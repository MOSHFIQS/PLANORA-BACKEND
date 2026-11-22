/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";
import { PrismaService } from "../../database/prisma.service";
import { AuditService } from "../audit/audit.service";
import { NotificationService } from "../notification/notification.service";
import { MailService } from "../../mail/mail.service";
import { stripe } from "../../config/stripe.config";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { envVars } from "../../config/env.config";
import {
  AuditAction,
  InvitationStatus,
  NotificationType,
  ParticipationStatus,
  PaymentStatus,
} from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { IQueryParams } from "../../common/interfaces/query.interface";
import { QueryBuilder } from "../../common/utils/query-builder.util";
import { generateEventInvoicePdf } from "./payment.utils";
import { InitiatePaymentDto } from "./dto/initiate-payment.dto";

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService
  ) {}

  private async createStripeSession(paymentId: string, amount: number) {
    return stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: { name: "Event Ticket" },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: { paymentId },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${envVars.FRONTEND_URL}/dashboard`,
      cancel_url: `${envVars.FRONTEND_URL}/dashboard`,
    });
  }

  async initiatePayment(user: IRequestUser, payload: InitiatePaymentDto) {
    if (!payload.eventId && !payload.invitationId) {
      throw new BadRequestException("Invalid payment target");
    }

    if (payload.eventId) {
      const existingParticipation = await this.prisma.participation.findUnique({
        where: {
          userId_eventId: {
            userId: user.userId,
            eventId: payload.eventId,
          },
        },
      });

      if (existingParticipation?.status === ParticipationStatus.APPROVED) {
        throw new BadRequestException("You already joined this event");
      }
    }

    if (payload.invitationId) {
      const invitation = await this.prisma.invitation.findUnique({
        where: { id: payload.invitationId },
      });

      if (invitation?.status === InvitationStatus.ACCEPTED) {
        throw new BadRequestException("Invitation already accepted");
      }
    }

    const successPayment = await this.prisma.payment.findFirst({
      where: {
        userId: user.userId,
        status: PaymentStatus.SUCCESS,
        ...(payload.eventId && {
          participation: { eventId: payload.eventId },
        }),
        ...(payload.invitationId && {
          invitationId: payload.invitationId,
        }),
      },
    });

    if (successPayment) {
      throw new BadRequestException("Payment already completed");
    }

    const existingPendingPayment = await this.prisma.payment.findFirst({
      where: {
        userId: user.userId,
        status: PaymentStatus.PENDING,
        ...(payload.eventId && {
          participation: { eventId: payload.eventId },
        }),
        ...(payload.invitationId && {
          invitationId: payload.invitationId,
        }),
      },
      include: { participation: true },
    });

    if (existingPendingPayment) {
      const session = await this.createStripeSession(
        existingPendingPayment.id,
        existingPendingPayment.amount
      );

      return {
        paymentId: existingPendingPayment.id,
        paymentUrl: session.url,
      };
    }

    let amount = 0;
    let participationId: string | undefined;

    if (payload.eventId) {
      const event = await this.prisma.event.findUniqueOrThrow({
        where: { id: payload.eventId },
      });

      amount = event.fee;

      const participation = await this.prisma.participation.upsert({
        where: {
          userId_eventId: {
            userId: user.userId,
            eventId: payload.eventId,
          },
        },
        create: {
          userId: user.userId,
          eventId: payload.eventId,
          status: ParticipationStatus.PENDING,
        },
        update: {},
      });

      participationId = participation.id;
    }

    if (payload.invitationId) {
      const invitation = await this.prisma.invitation.findUniqueOrThrow({
        where: { id: payload.invitationId },
        include: { event: true },
      });

      amount = invitation.event.fee;
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId: user.userId,
        amount,
        status: PaymentStatus.PENDING,
        transactionId: uuidv4(),
        ...(participationId && { participationId }),
        ...(payload.invitationId && { invitationId: payload.invitationId }),
      } as any,
    });

    const session = await this.createStripeSession(payment.id, amount);

    return {
      paymentId: payment.id,
      paymentUrl: session.url,
    };
  }

  async handleStripeWebhookEvent(event: Stripe.Event) {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;

      if (!paymentId) return;

      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          participation: { include: { event: true } },
          invitation: { include: { event: true } },
          user: true,
        },
      });

      if (!payment || payment.status === PaymentStatus.SUCCESS) return;

      let eventId = payment.participation?.eventId;
      let eventTitle = payment.participation?.event?.title;
      let eventDateTime = payment.participation?.event?.dateTime;
      let participationId = payment.participationId;

      if (payment.invitation) {
        eventId = payment.invitation.eventId;
        eventTitle = payment.invitation.event.title;
        eventDateTime = payment.invitation.event.dateTime;

        const participation = await this.prisma.participation.upsert({
          where: {
            userId_eventId: {
              userId: payment.userId,
              eventId,
            },
          },
          create: {
            userId: payment.userId,
            eventId,
            status: ParticipationStatus.APPROVED,
          },
          update: {
            status: ParticipationStatus.APPROVED,
          },
        });

        participationId = participation.id;

        await this.prisma.invitation.update({
          where: { id: payment.invitation.id },
          data: { status: InvitationStatus.ACCEPTED },
        });
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: PaymentStatus.SUCCESS,
            transactionId: session.payment_intent as string,
            participationId,
          },
        });

        if (participationId) {
          await tx.participation.update({
            where: { id: participationId },
            data: { status: ParticipationStatus.APPROVED },
          });

          await tx.ticket.create({
            data: {
              userId: payment.userId,
              eventId: eventId!,
              participationId,
              qrCode: uuidv4(),
            },
          });
        }
      });

      // Generate invoice PDF
      try {
        const invoicePdf = await generateEventInvoicePdf({
          invoiceId: payment.id,
          userName: payment.user.name,
          userEmail: payment.user.email,
          eventName: eventTitle || "Event",
          eventDate: eventDateTime ? eventDateTime.toISOString() : new Date().toISOString(),
          amount: payment.amount,
          transactionId: session.payment_intent as string,
          paymentDate: new Date().toISOString(),
        });

        const uploadResult = await uploadFileToCloudinary(
          invoicePdf,
          `invoice-${payment.id}.pdf`
        );

        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { invoiceUrl: uploadResult.secure_url },
        });

        await this.mailService.sendEmail({
          to: payment.user.email,
          subject: "Your Event Payment Invoice",
          templateName: "invoice",
          templateData: {
            userName: payment.user.name,
            eventName: eventTitle,
            amount: payment.amount,
            invoiceUrl: uploadResult.secure_url,
          },
          attachments: [
            {
              filename: `invoice-${payment.id}.pdf`,
              content: invoicePdf,
              contentType: "application/pdf",
            },
          ],
        });
      } catch (err: any) {
        this.logger.error("Failed to generate/upload/send invoice:", err.message);
      }

      await this.auditService.logAction(
        AuditAction.PAYMENT,
        "payment",
        payment.id,
        payment.userId,
        `Payment successful for event: ${eventTitle}`
      );

      await this.notificationService.sendNotification(
        payment.userId,
        "Payment Successful",
        `Your payment for ${eventTitle} was successful!`,
        NotificationType.SUCCESS,
        eventId,
        payment.id
      );
    }
  }

  async getMyPayments(user: IRequestUser, query: IQueryParams) {
    if (!user?.userId) {
      throw new UnauthorizedException("Unauthorized");
    }

    const queryBuilder = new QueryBuilder(this.prisma.payment, query);

    return queryBuilder
      .where({ userId: user.userId })
      .include({
        participation: { include: { event: true } },
        invitation: { include: { event: true } },
      })
      .sort()
      .paginate()
      .execute();
  }

  async getOrganizerPayments(user: IRequestUser, query: IQueryParams) {
    const queryBuilder = new QueryBuilder(this.prisma.payment, query);

    return queryBuilder
      .where({
        OR: [
          { participation: { event: { organizerId: user.userId } } },
          { invitation: { event: { organizerId: user.userId } } },
        ],
      })
      .include({
        user: true,
        participation: { include: { event: true } },
        invitation: { include: { event: true } },
      })
      .sort()
      .paginate()
      .execute();
  }

  async getAllPayments(query: IQueryParams) {
    const queryBuilder = new QueryBuilder(this.prisma.payment, query);

    return queryBuilder
      .include({
        user: true,
        participation: { include: { event: true } },
        invitation: { include: { event: true } },
      })
      .sort()
      .paginate()
      .execute();
  }
}

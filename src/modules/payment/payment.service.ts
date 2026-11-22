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

const PAYMENT_INCLUDES = {
  user: true,
  participation: { include: { event: true } },
  invitation: { include: { event: true } },
};

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
            unit_amount: Math.round(amount * 100),
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

  private async resolveTarget(user: IRequestUser, { eventId, invitationId }: InitiatePaymentDto) {
    if (eventId) {
      const [event, part] = await Promise.all([
        this.prisma.event.findUniqueOrThrow({ where: { id: eventId } }),
        this.prisma.participation.findUnique({
          where: { userId_eventId: { userId: user.userId, eventId } },
        }),
      ]);

      if (part?.status === ParticipationStatus.APPROVED) {
        throw new BadRequestException("You already joined this event");
      }

      return {
        amount: event.fee,
        eventId,
        invitationId: undefined,
        targetFilter: { participation: { eventId } },
      };
    }

    if (invitationId) {
      const invitation = await this.prisma.invitation.findUniqueOrThrow({
        where: { id: invitationId },
        include: { event: true },
      });

      if (invitation.status === InvitationStatus.ACCEPTED) {
        throw new BadRequestException("Invitation already accepted");
      }

      return {
        amount: invitation.event.fee,
        eventId: undefined,
        invitationId,
        targetFilter: { invitationId },
      };
    }

    throw new BadRequestException("Invalid payment target");
  }

  async initiatePayment(user: IRequestUser, payload: InitiatePaymentDto) {
    const { amount, eventId, invitationId, targetFilter } = await this.resolveTarget(user, payload);

    // Check existing payment status
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        userId: user.userId,
        ...targetFilter,
        status: { in: [PaymentStatus.SUCCESS, PaymentStatus.PENDING] },
      },
    });

    if (existingPayment?.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException("Payment already completed");
    }

    // Reuse pending payment with fresh Stripe session
    if (existingPayment) {
      const session = await this.createStripeSession(existingPayment.id, existingPayment.amount);
      return { paymentId: existingPayment.id, paymentUrl: session.url };
    }

    // Prepare participation if joining directly
    let participationId: string | undefined;
    if (eventId) {
      const participation = await this.prisma.participation.upsert({
        where: { userId_eventId: { userId: user.userId, eventId } },
        create: { userId: user.userId, eventId, status: ParticipationStatus.PENDING },
        update: {},
      });
      participationId = participation.id;
    }

    // Create pending payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId: user.userId,
        amount,
        status: PaymentStatus.PENDING,
        transactionId: uuidv4(),
        participationId,
        invitationId,
      } as any,
    });

    const session = await this.createStripeSession(payment.id, amount);
    return { paymentId: payment.id, paymentUrl: session.url };
  }

  async handleStripeWebhookEvent(event: Stripe.Event) {
    if (event.type !== "checkout.session.completed") return;

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

    const eventData = payment.participation?.event || payment.invitation?.event;
    const eventId = eventData?.id;
    const eventTitle = eventData?.title || "Event";

    // 1. Complete DB updates atomically in transaction
    await this.prisma.$transaction(async (tx) => {
      let participationId = payment.participationId;

      if (payment.invitation) {
        const participation = await tx.participation.upsert({
          where: {
            userId_eventId: { userId: payment.userId, eventId: payment.invitation.eventId },
          },
          create: {
            userId: payment.userId,
            eventId: payment.invitation.eventId,
            status: ParticipationStatus.APPROVED,
          },
          update: { status: ParticipationStatus.APPROVED },
        });

        participationId = participation.id;
        await tx.invitation.update({
          where: { id: payment.invitation.id },
          data: { status: InvitationStatus.ACCEPTED },
        });
      } else if (participationId) {
        await tx.participation.update({
          where: { id: participationId },
          data: { status: ParticipationStatus.APPROVED },
        });
      }

      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.SUCCESS,
          transactionId: (session.payment_intent as string) || payment.transactionId,
          participationId,
        },
      });

      if (participationId && eventId) {
        await tx.ticket.create({
          data: {
            userId: payment.userId,
            eventId,
            participationId,
            qrCode: uuidv4(),
          },
        });
      }
    });

    // 2. Deliver invoice and notify asynchronously (non-blocking for fast webhook response)
    this.sendInvoiceAndNotify(payment, session, eventTitle, eventData?.dateTime, eventId).catch(
      (err) => this.logger.error(`Webhook notification error: ${err.message}`)
    );
  }

  private async sendInvoiceAndNotify(
    payment: any,
    session: any,
    title: string,
    date?: Date,
    eventId?: string
  ) {
    try {
      const invoicePdf = await generateEventInvoicePdf({
        invoiceId: payment.id,
        userName: payment.user.name,
        userEmail: payment.user.email,
        eventName: title,
        eventDate: date ? date.toISOString() : new Date().toISOString(),
        amount: payment.amount,
        transactionId: (session.payment_intent as string) || payment.transactionId,
        paymentDate: new Date().toISOString(),
      });

      const { secure_url } = await uploadFileToCloudinary(invoicePdf, `invoice-${payment.id}.pdf`);

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { invoiceUrl: secure_url },
      });

      await this.mailService.sendEmail({
        to: payment.user.email,
        subject: "Your Event Payment Invoice",
        templateName: "invoice",
        templateData: {
          userName: payment.user.name,
          eventName: title,
          amount: payment.amount,
          invoiceUrl: secure_url,
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
      this.logger.error(`Invoice delivery failed for payment ${payment.id}: ${err.message}`);
    }

    await Promise.all([
      this.auditService.logAction(
        AuditAction.PAYMENT,
        "payment",
        payment.id,
        payment.userId,
        `Payment successful for: ${title}`
      ),
      this.notificationService.sendNotification(
        payment.userId,
        "Payment Successful",
        `Your payment for ${title} was successful!`,
        NotificationType.SUCCESS,
        eventId,
        payment.id
      ),
    ]);
  }

  private paginatePayments(query: IQueryParams, where: any = {}) {
    return new QueryBuilder(this.prisma.payment, query)
      .where(where)
      .include(PAYMENT_INCLUDES)
      .sort()
      .paginate()
      .execute();
  }

  async getMyPayments(user: IRequestUser, query: IQueryParams) {
    if (!user?.userId) throw new UnauthorizedException("Unauthorized");
    return this.paginatePayments(query, { userId: user.userId });
  }

  async getOrganizerPayments(user: IRequestUser, query: IQueryParams) {
    return this.paginatePayments(query, {
      OR: [
        { participation: { event: { organizerId: user.userId } } },
        { invitation: { event: { organizerId: user.userId } } },
      ],
    });
  }

  async getAllPayments(query: IQueryParams) {
    return this.paginatePayments(query);
  }
}

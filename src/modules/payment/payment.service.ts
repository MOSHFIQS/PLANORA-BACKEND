import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import Stripe from "stripe";
import {
  PaymentStatus,
  ParticipationStatus,
  TicketStatus,
  InvitationStatus,
  AuditAction,
  NotificationType,
} from "../../generated/prisma/enums";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env.config";
import { InitiatePaymentDto } from "./dto/initiate-payment.dto";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { AuditService } from "../audit/audit.service";
import { NotificationService } from "../notification/notification.service";
import { MailService } from "../../mail/mail.service";
import { v4 as uuidv4 } from "uuid";
import { generateEventInvoicePdf } from "./payment.utils";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../common/utils/query-builder.util";
import { IQueryParams } from "../../common/interfaces/query.interface";

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
            product_data: { name: "Event Ticket Pass" },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { paymentId },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${envVars.FRONTEND_URL}/dashboard/my/payments?session_id={CHECKOUT_SESSION_ID}&payment_id=${paymentId}`,
      cancel_url: `${envVars.FRONTEND_URL}/dashboard/my/payments?canceled=true`,
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

    // ── FREE EVENT: NO PAYMENT REQUIRED, AUTO-APPROVE IMMEDIATELY ──
    if (amount === 0) {
      let participationId: string | undefined;

      if (eventId) {
        const participation = await this.prisma.participation.upsert({
          where: { userId_eventId: { userId: user.userId, eventId } },
          create: { userId: user.userId, eventId, status: ParticipationStatus.APPROVED },
          update: { status: ParticipationStatus.APPROVED },
        });
        participationId = participation.id;
      }

      if (invitationId) {
        const invitation = await this.prisma.invitation.findUniqueOrThrow({
          where: { id: invitationId },
        });
        const participation = await this.prisma.participation.upsert({
          where: { userId_eventId: { userId: user.userId, eventId: invitation.eventId } },
          create: { userId: user.userId, eventId: invitation.eventId, status: ParticipationStatus.APPROVED },
          update: { status: ParticipationStatus.APPROVED },
        });
        participationId = participation.id;
        await this.prisma.invitation.update({
          where: { id: invitationId },
          data: { status: InvitationStatus.ACCEPTED },
        });
      }

      // Create SUCCESS payment record with 0 amount
      const transactionId = uuidv4();
      const payment = await this.prisma.payment.create({
        data: {
          userId: user.userId,
          amount: 0,
          status: PaymentStatus.SUCCESS,
          transactionId,
          participationId,
          invitationId,
        } as any,
      });

      // Generate verified digital Ticket immediately with QR code
      const targetEventId =
        eventId ||
        (invitationId
          ? (await this.prisma.invitation.findUnique({ where: { id: invitationId } }))?.eventId
          : undefined);

      if (participationId && targetEventId) {
        const existingTicket = await this.prisma.ticket.findFirst({
          where: { userId: user.userId, eventId: targetEventId },
        });

        if (!existingTicket) {
          const qrCode = `PLN-TKT-${targetEventId.slice(-6).toUpperCase()}-${user.userId.slice(-6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
          await this.prisma.ticket.create({
            data: {
              userId: user.userId,
              eventId: targetEventId,
              participationId,
              qrCode,
              status: TicketStatus.VALID,
            },
          });
        }
      }

      return {
        paymentId: payment.id,
        paymentUrl: null,
        isFree: true,
        message: "Successfully joined free event! Your ticket is confirmed.",
      };
    }

    // ── PAID EVENT: CHECK EXISTING PAYMENT OR CREATE STRIPE CHECKOUT ──
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

  /**
   * Completes payment, participation, and tickets in DB transaction.
   * Shared by Stripe webhook, direct verification, and auto-sync.
   */
  async completePaymentRecord(paymentId: string, stripeSessionOrIntentId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        participation: { include: { event: true } },
        invitation: { include: { event: true } },
        user: true,
      },
    });

    if (!payment || payment.status === PaymentStatus.SUCCESS) {
      return payment;
    }

    const eventData = payment.participation?.event || payment.invitation?.event;
    const eventId = eventData?.id;
    const eventTitle = eventData?.title || "Event";

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
          stripeEventId: stripeSessionOrIntentId || payment.stripeEventId,
          participationId,
        },
      });

      if (participationId && eventId) {
        const existingTicket = await tx.ticket.findFirst({
          where: { userId: payment.userId, eventId },
        });

        if (!existingTicket) {
          const qrCode = `PLN-TKT-${eventId.slice(-6).toUpperCase()}-${payment.userId.slice(-6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
          await tx.ticket.create({
            data: {
              userId: payment.userId,
              eventId,
              participationId,
              qrCode,
              status: TicketStatus.VALID,
            },
          });
        }
      }
    });

    this.sendInvoiceAndNotify(
      payment,
      { payment_intent: stripeSessionOrIntentId },
      eventTitle,
      eventData?.dateTime,
      eventId
    ).catch((err) => this.logger.error(`Webhook notification error: ${err.message}`));

    return this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: PAYMENT_INCLUDES,
    });
  }

  async handleStripeWebhookEvent(event: Stripe.Event) {
    if (event.type !== "checkout.session.completed") return;

    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = session.metadata?.paymentId;
    if (!paymentId) return;

    await this.completePaymentRecord(
      paymentId,
      (session.payment_intent as string) || session.id
    );
  }

  /**
   * Direct verification endpoint for instant confirmation upon redirect
   */
  async verifyPayment(user: IRequestUser, paymentId?: string, sessionId?: string) {
    if (sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const pid = session.metadata?.paymentId || paymentId;
        if (pid && (session.payment_status === "paid" || session.status === "complete")) {
          return await this.completePaymentRecord(
            pid,
            (session.payment_intent as string) || session.id
          );
        }
      } catch (err: any) {
        this.logger.warn(`Stripe session retrieval failed: ${err.message}`);
      }
    }

    if (paymentId) {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (payment && payment.status === PaymentStatus.PENDING) {
        try {
          const sessions = await stripe.checkout.sessions.list({ limit: 20 });
          const matched = sessions.data.find((s) => s.metadata?.paymentId === paymentId);
          if (matched && (matched.payment_status === "paid" || matched.status === "complete")) {
            return await this.completePaymentRecord(
              paymentId,
              (matched.payment_intent as string) || matched.id
            );
          }
        } catch (err: any) {
          this.logger.warn(`Stripe session check error: ${err.message}`);
        }
      }

      return payment;
    }

    throw new BadRequestException("Provide paymentId or sessionId to verify");
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

    // ── Auto-sync any PENDING payments against Stripe in real-time ──
    const pendingPayments = await this.prisma.payment.findMany({
      where: { userId: user.userId, status: PaymentStatus.PENDING },
    });

    if (pendingPayments.length > 0) {
      try {
        const sessions = await stripe.checkout.sessions.list({ limit: 25 });
        for (const p of pendingPayments) {
          const matched = sessions.data.find((s) => s.metadata?.paymentId === p.id);
          if (matched && (matched.payment_status === "paid" || matched.status === "complete")) {
            await this.completePaymentRecord(
              p.id,
              (matched.payment_intent as string) || matched.id
            );
          }
        }
      } catch (err: any) {
        this.logger.warn(`Auto-sync pending payments failed: ${err.message}`);
      }
    }

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

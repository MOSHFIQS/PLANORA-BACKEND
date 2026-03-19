/* eslint-disable @typescript-eslint/no-explicit-any */

import Stripe from "stripe";
import status from "http-status";
import { v4 as uuidv4 } from "uuid";

import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../config/stripe.config";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { PaymentStatus } from "../../../generated/prisma/enums";


const initiatePayment = async (
  user: IRequestUser,
  payload: {
    participationId?: string;
    invitationId?: string;
  }
) => {
  if (!payload.participationId && !payload.invitationId) {
    throw new AppError(status.BAD_REQUEST, "Invalid payment target");
  }

  let amount = 0;


  if (payload.participationId) {
    const participation = await prisma.participation.findUniqueOrThrow({
      where: { id: payload.participationId },
      include: { event: true },
    });

    if (participation.userId !== user.userId) {
      throw new AppError(status.FORBIDDEN, "Not your participation");
    }


    const paid = await prisma.payment.findFirst({
      where: {
        participationId: payload.participationId,
        status: PaymentStatus.SUCCESS,
      },
    });

    if (paid) {
      throw new AppError(status.BAD_REQUEST, "Already paid for this event");
    }


    const pending = await prisma.payment.findFirst({
      where: {
        participationId: payload.participationId,
        status: PaymentStatus.PENDING,
      },
    });

    if (pending) {
      throw new AppError(
        status.BAD_REQUEST,
        "Payment already in progress"
      );
    }

    amount = participation.event.fee;
  }


  if (payload.invitationId) {
    const invitation = await prisma.invitation.findUniqueOrThrow({
      where: { id: payload.invitationId },
      include: { event: true },
    });

    if (invitation.userId !== user.userId) {
      throw new AppError(status.FORBIDDEN, "Not your invitation");
    }

    const paid = await prisma.payment.findFirst({
      where: {
        invitationId: payload.invitationId,
        status: PaymentStatus.SUCCESS,
      },
    });

    if (paid) {
      throw new AppError(status.BAD_REQUEST, "Already paid");
    }

    const pending = await prisma.payment.findFirst({
      where: {
        invitationId: payload.invitationId,
        status: PaymentStatus.PENDING,
      },
    });

    if (pending) {
      throw new AppError(
        status.BAD_REQUEST,
        "Payment already in progress"
      );
    }

    amount = invitation.event.fee;
  }


  const payment = await prisma.payment.create({
    data: {
      amount,
      transactionId: uuidv4(),
      userId: user.userId,
      participationId: payload.participationId,
      invitationId: payload.invitationId,
      status: PaymentStatus.PENDING,
    },
  });


  const session = await stripe.checkout.sessions.create({
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

    metadata: {
      paymentId: payment.id,
    },

    success_url: `${process.env.FRONTEND_URL}/payment-success`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
  });

  return {
    paymentId: payment.id,
    paymentUrl: session.url,
  };
};


const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  const existing = await prisma.payment.findFirst({
    where: { stripeEventId: event.id },
  });

  if (existing) return { message: "Already processed" };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const paymentId = session.metadata?.paymentId;

      if (!paymentId) return { message: "Missing paymentId" };

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          participation: true,
          invitation: true,
        },
      });

      if (!payment) return { message: "Payment not found" };

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: PaymentStatus.SUCCESS,
            stripeEventId: event.id,
            paymentGatewayData: session,
          },
        });


        if (payment.participationId) {
          await tx.participation.update({
            where: { id: payment.participationId },
            data: { status: "APPROVED" },
          });
        }

        if (payment.invitationId) {
          await tx.invitation.update({
            where: { id: payment.invitationId },
            data: { status: "ACCEPTED" },
          });
        }
      });

      break;
    }

    case "payment_intent.payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object as any;
      const paymentId = session.metadata?.paymentId;

      if (!paymentId) return;

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.FAILED,
          stripeEventId: event.id,
        },
      });

      break;
    }

    default:
      break;
  }

  return { message: "Webhook processed" };
};

export const PaymentService = {
  initiatePayment,
  handleStripeWebhookEvent,
};
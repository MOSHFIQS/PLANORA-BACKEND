model User {
    id            String  @id @default(cuid())
    name          String
    email         String  @unique
    emailVerified Boolean @default(false)

    role   Role       @default(USER)
    status UserStatus @default(ACTIVE)

    isDeleted Boolean   @default(false)
    deletedAt DateTime?

    image String?

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    // 🔐 Better Auth relations
    sessions Session[]
    accounts Account[]

    // 🎉 Planora relations
    events         Event[]         @relation("OrganizerEvents")
    participations Participation[]
    invitations    Invitation[]
    reviews        Review[]
    payments       Payment[]

    @@map("user")
}

model Session {
    id        String   @id
    expiresAt DateTime
    token     String
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    ipAddress String?
    userAgent String?
    userId    String
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@unique([token])
    @@index([userId])
    @@map("session")
}

model Account {
    id                    String    @id
    accountId             String
    providerId            String
    userId                String
    user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
    accessToken           String?
    refreshToken          String?
    idToken               String?
    accessTokenExpiresAt  DateTime?
    refreshTokenExpiresAt DateTime?
    scope                 String?
    password              String?
    createdAt             DateTime  @default(now())
    updatedAt             DateTime  @updatedAt

    @@index([userId])
    @@map("account")
}

model Verification {
    id         String   @id
    identifier String
    value      String
    expiresAt  DateTime
    createdAt  DateTime @default(now())
    updatedAt  DateTime @updatedAt

    @@index([identifier])
    @@map("verification")
}

enum Role {
    USER
    ADMIN
}

enum UserStatus {
    ACTIVE
    SUSPENDED
}

enum EventVisibility {
    PUBLIC
    PRIVATE
}

enum ParticipationStatus {
    PENDING
    APPROVED
    REJECTED
    BANNED
}

enum InvitationStatus {
    PENDING
    ACCEPTED
    DECLINED
}

enum PaymentStatus {
    PENDING
    SUCCESS
    FAILED
    REFUNDED
    CANCELED
    UNPAID
}

model Event {
     id          String          @id @default(cuid())
     title       String
     description String
     venue       String
     dateTime    DateTime
     visibility  EventVisibility
     fee         Float           @default(0)

     organizerId String
     organizer   User   @relation("OrganizerEvents", fields: [organizerId], references: [id])

     image String? // Add this field for event images

     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     participations Participation[]
     invitations    Invitation[]
     reviews        Review[]

     @@index([organizerId])
     @@index([visibility])
     @@index([dateTime])
     @@map("event")
}


model Invitation {
  id          String   @id @default(cuid())

  eventId     String
  userId      String

  status      InvitationStatus @default(PENDING)

  createdAt   DateTime @default(now())

  event       Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user        User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  payment     Payment[]

  @@unique([eventId, userId])   // prevent duplicate invites
  @@index([eventId])
  @@index([status])
  @@map("invitation")
}

model Participation {
  id          String   @id @default(cuid())

  userId      String
  eventId     String

  status      ParticipationStatus @default(PENDING)

  createdAt   DateTime @default(now())

  user        User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  event       Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  payment     Payment[]

  @@unique([userId, eventId])   // one join per user per event
  @@index([eventId])
  @@index([status])
  @@map("participation")
}
model Payment {
    id                 String        @id @default(uuid())
    amount             Float
    transactionId      String        @db.Uuid() @unique
    stripeEventId      String?       @unique
    status             PaymentStatus @default(PENDING)
    userId             String
    invoiceUrl         String?
    paymentGatewayData Json?
    createdAt          DateTime      @default(now())
    updatedAt          DateTime      @updatedAt

    // Payment for a Participation OR Invitation
    participationId    String?      
    participation      Participation? @relation(fields: [participationId], references: [id], onDelete: Cascade)

    invitationId       String?       
    invitation         Invitation?   @relation(fields: [invitationId], references: [id], onDelete: Cascade)

    user               User  @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@index([participationId])
    @@index([invitationId])
    @@index([transactionId])
    @@map("payments")
}


model Review {
  id        String   @id @default(cuid())

  rating    Int
  comment   String?

  userId    String
  eventId   String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  event     Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([userId, eventId])  // one review per user per event
  @@index([eventId])
  @@map("review")
}

// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client"
  output   = "../../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { PaymentController } from "./payment.controller";

const router = Router();


// User initiates payment
router.post(
  "/pay",
  checkAuth(Role.USER, Role.ADMIN),
  PaymentController.initiatePayment
);

export const PaymentRoutes = router;

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, Response } from "express";
import status from "http-status";

import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";

// Start payment
const initiatePayment = catchAsync(async (req: Request, res: Response) => {
     const user = req.user!;
     const result = await PaymentService.initiatePayment(user, req.body);

     sendResponse(res, {
          success: true,
          httpStatusCode: status.OK,
          message: "Payment session created",
          data: result,
     });
});

//  Stripe Webhook
const handleStripeWebhookEvent = catchAsync(
     async (req: Request, res: Response) => {
          const signature = req.headers["stripe-signature"] as string;

          const event = stripe.webhooks.constructEvent(
               req.body, // RAW BODY
               signature,
               envVars.STRIPE.STRIPE_WEBHOOK_SECRET,
          );

          const result = await PaymentService.handleStripeWebhookEvent(event);

          sendResponse(res, {
               success: true,
               httpStatusCode: status.OK,
               message: "Webhook processed",
               data: result,
          });
     },
);

export const PaymentController = {
     initiatePayment,
     handleStripeWebhookEvent,
};


/* eslint-disable @typescript-eslint/no-explicit-any */

import Stripe from "stripe";
import status from "http-status";
import { v4 as uuidv4 } from "uuid";

import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../config/stripe.config";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { PaymentStatus } from "../../../generated/prisma/enums";

// Create Stripe Checkout Session
const initiatePayment = async (
     user: IRequestUser,
     payload: {
          participationId?: string;
          invitationId?: string;
     },
) => {
     if (!payload.participationId && !payload.invitationId) {
          throw new AppError(status.BAD_REQUEST, "Invalid payment target");
     }

     let amount = 0;

     // 🔹 Participation payment
     if (payload.participationId) {
          const participation = await prisma.participation.findUniqueOrThrow({
               where: { id: payload.participationId },
               include: { event: true },
          });

          if (participation.userId !== user.userId)
               throw new AppError(status.FORBIDDEN, "Not your participation");

          amount = participation.event.fee;
     }

     // 🔹 Invitation payment
     if (payload.invitationId) {
          const invitation = await prisma.invitation.findUniqueOrThrow({
               where: { id: payload.invitationId },
               include: { event: true },
          });

          if (invitation.userId !== user.userId)
               throw new AppError(status.FORBIDDEN, "Not your invitation");

          amount = invitation.event.fee;
     }

     // Create payment record
     const payment = await prisma.payment.create({
          data: {
               amount,
               transactionId: uuidv4(),
               userId: user.userId,
               participationId: payload.participationId,
               invitationId: payload.invitationId,
          },
     });

     // Stripe Checkout
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

// 🔔 Handle Stripe Webhook
const handleStripeWebhookEvent = async (event: Stripe.Event) => {
     // Prevent duplicate processing
     const existing = await prisma.payment.findFirst({
          where: { stripeEventId: event.id },
     });

     if (existing) return { message: "Already processed" };

     switch (event.type) {
          // Payment Success
          case "checkout.session.completed": {
               const session = event.data.object as any;
               console.log("session",session);
               const paymentId = session.metadata?.paymentId;

               if (!paymentId) return { message: "Missing paymentId" };

               //  Get payment with relations
               const payment = await prisma.payment.findUnique({
                    where: { id: paymentId },
                    include: {
                         participation: true,
                         invitation: true,
                    },
               });

               if (!payment) return { message: "Payment not found" };

               await prisma.$transaction(async (tx) => {
                    // Update payment
                    await tx.payment.update({
                         where: { id: paymentId },
                         data: {
                              status: PaymentStatus.SUCCESS,
                              stripeEventId: event.id,
                              paymentGatewayData: session,
                         },
                    });

                    //  If participation payment → APPROVE
                    console.log("111",payment.participationId);
                    if (payment.participationId) {
                         await tx.participation.update({
                              where: { id: payment.participationId },
                              data: { status: "APPROVED" },
                         });
                    }

                    //  If invitation payment → ACCEPT
                    if (payment.invitationId) {
                         await tx.invitation.update({
                              where: { id: payment.invitationId },
                              data: { status: "ACCEPTED" },
                         });
                    }
               });

               break;
          }

          // Payment Failed / Expired
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


import { Router } from "express";
import { ParticipationController } from "./participation.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// 👤 User routes
router.post(
     "/join/:eventId",
     checkAuth(Role.USER, Role.ADMIN),
     ParticipationController.joinEvent,
);

router.delete(
     "/cancel/:eventId",
     checkAuth(Role.USER, Role.ADMIN),
     ParticipationController.cancelParticipation,
);

router.get(
     "/my-events",
     checkAuth(Role.USER, Role.ADMIN),
     ParticipationController.getMyEvents,
);

// Organizer/Admin routes
router.get(
     "/event/:eventId",
     checkAuth(Role.USER, Role.ADMIN),
     ParticipationController.getEventParticipants,
);

router.patch(
     "/:id/status",
     checkAuth(Role.USER, Role.ADMIN),
     ParticipationController.updateStatus,
);

export const ParticipationRoutes = router;

import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { ParticipationService } from "./participation.service";
import { ParticipationStatus } from "../../../generated/prisma/enums";

const joinEvent = catchAsync(async (req: Request, res: Response) => {
     const user = req.user;
     if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

     const { eventId } = req.params;

     const result = await ParticipationService.joinEvent(
          user,
          eventId as string,
     );

     sendResponse(res, {
          httpStatusCode: status.CREATED,
          success: true,
          message: "Joined event successfully",
          data: result,
     });
});

const cancelParticipation = catchAsync(async (req: Request, res: Response) => {
     const user = req.user!;
     const { eventId } = req.params;

     const result = await ParticipationService.cancelParticipation(
          user,
          eventId as string,
     );

     sendResponse(res, {
          httpStatusCode: status.OK,
          success: true,
          message: "Participation canceled",
          data: result,
     });
});

const getMyEvents = catchAsync(async (req:Request, res:Response) => {
     const user = req.user!;

     const result = await ParticipationService.getMyEvents(user);

     sendResponse(res, {
          httpStatusCode: status.OK,
          success: true,
          message: "My events fetched",
          data: result,
     });
});

// const getEventParticipants = catchAsync(async (req, res) => {

//   const { eventId } = req.params;

//   const result = await ParticipationService.getEventParticipants(eventId as string);

//   sendResponse(res, {
//     httpStatusCode: status.OK,
//     success: true,
//     message: "Participants fetched",
//     data: result,
//   });
// });

const getEventParticipants = catchAsync(async (req:Request, res:Response) => {
     const user = req.user;
     if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

     const { eventId } = req.params;

     const result = await ParticipationService.getEventParticipants(
          user,
          eventId as string,
     );

     sendResponse(res, {
          httpStatusCode: status.OK,
          success: true,
          message: "Participants fetched",
          data: result,
     });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
     const user = req.user;
     if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

     const { id } = req.params;
     const { status: newStatus } = req.body;

     // Validate status
     if (!Object.values(ParticipationStatus).includes(newStatus)) {
          throw new AppError(status.BAD_REQUEST, "Invalid status value");
     }

     const result = await ParticipationService.updateStatus(
          user,
          id as string,
          newStatus,
     );

     sendResponse(res, {
          httpStatusCode: status.OK,
          success: true,
          message: `Participation ${newStatus.toLowerCase()}`,
          data: result,
     });
});

export const ParticipationController = {
     joinEvent,
     cancelParticipation,
     getMyEvents,
     getEventParticipants,
     updateStatus,
};
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import {
     ParticipationStatus,
     EventVisibility,
} from "../../../generated/prisma/enums";

const joinEvent = async (user: IRequestUser, eventId: string) => {
     const event = await prisma.event.findUnique({
          where: { id: eventId },
     });

     if (!event) throw new AppError(status.NOT_FOUND, "Event not found");

     if (event.organizerId === user.userId) {
          throw new AppError(
               status.BAD_REQUEST,
               "Organizer cannot join own event",
          );
     }

     const existing = await prisma.participation.findUnique({
          where: {
               userId_eventId: {
                    userId: user.userId,
                    eventId,
               },
          },
     });

     if (existing) {
          throw new AppError(status.BAD_REQUEST, "Already joined or requested");
     }

     // PAID EVENT
     if (event.fee > 0) {
          return prisma.participation.create({
               data: {
                    userId: user.userId,
                    eventId,
                    status: ParticipationStatus.PENDING, // wait for payment
               },
          });
     }

     // FREE EVENT
     const statusValue =
          event.visibility === EventVisibility.PUBLIC
               ? ParticipationStatus.APPROVED
               : ParticipationStatus.PENDING;

     return prisma.participation.create({
          data: {
               userId: user.userId,
               eventId,
               status: statusValue,
          },
     });
};

const cancelParticipation = async (user: IRequestUser, eventId: string) => {
     const participation = await prisma.participation.findUnique({
          where: {
               userId_eventId: {
                    userId: user.userId,
                    eventId,
               },
          },
     });

     if (!participation) {
          throw new AppError(status.NOT_FOUND, "Participation not found");
     }

     return prisma.participation.delete({
          where: { id: participation.id },
     });
};

const getMyEvents = async (user: IRequestUser) => {
     return prisma.participation.findMany({
          where: { userId: user.userId },
          include: {
               event: true,
          },
     });
};

// const getEventParticipants = async (eventId: string) => {
//      return prisma.participation.findMany({
//           where: { eventId },
//           include: {
//                user: true,
//           },
//      });
// };

const getEventParticipants = async (user: IRequestUser, eventId: string) => {
     const event = await prisma.event.findUnique({
          where: { id: eventId },
     });

     if (!event) {
          throw new AppError(status.NOT_FOUND, "Event not found");
     }

     // 🔐 Authorization check
     const isOrganizer = event.organizerId === user.userId;
     const isAdmin = user.role === "ADMIN";

     if (!isOrganizer && !isAdmin) {
          throw new AppError(
               status.FORBIDDEN,
               "You are not allowed to view participants",
          );
     }

     return prisma.participation.findMany({
          where: { eventId },
          include: {
               user: true,
          },
     });
};

const updateStatus = async (
     user: IRequestUser,
     participationId: string,
     newStatus: ParticipationStatus,
) => {
     const participation = await prisma.participation.findUnique({
          where: { id: participationId },
          include: { event: true },
     });

     if (!participation) {
          throw new AppError(status.NOT_FOUND, "Participation not found");
     }

     // 🔐 Only organizer or admin
     if (
          participation.event.organizerId !== user.userId &&
          user.role !== "ADMIN"
     ) {
          throw new AppError(status.FORBIDDEN, "Not authorized");
     }

     return prisma.participation.update({
          where: { id: participationId },
          data: { status: newStatus },
     });
};

export const ParticipationService = {
     joinEvent,
     cancelParticipation,
     getMyEvents,
     getEventParticipants,
     updateStatus,
};

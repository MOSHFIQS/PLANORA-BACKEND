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

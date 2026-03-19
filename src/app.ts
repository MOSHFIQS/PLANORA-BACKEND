import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { IndexRoutes } from "./app/routes";
import { PaymentController } from "./app/module/payment/payment.controller";

const app: Application = express();

app.post(
     "/api/v1/payments/webhook",
     express.raw({ type: "application/json" }),
     PaymentController.handleStripeWebhookEvent,
);
// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", IndexRoutes);

// Basic route
app.get("/", async (req: Request, res: Response) => {
     res.status(201).json({
          success: true,
          message: "API is working",
     });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;

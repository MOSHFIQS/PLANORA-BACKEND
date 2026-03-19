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
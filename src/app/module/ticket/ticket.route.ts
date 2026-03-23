import { Router } from "express";
import { TicketController } from "./ticket.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// User actions
router.get(
  "/my",
  checkAuth(Role.USER, Role.ADMIN),
  TicketController.getMyTickets
);

// Organizer/Admin actions
router.get(
  "/event/:eventId",
  checkAuth(Role.ADMIN, Role.USER),
  TicketController.getEventTickets
);

router.post(
  "/check-in",
  checkAuth(Role.ADMIN, Role.USER),
  TicketController.checkInTicket
);

export const TicketRoutes = router;
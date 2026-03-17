import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { EventController } from "./event.controller";

const router = Router();

router.post("/", checkAuth(Role.USER, Role.ADMIN), EventController.createEvent);

export const EventRoutes = router;
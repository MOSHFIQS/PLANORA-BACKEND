import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { UserController } from "./user.controller";

const router = Router();

router.get("/stats", checkAuth(Role.USER, Role.ADMIN), UserController.getMyStats);

export const UserRoutes = router;
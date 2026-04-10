import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { UserController } from "./user.controller";

const router = Router();

router.get("/stats", checkAuth(Role.USER, Role.ADMIN), UserController.getMyStats);
router.post("/create-admin", checkAuth(Role.SUPERADMIN), UserController.createAdmin);
router.patch("/:id/suspend", checkAuth(Role.SUPERADMIN, Role.ADMIN), UserController.suspendUser);


export const UserRoutes = router;
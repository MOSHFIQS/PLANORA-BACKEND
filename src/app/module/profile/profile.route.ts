import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { ProfileController } from "./profile.controller";

const router = Router();

router.get("/me", checkAuth(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN), ProfileController.getMyProfile);
router.patch("/me", checkAuth(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN), ProfileController.updateProfile);

export const ProfileRoutes = router;
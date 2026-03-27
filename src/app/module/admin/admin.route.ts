import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { AdminController } from "./admin.controller";

const router = Router();

router.get("/users", checkAuth(Role.ADMIN), AdminController.getAllUsers);
router.get("/admins", checkAuth(Role.ADMIN), AdminController.getAllAdmins);
router.patch("/users/:id/status", checkAuth(Role.ADMIN), AdminController.updateUserStatus);
router.delete("/users/:id", checkAuth(Role.ADMIN), AdminController.deleteUser);

router.patch(
  "/users/:id/role",
  checkAuth(Role.ADMIN),
  AdminController.updateUserRole
);

router.get("/stats", checkAuth(Role.ADMIN), AdminController.getAdminStats);


export const AdminRoutes = router;
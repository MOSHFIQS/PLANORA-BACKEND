import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { AuditController } from "./audit.controller";

const router = Router();

router.get("/", checkAuth(Role.SUPERADMIN), AuditController.getAllLogs);

export const AuditRoutes = router;

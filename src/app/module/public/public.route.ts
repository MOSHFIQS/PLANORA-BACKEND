import { Router } from "express";
import { PublicController } from "./public.controller";

const router = Router();

router.get("/stats", PublicController.getStats);

export const PublicRoutes = router;
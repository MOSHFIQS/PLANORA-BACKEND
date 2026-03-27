import { Router } from "express";
import { BannerController } from "./banner.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// PUBLIC
router.get("/", BannerController.getAllBanners);
router.get("/active", BannerController.getActiveBanners);

// ADMIN
router.post("/", checkAuth(Role.ADMIN), BannerController.createBanner);
router.patch("/:id", checkAuth(Role.ADMIN), BannerController.updateBanner);
router.delete("/:id", checkAuth(Role.ADMIN), BannerController.deleteBanner);

export const BannerRoutes = router;
import { Router } from "express";
import { BannerController } from "./banner.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// PUBLIC
router.get("/", BannerController.getAllBanners);
router.get("/active", BannerController.getActiveBanners);
router.get("/:id", BannerController.getBannerById);

// ADMIN
router.post("/", checkAuth(Role.ADMIN), BannerController.createBanner);
router.patch("/:id", checkAuth(Role.ADMIN), BannerController.updateBanner);
router.delete("/:id", checkAuth(Role.ADMIN), BannerController.deleteBanner);
router.patch(
  "/:id/status",
  checkAuth(Role.ADMIN),
  BannerController.updateBannerStatus
);

export const BannerRoutes = router;
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
router.post("/", checkAuth(Role.ADMIN, Role.SUPERADMIN), BannerController.createBanner);
router.patch("/:id", checkAuth(Role.ADMIN, Role.SUPERADMIN), BannerController.updateBanner);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPERADMIN), BannerController.deleteBanner);
router.patch(
  "/:id/status",
  checkAuth(Role.ADMIN, Role.SUPERADMIN),
  BannerController.updateBannerStatus
);

export const BannerRoutes = router;
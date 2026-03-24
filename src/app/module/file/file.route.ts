import { Router } from "express";
import { FileController } from "./file.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";

const router = Router();

// Upload (single + multiple)
router.post(
    "/upload-image",
    checkAuth(Role.USER, Role.ADMIN),
    multerUpload.array("file", 10), // supports 1 or many
    FileController.uploadImage
);

// Delete (single + multiple)
router.delete(
    "/delete-image",
    checkAuth(Role.USER, Role.ADMIN),
    FileController.deleteImage
);

export const FileRoutes = router;
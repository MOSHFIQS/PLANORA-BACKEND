import { Router } from "express";
import { FileController } from "./file.controller";
import { multerUpload } from "../../config/multer.config";

const router = Router();

// Upload (single + multiple)
router.post(
    "/upload-image",
    multerUpload.array("file", 10), // supports 1 or many
    FileController.uploadImage
);

// Delete (single + multiple)
router.delete(
    "/delete-image",
    FileController.deleteImage
);

export const FileRoutes = router;
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import AppError from "../errorHelpers/AppError";

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: async (req, file) => {
        const originalName = file.originalname;
        const extension = originalName.split(".").pop()?.toLowerCase();

        const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];

        if (!extension || !allowedExtensions.includes(extension)) {
            throw new AppError(400, "Only image files are allowed");
        }

        const fileNameWithoutExtension = originalName
            .split(".")
            .slice(0, -1)
            .join(".")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");

        const uniqueName =
            Math.random().toString(36).substring(2) +
            "-" +
            Date.now() +
            "-" +
            fileNameWithoutExtension;

        return {
            folder: "planora/images",
            public_id: uniqueName,
            resource_type: "image", // force image only
        };
    },
});

export const multerUpload = multer({storage})
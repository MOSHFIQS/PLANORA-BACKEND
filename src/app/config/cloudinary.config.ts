import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import status from "http-status";
import AppError from "../errorHelpers/AppError";
import { envVars } from "./env";

cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
})

export const uploadFileToCloudinary = async (
    buffer: Buffer,
    fileName: string,
): Promise<UploadApiResponse> => {

    if (!buffer || !fileName) {
        throw new AppError(
            status.BAD_REQUEST,
            "File buffer and file name are required for upload"
        );
    }

    const extension = fileName.split(".").pop()?.toLowerCase();

    // only allow images
    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];

    if (!extension || !allowedExtensions.includes(extension)) {
        throw new AppError(
            status.BAD_REQUEST,
            "Only image files are allowed"
        );
    }

    const fileNameWithoutExtension = fileName
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

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: "image", 
                public_id: `planora/images/${uniqueName}`,
                folder: "planora/images",
            },
            (error, result) => {
                if (error) {
                    return reject(
                        new AppError(
                            status.INTERNAL_SERVER_ERROR,
                            "Failed to upload image to Cloudinary"
                        )
                    );
                }
                resolve(result as UploadApiResponse);
            }
        ).end(buffer);
    });
};

export const deleteFileFromCloudinary = async (url: string) => {
    try {
        const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
        const match = url.match(regex);

        if (match?.[1]) {
            const publicId = match[1];

            await cloudinary.uploader.destroy(publicId, {
                resource_type: "image",
            });

            console.log(`Image ${publicId} deleted from cloudinary`);
        }
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        throw new AppError(
            status.INTERNAL_SERVER_ERROR,
            "Failed to delete image from Cloudinary"
        );
    }
};


export const cloudinaryUpload = cloudinary;
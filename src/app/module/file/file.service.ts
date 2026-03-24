import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";

const uploadImage = async (files: Express.Multer.File[] | undefined) => {
    if (!files || files.length === 0) {
        throw new AppError(status.BAD_REQUEST, "No file uploaded");
    }

    // single file 
    if (files.length === 1) {
        return {
            url: files[0].path
        };
    }

    // multiple files
    return files.map((file) => ({
        url: file.path
    }));
};

const deleteImage = async (urls: string | string[]) => {
    if (!urls) {
        throw new AppError(status.BAD_REQUEST, "Image URL is required");
    }

    if (Array.isArray(urls)) {
        await Promise.all(
            urls.map((url) => deleteFileFromCloudinary(url))
        );
        return null;
    }

    await deleteFileFromCloudinary(urls);
    return null;
};

export const FileService = {
    uploadImage,
    deleteImage,
};
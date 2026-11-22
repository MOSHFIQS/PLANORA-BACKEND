import { Injectable, BadRequestException } from "@nestjs/common";
import { uploadFileToCloudinary, deleteFileFromCloudinary } from "../../config/cloudinary.config";

@Injectable()
export class FileService {
  async uploadImage(files: Express.Multer.File[] | undefined) {
    if (!files || files.length === 0) {
      throw new BadRequestException("No file uploaded");
    }

    if (files.length === 1) {
      const result = await uploadFileToCloudinary(
        files[0].buffer,
        files[0].originalname
      );
      return { url: result.secure_url };
    }

    const uploadPromises = files.map((file) =>
      uploadFileToCloudinary(file.buffer, file.originalname)
    );

    const results = await Promise.all(uploadPromises);
    return results.map((result) => ({ url: result.secure_url }));
  }

  async deleteImage(urls: string | string[]) {
    if (!urls) {
      throw new BadRequestException("Image URL is required");
    }

    if (Array.isArray(urls)) {
      await Promise.all(urls.map((url) => deleteFileFromCloudinary(url)));
      return null;
    }

    await deleteFileFromCloudinary(urls);
    return null;
  }
}

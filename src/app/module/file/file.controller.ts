import { Request, Response } from "express";
import status from "http-status";
import { FileService } from "./file.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";

const uploadImage = catchAsync(async (req: Request, res: Response) => {
     const files = req.files as Express.Multer.File[];
     if (files?.length > 10) {
          throw new AppError(status.BAD_REQUEST, "Maximum 10 images are allowed");
     }

     const result = await FileService.uploadImage(files);

     sendResponse(res, {
          httpStatusCode: status.OK,
          success: true,
          message: "Image uploaded successfully",
          data: result,
     });
});

const deleteImage = catchAsync(async (req: Request, res: Response) => {
     const { url } = req.body;

     const result = await FileService.deleteImage(url);

     sendResponse(res, {
          httpStatusCode: status.OK,
          success: true,
          message: "Image deleted successfully",
          data: result,
     });
});

export const FileController = {
     uploadImage,
     deleteImage,
};
import { Request, Response } from "express";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { catchAsync } from "../../shared/catchAsync";
import { PublicService } from "./public.service";

const getStats = catchAsync(async (req: Request, res: Response) => {
  
  const result = await PublicService.getStats();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User stats fetched",
    data: result,
  });
});

export const PublicController = {
  getStats,
};
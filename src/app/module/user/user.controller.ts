import { Request, Response } from "express";
import status from "http-status";
import { UserService } from "./user.service";
import { sendResponse } from "../../shared/sendResponse";
import { catchAsync } from "../../shared/catchAsync";

const getMyStats = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const result = await UserService.getUserStats(user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User stats fetched",
    data: result,
  });
});

export const UserController = {
  getMyStats,
};
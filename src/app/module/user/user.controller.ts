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

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createAdmin(req.body);
  sendResponse(res, { httpStatusCode: status.CREATED, success: true, message: "Admin created", data: result });
});

const suspendUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status: actionStatus } = req.body;
  const currentUserRole = req.user!.role;
  const result = await UserService.suspendUser(id as string, currentUserRole, actionStatus, req.user!.userId);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "User status updated", data: result });
});

export const UserController = {
  getMyStats,
  createAdmin,
  suspendUser,
};
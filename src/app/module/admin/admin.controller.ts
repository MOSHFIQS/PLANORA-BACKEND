import { Request, Response } from "express";
import status from "http-status";
import { AdminService } from "./admin.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  const query = req.query;
  const result = await AdminService.getAllUsers(user, query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Users fetched",
    data: result,
  });
});

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  const query = req.query;
  const result = await AdminService.getAllAdmins(user, query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admins fetched",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status: statusValue } = req.body;
  const user = req.user;
  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

  const result = await AdminService.updateUserStatus(id as string, statusValue, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User status updated",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

  const result = await AdminService.deleteUser(id as string, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User deleted",
    data: result,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const user = req.user;

  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

  const result = await AdminService.updateUserRole(
    id as string,
    role,
    user
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User role updated",
    data: result,
  });
});

const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAdminStats();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin stats fetched",
    data: result,
  });
});


export const AdminController = {
  getAllUsers,
  getAllAdmins,
  updateUserStatus,
  deleteUser,
  updateUserRole,
  getAdminStats,
};
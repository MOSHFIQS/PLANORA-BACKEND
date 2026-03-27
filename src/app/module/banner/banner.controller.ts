import { Request, Response } from "express";
import status from "http-status";
import { BannerService } from "./banner.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";

// CREATE
const createBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.createBanner(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Banner created",
    data: result,
  });
});

// GET ALL
const getAllBanners = catchAsync(async (req, res) => {
  const result = await BannerService.getAllBanners();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Banners fetched",
    data: result,
  });
});

// GET ACTIVE
const getActiveBanners = catchAsync(async (req, res) => {
  const result = await BannerService.getActiveBanners();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Active banners fetched",
    data: result,
  });
});

// UPDATE
const updateBanner = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await BannerService.updateBanner(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Banner updated",
    data: result,
  });
});

const getBannerById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BannerService.getBannerById(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Banner fetched",
    data: result,
  });
});



// DELETE
const deleteBanner = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await BannerService.deleteBanner(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Banner deleted",
    data: result,
  });
});

const updateBannerStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new AppError(status.BAD_REQUEST, "isActive must be boolean");
  }

  const result = await BannerService.updateBannerStatus(id as string, isActive);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Banner status updated",
    data: result,
  });
});

export const BannerController = {
  createBanner,
  getAllBanners,
  getBannerById,
  getActiveBanners,
  updateBanner,
  deleteBanner,
  updateBannerStatus
};
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { ICreateBanner, IUpdateBanner } from "./banner.interface";

// CREATE
const createBanner = async (payload: ICreateBanner) => {
  return prisma.banner.create({
    data: payload,
  });
};

// GET ALL
const getAllBanners = async () => {
  return prisma.banner.findMany({
    where: { isDeleted: false },
    orderBy: { positionOrder: "asc" },
  });
};

// GET ACTIVE (IMPORTANT for frontend)
const getActiveBanners = async () => {
  return prisma.banner.findMany({
    where: {
      isDeleted: false,
      isActive: true,
    },
    orderBy: { positionOrder: "asc" },
  });
};

// GET SINGLE
const getSingleBanner = async (id: string) => {
  const banner = await prisma.banner.findUnique({
    where: { id },
  });

  if (!banner || banner.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Banner not found");
  }

  return banner;
};

// UPDATE
const updateBanner = async (id: string, payload: IUpdateBanner) => {
  await getSingleBanner(id);

  return prisma.banner.update({
    where: { id },
    data: payload,
  });
};

// DELETE
const deleteBanner = async (id: string) => {
  await getSingleBanner(id);

  return prisma.banner.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};

export const BannerService = {
  createBanner,
  getAllBanners,
  getActiveBanners,
  getSingleBanner,
  updateBanner,
  deleteBanner,
};
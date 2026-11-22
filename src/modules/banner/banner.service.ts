import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateBannerDto, UpdateBannerDto } from "./dto/banner.dto";

@Injectable()
export class BannerService {
  constructor(private readonly prisma: PrismaService) {}

  async createBanner(payload: CreateBannerDto) {
    return this.prisma.banner.create({
      data: payload as any,
    });
  }

  async getAllBanners() {
    return this.prisma.banner.findMany({
      where: { isDeleted: false },
      orderBy: { positionOrder: "asc" },
    });
  }

  async getActiveBanners() {
    return this.prisma.banner.findMany({
      where: {
        isDeleted: false,
        isActive: true,
      },
      orderBy: { positionOrder: "asc" },
    });
  }

  async getBannerById(id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!banner || banner.isDeleted) {
      throw new NotFoundException("Banner not found");
    }

    return banner;
  }

  async updateBanner(id: string, payload: UpdateBannerDto) {
    await this.getBannerById(id);

    return this.prisma.banner.update({
      where: { id },
      data: payload as any,
    });
  }

  async deleteBanner(id: string) {
    await this.getBannerById(id);

    return this.prisma.banner.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async updateBannerStatus(id: string, isActive: boolean) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner || banner.isDeleted) {
      throw new NotFoundException("Banner not found");
    }

    return this.prisma.banner.update({
      where: { id },
      data: { isActive },
    });
  }
}

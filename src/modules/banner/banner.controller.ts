import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { BannerService } from "./banner.service";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../generated/prisma/enums";
import {
  CreateBannerDto,
  UpdateBannerDto,
  UpdateBannerStatusDto,
} from "./dto/banner.dto";

@Controller("banner")
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Public()
  @Get()
  async getAllBanners() {
    return this.bannerService.getAllBanners();
  }

  @Public()
  @Get("active")
  async getActiveBanners() {
    return this.bannerService.getActiveBanners();
  }

  @Public()
  @Get(":id")
  async getBannerById(@Param("id") id: string) {
    return this.bannerService.getBannerById(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async createBanner(@Body() payload: CreateBannerDto) {
    return this.bannerService.createBanner(payload);
  }

  @Patch(":id")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async updateBanner(
    @Param("id") id: string,
    @Body() payload: UpdateBannerDto
  ) {
    return this.bannerService.updateBanner(id, payload);
  }

  @Delete(":id")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async deleteBanner(@Param("id") id: string) {
    return this.bannerService.deleteBanner(id);
  }

  @Patch(":id/status")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async updateBannerStatus(
    @Param("id") id: string,
    @Body() payload: UpdateBannerStatusDto
  ) {
    return this.bannerService.updateBannerStatus(id, payload.isActive);
  }
}

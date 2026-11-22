import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { BannerService } from "./banner.service";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../generated/prisma/enums";
import {
  CreateBannerDto,
  UpdateBannerDto,
  UpdateBannerStatusDto,
} from "./dto/banner.dto";

@ApiTags("Banner")
@Controller("banner")
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Get all banners" })
  @ApiResponse({ status: 200, description: "List of all banners returned successfully" })
  async getAllBanners() {
    return this.bannerService.getAllBanners();
  }

  @Public()
  @Get("active")
  @ApiOperation({ summary: "Get all active banners" })
  @ApiResponse({ status: 200, description: "List of active banners returned successfully" })
  async getActiveBanners() {
    return this.bannerService.getActiveBanners();
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Get banner by ID" })
  @ApiParam({ name: "id", description: "Banner ID" })
  @ApiResponse({ status: 200, description: "Banner details returned successfully" })
  @ApiResponse({ status: 404, description: "Banner not found" })
  async getBannerById(@Param("id") id: string) {
    return this.bannerService.getBannerById(id);
  }

  @Post()
  @ApiBearerAuth("bearer")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Create new banner (Admin/SuperAdmin)" })
  @ApiResponse({ status: 201, description: "Banner created successfully" })
  async createBanner(@Body() payload: CreateBannerDto) {
    return this.bannerService.createBanner(payload);
  }

  @Patch(":id")
  @ApiBearerAuth("bearer")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Update banner by ID (Admin/SuperAdmin)" })
  @ApiParam({ name: "id", description: "Banner ID" })
  @ApiResponse({ status: 200, description: "Banner updated successfully" })
  async updateBanner(
    @Param("id") id: string,
    @Body() payload: UpdateBannerDto
  ) {
    return this.bannerService.updateBanner(id, payload);
  }

  @Delete(":id")
  @ApiBearerAuth("bearer")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Delete banner by ID (Admin/SuperAdmin)" })
  @ApiParam({ name: "id", description: "Banner ID" })
  @ApiResponse({ status: 200, description: "Banner deleted successfully" })
  async deleteBanner(@Param("id") id: string) {
    return this.bannerService.deleteBanner(id);
  }

  @Patch(":id/status")
  @ApiBearerAuth("bearer")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Update banner active status (Admin/SuperAdmin)" })
  @ApiParam({ name: "id", description: "Banner ID" })
  @ApiResponse({ status: 200, description: "Banner status updated successfully" })
  async updateBannerStatus(
    @Param("id") id: string,
    @Body() payload: UpdateBannerStatusDto
  ) {
    return this.bannerService.updateBannerStatus(id, payload.isActive);
  }
}

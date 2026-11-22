import { Controller, Get } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { StatService } from "./stat.service";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";

@ApiTags("Stat")
@Controller("stat")
export class StatController {
  constructor(private readonly statService: StatService) {}

  @Get("superadmin")
  @ApiBearerAuth("bearer")
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: "Get platform overall statistics (SuperAdmin)" })
  @ApiResponse({ status: 200, description: "SuperAdmin platform stats returned successfully" })
  async getSuperAdminStats() {
    return this.statService.getSuperAdminStats();
  }

  @Get("admin")
  @ApiBearerAuth("bearer")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Get admin statistics (Admin/SuperAdmin)" })
  @ApiResponse({ status: 200, description: "Admin platform stats returned successfully" })
  async getAdminStats() {
    return this.statService.getAdminStats();
  }

  @Get("organizer")
  @ApiBearerAuth("bearer")
  @Roles(Role.ORGANIZER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Get organizer event statistics" })
  @ApiResponse({ status: 200, description: "Organizer stats returned successfully" })
  async getOrganizerStats(@CurrentUser() user: IRequestUser) {
    return this.statService.getOrganizerStats(user);
  }

  @Get("user")
  @ApiBearerAuth("bearer")
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Get current user event & ticket statistics" })
  @ApiResponse({ status: 200, description: "User stats returned successfully" })
  async getUserStats(@CurrentUser() user: IRequestUser) {
    return this.statService.getUserStats(user);
  }

  @Public()
  @Get("public")
  @ApiOperation({ summary: "Get public platform counts (Events, Users, Organizers)" })
  @ApiResponse({ status: 200, description: "Public stats returned successfully" })
  async getPublicStats() {
    return this.statService.getPublicStats();
  }
}

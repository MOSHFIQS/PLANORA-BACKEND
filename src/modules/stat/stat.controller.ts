import { Controller, Get } from "@nestjs/common";
import { StatService } from "./stat.service";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";

@Controller("stat")
export class StatController {
  constructor(private readonly statService: StatService) {}

  @Get("superadmin")
  @Roles(Role.SUPERADMIN)
  async getSuperAdminStats() {
    return this.statService.getSuperAdminStats();
  }

  @Get("admin")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getAdminStats() {
    return this.statService.getAdminStats();
  }

  @Get("organizer")
  @Roles(Role.ORGANIZER, Role.ADMIN, Role.SUPERADMIN)
  async getOrganizerStats(@CurrentUser() user: IRequestUser) {
    return this.statService.getOrganizerStats(user);
  }

  @Get("user")
  @Roles(Role.USER, Role.ORGANIZER, Role.ADMIN, Role.SUPERADMIN)
  async getUserStats(@CurrentUser() user: IRequestUser) {
    return this.statService.getUserStats(user);
  }

  @Public()
  @Get("public")
  async getPublicStats() {
    return this.statService.getPublicStats();
  }
}

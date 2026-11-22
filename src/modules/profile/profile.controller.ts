import { Controller, Get, Patch, Body } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Controller("profile")
@Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get("me")
  async getMyProfile(@CurrentUser() user: IRequestUser) {
    return this.profileService.getMyProfile(user);
  }

  @Patch("me")
  async updateProfile(
    @CurrentUser() user: IRequestUser,
    @Body() payload: UpdateProfileDto
  ) {
    return this.profileService.updateProfile(user, payload);
  }
}

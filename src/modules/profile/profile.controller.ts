import { Controller, Get, Patch, Body } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ProfileService } from "./profile.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@ApiTags("Profile")
@ApiBearerAuth("bearer")
@Controller("profile")
@Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current logged-in user profile" })
  @ApiResponse({ status: 200, description: "Profile details returned successfully" })
  async getMyProfile(@CurrentUser() user: IRequestUser) {
    return this.profileService.getMyProfile(user);
  }

  @Patch("me")
  @ApiOperation({ summary: "Update current logged-in user profile (name, avatar image)" })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  async updateProfile(
    @CurrentUser() user: IRequestUser,
    @Body() payload: UpdateProfileDto
  ) {
    return this.profileService.updateProfile(user, payload);
  }
}

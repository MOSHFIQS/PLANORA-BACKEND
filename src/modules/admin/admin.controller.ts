import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { IQueryParams } from "../../common/interfaces/query.interface";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateUserRoleDto, UpdateUserStatusDto } from "./dto/update-user.dto";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getAllUsers(
    @CurrentUser() user: IRequestUser,
    @Query() query: IQueryParams
  ) {
    return this.adminService.getAllUsers(user, query);
  }

  @Get("users/:id")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getSingleUser(@Param("id") id: string) {
    return this.adminService.getSingleUser(id);
  }

  @Patch("users/:id/status")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async updateUserStatus(
    @Param("id") id: string,
    @Body() payload: UpdateUserStatusDto,
    @CurrentUser() user: IRequestUser
  ) {
    return this.adminService.updateUserStatus(id, payload.status, user);
  }

  @Patch("users/:id/role")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async updateUserRole(
    @Param("id") id: string,
    @Body() payload: UpdateUserRoleDto,
    @CurrentUser() user: IRequestUser
  ) {
    return this.adminService.updateUserRole(id, payload.role, user);
  }

  @Delete("users/:id")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async deleteUser(
    @Param("id") id: string,
    @CurrentUser() user: IRequestUser
  ) {
    return this.adminService.deleteUser(id, user);
  }

  @Get("admins")
  @Roles(Role.SUPERADMIN)
  async getAllAdmins(
    @CurrentUser() user: IRequestUser,
    @Query() query: IQueryParams
  ) {
    return this.adminService.getAllAdmins(user, query);
  }

  @Post("admins")
  @Roles(Role.SUPERADMIN)
  async createAdmin(@Body() payload: CreateAdminDto) {
    return this.adminService.createAdmin(payload);
  }
}

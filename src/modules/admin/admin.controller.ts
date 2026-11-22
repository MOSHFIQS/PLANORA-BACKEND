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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateUserRoleDto, UpdateUserStatusDto } from "./dto/update-user.dto";

@ApiTags("Admin")
@ApiBearerAuth("bearer")
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Get all platform users with filtering & pagination" })
  @ApiResponse({ status: 200, description: "List of users returned successfully" })
  async getAllUsers(
    @CurrentUser() user: IRequestUser,
    @Query() query: PaginationQueryDto
  ) {
    return this.adminService.getAllUsers(user, query);
  }

  @Get("users/:id")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Get user details by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "User details returned successfully" })
  async getSingleUser(@Param("id") id: string) {
    return this.adminService.getSingleUser(id);
  }

  @Patch("users/:id/status")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Update user account status (e.g. ACTIVE, BLOCKED)" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "User status updated successfully" })
  async updateUserStatus(
    @Param("id") id: string,
    @Body() payload: UpdateUserStatusDto,
    @CurrentUser() user: IRequestUser
  ) {
    return this.adminService.updateUserStatus(id, payload.status, user);
  }

  @Patch("users/:id/role")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Update user role (e.g. USER, ORGANIZER, ADMIN)" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "User role updated successfully" })
  async updateUserRole(
    @Param("id") id: string,
    @Body() payload: UpdateUserRoleDto,
    @CurrentUser() user: IRequestUser
  ) {
    return this.adminService.updateUserRole(id, payload.role, user);
  }

  @Delete("users/:id")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Delete user account" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  async deleteUser(
    @Param("id") id: string,
    @CurrentUser() user: IRequestUser
  ) {
    return this.adminService.deleteUser(id, user);
  }

  @Get("admins")
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: "Get all admins (SuperAdmin only)" })
  @ApiResponse({ status: 200, description: "List of admins returned successfully" })
  async getAllAdmins(
    @CurrentUser() user: IRequestUser,
    @Query() query: PaginationQueryDto
  ) {
    return this.adminService.getAllAdmins(user, query);
  }

  @Post("admins")
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: "Create new admin or superadmin (SuperAdmin only)" })
  @ApiResponse({ status: 201, description: "Admin created successfully" })
  async createAdmin(@Body() payload: CreateAdminDto) {
    return this.adminService.createAdmin(payload);
  }
}

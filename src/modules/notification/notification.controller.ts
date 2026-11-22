import { Controller, Get, Patch, Param } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { NotificationService } from "./notification.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../generated/prisma/enums";

@ApiTags("Notification")
@ApiBearerAuth("bearer")
@Controller("notification")
@Roles(Role.USER, Role.ORGANIZER, Role.ADMIN, Role.SUPERADMIN)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: "Get all notifications for logged-in user" })
  @ApiResponse({ status: 200, description: "User notifications list returned successfully" })
  async getMyNotifications(@CurrentUser() user: IRequestUser) {
    return this.notificationService.getMyNotifications(user.userId);
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notifications count" })
  @ApiResponse({ status: 200, description: "Unread notifications count returned successfully" })
  async getUnreadCount(@CurrentUser() user: IRequestUser) {
    return this.notificationService.getUnreadCount(user.userId);
  }

  @Patch("mark-all-read")
  @ApiOperation({ summary: "Mark all notifications as read" })
  @ApiResponse({ status: 200, description: "All notifications marked as read" })
  async markAllAsRead(@CurrentUser() user: IRequestUser) {
    return this.notificationService.markAllAsRead(user.userId);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark single notification as read" })
  @ApiParam({ name: "id", description: "Notification ID" })
  @ApiResponse({ status: 200, description: "Notification marked as read" })
  async markAsRead(
    @CurrentUser() user: IRequestUser,
    @Param("id") id: string
  ) {
    return this.notificationService.markAsRead(user.userId, id);
  }
}

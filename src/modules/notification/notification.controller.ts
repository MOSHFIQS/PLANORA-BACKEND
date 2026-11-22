import { Controller, Get, Patch, Param } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../generated/prisma/enums";

@Controller("notification")
@Roles(Role.USER, Role.ORGANIZER, Role.ADMIN, Role.SUPERADMIN)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getMyNotifications(@CurrentUser() user: IRequestUser) {
    return this.notificationService.getMyNotifications(user.userId);
  }

  @Get("unread-count")
  async getUnreadCount(@CurrentUser() user: IRequestUser) {
    return this.notificationService.getUnreadCount(user.userId);
  }

  @Patch("mark-all-read")
  async markAllAsRead(@CurrentUser() user: IRequestUser) {
    return this.notificationService.markAllAsRead(user.userId);
  }

  @Patch(":id/read")
  async markAsRead(
    @CurrentUser() user: IRequestUser,
    @Param("id") id: string
  ) {
    return this.notificationService.markAsRead(user.userId, id);
  }
}

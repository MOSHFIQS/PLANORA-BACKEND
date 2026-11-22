/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { NotificationType } from "../../generated/prisma/enums";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    eventId?: string,
    paymentId?: string,
    metadata?: any
  ): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          eventId,
          paymentId,
          metadata: metadata ? metadata : undefined,
        },
      });
    } catch (error: any) {
      this.logger.error("Failed to send notification:", error.message);
    }
  }

  async getMyNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException("Unauthorized");
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }
}

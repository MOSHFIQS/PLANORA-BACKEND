import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { AuditService } from "../audit/audit.service";
import { NotificationService } from "../notification/notification.service";
import {
  AuditAction,
  EventVisibility,
  NotificationType,
  Role,
} from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { IQueryParams } from "../../common/interfaces/query.interface";
import { QueryBuilder } from "../../common/utils/query-builder.util";
import { SendInvitationDto } from "./dto/send-invitation.dto";

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService
  ) {}

  async sendInvitation(user: IRequestUser, payload: SendInvitationDto) {
    const { eventId, targetUserId } = payload;

    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException("Event not found");

    if (event.visibility !== EventVisibility.PRIVATE) {
      throw new BadRequestException("Invitations only for private events");
    }

    if (event.organizerId !== user.userId) {
      throw new ForbiddenException("Not authorized");
    }

    if (event.organizerId === targetUserId) {
      throw new BadRequestException("Organizer cannot invite self");
    }

    const existingParticipation = await this.prisma.participation.findUnique({
      where: { userId_eventId: { userId: targetUserId, eventId } },
    });
    if (existingParticipation) {
      throw new BadRequestException("User already joined");
    }

    const existingInvitation = await this.prisma.invitation.findFirst({
      where: { userId: targetUserId, eventId },
    });
    if (existingInvitation) {
      throw new BadRequestException("User has already been invited");
    }

    const invitation = await this.prisma.invitation.create({
      data: {
        eventId,
        userId: targetUserId,
      },
    });

    await this.auditService.logAction(
      AuditAction.CREATE,
      "invitation",
      invitation.id,
      user.userId,
      "Sent invitation to target user"
    );

    await this.notificationService.sendNotification(
      targetUserId,
      "New Event Invitation",
      "You have been invited to an event!",
      NotificationType.INVITATION,
      eventId
    );

    return invitation;
  }

  async getEventInvitations(user: IRequestUser, eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException("Event not found");

    if (event.organizerId !== user.userId) {
      throw new ForbiddenException("Not authorized");
    }

    return this.prisma.invitation.findMany({
      where: { eventId },
      include: { user: true },
    });
  }

  async getMyInvitations(user: IRequestUser, query: IQueryParams) {
    const queryBuilder = new QueryBuilder(this.prisma.invitation, query);

    return queryBuilder
      .where({ userId: user.userId })
      .include({
        event: {
          select: {
            id: true,
            title: true,
            dateTime: true,
            type: true,
            fee: true,
            images: true,
          },
        },
      })
      .sort()
      .paginate()
      .execute();
  }

  async cancelInvitation(user: IRequestUser, invitationId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    if (
      invitation.userId !== user.userId &&
      user.role !== Role.ADMIN &&
      user.role !== Role.SUPERADMIN
    ) {
      throw new ForbiddenException("You are not allowed to cancel this invitation");
    }

    return this.prisma.invitation.delete({
      where: { id: invitationId },
    });
  }
}

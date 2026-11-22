/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { IQueryParams } from "../../common/interfaces/query.interface";
import { QueryBuilder } from "../../common/utils/query-builder.util";
import { ParticipationStatus, PaymentStatus } from "../../generated/prisma/enums";

@Injectable()
export class ParticipationService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyEvents(user: IRequestUser, query: IQueryParams) {
    const queryBuilder = new QueryBuilder(this.prisma.participation, query, {
      searchableFields: ["event.description", "event.title"],
    });

    return queryBuilder
      .search()
      .where({
        userId: user.userId,
        OR: [
          { status: ParticipationStatus.APPROVED },
          {
            payment: {
              some: {
                status: PaymentStatus.SUCCESS,
              },
            },
          },
        ],
      })
      .include({
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            venue: true,
            dateTime: true,
            type: true,
            fee: true,
            images: true,
            meetingLink: true,
            organizer: {
              select: {
                id: true,
                name: true,
              },
            },
            reviews: {
              where: { userId: user.userId },
              select: { id: true },
            },
          },
        },
        ticket: true,
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            invoiceUrl: true,
            transactionId: true,
          },
        },
      })
      .sort()
      .paginate()
      .execute();
  }

  async getEventParticipants(user: IRequestUser, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizerId !== user.userId) {
      throw new ForbiddenException("You are not allowed to view participants");
    }

    return this.prisma.participation.findMany({
      where: { eventId },
      include: { user: true },
    });
  }

  async getMyAllEventParticipants(user: IRequestUser) {
    const events = await this.prisma.event.findMany({
      where: { organizerId: user.userId },
      select: {
        id: true,
        title: true,
        dateTime: true,
        participations: {
          select: {
            user: { select: { id: true, name: true, email: true, image: true } },
            status: true,
          },
        },
        invitations: {
          select: {
            user: { select: { id: true, name: true, email: true, image: true } },
            status: true,
          },
        },
      },
    });

    const usersMap = new Map<string, any>();

    events.forEach((event) => {
      event.participations.forEach((p) => {
        const existingUser = usersMap.get(p.user.id) || { ...p.user, events: [] };
        const eventIndex = existingUser.events.findIndex((e: any) => e.eventId === event.id);

        if (p.status === "APPROVED" || p.status === "PENDING") {
          const invited = p.status === "PENDING";
          if (eventIndex > -1) {
            existingUser.events[eventIndex] = {
              ...existingUser.events[eventIndex],
              participationStatus: p.status,
              invited,
            };
          } else {
            existingUser.events.push({
              eventId: event.id,
              title: event.title,
              dateTime: event.dateTime,
              participationStatus: p.status,
              invitationStatus: null,
              invited,
            });
          }
          usersMap.set(p.user.id, existingUser);
        }
      });

      event.invitations.forEach((inv) => {
        const existingUser = usersMap.get(inv.user.id) || { ...inv.user, events: [] };
        const eventIndex = existingUser.events.findIndex((e: any) => e.eventId === event.id);

        if (eventIndex > -1) {
          const hasApproved = existingUser.events[eventIndex].participationStatus === "APPROVED";
          existingUser.events[eventIndex] = {
            ...existingUser.events[eventIndex],
            invitationStatus: inv.status,
            invited: !hasApproved,
          };
        } else {
          existingUser.events.push({
            eventId: event.id,
            title: event.title,
            dateTime: event.dateTime,
            participationStatus: null,
            invitationStatus: inv.status,
            invited: true,
          });
        }
        usersMap.set(inv.user.id, existingUser);
      });
    });

    return Array.from(usersMap.values());
  }

  async updateStatus(
    user: IRequestUser,
    participationId: string,
    newStatus: ParticipationStatus
  ) {
    const participation = await this.prisma.participation.findUnique({
      where: { id: participationId },
      include: { event: true },
    });

    if (!participation) {
      throw new NotFoundException("Participation not found");
    }

    if (participation.event.organizerId !== user.userId) {
      throw new ForbiddenException("Not authorized");
    }

    return this.prisma.participation.update({
      where: { id: participationId },
      data: { status: newStatus },
    });
  }
}

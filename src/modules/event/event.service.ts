import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { AuditService } from "../audit/audit.service";
import {
  AuditAction,
  EventVisibility,
  ParticipationStatus,
  PaymentStatus,
} from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { IQueryParams } from "../../common/interfaces/query.interface";
import { QueryBuilder } from "../../common/utils/query-builder.util";
import {
  eventFilterableFields,
  eventSearchableFields,
} from "../../common/constants/events.constant";
import { CreateEventDto, UpdateEventDto } from "./dto/event.dto";

@Injectable()
export class EventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async createEvent(user: IRequestUser, payload: CreateEventDto) {
    const categoryExists = await this.prisma.category.findUnique({
      where: { id: payload.categoryId },
    });

    if (!categoryExists) {
      throw new BadRequestException("Category does not exist");
    }

    const createdEvent = await this.prisma.event.create({
      data: {
        ...payload,
        organizerId: user.userId,
        dateTime: new Date(payload.dateTime),
      },
    });

    await this.auditService.logAction(
      AuditAction.CREATE,
      "event",
      createdEvent.id,
      user.userId,
      `Created event: ${createdEvent.title}`
    );

    return createdEvent;
  }

  async getAllEvents(query: IQueryParams) {
    const queryBuilder = new QueryBuilder(this.prisma.event, query, {
      searchableFields: eventSearchableFields,
      filterableFields: eventFilterableFields,
    });

    return queryBuilder
      .search()
      .filter()
      .where({ visibility: EventVisibility.PUBLIC })
      .selectFixed({
        id: true,
        title: true,
        dateTime: true,
        type: true,
        fee: true,
        images: true,
        categoryId: true,
        venue: true,
      })
      .sort()
      .paginate()
      .execute();
  }

  async getOrganizerEvents(user: IRequestUser, query: IQueryParams) {
    const queryBuilder = new QueryBuilder(this.prisma.event, query);

    return queryBuilder
      .where({ organizerId: user.userId })
      .include({
        _count: {
          select: { reviews: true },
        },
      })
      .sort()
      .paginate()
      .execute();
  }

  async getSingleEventPublic(user: IRequestUser, eventId: string) {
    const participation = await this.prisma.participation.findFirst({
      where: {
        eventId,
        userId: user.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
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
            organizerId: true,
            organizer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        ticket: true,
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            invoiceUrl: true,
            transactionId: true,
          },
        },
      },
    });

    const isUnlocked =
      participation &&
      (participation.status === ParticipationStatus.APPROVED ||
        participation.payment?.some((p) => p.status === PaymentStatus.SUCCESS));

    if (isUnlocked) {
      return {
        type: "FULL",
        data: participation,
      };
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        venue: true,
        dateTime: true,
        type: true,
        fee: true,
        images: true,
        organizer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    return {
      type: "PUBLIC",
      data: event,
    };
  }

  async organizersSingleEventById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: true,
        participations: true,
        invitations: true,
        reviews: true,
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    return event;
  }

  async updateEvent(id: string, user: IRequestUser, payload: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException("Event not found");

    if (event.organizerId !== user.userId) {
      throw new ForbiddenException("You are not authorized to update this event");
    }

    if (payload.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: payload.categoryId },
      });
      if (!categoryExists) {
        throw new BadRequestException("Category does not exist");
      }
    }

    const dataToUpdate = {
      ...payload,
      dateTime: payload.dateTime ? new Date(payload.dateTime) : undefined,
    };

    return this.prisma.event.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async deleteEventByOrganizer(id: string, user: IRequestUser) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { participations: true },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizerId !== user.userId) {
      throw new ForbiddenException("Only organizer can delete this event");
    }

    if (event.participations.length > 0) {
      throw new BadRequestException("Cannot delete event. Participants already joined.");
    }

    await this.prisma.event.delete({ where: { id } });

    await this.auditService.logAction(
      AuditAction.DELETE,
      "event",
      id,
      user.userId,
      "Deleted event by organizer"
    );

    return null;
  }

  async getAllEventsAdmin(query: IQueryParams) {
    const queryBuilder = new QueryBuilder(this.prisma.event, query);

    return queryBuilder
      .include({ organizer: true })
      .sort()
      .paginate()
      .execute();
  }

  async deleteEventByAdmin(id: string, user: IRequestUser) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException("Event not found");
    }

    await this.prisma.event.delete({ where: { id } });

    await this.auditService.logAction(
      AuditAction.DELETE,
      "event",
      id,
      user.userId,
      "Deleted event by admin"
    );

    return null;
  }

  async updateFeaturedStatus(id: string, isFeatured: boolean) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { id: true, visibility: true },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.visibility !== "PUBLIC") {
      throw new BadRequestException("Only public events can be featured");
    }

    return this.prisma.event.update({
      where: { id },
      data: { isFeatured },
    });
  }

  async getFeaturedEvents() {
    return this.prisma.event.findMany({
      where: {
        isFeatured: true,
        visibility: "PUBLIC",
      },
      orderBy: { dateTime: "asc" },
      include: { category: true },
    });
  }
}

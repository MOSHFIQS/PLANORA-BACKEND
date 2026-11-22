import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { IQueryParams } from "../../common/interfaces/query.interface";
import { QueryBuilder } from "../../common/utils/query-builder.util";

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserTickets(user: IRequestUser, query: IQueryParams) {
    const queryBuilder = new QueryBuilder(this.prisma.ticket, query);

    return queryBuilder
      .where({ userId: user.userId })
      .include({ event: true })
      .sort()
      .paginate()
      .execute();
  }

  async getEventTickets(eventId: string) {
    return this.prisma.ticket.findMany({
      where: { eventId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async checkIn(qrCode: string, organizerId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode },
      include: { event: true, user: true },
    });

    if (!ticket) {
      throw new BadRequestException("Invalid ticket");
    }

    if (ticket.status === "USED") {
      throw new BadRequestException("Ticket already used");
    }

    if (ticket.event.organizerId !== organizerId) {
      throw new ForbiddenException("Unauthorized");
    }

    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: "USED", checkedInAt: new Date() },
    });

    return {
      user: {
        id: ticket.user.id,
        name: ticket.user.name,
        email: ticket.user.email,
      },
      event: {
        id: ticket.event.id,
        title: ticket.event.title,
        dateTime: ticket.event.dateTime,
      },
    };
  }
}

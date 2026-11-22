import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import { TicketService } from "./ticket.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { IQueryParams } from "../../common/interfaces/query.interface";
import { CheckInTicketDto } from "./dto/check-in-ticket.dto";

@Controller("ticket")
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get("my")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  async getMyTickets(
    @CurrentUser() user: IRequestUser,
    @Query() query: IQueryParams
  ) {
    return this.ticketService.getUserTickets(user, query);
  }

  @Get("event/:eventId")
  @Roles(Role.ORGANIZER)
  async getEventTickets(@Param("eventId") eventId: string) {
    return this.ticketService.getEventTickets(eventId);
  }

  @Post("check-in")
  @Roles(Role.ORGANIZER)
  async checkIn(
    @CurrentUser() user: IRequestUser,
    @Body() payload: CheckInTicketDto
  ) {
    return this.ticketService.checkIn(payload.qrCode, user.userId);
  }
}

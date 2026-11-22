import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { TicketService } from "./ticket.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { CheckInTicketDto } from "./dto/check-in-ticket.dto";

@ApiTags("Ticket")
@ApiBearerAuth("bearer")
@Controller("ticket")
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get("my")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  @ApiOperation({ summary: "Get current user's purchased tickets with pagination" })
  @ApiResponse({ status: 200, description: "User tickets returned successfully" })
  async getMyTickets(
    @CurrentUser() user: IRequestUser,
    @Query() query: PaginationQueryDto
  ) {
    return this.ticketService.getUserTickets(user, query);
  }

  @Get("event/:eventId")
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: "Get all tickets for an event (Organizer only)" })
  @ApiParam({ name: "eventId", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Event tickets returned successfully" })
  async getEventTickets(@Param("eventId") eventId: string) {
    return this.ticketService.getEventTickets(eventId);
  }

  @Post("check-in")
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: "Scan and check in a ticket using QR Code (Organizer only)" })
  @ApiResponse({ status: 200, description: "Ticket verified and checked in successfully" })
  @ApiResponse({ status: 400, description: "Invalid or already used ticket" })
  async checkIn(
    @CurrentUser() user: IRequestUser,
    @Body() payload: CheckInTicketDto
  ) {
    return this.ticketService.checkIn(payload.qrCode, user.userId);
  }
}

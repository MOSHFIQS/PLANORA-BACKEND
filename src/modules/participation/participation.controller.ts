import {
  Controller,
  Get,
  Patch,
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
import { ParticipationService } from "./participation.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { UpdateParticipationStatusDto } from "./dto/update-participation-status.dto";

@ApiTags("Participation")
@ApiBearerAuth("bearer")
@Controller("participation")
export class ParticipationController {
  constructor(private readonly participationService: ParticipationService) {}

  @Get("my-events")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  @ApiOperation({ summary: "Get events current user is participating in" })
  @ApiResponse({ status: 200, description: "Participating events returned successfully" })
  async getMyEvents(
    @CurrentUser() user: IRequestUser,
    @Query() query: PaginationQueryDto
  ) {
    return this.participationService.getMyEvents(user, query);
  }

  @Get("event/:eventId")
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: "Get participants for an event (Organizer only)" })
  @ApiParam({ name: "eventId", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Event participants returned successfully" })
  async getEventParticipants(
    @CurrentUser() user: IRequestUser,
    @Param("eventId") eventId: string
  ) {
    return this.participationService.getEventParticipants(user, eventId);
  }

  @Get("my-all-participants")
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: "Get all participants across all events created by organizer" })
  @ApiResponse({ status: 200, description: "All participants list returned successfully" })
  async getMyAllEventParticipants(@CurrentUser() user: IRequestUser) {
    return this.participationService.getMyAllEventParticipants(user);
  }

  @Patch(":id/status")
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: "Update participant status (e.g. CONFIRMED, CANCELLED)" })
  @ApiParam({ name: "id", description: "Participation ID" })
  @ApiResponse({ status: 200, description: "Participant status updated successfully" })
  async updateStatus(
    @CurrentUser() user: IRequestUser,
    @Param("id") id: string,
    @Body() payload: UpdateParticipationStatusDto
  ) {
    return this.participationService.updateStatus(user, id, payload.status);
  }
}

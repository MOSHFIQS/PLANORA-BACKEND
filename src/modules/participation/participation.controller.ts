import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { ParticipationService } from "./participation.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { IQueryParams } from "../../common/interfaces/query.interface";
import { UpdateParticipationStatusDto } from "./dto/update-participation-status.dto";

@Controller("participation")
export class ParticipationController {
  constructor(private readonly participationService: ParticipationService) {}

  @Get("my-events")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  async getMyEvents(
    @CurrentUser() user: IRequestUser,
    @Query() query: IQueryParams
  ) {
    return this.participationService.getMyEvents(user, query);
  }

  @Get("event/:eventId")
  @Roles(Role.ORGANIZER)
  async getEventParticipants(
    @CurrentUser() user: IRequestUser,
    @Param("eventId") eventId: string
  ) {
    return this.participationService.getEventParticipants(user, eventId);
  }

  @Get("my-all-participants")
  @Roles(Role.ORGANIZER)
  async getMyAllEventParticipants(@CurrentUser() user: IRequestUser) {
    return this.participationService.getMyAllEventParticipants(user);
  }

  @Patch(":id/status")
  @Roles(Role.ORGANIZER)
  async updateStatus(
    @CurrentUser() user: IRequestUser,
    @Param("id") id: string,
    @Body() payload: UpdateParticipationStatusDto
  ) {
    return this.participationService.updateStatus(user, id, payload.status);
  }
}

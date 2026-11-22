import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { InvitationService } from "./invitation.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { IQueryParams } from "../../common/interfaces/query.interface";
import { SendInvitationDto } from "./dto/send-invitation.dto";

@Controller("invitation")
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post("send")
  @Roles(Role.ORGANIZER)
  async sendInvitation(
    @CurrentUser() user: IRequestUser,
    @Body() payload: SendInvitationDto
  ) {
    return this.invitationService.sendInvitation(user, payload);
  }

  @Get("event/:eventId")
  @Roles(Role.ORGANIZER)
  async getEventInvitations(
    @CurrentUser() user: IRequestUser,
    @Param("eventId") eventId: string
  ) {
    return this.invitationService.getEventInvitations(user, eventId);
  }

  @Get("my")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  async getMyInvitations(
    @CurrentUser() user: IRequestUser,
    @Query() query: IQueryParams
  ) {
    return this.invitationService.getMyInvitations(user, query);
  }

  @Delete(":id")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  async cancelInvitation(
    @CurrentUser() user: IRequestUser,
    @Param("id") id: string
  ) {
    return this.invitationService.cancelInvitation(user, id);
  }
}

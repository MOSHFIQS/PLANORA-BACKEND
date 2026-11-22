import {
  Controller,
  Get,
  Post,
  Delete,
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
import { InvitationService } from "./invitation.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { SendInvitationDto } from "./dto/send-invitation.dto";

@ApiTags("Invitation")
@ApiBearerAuth("bearer")
@Controller("invitation")
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post("send")
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: "Send event invitation to a user (Organizer only)" })
  @ApiResponse({ status: 201, description: "Invitation sent successfully" })
  async sendInvitation(
    @CurrentUser() user: IRequestUser,
    @Body() payload: SendInvitationDto
  ) {
    return this.invitationService.sendInvitation(user, payload);
  }

  @Get("event/:eventId")
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: "Get all invitations for an event (Organizer only)" })
  @ApiParam({ name: "eventId", description: "Event ID" })
  @ApiResponse({ status: 200, description: "List of invitations returned successfully" })
  async getEventInvitations(
    @CurrentUser() user: IRequestUser,
    @Param("eventId") eventId: string
  ) {
    return this.invitationService.getEventInvitations(user, eventId);
  }

  @Get("my")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  @ApiOperation({ summary: "Get invitations received by current user" })
  @ApiResponse({ status: 200, description: "User's received invitations returned successfully" })
  async getMyInvitations(
    @CurrentUser() user: IRequestUser,
    @Query() query: PaginationQueryDto
  ) {
    return this.invitationService.getMyInvitations(user, query);
  }

  @Delete(":id")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  @ApiOperation({ summary: "Cancel or decline invitation" })
  @ApiParam({ name: "id", description: "Invitation ID" })
  @ApiResponse({ status: 200, description: "Invitation cancelled successfully" })
  async cancelInvitation(
    @CurrentUser() user: IRequestUser,
    @Param("id") id: string
  ) {
    return this.invitationService.cancelInvitation(user, id);
  }
}

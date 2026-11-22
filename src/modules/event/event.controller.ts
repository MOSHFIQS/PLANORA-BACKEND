import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { EventService } from "./event.service";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { IQueryParams } from "../../common/interfaces/query.interface";
import {
  CreateEventDto,
  UpdateEventDto,
  UpdateFeaturedDto,
} from "./dto/event.dto";

@Controller("event")
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // Public
  @Public()
  @Get()
  async getAllEvents(@Query() query: IQueryParams) {
    return this.eventService.getAllEvents(query);
  }

  @Get("featured")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getFeaturedEvents() {
    return this.eventService.getFeaturedEvents();
  }

  @Get("public/:id")
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN, Role.ORGANIZER)
  async getSingleEventPublic(
    @CurrentUser() user: IRequestUser,
    @Param("id") id: string
  ) {
    return this.eventService.getSingleEventPublic(user, id);
  }

  // Admin
  @Get("admin/all")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getAllEventsAdmin(@Query() query: IQueryParams) {
    return this.eventService.getAllEventsAdmin(query);
  }

  @Delete("admin/:id")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async deleteEventByAdmin(
    @Param("id") id: string,
    @CurrentUser() user: IRequestUser
  ) {
    return this.eventService.deleteEventByAdmin(id, user);
  }

  @Patch("admin/feature/:id")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async updateFeaturedStatus(
    @Param("id") id: string,
    @Body() payload: UpdateFeaturedDto
  ) {
    return this.eventService.updateFeaturedStatus(id, payload.isFeatured);
  }

  // Organizer
  @Post()
  @Roles(Role.ORGANIZER)
  async createEvent(
    @CurrentUser() user: IRequestUser,
    @Body() payload: CreateEventDto
  ) {
    return this.eventService.createEvent(user, payload);
  }

  @Get("me/events")
  @Roles(Role.ORGANIZER)
  async getOrganizerEvents(
    @CurrentUser() user: IRequestUser,
    @Query() query: IQueryParams
  ) {
    return this.eventService.getOrganizerEvents(user, query);
  }

  // Dynamic parameterized routes LAST
  @Get(":id")
  @Roles(Role.ORGANIZER)
  async organizersSingleEventById(@Param("id") id: string) {
    return this.eventService.organizersSingleEventById(id);
  }

  @Patch(":id")
  @Roles(Role.ORGANIZER)
  async updateEvent(
    @Param("id") id: string,
    @CurrentUser() user: IRequestUser,
    @Body() payload: UpdateEventDto
  ) {
    return this.eventService.updateEvent(id, user, payload);
  }

  @Delete(":id")
  @Roles(Role.ORGANIZER)
  async deleteEventByOrganizer(
    @Param("id") id: string,
    @CurrentUser() user: IRequestUser
  ) {
    return this.eventService.deleteEventByOrganizer(id, user);
  }
}

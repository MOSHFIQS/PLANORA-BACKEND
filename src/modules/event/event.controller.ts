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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { EventService } from "./event.service";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import {
  CreateEventDto,
  UpdateEventDto,
  UpdateFeaturedDto,
} from "./dto/event.dto";

@ApiTags("Event")
@Controller("event")
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // Public
  @Public()
  @Get()
  @ApiOperation({ summary: "Get all public events with filtering, search & pagination" })
  @ApiResponse({ status: 200, description: "Events list returned successfully" })
  async getAllEvents(@Query() query: PaginationQueryDto) {
    return this.eventService.getAllEvents(query);
  }

  @Get("featured")
  @ApiBearerAuth("bearer")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Get all featured events (Admin/SuperAdmin)" })
  @ApiResponse({ status: 200, description: "Featured events returned successfully" })
  async getFeaturedEvents() {
    return this.eventService.getFeaturedEvents();
  }

  @Get("public/:id")
  @ApiBearerAuth("bearer")
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN, Role.ORGANIZER)
  @ApiOperation({ summary: "Get single event public details with user participation check" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Event details returned successfully" })
  async getSingleEventPublic(
    @CurrentUser() user: IRequestUser,
    @Param("id") id: string
  ) {
    return this.eventService.getSingleEventPublic(user, id);
  }

  // Admin
  @Get("admin/all")
  @ApiBearerAuth("bearer")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Get all events across platform (Admin/SuperAdmin)" })
  @ApiResponse({ status: 200, description: "All events returned successfully" })
  async getAllEventsAdmin(@Query() query: PaginationQueryDto) {
    return this.eventService.getAllEventsAdmin(query);
  }

  @Delete("admin/:id")
  @ApiBearerAuth("bearer")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Delete event by Admin/SuperAdmin" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Event deleted successfully" })
  async deleteEventByAdmin(
    @Param("id") id: string,
    @CurrentUser() user: IRequestUser
  ) {
    return this.eventService.deleteEventByAdmin(id, user);
  }

  @Patch("admin/feature/:id")
  @ApiBearerAuth("bearer")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Toggle event featured status (Admin/SuperAdmin)" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Featured status updated successfully" })
  async updateFeaturedStatus(
    @Param("id") id: string,
    @Body() payload: UpdateFeaturedDto
  ) {
    return this.eventService.updateFeaturedStatus(id, payload.isFeatured);
  }

  // Organizer
  @Post()
  @ApiBearerAuth("bearer")
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: "Create new event (Organizer only)" })
  @ApiResponse({ status: 201, description: "Event created successfully" })
  async createEvent(
    @CurrentUser() user: IRequestUser,
    @Body() payload: CreateEventDto
  ) {
    return this.eventService.createEvent(user, payload);
  }

  @Get("me/events")
  @ApiBearerAuth("bearer")
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: "Get all events created by logged-in organizer" })
  @ApiResponse({ status: 200, description: "Organizer's events returned successfully" })
  async getOrganizerEvents(
    @CurrentUser() user: IRequestUser,
    @Query() query: PaginationQueryDto
  ) {
    return this.eventService.getOrganizerEvents(user, query);
  }

  // Dynamic parameterized routes LAST
  @Get(":id")
  @ApiBearerAuth("bearer")
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: "Get organizer event details by ID" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Organizer event details returned successfully" })
  async organizersSingleEventById(@Param("id") id: string) {
    return this.eventService.organizersSingleEventById(id);
  }

  @Patch(":id")
  @ApiBearerAuth("bearer")
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: "Update event details (Organizer only)" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Event updated successfully" })
  async updateEvent(
    @CurrentUser() user: IRequestUser,
    @Param("id") id: string,
    @Body() payload: UpdateEventDto
  ) {
    return this.eventService.updateEvent(id, user, payload);
  }

  @Delete(":id")
  @ApiBearerAuth("bearer")
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: "Delete event (Organizer only)" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Event deleted successfully" })
  async deleteEvent(
    @CurrentUser() user: IRequestUser,
    @Param("id") id: string
  ) {
    return this.eventService.deleteEventByOrganizer(id, user);
  }
}

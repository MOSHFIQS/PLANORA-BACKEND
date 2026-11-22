import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { ReviewService } from "./review.service";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { CreateReviewDto, UpdateReviewDto } from "./dto/review.dto";

@ApiTags("Review")
@Controller("review")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiBearerAuth("bearer")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  @ApiOperation({ summary: "Create review and rating for an attended event" })
  @ApiResponse({ status: 201, description: "Review submitted successfully" })
  async createReview(
    @CurrentUser() user: IRequestUser,
    @Body() payload: CreateReviewDto
  ) {
    return this.reviewService.createReview(user, payload);
  }

  @Patch(":id")
  @ApiBearerAuth("bearer")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  @ApiOperation({ summary: "Update existing review" })
  @ApiParam({ name: "id", description: "Review ID" })
  @ApiResponse({ status: 200, description: "Review updated successfully" })
  async updateReview(
    @CurrentUser() user: IRequestUser,
    @Param("id") id: string,
    @Body() payload: UpdateReviewDto
  ) {
    return this.reviewService.updateReview(user, id, payload);
  }

  @Delete(":id")
  @ApiBearerAuth("bearer")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  @ApiOperation({ summary: "Delete review" })
  @ApiParam({ name: "id", description: "Review ID" })
  @ApiResponse({ status: 200, description: "Review deleted successfully" })
  async deleteReview(
    @CurrentUser() user: IRequestUser,
    @Param("id") id: string
  ) {
    return this.reviewService.deleteReview(user, id);
  }

  @Get("my")
  @ApiBearerAuth("bearer")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  @ApiOperation({ summary: "Get all reviews created by current user" })
  @ApiResponse({ status: 200, description: "List of user's reviews returned successfully" })
  async getMyReviews(@CurrentUser() user: IRequestUser) {
    return this.reviewService.getMyReviews(user);
  }

  @Public()
  @Get("event/:eventId")
  @ApiOperation({ summary: "Get public reviews for an event" })
  @ApiParam({ name: "eventId", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Event reviews list returned successfully" })
  async getEventReviews(@Param("eventId") eventId: string) {
    return this.reviewService.getEventReviews(eventId);
  }

  @Get("organizer/events/:eventId")
  @ApiBearerAuth("bearer")
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: "Get organizer event review analytics (Organizer only)" })
  @ApiParam({ name: "eventId", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Organizer review analytics returned successfully" })
  async getOrganizerEventReviews(
    @CurrentUser() user: IRequestUser,
    @Param("eventId") eventId: string
  ) {
    return this.reviewService.getOrganizerEventReviewsByEventId(user, eventId);
  }
}

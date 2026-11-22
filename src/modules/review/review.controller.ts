import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { ReviewService } from "./review.service";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { CreateReviewDto, UpdateReviewDto } from "./dto/review.dto";

@Controller("review")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  async createReview(
    @CurrentUser() user: IRequestUser,
    @Body() payload: CreateReviewDto
  ) {
    return this.reviewService.createReview(user, payload);
  }

  @Patch(":id")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  async updateReview(
    @CurrentUser() user: IRequestUser,
    @Param("id") id: string,
    @Body() payload: UpdateReviewDto
  ) {
    return this.reviewService.updateReview(user, id, payload);
  }

  @Delete(":id")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  async deleteReview(
    @CurrentUser() user: IRequestUser,
    @Param("id") id: string
  ) {
    return this.reviewService.deleteReview(user, id);
  }

  @Get("my")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  async getMyReviews(@CurrentUser() user: IRequestUser) {
    return this.reviewService.getMyReviews(user);
  }

  @Public()
  @Get("event/:eventId")
  async getEventReviews(@Param("eventId") eventId: string) {
    return this.reviewService.getEventReviews(eventId);
  }

  @Get("organizer/events/:eventId")
  @Roles(Role.ORGANIZER)
  async getOrganizerEventReviewsByEventId(
    @CurrentUser() user: IRequestUser,
    @Param("eventId") eventId: string
  ) {
    return this.reviewService.getOrganizerEventReviewsByEventId(user, eventId);
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { ParticipationStatus, Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { CreateReviewDto, UpdateReviewDto } from "./dto/review.dto";

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(user: IRequestUser, payload: CreateReviewDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: payload.eventId },
    });

    if (!event) throw new NotFoundException("Event not found");

    if (event.organizerId === user.userId) {
      throw new BadRequestException("Organizer cannot review own event");
    }

    const participation = await this.prisma.participation.findUnique({
      where: {
        userId_eventId: {
          userId: user.userId,
          eventId: payload.eventId,
        },
      },
    });

    if (!participation || participation.status !== ParticipationStatus.APPROVED) {
      throw new ForbiddenException("You did not attend this event");
    }

    const existing = await this.prisma.review.findUnique({
      where: {
        userId_eventId: {
          userId: user.userId,
          eventId: payload.eventId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException("Already reviewed");
    }

    return this.prisma.review.create({
      data: {
        userId: user.userId,
        eventId: payload.eventId,
        rating: payload.rating,
        comment: payload.comment || payload.feedback || "",
      },
    });
  }

  async updateReview(user: IRequestUser, id: string, payload: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) throw new NotFoundException("Review not found");

    if (review.userId !== user.userId) {
      throw new ForbiddenException("Not authorized to update this review");
    }

    const updateData: any = {};
    if (payload.rating !== undefined) updateData.rating = payload.rating;
    if (payload.comment !== undefined || payload.feedback !== undefined) {
      updateData.comment = payload.comment || payload.feedback;
    }

    return this.prisma.review.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteReview(user: IRequestUser, id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!review) throw new NotFoundException("Review not found");

    const isOwner = review.userId === user.userId;
    const isOrganizer = review.event.organizerId === user.userId;
    const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPERADMIN;

    if (!isOwner && !isOrganizer && !isAdmin) {
      throw new ForbiddenException("Not authorized to delete this review");
    }

    await this.prisma.review.delete({
      where: { id },
    });

    return null;
  }

  async getEventReviews(eventId: string) {
    return this.prisma.review.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getMyReviews(user: IRequestUser) {
    return this.prisma.review.findMany({
      where: { userId: user.userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getOrganizerEventReviewsByEventId(user: IRequestUser, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizerId !== user.userId) {
      throw new ForbiddenException("You are not the organizer of this event");
    }

    return this.prisma.review.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

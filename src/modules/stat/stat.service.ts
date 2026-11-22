import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import {
  InvitationStatus,
  ParticipationStatus,
  PaymentStatus,
  TicketStatus,
  UserStatus,
} from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";

@Injectable()
export class StatService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuperAdminStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      totalAdmins,
      totalOrganizers,
      totalEvents,
      totalPayments,
      monthlyRevenue,
      totalTickets,
      totalAuditLogs,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isDeleted: false } }),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE, isDeleted: false } }),
      this.prisma.user.count({ where: { role: "ADMIN", isDeleted: false } }),
      this.prisma.user.count({ where: { role: "ORGANIZER", isDeleted: false } }),
      this.prisma.event.count(),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCESS },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.SUCCESS,
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.ticket.count(),
      this.prisma.auditLog.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: totalAdmins,
        organizers: totalOrganizers,
      },
      events: { total: totalEvents },
      revenue: {
        total: totalPayments._sum.amount ?? 0,
        monthly: monthlyRevenue._sum.amount ?? 0,
      },
      tickets: { total: totalTickets },
      auditLogs: { total: totalAuditLogs },
    };
  }

  async getAdminStats() {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalOrganizers,
      totalEvents,
      publicEvents,
      privateEvents,
      totalRevenue,
      totalTickets,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isDeleted: false } }),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE, isDeleted: false } }),
      this.prisma.user.count({ where: { status: UserStatus.SUSPENDED, isDeleted: false } }),
      this.prisma.user.count({ where: { role: "ORGANIZER", isDeleted: false } }),
      this.prisma.event.count(),
      this.prisma.event.count({ where: { visibility: "PUBLIC" } }),
      this.prisma.event.count({ where: { visibility: "PRIVATE" } }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCESS },
        _sum: { amount: true },
      }),
      this.prisma.ticket.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        organizers: totalOrganizers,
      },
      events: {
        total: totalEvents,
        public: publicEvents,
        private: privateEvents,
      },
      revenue: {
        total: totalRevenue._sum.amount ?? 0,
      },
      tickets: {
        total: totalTickets,
      },
    };
  }

  async getOrganizerStats(user: IRequestUser) {
    const organizerId = user.userId;

    const [
      totalEvents,
      upcomingEvents,
      pastEvents,
      totalParticipants,
      totalTicketsSold,
      revenue,
      totalReviews,
    ] = await Promise.all([
      this.prisma.event.count({ where: { organizerId } }),
      this.prisma.event.count({
        where: { organizerId, dateTime: { gte: new Date() } },
      }),
      this.prisma.event.count({
        where: { organizerId, dateTime: { lt: new Date() } },
      }),
      this.prisma.participation.count({
        where: { event: { organizerId }, status: ParticipationStatus.APPROVED },
      }),
      this.prisma.ticket.count({
        where: { event: { organizerId } },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.SUCCESS,
          participation: { event: { organizerId } },
        },
        _sum: { amount: true },
      }),
      this.prisma.review.count({
        where: { event: { organizerId } },
      }),
    ]);

    return {
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
        past: pastEvents,
      },
      participants: { total: totalParticipants },
      tickets: { totalSold: totalTicketsSold },
      revenue: { total: revenue._sum.amount ?? 0 },
      reviews: { total: totalReviews },
    };
  }

  async getUserStats(user: IRequestUser) {
    const userId = user.userId;

    const [
      totalParticipations,
      pendingParticipations,
      approvedParticipations,
      rejectedParticipations,
      totalInvitations,
      pendingInvitations,
      acceptedInvitations,
      totalPayments,
      successfulPayments,
      totalSpent,
      totalTickets,
      validTickets,
      usedTickets,
      totalReviews,
      unreadNotifications,
    ] = await Promise.all([
      this.prisma.participation.count({ where: { userId } }),
      this.prisma.participation.count({ where: { userId, status: ParticipationStatus.PENDING } }),
      this.prisma.participation.count({ where: { userId, status: ParticipationStatus.APPROVED } }),
      this.prisma.participation.count({ where: { userId, status: ParticipationStatus.REJECTED } }),
      this.prisma.invitation.count({ where: { userId } }),
      this.prisma.invitation.count({ where: { userId, status: InvitationStatus.PENDING } }),
      this.prisma.invitation.count({ where: { userId, status: InvitationStatus.ACCEPTED } }),
      this.prisma.payment.count({ where: { userId } }),
      this.prisma.payment.count({ where: { userId, status: PaymentStatus.SUCCESS } }),
      this.prisma.payment.aggregate({
        where: { userId, status: PaymentStatus.SUCCESS },
        _sum: { amount: true },
      }),
      this.prisma.ticket.count({ where: { userId } }),
      this.prisma.ticket.count({ where: { userId, status: TicketStatus.VALID } }),
      this.prisma.ticket.count({ where: { userId, status: TicketStatus.USED } }),
      this.prisma.review.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      participations: {
        total: totalParticipations,
        byStatus: {
          pending: pendingParticipations,
          approved: approvedParticipations,
          rejected: rejectedParticipations,
        },
      },
      invitations: {
        total: totalInvitations,
        byStatus: { pending: pendingInvitations, accepted: acceptedInvitations },
      },
      payments: {
        total: totalPayments,
        successful: successfulPayments,
        totalSpent: totalSpent._sum.amount ?? 0,
      },
      tickets: {
        total: totalTickets,
        valid: validTickets,
        used: usedTickets,
      },
      reviews: { total: totalReviews },
      notifications: { unread: unreadNotifications },
    };
  }

  async getPublicStats() {
    const now = new Date();

    const [
      totalActiveUsers,
      totalEventsDone,
      totalTicketsCreated,
      totalOrganizers,
      totalParticipants,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { status: "ACTIVE", isDeleted: false },
      }),
      this.prisma.event.count({
        where: { dateTime: { lt: now } },
      }),
      this.prisma.ticket.count(),
      this.prisma.user.count({
        where: { events: { some: {} }, isDeleted: false },
      }),
      this.prisma.participation.count(),
    ]);

    return {
      totalActiveUsers,
      totalEventsDone,
      totalTicketsCreated,
      totalOrganizers,
      totalParticipants,
    };
  }
}

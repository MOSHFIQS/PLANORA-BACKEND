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
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

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
        where: { status: PaymentStatus.SUCCESS, createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.ticket.count(),
      this.prisma.auditLog.count(),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers, admins: totalAdmins, organizers: totalOrganizers },
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
      users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, organizers: totalOrganizers },
      events: { total: totalEvents, public: publicEvents, private: privateEvents },
      revenue: { total: totalRevenue._sum.amount ?? 0 },
      tickets: { total: totalTickets },
    };
  }

  async getOrganizerStats(user: IRequestUser) {
    const organizerId = user.userId;
    const now = new Date();

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
      this.prisma.event.count({ where: { organizerId, dateTime: { gte: now } } }),
      this.prisma.event.count({ where: { organizerId, dateTime: { lt: now } } }),
      this.prisma.participation.count({
        where: { event: { organizerId }, status: ParticipationStatus.APPROVED },
      }),
      this.prisma.ticket.count({ where: { event: { organizerId } } }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCESS, participation: { event: { organizerId } } },
        _sum: { amount: true },
      }),
      this.prisma.review.count({ where: { event: { organizerId } } }),
    ]);

    return {
      events: { total: totalEvents, upcoming: upcomingEvents, past: pastEvents },
      participants: { total: totalParticipants },
      tickets: { totalSold: totalTicketsSold },
      revenue: { total: revenue._sum.amount ?? 0 },
      reviews: { total: totalReviews },
    };
  }

  async getUserStats(user: IRequestUser) {
    const userId = user.userId;

    const [parts, invites, payments, tickets, totalReviews, unreadNotifications] =
      await Promise.all([
        this.prisma.participation.groupBy({
          by: ["status"],
          where: { userId },
          _count: { _all: true },
        }),
        this.prisma.invitation.groupBy({
          by: ["status"],
          where: { userId },
          _count: { _all: true },
        }),
        this.prisma.payment.groupBy({
          by: ["status"],
          where: { userId },
          _count: { _all: true },
          _sum: { amount: true },
        }),
        this.prisma.ticket.groupBy({
          by: ["status"],
          where: { userId },
          _count: { _all: true },
        }),
        this.prisma.review.count({ where: { userId } }),
        this.prisma.notification.count({ where: { userId, isRead: false } }),
      ]);

    const partMap = Object.fromEntries(parts.map((p) => [p.status, p._count._all]));
    const invMap = Object.fromEntries(invites.map((i) => [i.status, i._count._all]));
    const ticketMap = Object.fromEntries(tickets.map((t) => [t.status, t._count._all]));
    const totalPayments = payments.reduce((acc, p) => acc + p._count._all, 0);
    const successPay = payments.find((p) => p.status === PaymentStatus.SUCCESS);

    return {
      participations: {
        total: parts.reduce((acc, p) => acc + p._count._all, 0),
        byStatus: {
          pending: partMap[ParticipationStatus.PENDING] ?? 0,
          approved: partMap[ParticipationStatus.APPROVED] ?? 0,
          rejected: partMap[ParticipationStatus.REJECTED] ?? 0,
        },
      },
      invitations: {
        total: invites.reduce((acc, i) => acc + i._count._all, 0),
        byStatus: {
          pending: invMap[InvitationStatus.PENDING] ?? 0,
          accepted: invMap[InvitationStatus.ACCEPTED] ?? 0,
        },
      },
      payments: {
        total: totalPayments,
        successful: successPay?._count._all ?? 0,
        totalSpent: successPay?._sum.amount ?? 0,
      },
      tickets: {
        total: tickets.reduce((acc, t) => acc + t._count._all, 0),
        valid: ticketMap[TicketStatus.VALID] ?? 0,
        used: ticketMap[TicketStatus.USED] ?? 0,
      },
      reviews: { total: totalReviews },
      notifications: { unread: unreadNotifications },
    };
  }

  async getPublicStats() {
    const now = new Date();
    const [totalActiveUsers, totalEventsDone, totalTicketsCreated, totalOrganizers, totalParticipants] =
      await Promise.all([
        this.prisma.user.count({ where: { status: "ACTIVE", isDeleted: false } }),
        this.prisma.event.count({ where: { dateTime: { lt: now } } }),
        this.prisma.ticket.count(),
        this.prisma.user.count({ where: { events: { some: {} }, isDeleted: false } }),
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

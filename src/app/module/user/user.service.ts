import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { ParticipationStatus, InvitationStatus, PaymentStatus } from "../../../generated/prisma/enums";

const getUserStats = async (user: IRequestUser) => {
  const userId = user.userId;

  // ===== PARTICIPATION STATS =====
  const totalJoined = await prisma.participation.count({
    where: { userId },
  });

  const approvedJoined = await prisma.participation.count({
    where: { userId, status: ParticipationStatus.APPROVED },
  });

  const pendingJoined = await prisma.participation.count({
    where: { userId, status: ParticipationStatus.PENDING },
  });

  // ===== INVITATION STATS =====
  const totalInvitesReceived = await prisma.invitation.count({
    where: { userId },
  });

  const acceptedInvites = await prisma.invitation.count({
    where: { userId, status: InvitationStatus.ACCEPTED },
  });

  const pendingInvites = await prisma.invitation.count({
    where: { userId, status: InvitationStatus.PENDING },
  });

  // ===== PAYMENT STATS =====
  const totalPayments = await prisma.payment.count({
    where: { userId },
  });

  const successfulPayments = await prisma.payment.count({
    where: { userId, status: PaymentStatus.SUCCESS },
  });

  const totalSpent = await prisma.payment.aggregate({
    where: { userId, status: PaymentStatus.SUCCESS },
    _sum: { amount: true },
  });

  // ===== REVIEW STATS =====
  const totalReviews = await prisma.review.count({
    where: { userId },
  });

  // ===== ORGANIZER STATS =====
  const totalEventsCreated = await prisma.event.count({
    where: { organizerId: userId },
  });

  const totalParticipantsInMyEvents = await prisma.participation.count({
    where: {
      event: { organizerId: userId },
      status: ParticipationStatus.APPROVED,
    },
  });

  const totalInvitesSent = await prisma.invitation.count({
    where: {
      event: { organizerId: userId },
    },
  });

  const acceptedInvitesOnMyEvents = await prisma.invitation.count({
    where: {
      event: { organizerId: userId },
      status: InvitationStatus.ACCEPTED,
    },
  });

  const totalReviewsOnMyEvents = await prisma.review.count({
    where: {
      event: { organizerId: userId },
    },
  });

  return {
    participation: {
      totalJoined,
      approvedJoined,
      pendingJoined,
    },

    invitations: {
      totalInvitesReceived,
      acceptedInvites,
      pendingInvites,
    },

    payments: {
      totalPayments,
      successfulPayments,
      totalSpent: totalSpent._sum.amount || 0,
    },

    reviews: {
      totalReviews,
    },

    organizer: {
      totalEventsCreated,
      totalParticipantsInMyEvents,
      totalInvitesSent,
      acceptedInvitesOnMyEvents,
      totalReviewsOnMyEvents,
    },
  };
};

export const UserService = {
  getUserStats,
};
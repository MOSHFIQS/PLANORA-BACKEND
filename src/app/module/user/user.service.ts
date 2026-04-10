import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { ParticipationStatus, InvitationStatus, PaymentStatus, Role, AuditAction, UserStatus, NotificationType } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { AuditLogService } from "../audit/audit.service";
import { NotificationService } from "../notification/notification.service";


const roleHierarchy: Record<Role, number> = {
  [Role.SUPERADMIN]: 4,
  [Role.ADMIN]: 3,
  [Role.ORGANIZER]: 2,
  [Role.USER]: 1,
};




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

const createAdmin = async (payload: any) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: { name, email, password, role: Role.ADMIN },
  });
  if (!data?.user) throw new AppError(status.BAD_REQUEST, "Failed to create Admin");
  return data.user;
};

const suspendUser = async (targetId: string, currentUserRole: Role, actionStatus: UserStatus, actorId?: string) => {
  const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
  if (!targetUser) throw new AppError(status.NOT_FOUND, "User not found");

  if (roleHierarchy[currentUserRole] <= roleHierarchy[targetUser.role]) {
    throw new AppError(status.FORBIDDEN, "You do not have permission to modify this user's status");
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetId },
    data: { status: actionStatus },
  });

  await AuditLogService.logAction(
    AuditAction.SUSPEND,
    "user",
    targetId,
    actorId || null,
    `Status changed to ${actionStatus}`
  );

  await NotificationService.sendNotification(
    targetId,
    "Account Status Update",
    `Your account has been moved to ${actionStatus}.`,
    actionStatus === UserStatus.SUSPENDED ? NotificationType.WARNING : NotificationType.INFO
  );

  return updatedUser;
};


export const UserService = {
  getUserStats,
  createAdmin,
  suspendUser,
};
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { InvitationStatus, ParticipationStatus, PaymentStatus, Role, UserStatus } from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";

// get all users
const getAllUsers = async () => {
  return prisma.user.findMany({
    where: {
      isDeleted: false,
      role: "USER",
    },
    orderBy: { createdAt: "desc" },
  });
};

const getAllAdmins = async () => {
  return prisma.user.findMany({
    where: {
      isDeleted: false,
      role: "ADMIN",
    },
    orderBy: { createdAt: "desc" },
  });
};

// get single user
const getSingleUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user || user.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return user;
};

// update user status (ACTIVE / SUSPENDED)
const updateUserStatus = async (id: string, statusValue: UserStatus, user: IRequestUser) => {
  if (user.role !== "ADMIN") {
    throw new AppError(status.UNAUTHORIZED, "You are not authorized");
  }
  if (user.userId === id) {
    throw new AppError(status.BAD_REQUEST, "You cannot suspended yourself");
  }
  return prisma.user.update({
    where: { id },
    data: { status: statusValue },
  });
};

// soft delete user
const deleteUser = async (id: string, user: IRequestUser) => {

  if (user.role !== "ADMIN") {
    throw new AppError(status.UNAUTHORIZED, "You are not authorized");
  }


  if (user.userId === id) {
    throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
  }

  //  Delete (soft delete)
  return prisma.user.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};


const updateUserRole = async (
  id: string,
  role: Role,
  user: IRequestUser
) => {
  // only admin can change role
  if (user.role !== "ADMIN") {
    throw new AppError(status.UNAUTHORIZED, "You are not authorized");
  }

  // prevent self role change (very important)
  if (user.userId === id) {
    throw new AppError(status.BAD_REQUEST, "You cannot change your own role");
  }

  // check user exists
  const targetUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!targetUser || targetUser.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: { role },
  });
};



const getAdminStats = async () => {
  // ===== USERS =====
  const totalUsers = await prisma.user.count();

  const totalAdmins = await prisma.user.count({
    where: { role: "ADMIN" },
  });

  const totalNormalUsers = await prisma.user.count({
    where: { role: "USER" },
  });

  const activeUsers = await prisma.user.count({
    where: {
      status: "ACTIVE",
      role: "USER",
    },
  });

  const suspendedUsers = await prisma.user.count({
    where: {
      status: "SUSPENDED",
      role: "USER",
    },
  });

  // ===== EVENTS =====
  const totalEvents = await prisma.event.count();

  const upcomingEvents = await prisma.event.count({
    where: {
      dateTime: { gt: new Date() },
    },
  });

  // ===== PARTICIPATION =====
  const totalParticipants = await prisma.participation.count();

  const approvedParticipants = await prisma.participation.count({
    where: { status: ParticipationStatus.APPROVED },
  });

  // ===== INVITATIONS =====
  const totalInvites = await prisma.invitation.count();

  const acceptedInvites = await prisma.invitation.count({
    where: { status: InvitationStatus.ACCEPTED },
  });

  // ===== PAYMENTS =====
  const totalPayments = await prisma.payment.count();

  const successfulPayments = await prisma.payment.count({
    where: { status: PaymentStatus.SUCCESS },
  });

  const totalRevenue = await prisma.payment.aggregate({
    where: { status: PaymentStatus.SUCCESS },
    _sum: { amount: true },
  });

  // ===== REVIEWS =====
  const totalReviews = await prisma.review.count();

  return {
    users: {
      totalUsers,
      activeUsers,
      totalAdmins,
      totalNormalUsers,
      suspendedUsers
    },

    events: {
      totalEvents,
      upcomingEvents,
    },

    participation: {
      totalParticipants,
      approvedParticipants,
    },

    invitations: {
      totalInvites,
      acceptedInvites,
    },

    payments: {
      totalPayments,
      successfulPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
    },

    reviews: {
      totalReviews,
    },
  };
};

export const AdminService = {
  getAllUsers,
  getAllAdmins,
  getSingleUser,
  updateUserStatus,
  deleteUser,
  updateUserRole,
  getAdminStats,
};
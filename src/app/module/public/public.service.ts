import { prisma } from "../../lib/prisma";

const getStats = async () => {
  const now = new Date();

  const [
    totalActiveUsers,
    totalEventsDone,
    totalTicketsCreated,
    totalOrganizers,
    totalParticipants,
  ] = await Promise.all([
    // Active users
    prisma.user.count({
      where: {
        status: "ACTIVE",
        isDeleted: false,
      },
    }),

    // Past events
    prisma.event.count({
      where: {
        dateTime: {
          lt: now,
        },
      },
    }),

    // Tickets
    prisma.ticket.count(),

    prisma.user.count({
      where: {
        events: {
          some: {}, 
        },
        isDeleted: false,
      },
    }),

    // Participants
    prisma.participation.count(),
  ]);

  return {
    totalActiveUsers,
    totalEventsDone,
    totalTicketsCreated,
    totalOrganizers,
    totalParticipants,
  };
};

export const PublicService = {
  getStats,
};
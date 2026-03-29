import { prisma } from "../../lib/prisma";

const getStats = async () => {
  const now = new Date();

  const [
    totalActiveUsers,
    totalEventsDone,
    totalTicketsCreated,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        status: "ACTIVE",
        isDeleted: false,
      },
    }),

    prisma.event.count({
      where: {
        dateTime: {
          lt: now, // past events
        },
      },
    }),

    prisma.ticket.count(),
  ]);

  return {
    totalActiveUsers,
    totalEventsDone,
    totalTicketsCreated,
  };
};

export const PublicService = {
  getStats,
};
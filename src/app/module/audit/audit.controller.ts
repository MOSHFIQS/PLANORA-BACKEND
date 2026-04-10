import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { prisma } from "../../lib/prisma";

const getAllLogs = catchAsync(async (req: Request, res: Response) => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Audit logs fetched successfully",
    data: {
      meta: {
        total: logs.length,
      },
      data: logs,
    },
  });
});

export const AuditController = {
  getAllLogs,
};

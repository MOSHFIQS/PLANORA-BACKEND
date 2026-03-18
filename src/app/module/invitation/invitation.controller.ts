import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { InvitationStatus } from "../../../generated/prisma/enums";
import { InvitationService } from "./invitation.service";

// send invitation
const sendInvitation = catchAsync(async (req:Request, res:Response) => {
     const user = req.user;
     if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

     const { eventId, userId } = req.body;

     const result = await InvitationService.sendInvitation(
          user,
          eventId,
          userId,
     );

     sendResponse(res, {
          httpStatusCode: status.CREATED,
          success: true,
          message: "Invitation sent",
          data: result,
     });
});

// 👤 Respond invitation
const respondInvitation = catchAsync(async (req:Request, res:Response) => {
     const user = req.user!;
     const { id } = req.params;
     const { status: newStatus } = req.body;

     if (!Object.values(InvitationStatus).includes(newStatus)) {
          throw new AppError(status.BAD_REQUEST, "Invalid status");
     }

     const result = await InvitationService.respondInvitation(
          user,
          id as string,
          newStatus,
     );

     sendResponse(res, {
          httpStatusCode: status.OK,
          success: true,
          message: `Invitation ${newStatus.toLowerCase()}`,
          data: result,
     });
});

//  Event invitations
const getEventInvitations = catchAsync(async (req:Request, res:Response) => {
     const user = req.user!;
     const { eventId } = req.params;

     const result = await InvitationService.getEventInvitations(
          user,
          eventId as string,
     );

     sendResponse(res, {
          httpStatusCode: status.OK,
          success: true,
          message: "Event invitations fetched",
          data: result,
     });
});

//  My invitations
const getMyInvitations = catchAsync(async (req:Request, res:Response) => {
     const user = req.user!;

     const result = await InvitationService.getMyInvitations(user);

     sendResponse(res, {
          httpStatusCode: status.OK,
          success: true,
          message: "My invitations fetched",
          data: result,
     });
});

//  Cancel invitation
const cancelInvitation = catchAsync(async (req:Request, res:Response) => {
     const user = req.user!;
     const { id } = req.params;

     const result = await InvitationService.cancelInvitation(
          user,
          id as string,
     );

     sendResponse(res, {
          httpStatusCode: status.OK,
          success: true,
          message: "Invitation canceled",
          data: result,
     });
});

export const InvitationController = {
     sendInvitation,
     respondInvitation,
     getEventInvitations,
     getMyInvitations,
     cancelInvitation,
};

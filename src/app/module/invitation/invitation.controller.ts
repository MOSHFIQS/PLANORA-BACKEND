import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { InvitationService } from "./invitation.service";
import { IQueryParams } from "../../interfaces/query.interface";


const sendInvitation = catchAsync(async (req: Request, res: Response) => {
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


const getEventInvitations = catchAsync(async (req: Request, res: Response) => {
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


const getMyInvitations = catchAsync(async (req: Request, res: Response) => {
     const user = req.user!;
     const query = req.query;

     const result = await InvitationService.getMyInvitations(user, query as IQueryParams);
     

     sendResponse(res, {
          httpStatusCode: status.OK,
          success: true,
          message: "My invitations fetched",
          data: result,
     });
});


const cancelInvitation = catchAsync(async (req: Request, res: Response) => {
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
     getEventInvitations,
     getMyInvitations,
     cancelInvitation,
};

import { InvitationStatus } from "../../../generated/prisma/enums";

export interface ISendInvitationPayload {
  eventId: string;
  userId: string;
}

export interface IRespondInvitationPayload {
  status: InvitationStatus; 
}
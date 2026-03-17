import { EventVisibility } from "../../../generated/prisma/enums";

export interface ICreateEventPayload {
  title: string;
  description: string;
  venue: string;
  dateTime: Date | string;
  visibility: EventVisibility;
  fee?: number;
  image?: string;
}

export interface IUpdateEventPayload {
  title?: string;
  description?: string;
  venue?: string;
  dateTime?: Date | string;
  visibility?: EventVisibility;
  fee?: number;
  image?: string;
}
import { BannerPosition, EventType } from "../../../generated/prisma/enums";

export interface ICreateBanner {
  title: string;
  image: string;

  position: BannerPosition;
  positionOrder: number;
  dateTime: Date
  type: EventType

  description?: string;
  redirectUrl?: string;

  buttonText?: string;
  altText?: string;

  isActive?: boolean; // default true (optional from client)
}


export interface IUpdateBanner {
  title?: string;
  image?: string;

  position?: BannerPosition;
  positionOrder?: number;
  dateTime: Date;
  type: EventType

  description?: string;
  redirectUrl?: string;

  buttonText?: string;
  altText?: string;

  isActive?: boolean;
}
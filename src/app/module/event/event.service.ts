import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { ICreateEventPayload } from "./event.interface";
import { EventVisibility } from "../../../generated/prisma/enums";

const createEvent = async (
     user: IRequestUser,
     payload: ICreateEventPayload,
) => {
     return prisma.event.create({
          data: {
               ...payload,
               organizerId: user.userId,
          },
     });
};

const getAllEvents = async () => {
     return prisma.event.findMany({
          where: {
               visibility: EventVisibility.PUBLIC,
          },
          include: {
               organizer: true,
          },
          orderBy: {
               dateTime: "asc",
          },
     });
};

export const EventService = {
     createEvent,
     getAllEvents,
};

import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { ICreateEventPayload } from "./event.interface";

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

export const EventService = {
     createEvent,
};

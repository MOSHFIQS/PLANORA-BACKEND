import { Role, UserStatus } from "../../generated/prisma/enums";

export interface ILoginUserPayload {
     email: string;
     password: string;
}

export interface IRequestUser {
     userId: string;
     role: Role;
     name?: string;
     email?: string;
     status?: UserStatus;
     isDeleted?: boolean;
     emailVerified?: boolean;
}

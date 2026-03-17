import { Role, UserStatus } from "../../generated/prisma/enums";

export interface IRequestUser {
    userId: string;
    role: Role;
    name?: string;
    email?: string;
    status?: UserStatus;
    isDeleted?: boolean;
    emailVerified?: boolean;
}
     
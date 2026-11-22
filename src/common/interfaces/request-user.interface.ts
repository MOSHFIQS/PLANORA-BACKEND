import { Role } from "../../generated/prisma/enums";

export interface IRequestUser {
  userId: string;
  id?: string;
  role: Role;
  email: string;
  name?: string;
  status?: string;
  needPasswordChange?: boolean;
  isDeleted?: boolean;
  emailVerified?: boolean;
}

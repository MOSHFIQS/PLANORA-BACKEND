import { SetMetadata } from "@nestjs/common";
import { Roles as BetterAuthRoles } from "@thallesp/nestjs-better-auth";
import { Role } from "../../generated/prisma/enums";

export const ROLES_KEY = "ROLES";

export const Roles = (...roles: Role[]) => {
  return (target: any, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
    SetMetadata(ROLES_KEY, roles)(target, key, descriptor);
    BetterAuthRoles(roles as string[])(target, key, descriptor);
  };
};

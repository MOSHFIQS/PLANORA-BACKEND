import { Role } from "../../generated/prisma/enums";

export const RoleHierarchy: Record<Role, number> = {
  [Role.SUPERADMIN]: 4,
  [Role.ADMIN]: 3,
  [Role.ORGANIZER]: 2,
  [Role.USER]: 1,
};

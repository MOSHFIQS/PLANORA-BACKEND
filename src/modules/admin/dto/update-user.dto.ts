import { IsEnum, IsNotEmpty } from "class-validator";
import { Role, UserStatus } from "../../../generated/prisma/enums";

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;
}

export class UpdateUserRoleDto {
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}

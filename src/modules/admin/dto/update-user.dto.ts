import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { Role, UserStatus } from "../../../generated/prisma/enums";

export class UpdateUserStatusDto {
  @ApiProperty({ description: "New account status", enum: UserStatus, example: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;
}

export class UpdateUserRoleDto {
  @ApiProperty({ description: "New role assignment", enum: Role, example: Role.ORGANIZER })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}

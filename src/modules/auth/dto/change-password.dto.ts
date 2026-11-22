import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({ description: "Current account password", example: "OldPassword123" })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: "New password (min 6 characters)", example: "NewPassword123" })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

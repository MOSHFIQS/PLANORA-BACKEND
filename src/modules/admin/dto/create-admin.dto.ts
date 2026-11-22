import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateAdminDto {
  @ApiProperty({ description: "Admin full name", example: "Admin Manager" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Admin email address", example: "admin@planora.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Admin account password (min 6 chars)", example: "SuperSecret123" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: "Role assignment", enum: ["ADMIN", "SUPERADMIN"], example: "ADMIN" })
  @IsIn(["ADMIN", "SUPERADMIN"])
  role: "ADMIN" | "SUPERADMIN";
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "../../../generated/prisma/enums";

export class RegisterDto {
  @ApiProperty({ description: "User's full name", example: "Moshfiqur Rahman" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Valid email address", example: "user@planora.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Password (min 6 characters)", example: "Password123" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: "User role", enum: Role, example: Role.USER, default: Role.USER })
  @IsOptional()
  role?: Role;
}

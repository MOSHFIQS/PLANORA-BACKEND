import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "../../../generated/prisma/enums";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  role?: Role;
}

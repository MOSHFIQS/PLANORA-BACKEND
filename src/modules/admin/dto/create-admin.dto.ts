import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(["ADMIN", "SUPERADMIN"])
  role: "ADMIN" | "SUPERADMIN";
}

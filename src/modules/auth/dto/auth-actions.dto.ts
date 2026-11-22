import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class VerifyEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ForgetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ResendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  type: "email-verification" | "forget-password";
}

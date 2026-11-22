import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class VerifyEmailDto {
  @ApiProperty({ description: "User's email address", example: "user@planora.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "6-digit verification OTP code", example: "123456" })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ForgetPasswordDto {
  @ApiProperty({ description: "Email address associated with the account", example: "user@planora.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: "Email address", example: "user@planora.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Password reset OTP code", example: "123456" })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ description: "New password (min 6 characters)", example: "NewSecurePassword123" })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ResendOtpDto {
  @ApiProperty({ description: "Email address", example: "user@planora.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "OTP purpose type",
    enum: ["email-verification", "forget-password"],
    example: "email-verification",
  })
  @IsString()
  @IsNotEmpty()
  type: "email-verification" | "forget-password";
}

import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({ description: "Registered email address", example: "user@planora.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Account password", example: "Password123" })
  @IsString()
  @IsNotEmpty()
  password: string;
}

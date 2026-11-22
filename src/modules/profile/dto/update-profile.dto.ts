import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: "Updated user full name", example: "Moshfiqur Rahman" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: "Updated user profile picture URL", example: "https://res.cloudinary.com/.../avatar.jpg" })
  @IsString()
  @IsOptional()
  image?: string;
}

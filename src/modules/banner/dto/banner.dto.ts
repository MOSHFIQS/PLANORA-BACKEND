import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateBannerDto {
  @ApiProperty({ description: "Banner title", example: "Tech Summit 2026 Announcement" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: "Banner image URL", example: "https://res.cloudinary.com/.../banner.jpg" })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiPropertyOptional({ description: "Target link when clicked", example: "https://planora.com/events/123" })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({ description: "Position display order", example: 1, default: 0 })
  @IsNumber()
  @IsOptional()
  positionOrder?: number;

  @ApiPropertyOptional({ description: "Associated Event ID (optional)", example: "evt_12345" })
  @IsString()
  @IsOptional()
  eventId?: string;
}

export class UpdateBannerDto {
  @ApiPropertyOptional({ description: "Updated banner title", example: "Tech Summit - Registration Closing Soon" })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: "Updated banner image URL" })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ description: "Updated target link" })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({ description: "Updated position display order" })
  @IsNumber()
  @IsOptional()
  positionOrder?: number;

  @ApiPropertyOptional({ description: "Updated associated Event ID" })
  @IsString()
  @IsOptional()
  eventId?: string;

  @ApiPropertyOptional({ description: "Active status flag", example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBannerStatusDto {
  @ApiProperty({ description: "Active status flag", example: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}

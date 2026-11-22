import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { EventType, EventVisibility } from "../../../generated/prisma/enums";

export class CreateEventDto {
  @ApiProperty({ description: "Event title", example: "Global AI Conference 2026" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: "Detailed event description", example: "Join leading researchers in AI and machine learning." })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: "Event date and time (ISO string or formatted date)", example: "2026-12-15T09:00:00.000Z" })
  @IsString()
  @IsNotEmpty()
  dateTime: string;

  @ApiProperty({ description: "Event venue or address", example: "Bangabandhu International Conference Center, Dhaka" })
  @IsString()
  @IsNotEmpty()
  venue: string;

  @ApiProperty({ description: "Event format", enum: EventType, example: EventType.OFFLINE })
  @IsEnum(EventType)
  @IsNotEmpty()
  type: EventType;

  @ApiProperty({ description: "Ticket entry fee (0 for free events)", example: 500 })
  @IsNumber()
  @IsNotEmpty()
  fee: number;

  @ApiProperty({ description: "Array of image URLs for gallery/banner", example: ["https://res.cloudinary.com/.../event1.jpg"] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  images: string[];

  @ApiProperty({ description: "Category ID", example: "cat_12345" })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ description: "Online meeting URL (if virtual/hybrid)", example: "https://meet.google.com/xyz-abc" })
  @IsString()
  @IsOptional()
  meetingLink?: string;

  @ApiProperty({ description: "Event visibility", enum: EventVisibility, example: EventVisibility.PUBLIC })
  @IsEnum(EventVisibility)
  @IsNotEmpty()
  visibility: EventVisibility;

  @ApiPropertyOptional({ description: "Feature event on homepage (optional)", example: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class UpdateEventDto {
  @ApiPropertyOptional({ description: "Updated event title" })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: "Updated event description" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: "Updated event date and time" })
  @IsString()
  @IsOptional()
  dateTime?: string;

  @ApiPropertyOptional({ description: "Updated event venue" })
  @IsString()
  @IsOptional()
  venue?: string;

  @ApiPropertyOptional({ description: "Updated event format", enum: EventType })
  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @ApiPropertyOptional({ description: "Updated ticket entry fee" })
  @IsNumber()
  @IsOptional()
  fee?: number;

  @ApiPropertyOptional({ description: "Updated event image URLs", type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ description: "Updated category ID" })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: "Updated meeting URL" })
  @IsString()
  @IsOptional()
  meetingLink?: string;

  @ApiPropertyOptional({ description: "Updated event visibility", enum: EventVisibility })
  @IsEnum(EventVisibility)
  @IsOptional()
  visibility?: EventVisibility;

  @ApiPropertyOptional({ description: "Featured status" })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class UpdateFeaturedDto {
  @ApiProperty({ description: "Set featured flag", example: true })
  @IsBoolean()
  @IsNotEmpty()
  isFeatured: boolean;
}

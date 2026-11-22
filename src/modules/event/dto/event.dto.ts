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
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  dateTime: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsEnum(EventType)
  @IsNotEmpty()
  type: EventType;

  @IsNumber()
  @IsNotEmpty()
  fee: number;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  images: string[];

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsOptional()
  meetingLink?: string;

  @IsEnum(EventVisibility)
  @IsNotEmpty()
  visibility: EventVisibility;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  dateTime?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @IsNumber()
  @IsOptional()
  fee?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  meetingLink?: string;

  @IsEnum(EventVisibility)
  @IsOptional()
  visibility?: EventVisibility;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class UpdateFeaturedDto {
  @IsBoolean()
  @IsNotEmpty()
  isFeatured: boolean;
}

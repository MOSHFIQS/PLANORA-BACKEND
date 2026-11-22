import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsNumber()
  @IsOptional()
  positionOrder?: number;

  @IsString()
  @IsOptional()
  eventId?: string;
}

export class UpdateBannerDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsNumber()
  @IsOptional()
  positionOrder?: number;

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBannerStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  feedback?: string;
}

export class UpdateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  feedback?: string;
}

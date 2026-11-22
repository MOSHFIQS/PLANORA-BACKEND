import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateReviewDto {
  @ApiProperty({ description: "Target Event ID", example: "evt_12345" })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ description: "Rating score between 1 and 5", example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiPropertyOptional({ description: "Review comment or feedback", example: "Incredible speaker lineup and great venue!" })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({ description: "Alternative alias for review comment" })
  @IsString()
  @IsOptional()
  feedback?: string;
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ description: "Updated rating score (1-5)", example: 4, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ description: "Updated review comment", example: "Updated review text" })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({ description: "Updated feedback alias" })
  @IsString()
  @IsOptional()
  feedback?: string;
}

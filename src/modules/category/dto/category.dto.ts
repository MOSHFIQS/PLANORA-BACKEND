import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({ description: "Category name", example: "Technology & Coding" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: "Detailed category description",
    example: "Workshops, seminars, and hackathons for developers",
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: "Updated category name", example: "AI & Machine Learning" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: "Updated category description",
    example: "All events related to AI and Deep Learning",
  })
  @IsString()
  @IsOptional()
  description?: string;
}

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: "Search term / keyword for filtering" })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  page?: number | string;

  @ApiPropertyOptional({ description: "Number of records per page", default: 10 })
  @IsOptional()
  limit?: number | string;

  @ApiPropertyOptional({ description: "Field name to sort by", default: "createdAt" })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: "Sort direction",
    enum: ["asc", "desc"],
    default: "desc",
  })
  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";
}

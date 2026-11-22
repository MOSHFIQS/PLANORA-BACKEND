import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class DeleteFileDto {
  @ApiProperty({
    description: "Cloudinary image URL or array of URLs to delete",
    example: ["https://res.cloudinary.com/.../image.jpg"],
  })
  @IsNotEmpty()
  urls: string | string[];
}

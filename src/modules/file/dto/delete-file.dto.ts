import { IsNotEmpty } from "class-validator";

export class DeleteFileDto {
  @IsNotEmpty()
  urls: string | string[];
}

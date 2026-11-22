import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Body,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { FileService } from "./file.service";
import { Public } from "../../common/decorators/public.decorator";
import { DeleteFileDto } from "./dto/delete-file.dto";

@Controller("file")
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Public()
  @Post("upload-image")
  @UseInterceptors(FilesInterceptor("file", 10))
  async uploadImage(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.fileService.uploadImage(files);
  }

  @Public()
  @Delete("delete-image")
  async deleteImage(@Body() payload: DeleteFileDto) {
    return this.fileService.deleteImage(payload.urls);
  }
}

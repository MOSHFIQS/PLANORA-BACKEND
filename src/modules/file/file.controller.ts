import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Body,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { FilesInterceptor } from "@nestjs/platform-express";
import { FileService } from "./file.service";
import { Public } from "../../common/decorators/public.decorator";
import { DeleteFileDto } from "./dto/delete-file.dto";

@ApiTags("File")
@Controller("file")
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Public()
  @Post("upload-image")
  @ApiOperation({ summary: "Upload up to 10 images to Cloudinary" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
          description: "Select 1 to 10 image files",
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Images uploaded successfully", schema: { example: ["https://res.cloudinary.com/.../img1.jpg"] } })
  @UseInterceptors(FilesInterceptor("file", 10))
  async uploadImage(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.fileService.uploadImage(files);
  }

  @Public()
  @Delete("delete-image")
  @ApiOperation({ summary: "Delete images from Cloudinary" })
  @ApiResponse({ status: 200, description: "Images deleted successfully" })
  async deleteImage(@Body() payload: DeleteFileDto) {
    return this.fileService.deleteImage(payload.urls);
  }
}

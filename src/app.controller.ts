import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "./common/decorators/public.decorator";

@ApiTags("App")
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({ status: 200, description: "API status is active and healthy" })
  getHealth() {
    return {
      message: "API is working",
    };
  }
}

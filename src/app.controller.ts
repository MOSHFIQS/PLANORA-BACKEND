import { Controller, Get, Req, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiProduces } from "@nestjs/swagger";
import { Request, Response } from "express";
import { Public } from "./common/decorators/public.decorator";
import { getLandingHtml } from "./common/views/landing.html";

@ApiTags("App")
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: "API Home & Health status with interactive landing page" })
  @ApiProduces("text/html", "application/json")
  @ApiResponse({ status: 200, description: "Interactive API Portal (HTML) or JSON Health response" })
  getHealth(@Req() req: Request, @Res() res: Response) {
    const acceptHeader = req.headers.accept || "";

    // If client explicitly requests JSON without text/html (e.g. cURL, postman, automated monitors)
    if (acceptHeader.includes("application/json") && !acceptHeader.includes("text/html")) {
      return res.status(200).json({
        success: true,
        message: "Planora Event Management & Ticketing Engine is operational",
        version: "1.0.0",
        docs: "/docs",
        openapi: "/docs-json",
        status: "healthy",
        timestamp: new Date().toISOString(),
      });
    }

    // Default to rendering the rich interactive landing UI for browser visitors
    return res.type("html").send(getLandingHtml());
  }
}

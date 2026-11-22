import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response, Request } from "express";
import AppError from "../errors/app.error";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal Server Error";
    let errorSources: any = [];

    // Handle AppError (legacy or custom AppError)
    if (exception instanceof AppError) {
      statusCode = exception.statusCode;
      message = exception.message;
    }
    // Handle NestJS HttpException
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === "string") {
        message = res;
      } else if (typeof res === "object" && res !== null) {
        message = (res as any).message || exception.message;
        errorSources = (res as any).errorSources || (res as any).message || [];
      }
    }
    // Handle Prisma Client Known Request Errors
    else if (exception?.code && typeof exception.code === "string") {
      if (exception.code === "P2002") {
        statusCode = HttpStatus.CONFLICT;
        const target = exception.meta?.target ? ` on field: ${exception.meta.target}` : "";
        message = `Duplicate key error${target}`;
      } else if (exception.code === "P2025") {
        statusCode = HttpStatus.NOT_FOUND;
        message = exception.meta?.cause || "Record not found";
      } else {
        statusCode = HttpStatus.BAD_REQUEST;
        message = exception.message || "Database error occurred";
      }
    }
    // Standard JS Error
    else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `${request.method} ${request.url} - Status: ${statusCode} - Error: ${message}`,
      exception?.stack
    );

    response.status(statusCode).json({
      success: false,
      message,
      errorSources: Array.isArray(errorSources) ? errorSources : [errorSources],
      stack: process.env.NODE_ENV === "development" ? exception?.stack : undefined,
    });
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as
        string | { message?: string | string[] };
      message =
        typeof exceptionResponse === "string"
          ? [exceptionResponse]
          : (exceptionResponse.message ?? [exception.message]);
    }

    this.logger.error(
      `${request.method} ${request.url} → ${status}: ${Array.isArray(message) ? message.join(", ") : message}`,
    );

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

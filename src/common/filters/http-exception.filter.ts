import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {

  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = 500;
    let message = [exception.message] || "Unknown message";
    let error = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const errorMessage = exception.getResponse() as {
        statusCode: number;
        message: string[] | string;
        error: string;
      };

      message = errorMessage.message || "Unknown message";
      error = errorMessage.error || "Unknown error";
    }

    const jsonError = {
      statusCode: status,
      timestamp: (new Date()).toISOString(),
      path: request.url,
      message,
      error,
    }

    response.status(status).json(jsonError);
  }
}

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Standardize error response format
    const errorResponse =
      typeof exceptionResponse === 'string'
        ? {
            statusCode: status,
            message: exceptionResponse,
            error: HttpStatus[status],
          }
        : {
            statusCode: status,
            message:
              (exceptionResponse as Record<string, unknown>).message ??
              exception.message,
            error:
              (exceptionResponse as Record<string, unknown>).error ??
              HttpStatus[status],
          };

    response.status(status).json(errorResponse);
  }
}

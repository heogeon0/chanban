import { ERROR_METADATA, ErrorCode } from '@chanban/shared-types';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException
} from '@nestjs/common';
import { Response } from 'express';

interface HttpExceptionResponse {
  code?: ErrorCode;
  message?: string | string[];
  error?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as HttpExceptionResponse;

    // ErrorCode가 명시적으로 전달된 경우
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse.code &&
      Object.values(ErrorCode).includes(exceptionResponse.code)
    ) {
      return response.status(status).json({
        ...ERROR_METADATA[exceptionResponse.code],
      });
    }

    // 일반 HTTP 예외 처리
    const customMessage = this.extractMessage(exceptionResponse);
    const message = customMessage || 'An error occurred';

    response.status(status).json({
      status,
      message,
    });
  }

  private extractMessage(
    exceptionResponse: string | string[] | HttpExceptionResponse,
  ): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (Array.isArray(exceptionResponse)) {
      return exceptionResponse.join(', ');
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
      if (Array.isArray(exceptionResponse.message)) {
        return exceptionResponse.message.join(', ');
      }
      return exceptionResponse.message;
    }

    return '';
  }
}

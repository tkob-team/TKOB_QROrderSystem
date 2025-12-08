import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode, ErrorMessages } from '../constants/error-codes.constant';

/**
 * Error response interface following OPENAPI.md spec
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
}

/**
 * Global HTTP Exception Filter
 * Standardizes error responses across the application
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Extract error details
    const exceptionResponse = exception.getResponse();
    const errorCode = this.extractErrorCode(exceptionResponse, status);
    const message = this.extractMessage(exceptionResponse);
    const details = this.extractDetails(exceptionResponse);

    // Build standardized error response
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: request.headers['x-request-id'] as string,
    };

    // Log error (but not for client errors like 400, 404)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify(errorResponse),
        exception.stack,
      );
    } else if (status >= 400) {
      this.logger.warn(`${request.method} ${request.url}`, JSON.stringify(errorResponse));
    }

    response.status(status).json(errorResponse);
  }

  /**
   * Extract error code from exception response or map from HTTP status
   */
  private extractErrorCode(exceptionResponse: any, status: number): string {
    // Priority 1: Check if errorCode exists in response (from custom exceptions)
    if (typeof exceptionResponse === 'object' && exceptionResponse.errorCode) {
      return exceptionResponse.errorCode;
    }

    // Priority 2: Check if there's a custom error code in the message (for NotFoundException with ErrorCode)
    // This handles cases like: throw new NotFoundException(ErrorMessages[ErrorCode.MENU_CATEGORY_NOT_FOUND])
    if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
      const message = exceptionResponse.message;
      // Check if message matches any ErrorCode value
      const matchingCode = Object.keys(ErrorMessages).find(
        (key) => ErrorMessages[key as ErrorCode] === message,
      );
      if (matchingCode) {
        return matchingCode as ErrorCode;
      }
    }

    // Priority 3: Map HTTP status to appropriate error code
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_FAILED;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.AUTH_UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.AUTH_FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.INTERNAL_SERVER_ERROR; // Fallback for generic 404
      case HttpStatus.CONFLICT:
        return ErrorCode.VALIDATION_FAILED;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return ErrorCode.VALIDATION_FAILED;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.RATE_LIMIT_EXCEEDED;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }

  /**
   * Extract message from exception response
   */
  private extractMessage(exceptionResponse: any): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object') {
      // Handle class-validator errors (array of validation messages)
      if (Array.isArray(exceptionResponse.message)) {
        return exceptionResponse.message.join(', ');
      }

      if (exceptionResponse.message) {
        return exceptionResponse.message;
      }
    }

    return 'An error occurred';
  }

  /**
   * Extract details from exception response
   */
  private extractDetails(exceptionResponse: any): any {
    if (typeof exceptionResponse === 'object') {
      const { errorCode, message, ...details } = exceptionResponse;

      // Only return details if there are additional fields
      if (Object.keys(details).length > 0) {
        return details;
      }
    }

    return undefined;
  }
}

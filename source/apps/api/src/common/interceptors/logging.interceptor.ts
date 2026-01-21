import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Logging Interceptor
 * Logs incoming requests and outgoing responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, body, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const requestId = headers['x-request-id'] || '';

    const now = Date.now();

    // Log incoming request
    this.logger.log(
      `Incoming Request: ${method} ${url} | RequestId: ${requestId} | UserAgent: ${userAgent}`,
    );

    // Log request body in development (excluding sensitive fields)
    if (process.env.NODE_ENV === 'development' && body && Object.keys(body).length > 0) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - now;
          const statusCode = response.statusCode;

          this.logger.log(
            `Outgoing Response: ${method} ${url} | Status: ${statusCode} | Duration: ${duration}ms`,
          );

          // Only log response body when LOG_LEVEL is explicitly set to debug
          const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
          if (logLevel === 'debug') {
            this.logger.debug(`Response: ${JSON.stringify(data)}`);
          }
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `Error Response: ${method} ${url} | Duration: ${duration}ms | Error: ${error.message}`,
          );
        },
      }),
    );
  }

  /**
   * Remove sensitive fields from body
   */
  private sanitizeBody(body: any): any {
    const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken', 'otp'];
    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { TableSessionService, SessionData } from '../services/table-session.service';

// Extend Express Request to include session data
declare module 'express' {
  interface Request {
    session?: SessionData;
  }
}

/**
 * SessionGuard - Validates session cookie for customer requests
 * Used by public endpoints that require active table session
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessionService: TableSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Get session ID from cookie
    const sessionId = request.cookies?.table_session_id;

    if (!sessionId) {
      throw new UnauthorizedException(
        'No active session. Please scan QR code to start ordering.',
      );
    }

    try {
      // 2. Validate session
      const sessionData = await this.sessionService.validateSession(sessionId);

      // 3. Attach session data to request
      request.session = sessionData;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired session. Please scan QR code again.');
    }
  }
}

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

    // Check if SessionMiddleware already attached session data
    if (request.session) {
      return true;
    }

    // Fallback: Get session ID from cookie if middleware didn't run
    const sessionId = request.cookies?.table_session_id;

    if (!sessionId) {
      throw new UnauthorizedException('No active session. Please scan QR code to start ordering.');
    }

    try {
      // Validate session
      const sessionData = await this.sessionService.validateSession(sessionId);

      // Attach session data to request
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

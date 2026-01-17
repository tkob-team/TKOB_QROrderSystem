import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TableSessionService, SessionData } from '../../modules/table/services/table-session.service';

// Extend Express Request to include session data
declare module 'express' {
  interface Request {
    session?: SessionData;
  }
}

/**
 * SessionMiddleware - Parse and attach session data from cookie to ALL requests
 * 
 * Unlike SessionGuard (which throws if no session), this middleware:
 * - Silently populates request.session if valid cookie exists
 * - Does nothing if no cookie (leaves request.session undefined)
 * - Allows controllers to decide if session is required or optional
 * 
 * This enables @Public() endpoints to still access session data via @Session() decorator
 */
@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SessionMiddleware.name);

  constructor(private readonly sessionService: TableSessionService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const sessionId = req.cookies?.table_session_id;

    this.logger.debug(`[SessionMiddleware] ${req.method} ${req.path} | Cookie: ${sessionId ? 'Present' : 'Missing'}`);

    if (sessionId) {
      try {
        // Validate and attach session data
        const sessionData = await this.sessionService.validateSession(sessionId);
        req.session = sessionData;
        
        this.logger.debug(`Session attached: ${sessionData.sessionId.substring(0, 8)}... | Tenant: ${sessionData.tenantId.substring(0, 8)}...`);
      } catch (error) {
        // Silently ignore invalid sessions - let controller decide if session is required
        this.logger.debug(`Invalid session cookie: ${error.message}`);
      }
    }

    next();
  }
}

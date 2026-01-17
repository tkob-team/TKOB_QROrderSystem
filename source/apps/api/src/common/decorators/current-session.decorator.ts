import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import type { SessionData } from 'src/modules/table/services/table-session.service';

/**
 * Decorator to extract session data from request
 * Used in endpoints protected by SessionGuard
 */
export const CurrentSession = createParamDecorator((data: unknown, ctx: ExecutionContext): SessionData => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.session!;
});

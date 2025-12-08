import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Tenant Ownership Guard
 *
 * Verifies that authenticated user can only access their own tenant's data
 *
 * Security layers:
 * 1. Middleware: Sets req.tenant.id from JWT/header
 * 2. Guard: Validates user.tenantId matches req.tenant.id
 * 3. Prisma: Auto-filters queries by tenantId via RLS
 */
@Injectable()
export class TenantOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(TenantOwnershipGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user context exists (JWT verified by JwtAuthGuard)
    if (!user || !user.tenantId) {
      throw new ForbiddenException('User context not found');
    }

    const userTenantId = user.tenantId;

    // Extract tenant context from middleware or header
    let requestedTenantId: string | undefined;

    // Priority 1: From tenant context middleware (most reliable)
    if (request.tenant?.id) {
      requestedTenantId = request.tenant.id;
    }
    // Priority 2: From explicit header (for service-to-service calls)
    else if (request.headers['x-tenant-id']) {
      requestedTenantId = request.headers['x-tenant-id'] as string;
    }

    // If no tenant context, allow (global routes like /health)
    if (!requestedTenantId) {
      this.logger.debug(`No tenant context for user ${user.userId}, allowing access`);
      return true;
    }

    // Verify tenant ownership
    if (requestedTenantId !== userTenantId) {
      this.logger.warn(
        `Tenant ownership violation: User ${user.userId} (tenant: ${userTenantId}) ` +
          `attempted to access tenant ${requestedTenantId}`,
      );
      throw new ForbiddenException('You do not have permission to access this tenant');
    }

    this.logger.debug(`Tenant ownership verified: ${userTenantId}`);
    return true;
  }
}

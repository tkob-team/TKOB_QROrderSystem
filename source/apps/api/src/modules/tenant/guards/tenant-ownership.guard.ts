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
 * Purpose: Verify that the authenticated user has permission to access the tenant resource
 * 
 * Logic:
 * 1. Extract tenantId from:
 *    a. Route params (e.g., /tenants/:id)
 *    b. Request header (x-tenant-id)
 *    c. Tenant context from middleware (req.tenant.id)
 * 2. Compare with tenantId from JWT (req.user.tenantId)
 * 3. Block request if they don't match (user trying to access another tenant's data)
 * 
 * Usage: Apply to tenant-specific routes
 * @UseGuards(JwtAuthGuard, TenantOwnershipGuard)
 */

@Injectable()
export class TenantOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(TenantOwnershipGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    // Check if user context exists
    if (!user || !user.tenantId) {
      throw new ForbiddenException('User context not found');
    }

    const userTenantId = user.tenantId;

    // Extract requested tenantId from multiple sources (priority order)
    let requestedTenantId: string | undefined;

    // 1. From route params (e.g., /tenants/:id)
    if (params.id) {
      requestedTenantId = params.id;
    }
    // 2. From explicit header
    else if (request.headers['x-tenant-id']) {
      requestedTenantId = request.headers['x-tenant-id'] as string;
    }
    // 3. From tenant context middleware
    else if (request.tenant?.id) {
      requestedTenantId = request.tenant.id;
    }

    // If no tenantId found in request, allow (might be a global route)
    if (!requestedTenantId) {
      this.logger.debug(
        `No tenantId found in request for user ${user.userId}, allowing access`,
      );
      return true;
    }

    // Verify ownership
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
import type { UserRole } from '@prisma/client';

/**
 * Authenticated user payload extracted from JWT token
 * This interface is attached to the request object by JwtAuthGuard
 *
 * @see JwtAuthGuard - Guard that validates JWT and attaches user to request
 * @see JwtStrategy - Strategy that extracts and validates JWT payload
 */
export interface AuthenticatedUser {
  /** User's unique identifier */
  userId: string;

  /** User's email address */
  email: string;

  /** User's role in the system */
  role: UserRole;

  /** Tenant/Restaurant ID that the user belongs to */
  tenantId: string;
}

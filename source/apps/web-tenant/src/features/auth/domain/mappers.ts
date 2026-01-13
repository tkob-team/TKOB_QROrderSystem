import { logger } from '@/shared/utils/logger';
import type { UserRole as NavigationUserRole } from '@/shared/config';
import type { AuthUserResponseDto } from '@/services/generated/models';
import type { User } from './types';

const VALID_BACKEND_ROLES = ['owner', 'kitchen', 'waiter', 'service'];

export function mapBackendUserToDomainUser(currentUserData: AuthUserResponseDto | null | undefined): User | null {
  if (!currentUserData) return null;

  const hasRequiredFields = Boolean(
    currentUserData.id &&
      currentUserData.email &&
      currentUserData.fullName &&
      currentUserData.role &&
      currentUserData.tenantId,
  );

  if (!hasRequiredFields) {
    logger.warn('[invariant] INCOMPLETE_USER_DATA', {
      hasId: !!currentUserData?.id,
      hasEmail: !!currentUserData?.email,
      hasFullName: !!currentUserData?.fullName,
      hasRole: !!currentUserData?.role,
      hasTenantId: !!currentUserData?.tenantId,
    });
    return null;
  }

  const backendRole = String(currentUserData.role || '').toLowerCase();
  if (!VALID_BACKEND_ROLES.includes(backendRole)) {
    logger.warn('[invariant] UNEXPECTED_USER_ROLE', {
      backendRole: currentUserData.role,
      validRoles: VALID_BACKEND_ROLES,
    });
  }

  const mappedRole = (backendRole === 'owner'
    ? 'admin'
    : backendRole === 'kitchen'
    ? 'kds'
    : 'waiter') as NavigationUserRole;

  return {
    id: currentUserData.id,
    email: currentUserData.email,
    name: currentUserData.fullName,
    role: mappedRole as User['role'],
    tenantId: currentUserData.tenantId,
  } satisfies User;
}

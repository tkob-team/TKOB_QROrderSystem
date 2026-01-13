import { ROUTES } from '@/shared/config';
import { logger } from '@/shared/utils/logger';
import { clearAuthTokens, getStoredAuthToken } from './tokenStorage';

const PROTECTED_PREFIXES = ['/admin', '/kds', '/waiter'];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function bootstrapAuthState(): boolean {
  if (typeof window === 'undefined') return false;

  const token = getStoredAuthToken();
  const hasToken = !!token;

  logger.log('[AuthContext] Token check on mount:', hasToken ? 'Found' : 'Not found');

  if (!token) {
    logger.log('[AuthContext] No token in storage, clearing stale cookies');
    clearAuthTokens();

    const pathname = window.location.pathname;
    if (isProtectedPath(pathname)) {
      logger.log('[AuthContext] No token on protected route, redirecting to login');
      window.location.href = ROUTES.login;
    }
  }

  return hasToken;
}

import { logger } from '@/shared/utils/logger';

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const DEV_ROLE_KEY = 'devRole';
const REMEMBER_ME_TOKEN_KEY = 'rememberMeToken';
const REMEMBER_ME_ENABLED_KEY = 'rememberMeEnabled';
const REMEMBER_ME_EMAIL_KEY = 'rememberMeEmail';
const REMEMBER_ME_KEY = 'rememberMe';

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthTokens(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(DEV_ROLE_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);

  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function setRememberMeToken(token: string, expiryDays: number = 7): void {
  try {
    if (typeof window === 'undefined') return;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    const rememberMeData = {
      token,
      expiryTime: expiryDate.getTime(),
      createdAt: Date.now(),
    };

    localStorage.setItem(REMEMBER_ME_TOKEN_KEY, JSON.stringify(rememberMeData));
    localStorage.setItem(REMEMBER_ME_ENABLED_KEY, 'true');

    logger.log('[AuthContext] Remember me token saved, expires in', expiryDays, 'days');
  } catch (error) {
    logger.error('[AuthContext] Failed to save remember me token:', error);
  }
}

export function clearRememberMeToken(): void {
  try {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(REMEMBER_ME_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_ME_ENABLED_KEY);
    localStorage.removeItem(REMEMBER_ME_EMAIL_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);

    logger.log('[AuthContext] Remember me tokens cleared');
  } catch (error) {
    logger.error('[AuthContext] Failed to clear remember me token:', error);
  }
}

export function getRefreshTokenFromCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${REFRESH_TOKEN_KEY}=`))
    ?.split('=')[1];
}

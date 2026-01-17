'use client';

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES, getHomeRouteForRole, canAccessRoute, config } from '@/shared/config';
import type { UserRole as NavigationUserRole } from '@/shared/config';
import { useAuthController } from '@/features/auth';
import { logger } from '@/shared/utils/logger';
import { bootstrapAuthState } from '../../data/bootstrap';
import {
  clearAuthTokens,
  clearRememberMeToken,
  getRefreshTokenFromCookie,
  setRememberMeToken,
} from '../../data/tokenStorage';
import { mapBackendUserToDomainUser } from '../../domain/mappers';
import type { User, UserRole } from '../../domain/types';
import type { LoginDto } from '@/services/generated/models';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  devLogin: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  getDefaultRoute: () => string;
  canAccess: (path: string) => boolean;
  setRememberMeToken: (token: string, expiryDays?: number) => void;
  clearRememberMeToken: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const router = useRouter();

  const controller = useAuthController({
    enabledCurrentUser: hasToken,
  });

  const { loginMutation, logoutMutation, currentUserQuery } = controller;
  const currentUserData = currentUserQuery.data;
  const refetch = currentUserQuery.refetch;
  
  // isLoading must be true until:
  // 1. Token bootstrap is complete (isInitialized)
  // 2. User query is not loading (currentUserQuery.isLoading)
  // 3. If hasToken and data exists, user state must be synced
  const isUserSynced = !hasToken || !currentUserData || !!user;
  const isLoading = !isInitialized || currentUserQuery.isLoading || !isUserSynced;

  // Bootstrap token state on mount
  useEffect(() => {
    const foundToken = bootstrapAuthState();
    setHasToken(foundToken);
    setIsInitialized(true);
  }, []);

  // Handle auth error - redirect to home when token is invalid
  useEffect(() => {
    if (currentUserQuery.isError && hasToken) {
      logger.warn('[AuthContext] Auth validation failed, clearing tokens and redirecting to home');
      clearAuthTokens();
      clearRememberMeToken();
      setHasToken(false);
      setUser(null);
      
      // Redirect to home if not already on public pages
      // This allows user to choose login or signup
      if (typeof window !== 'undefined') {
        const isPublicPage = window.location.pathname.startsWith('/auth/') || 
                             window.location.pathname === '/' ||
                             window.location.pathname === '/home';
        if (!isPublicPage) {
          logger.log('[AuthContext] Redirecting to home page...');
          window.location.href = '/';
        }
      }
    }
  }, [currentUserQuery.isError, hasToken]);

  // Sync user state with React Query data
  useEffect(() => {
    // getCurrentUser returns { user, tenant }, so extract user field
    const mappedUser = mapBackendUserToDomainUser(currentUserData?.user);

    if (hasToken && mappedUser) {
      setUser(mappedUser);
      logger.log('[AuthContext] Login success');
      return;
    }

    if (hasToken && currentUserData?.user && !mappedUser) {
      // Already logged in but data incomplete; map helper logged invariant
      return;
    }

    if (!hasToken || (!isLoading && !currentUserData)) {
      logger.log('[AuthContext] User logged out (no token or user data)');
      setUser(null);
    }
  }, [currentUserData, hasToken, isLoading]);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = false) => {
      try {
        const deviceInfo = typeof window !== 'undefined'
          ? `${navigator.userAgent} | ${navigator.platform}`
          : 'Unknown device';

        logger.log('[AuthContext] Starting login', 'Remember me:', rememberMe);

        const loginPayload: LoginDto & { rememberMe?: boolean; deviceInfo?: string } = {
          email,
          password,
          deviceInfo,
          rememberMe,
        };

        await loginMutation.mutateAsync(loginPayload);

        logger.log('[AuthContext] Login mutation successful, setting hasToken=true');
        setHasToken(true);
        await refetch();
        logger.log('[AuthContext] Login complete');
      } catch (error) {
        logger.error('[AuthContext] Login failed:', error);
        throw error;
      }
    },
    [loginMutation, refetch],
  );

  const logout = useCallback(() => {
    const refreshToken = getRefreshTokenFromCookie();

    clearRememberMeToken();
    clearAuthTokens();

    setHasToken(false);
    setUser(null);

    logger.log('[AuthContext] Logout complete, redirecting to login');

    if (refreshToken) {
      logoutMutation.mutate(refreshToken);
    }

    if (typeof window !== 'undefined') {
      window.location.href = ROUTES.login;
    }
  }, [logoutMutation]);

  const devLogin = useCallback((role: UserRole) => {
    if (!config.useMockData) {
      logger.warn('devLogin is DISABLED in production mode (NEXT_PUBLIC_USE_MOCK_DATA=false)');
      logger.warn('To enable dev mode, set NEXT_PUBLIC_USE_MOCK_DATA=true in .env');
      return;
    }

    if (process.env.NODE_ENV !== 'development') {
      logger.warn('devLogin only available in development environment');
      return;
    }

    const roleNames = {
      admin: 'Admin Display User',
      kds: 'Kitchen Display User',
      waiter: 'Waiter User',
    };

    const mockToken = `mock-jwt-${role}`;
    const mockUser: User = {
      id: role === 'admin' ? '1' : role === 'kds' ? '2' : '3',
      email: `${role}@restaurant.com`,
      name: roleNames[role],
      role,
      tenantId: 'tenant-001',
    };

    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('devRole', role);
    document.cookie = `authToken=${mockToken}; path=/; max-age=86400; SameSite=Lax`;

    setUser(mockUser);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');

      if (redirect) {
        logger.log('[AuthContext] devLogin redirecting');
        logger.log('[AuthContext] Using window.location.href for hard redirect');
        window.location.href = redirect;
      } else {
        const homeRoute = getHomeRouteForRole(role as NavigationUserRole);
        logger.log('[AuthContext] devLogin - navigating to home route');
        logger.log('[AuthContext] About to set window.location.href');
        logger.log('[AuthContext] Current location href');
        window.location.replace(homeRoute);
        logger.log('[AuthContext] After replace, window.location.href');
      }
    }
  }, []);

  const switchRole = useCallback(
    (role: UserRole) => {
      if (!config.useMockData) {
        logger.warn('switchRole is DISABLED in production mode (NEXT_PUBLIC_USE_MOCK_DATA=false)');
        logger.warn('To enable dev mode, set NEXT_PUBLIC_USE_MOCK_DATA=true in .env');
        return;
      }

      if (process.env.NODE_ENV !== 'development') {
        logger.warn('Role switching only available in development');
        return;
      }

      const roleNames = {
        admin: 'Admin User',
        kds: 'Kitchen Display User',
        waiter: 'Waiter User',
      };

      const mockUser: User = {
        id: role === 'admin' ? '1' : role === 'kds' ? '2' : '3',
        email: `${role}@restaurant.com`,
        name: roleNames[role],
        role,
        tenantId: 'tenant-001',
      };

      setUser(mockUser);
      localStorage.setItem('devRole', role);
      document.cookie = `authToken=mock-jwt-${role}; path=/; max-age=86400; SameSite=Lax`;

      const homeRoute = getHomeRouteForRole(role as NavigationUserRole);
      router.push(homeRoute);
    },
    [router],
  );

  const getDefaultRoute = useCallback(() => {
    return user ? getHomeRouteForRole(user.role as NavigationUserRole) : ROUTES.login;
  }, [user]);

  const canAccess = useCallback(
    (path: string) => {
      if (!user) return false;
      return canAccessRoute(user.role as NavigationUserRole, path);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      devLogin,
      switchRole,
      getDefaultRoute,
      canAccess,
      setRememberMeToken,
      clearRememberMeToken,
    }),
    [user, isLoading, login, logout, devLogin, switchRole, getDefaultRoute, canAccess],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

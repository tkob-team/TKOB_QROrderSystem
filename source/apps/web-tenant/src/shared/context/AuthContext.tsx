'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/config';
import { getHomeRouteForRole, canAccessRoute } from '@/shared/config';
import type { UserRole as NavigationUserRole } from '@/shared/config';
import { useLogin, useLogout, useCurrentUser } from '@/features/auth/hooks/useAuth';
import { config } from '@/shared/config';

// User role type matching RBAC requirements (3 roles only)
export type UserRole = 'admin' | 'kds' | 'waiter';

// TODO: Import from @packages/dto when available
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  devLogin: (role: UserRole) => void; // For dev mode quick login - ONLY in mock mode
  switchRole: (role: UserRole) => void; // Dev mode role switching - ONLY in mock mode
  getDefaultRoute: () => string; // Get home route for current user role
  canAccess: (path: string) => boolean; // Check if current user can access path
  setRememberMeToken: (token: string, expiryDays?: number) => void; // Save token for "Remember me"
  clearRememberMeToken: () => void; // Clear remember me token on logout
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const router = useRouter();
  
  // Check for token on mount and watch for changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      setHasToken(!!token);
      console.log('[AuthContext] Token check on mount:', !!token ? 'Found' : 'Not found');
      
      // If no token in storage but cookies might exist, clear them
      if (!token) {
        console.log('[AuthContext] No token in storage, clearing stale cookies');
        document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        
        // If we're on a protected route without token, redirect to login
        const pathname = window.location.pathname;
        if (pathname.startsWith('/admin') || pathname.startsWith('/kds') || pathname.startsWith('/waiter')) {
          console.log('[AuthContext] No token on protected route, redirecting to login');
          window.location.href = ROUTES.login;
        }
      }
    }
  }, []);
  
  // Use React Query hooks
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const { data: currentUserData, isLoading, refetch } = useCurrentUser({
    // Only fetch user data if we have a token
    enabled: hasToken,
  });

  // Remember me token management
  const setRememberMeToken = useCallback((token: string, expiryDays: number = 7) => {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);
      
      const rememberMeData = {
        token,
        expiryTime: expiryDate.getTime(),
        createdAt: Date.now(),
      };
      
      localStorage.setItem('rememberMeToken', JSON.stringify(rememberMeData));
      localStorage.setItem('rememberMeEnabled', 'true');
      
      console.log('[AuthContext] Remember me token saved, expires in', expiryDays, 'days');
    } catch (error) {
      console.error('[AuthContext] Failed to save remember me token:', error);
    }
  }, []);

  const clearRememberMeToken = useCallback(() => {
    try {
      localStorage.removeItem('rememberMeToken');
      localStorage.removeItem('rememberMeEnabled');
      localStorage.removeItem('rememberMeEmail');
      localStorage.removeItem('rememberMe');
      console.log('[AuthContext] Remember me tokens cleared');
    } catch (error) {
      console.error('[AuthContext] Failed to clear remember me token:', error);
    }
  }, []);

  // Sync user state with React Query data
  useEffect(() => {
    // getCurrentUser() now returns AuthUserResponseDto directly, not { user: ... }
    if (hasToken && currentUserData && 
        currentUserData.id && 
        currentUserData.email && 
        currentUserData.fullName &&
        currentUserData.role &&
        currentUserData.tenantId) {
      const mappedUser: User = {
        id: currentUserData.id,
        email: currentUserData.email,
        name: currentUserData.fullName,
        role: (currentUserData.role.toLowerCase() === 'owner' 
          ? 'admin' 
          : currentUserData.role.toLowerCase() === 'kitchen' 
            ? 'kds' 
            : 'waiter') as UserRole,
        tenantId: currentUserData.tenantId,
      };
      setUser(mappedUser);
      console.log('[AuthContext] User logged in:', mappedUser.email);
    } else if (!hasToken || (!isLoading && !currentUserData)) {
      // No token found or query returned no user - clear user state
      console.log('[AuthContext] User logged out (no token or user data)');
      setUser(null);
    }
  }, [currentUserData, isLoading, hasToken]);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const deviceInfo = typeof window !== 'undefined' 
        ? `${navigator.userAgent} | ${navigator.platform}`
        : 'Unknown device';
      
      console.log('[AuthContext] Starting login for:', email, 'Remember me:', rememberMe);
      
      // Pass rememberMe flag to the mutation
      await loginMutation.mutateAsync({ 
        email, 
        password,
        deviceInfo,
        rememberMe, // Pass this to useLogin hook
      } as any);
      
      console.log('[AuthContext] Login mutation successful, setting hasToken=true');
      
      // Mark that we have a token so useCurrentUser query will run
      setHasToken(true);
      
      // Refetch current user after successful login
      await refetch();
      
      console.log('[AuthContext] Login complete');
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    const refreshToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('refreshToken='))
      ?.split('=')[1];
    
    // Clear remember me tokens
    clearRememberMeToken();
    
    // Clear from both storages
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('devRole');
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Update state to reflect no token
    setHasToken(false);
    setUser(null);
    
    console.log('[AuthContext] Logout complete, redirecting to login');
    
    if (refreshToken) {
      logoutMutation.mutate(refreshToken);
    }
    
    if (typeof window !== 'undefined') {
      window.location.href = ROUTES.login;
    }
  };

  // Dev mode quick login - bypasses API (ONLY available in mock data mode)
  const devLogin = (role: UserRole) => {
    if (!config.useMockData) {
      console.warn('❌ devLogin is DISABLED in production mode (NEXT_PUBLIC_USE_MOCK_DATA=false)');
      console.warn('ℹ️  To enable dev mode, set NEXT_PUBLIC_USE_MOCK_DATA=true in .env');
      return;
    }

    if (process.env.NODE_ENV !== 'development') {
      console.warn('devLogin only available in development environment');
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

    // Set token in both localStorage and cookie
    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('devRole', role); // Store role for persistence
    
    // Set cookie for middleware authentication check
    document.cookie = `authToken=${mockToken}; path=/; max-age=86400; SameSite=Lax`;
    
    setUser(mockUser);
    
    // Check for redirect parameter in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      
      if (redirect) {
        console.log('[AuthContext] devLogin redirecting to:', redirect);
        console.log('[AuthContext] Using window.location.href for hard redirect');
        window.location.href = redirect;
      } else {
        const homeRoute = getHomeRouteForRole(role as NavigationUserRole);
        console.log('[AuthContext] devLogin - role:', role, 'homeRoute:', homeRoute);
        console.log('[AuthContext] About to set window.location.href to:', homeRoute);
        console.log('[AuthContext] Current window.location.href:', window.location.href);
        
        // Use replace instead of assignment to prevent history entry
        window.location.replace(homeRoute);
        
        console.log('[AuthContext] After replace, window.location.href:', window.location.href);
      }
    }
  };

  // Dev mode: Switch role on the fly (ONLY available in mock data mode)
  const switchRole = useCallback(
    (role: UserRole) => {
      if (!config.useMockData) {
        console.warn('❌ switchRole is DISABLED in production mode (NEXT_PUBLIC_USE_MOCK_DATA=false)');
        console.warn('ℹ️  To enable dev mode, set NEXT_PUBLIC_USE_MOCK_DATA=true in .env');
        return;
      }

      if (process.env.NODE_ENV !== 'development') {
        console.warn('Role switching only available in development');
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
      
      // Set cookie for middleware authentication check
      document.cookie = `authToken=mock-jwt-${role}; path=/; max-age=86400; SameSite=Lax`;
      
      const homeRoute = getHomeRouteForRole(role as NavigationUserRole);
      router.push(homeRoute);
    },
    [router]
  );

  // Get the default home route for current user
  const getDefaultRoute = useCallback(() => {
    return user ? getHomeRouteForRole(user.role as NavigationUserRole) : ROUTES.login;
  }, [user]);

  // Check if current user can access a specific path
  const canAccess = useCallback(
    (path: string) => {
      if (!user) return false;
      return canAccessRoute(user.role as NavigationUserRole, path);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

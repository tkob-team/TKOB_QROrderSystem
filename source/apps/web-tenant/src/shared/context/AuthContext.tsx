'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { getHomeRouteForRole, canAccessRoute } from '@/lib/navigation';
import type { UserRole as NavigationUserRole } from '@/lib/navigation';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  devLogin: (role: UserRole) => void; // For dev mode quick login
  switchRole: (role: UserRole) => void; // Dev mode role switching
  getDefaultRoute: () => string; // Get home route for current user role
  canAccess: (path: string) => boolean; // Check if current user can access path
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing auth token on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // TODO: Validate token with backend and get user data
          // For now, return a hardcoded admin user
          const mockUser: User = {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            tenantId: 'tenant-001',
          };
          setUser(mockUser);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Implement actual login API call
    try {
      // Mock login for now - returns admin by default
      const mockToken = 'mock-jwt-token';
      const mockUser: User = {
        id: '1',
        email,
        name: 'Admin User',
        role: 'admin',
        tenantId: 'tenant-001',
      };

      localStorage.setItem('authToken', mockToken);
      setUser(mockUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('devRole');
    
    // Remove auth cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = ROUTES.login;
    }
  };

  // Dev mode: instant login with specific role
  const devLogin = (role: UserRole) => {
    const roleNames = {
      admin: 'Admin User',
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
// Dev mode: Switch role on the fly
  const switchRole = useCallback(
    (role: UserRole) => {
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

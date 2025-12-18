'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ROUTES } from '@/lib/routes';

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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('devRole', role); // Store role for persistence
    setUser(mockUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        devLogin,
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

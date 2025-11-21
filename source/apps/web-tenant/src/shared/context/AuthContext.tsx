'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User role type matching RBAC requirements
export type UserRole = 'tenant-admin' | 'manager' | 'kitchen' | 'server';

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
          // For now, return a hardcoded tenant-admin user
          const mockUser: User = {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'tenant-admin',
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
      // Mock login for now - returns tenant-admin by default
      const mockToken = 'mock-jwt-token';
      const mockUser: User = {
        id: '1',
        email,
        name: 'Admin User',
        role: 'tenant-admin',
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
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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

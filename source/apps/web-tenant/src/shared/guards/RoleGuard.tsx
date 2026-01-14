'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/shared/context/AuthContext';
import { logger } from '@/shared/utils/logger';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // INVARIANT: Check for authenticated but missing user object
  useEffect(() => {
    if (isMounted && isAuthenticated && !user) {
      logger.warn('[invariant] AUTHENTICATED_BUT_NO_USER', {
        isAuthenticated,
        hasUser: !!user,
        isLoading,
      });
    }
  }, [isMounted, isAuthenticated, user, isLoading]);

  // Redirect not authenticated users to login
  useEffect(() => {
    if (isMounted && !isLoading && (!isAuthenticated || !user)) {
      logger.log('[RoleGuard] User not authenticated, redirecting to login', {
        isAuthenticated,
        hasUser: !!user,
      });
      router.push('/auth/login');
    }
  }, [isMounted, isLoading, isAuthenticated, user, router]);

  if (!isMounted) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - already redirecting via useEffect
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check if user's role is allowed
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access this page.
          </p>
          <div className="text-sm text-gray-500 mb-6">
            <p>Your role: <span className="font-semibold text-gray-700">{user.role}</span></p>
            <p>Required roles: <span className="font-semibold text-gray-700">{allowedRoles.join(', ')}</span></p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // User has correct role, render children
  return <>{children}</>;
}

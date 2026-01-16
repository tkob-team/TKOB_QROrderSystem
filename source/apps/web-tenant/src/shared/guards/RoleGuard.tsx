'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/shared/context/AuthContext';
import { logger } from '@/shared/utils/logger';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

/**
 * RoleGuard - Protects routes by checking user authentication and role
 * 
 * Optimizations:
 * - Removed isMounted state (unnecessary with Next.js 13+ client components)
 * - Consolidated redirect logic into single useEffect
 * - Improved loading state rendering
 * - Better error state handling
 * - Reduced flash of loading content
 */
export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  // Single useEffect to handle all redirect logic
  useEffect(() => {
    // Skip if still loading - CRITICAL: must wait for auth state to be determined
    if (isLoading) {
      return;
    }

    // Not authenticated - redirect to login
    // ONLY redirect if we're sure loading is complete
    if (!isLoading && !isAuthenticated && !user) {
      logger.log('[RoleGuard] User not authenticated, redirecting to login', {
        isAuthenticated,
        hasUser: !!user,
        isLoading,
      });
      router.push('/auth/login');
      return;
    }

    // Check for authenticated but missing user object (should not happen)
    if (isAuthenticated && !user) {
      logger.warn('[invariant] AUTHENTICATED_BUT_NO_USER', {
        isAuthenticated,
        hasUser: !!user,
        isLoading,
      });
      return;
    }

    // Role check happens in render below
  }, [isLoading, isAuthenticated, user, router]);

  // Countdown effect for role mismatch redirect
  useEffect(() => {
    if (user && !allowedRoles.includes(user.role)) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // Redirect when countdown reaches 0
        const redirectPath = 
          user.role === 'kds' ? '/kds' :
          user.role === 'waiter' ? '/waiter' :
          user.role === 'admin' ? '/waiter' :
          '/auth/login';
        router.push(redirectPath);
      }
    }
  }, [countdown, user, allowedRoles, router]);

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show nothing while redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Check if user's role is allowed
  if (!allowedRoles.includes(user.role)) {
    logger.warn('[RoleGuard] Access denied', {
      userRole: user.role,
      allowedRoles,
      userId: user.id,
    });

    // Get redirect destination
    const redirectDestination = 
      user.role === 'kds' ? 'Kitchen Display' :
      user.role === 'waiter' ? 'Service Board' :
      user.role === 'admin' ? 'Service Board' :
      'Login';

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
          <div className="text-sm text-gray-500 mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="mb-1">
              Your role: <span className="font-semibold text-gray-700">{user.role}</span>
            </p>
            <p>
              Required: <span className="font-semibold text-gray-700">{allowedRoles.join(', ')}</span>
            </p>
          </div>
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-2">
              <span className="text-3xl font-bold text-primary-600">{countdown}</span>
            </div>
            <p className="text-sm text-gray-600">
              Redirecting to {redirectDestination}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has correct role - render children
  return <>{children}</>;
}

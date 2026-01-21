'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  // Prevent double execution in React StrictMode
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');
    const isNewUser = searchParams.get('isNewUser') === 'true';

    if (error) {
      toast.error('Google login failed. Please try again.');
      window.location.href = '/auth/login';
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens in localStorage BEFORE redirecting
      // IMPORTANT: Use 'authToken' key to match tokenStorage.ts
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Set cookie for middleware authentication
      // Cookie expires in 1 hour (matches JWT access token expiry)
      document.cookie = `authToken=${accessToken}; path=/; max-age=3600; SameSite=Lax`;

      // Small delay to ensure localStorage is persisted
      setTimeout(() => {
        if (isNewUser) {
          toast.success('Account created! Let\'s set up your restaurant.');
          // Use hard redirect to ensure AuthProvider re-initializes with tokens
          window.location.href = '/auth/onboarding-wizard';
        } else {
          toast.success('Login successful!');
          // Use hard redirect to ensure AuthProvider re-initializes with tokens
          window.location.href = '/admin/dashboard';
        }
      }, 100);
    } else {
      toast.error('Authentication failed');
      window.location.href = '/auth/login';
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-neutral-50 to-emerald-100/30">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Completing login...</h1>
        <p className="text-gray-600 mt-2">You will be redirected shortly.</p>
      </div>
    </div>
  );
}

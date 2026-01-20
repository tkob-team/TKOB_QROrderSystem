'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');
    const isNewUser = searchParams.get('isNewUser') === 'true';

    if (error) {
      toast.error('Google login failed. Please try again.');
      router.push('/auth/login');
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens in localStorage
      // IMPORTANT: Use 'authToken' key to match tokenStorage.ts
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Set cookie for middleware authentication
      // Cookie expires in 1 hour (matches JWT access token expiry)
      document.cookie = `authToken=${accessToken}; path=/; max-age=3600; SameSite=Lax`;

      if (isNewUser) {
        toast.success('Account created! Let\'s set up your restaurant.');
        // New users go to onboarding wizard
        router.push('/auth/onboarding-wizard');
      } else {
        toast.success('Login successful!');
        // Existing users go to dashboard
        router.push('/admin/dashboard');
      }
    } else {
      toast.error('Authentication failed');
      router.push('/auth/login');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-neutral-50 to-emerald-100/30">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-500" />
        <p className="text-neutral-600">Completing sign in...</p>
      </div>
    </div>
  );
}

export default GoogleCallbackPage;

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { ROUTES } from '@/shared/config';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration on client side
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    if (!isLoading && isHydrated) {
      if (isAuthenticated) {
        router.push(ROUTES.dashboard);
      } else {
        router.push(ROUTES.login);
      }
    }
  }, [isAuthenticated, isLoading, isHydrated, router]);

  // Render loading only on client after hydration
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return null;
}

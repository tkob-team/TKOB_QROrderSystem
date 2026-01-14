"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { ROUTES } from '@/shared/config';

export function HomeRedirectGate() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || isLoading) return;
    if (isAuthenticated) {
      router.push(ROUTES.dashboard);
    } else {
      router.push(ROUTES.login);
    }
  }, [isAuthenticated, isLoading, isHydrated, router]);

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return null;
}

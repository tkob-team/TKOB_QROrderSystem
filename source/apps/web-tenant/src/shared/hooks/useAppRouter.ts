'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/config';

/**
 * useAppRouter
 * Thin wrappers around Next.js App Router for common navigations.
 * Keep page wrappers thin; use this in feature hooks/components as needed.
 */
export function useAppRouter() {
  const router = useRouter();

  const goTo = (path: string) => router.push(path);
  const replace = (path: string) => router.replace(path);
  const back = () => router.back();

  // Convenience navigations
  const goHome = () => router.push(ROUTES.home);
  const goLogin = () => router.push(ROUTES.login);
  const goDashboard = () => router.push(ROUTES.dashboard);

  return { goTo, replace, back, goHome, goLogin, goDashboard };
}

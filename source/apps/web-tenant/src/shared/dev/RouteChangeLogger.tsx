'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { logger } from '@/shared/utils/logger';

/**
 * RouteChangeLogger
 * 
 * Logs navigation events for debugging route changes.
 * Respects NEXT_PUBLIC_USE_LOGGING flag (off by default).
 * 
 * Usage: Mount once in root layout.
 */
export function RouteChangeLogger() {
  const pathname = usePathname();

  useEffect(() => {
    // Log pathname only (no query params)
    logger.info('[nav] SCREEN_ENTER', { path: pathname });
  }, [pathname]);

  return null;
}

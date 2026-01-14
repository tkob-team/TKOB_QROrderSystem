"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/shared/utils/logger';
import { Login } from '@/features/auth';

export default function LoginPage() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    logger.debug('[auth] LOGIN_PAGE_NAVIGATE', { path });
    router.push(path);
  };

  return <Login onNavigate={handleNavigate} />;
}

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Login } from '@/features/auth';

export default function LoginPage() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    console.log('[LoginPage] onNavigate called with path:', path);
    router.push(path);
  };

  return <Login onNavigate={handleNavigate} />;
}

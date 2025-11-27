"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Login from '@/features/auth/Login';

export default function LoginPage() {
  const router = useRouter();

  return <Login onNavigate={(path) => router.push(path)} />;
}

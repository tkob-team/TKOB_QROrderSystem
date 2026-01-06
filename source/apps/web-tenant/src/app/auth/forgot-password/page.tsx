"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ForgotPassword } from '@/features/auth';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return <ForgotPassword onNavigate={(path) => router.push(path)} />;
}

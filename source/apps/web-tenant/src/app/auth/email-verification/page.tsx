"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import EmailVerification from '@/features/auth/EmailVerification';

export default function EmailVerificationPage() {
  const router = useRouter();
  return <EmailVerification onNavigate={(path) => router.push(path)} />;
}

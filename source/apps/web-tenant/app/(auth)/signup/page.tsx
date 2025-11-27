"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Signup from '@/features/auth/Signup';

export default function SignupPage() {
  const router = useRouter();

  return (
  <Signup onNavigate={(path) => router.push(path)} />
  );
}

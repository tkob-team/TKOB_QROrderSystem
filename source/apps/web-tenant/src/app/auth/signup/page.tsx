"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Signup } from '@/features/auth';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email');

  return (
    <Signup 
      onNavigate={(path) => router.push(path)} 
      initialEmail={emailFromQuery || undefined}
    />
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}

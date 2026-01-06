"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmailVerification } from '@/features/auth';

function EmailVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email');
  const registrationTokenFromQuery = searchParams.get('token');

  return (
    <EmailVerification 
      onNavigate={(path) => router.push(path)} 
      userEmail={emailFromQuery || undefined}
      registrationToken={registrationTokenFromQuery || undefined}
    />
  );
}

export default function EmailVerificationPage() {
  return (
    <Suspense>
      <EmailVerificationContent />
    </Suspense>
  );
}

"use client";

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ResetPassword } from '@/features/auth';

/**
 * Reset Password Page
 * 
 * Route: /forgot-password/reset
 * 
 * Expected query parameters:
 * - token: The password reset token from the email link
 * - email: (optional) The user's email for display
 * 
 * Example URL: /forgot-password/reset?token=abc123&email=user@example.com
 */
function ResetPasswordPageContent() {
  const router = useRouter();

  return (
    <ResetPassword
      onNavigate={(path) => router.push(path)}
    />
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

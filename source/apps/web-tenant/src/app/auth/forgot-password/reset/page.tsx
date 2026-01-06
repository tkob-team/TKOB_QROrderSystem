"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read token and email from URL query parameters
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  return (
    <ResetPassword 
      onNavigate={(path) => router.push(path)}
    />
  );
}

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingWizard } from '@/features/auth';

export default function OnboardingPage() {
  const router = useRouter();
  return <OnboardingWizard onNavigate={(path) => router.push(path)} />;
}

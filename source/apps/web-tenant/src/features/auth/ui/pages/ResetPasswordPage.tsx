/**
 * ResetPassword Page - Thin Orchestrator
 * Orchestrates password reset sections
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/shared/config';
import { fadeInUp, shake, scaleIn } from '@/shared/utils/animations';
import { useAuthController } from '../../hooks';
import {
  ResetPasswordFormSection,
  ResetPasswordSuccessSection,
  ResetPasswordInvalidSection,
  type PageState,
} from '../sections/reset-password';
import {
  getPasswordChecks,
  getStrengthColor,
  getStrengthText,
  countPassedChecks,
} from '../../utils/passwordStrength';

interface ResetPasswordProps {
  onNavigate?: (path: string) => void;
}

export function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const controller = useAuthController();
  
  // State
  const [pageState, setPageState] = useState<PageState>('form');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Refs for animations
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Password strength calculation
  const passwordChecks = getPasswordChecks(password);
  const passedChecks = countPassedChecks(passwordChecks);
  const strengthColor = getStrengthColor(passedChecks);
  const strengthText = getStrengthText(passedChecks);

  // Entrance animations
  useEffect(() => {
    const animate = async () => {
      if (logoRef.current) fadeInUp(logoRef.current, 0);
      if (titleRef.current) fadeInUp(titleRef.current, 100);
      if (formRef.current) fadeInUp(formRef.current, 200);
    };
    animate();
  }, [pageState]);

  // Error shake animation
  useEffect(() => {
    if (controller.resetPasswordError && errorRef.current) {
      shake(errorRef.current);
    }
  }, [controller.resetPasswordError]);

  // Success animation
  useEffect(() => {
    if (pageState === 'success' && successRef.current) {
      scaleIn(successRef.current);
    }
  }, [pageState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return;
    }

    if (passedChecks < 3) {
      return;
    }

    const result = await controller.resetPassword({
      token,
      newPassword: password,
    });

    if (result.success) {
      setPageState('success');
    } else {
      if (result.message?.includes('expired') || result.message?.includes('invalid')) {
        setPageState('invalid');
      }
    }
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  // Render sections based on page state
  if (pageState === 'success') {
    return (
      <ResetPasswordSuccessSection
        successRef={successRef}
        onNavigateLogin={() => handleNavigate(ROUTES.login)}
      />
    );
  }

  if (pageState === 'invalid') {
    return (
      <ResetPasswordInvalidSection
        onRequestNewLink={() => handleNavigate(ROUTES.forgotPassword)}
        onNavigateLogin={() => handleNavigate(ROUTES.login)}
      />
    );
  }

  // Form state (default)
  return (
    <ResetPasswordFormSection
      logoRef={logoRef}
      titleRef={titleRef}
      formRef={formRef}
      errorRef={errorRef}
      password={password}
      confirmPassword={confirmPassword}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      error={controller.resetPasswordError}
      isResetting={controller.isResettingPassword}
      passwordChecks={passwordChecks}
      passedChecks={passedChecks}
      strengthColor={strengthColor}
      strengthText={strengthText}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onTogglePassword={() => setShowPassword(!showPassword)}
      onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
      onSubmit={handleSubmit}
    />
  );
}

export default ResetPassword;

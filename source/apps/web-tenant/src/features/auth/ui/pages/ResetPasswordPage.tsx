/**
 * ResetPassword Page - Thin Orchestrator
 * Orchestrates password reset sections
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/shared/config';
import { logger } from '@/shared/utils/logger';
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

  // BUG-05 & BUG-06: Proactively validate reset token on mount using API
  useEffect(() => {
    const validateToken = async () => {
      if (!token || token.trim() === '') {
        setPageState('invalid');
        return;
      }

      // Call API to verify token is valid (not expired)
      const result = await controller.verifyResetToken(token);
      
      if (!result.valid) {
        logger.warn('[reset-password] TOKEN_INVALID_OR_EXPIRED', { token });
        setPageState('invalid');
      }
      // If valid, keep pageState as 'form' (default)
    };

    validateToken();
  }, [token, controller]);

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
      // Enhanced error detection for expired/invalid tokens
      const errorMsg = result.message?.toLowerCase() || '';
      const isTokenError = 
        errorMsg.includes('expired') || 
        errorMsg.includes('invalid') ||
        errorMsg.includes('token') ||
        result.code === 'TOKEN_EXPIRED' ||
        result.code === 'TOKEN_INVALID' ||
        result.code === 'AUTH_INVALID_TOKEN';
      
      if (isTokenError) {
        setPageState('invalid');
      }
      // If other error, controller.resetPasswordError will display it
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

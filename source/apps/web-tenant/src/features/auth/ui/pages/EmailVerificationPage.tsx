/**
 * EmailVerification Page - Thin Orchestrator
 * Orchestrates OTP verification sections
 */

'use client';

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/config';
import { fadeInUp, shake, scaleIn } from '@/shared/utils/animations';
import { useAuthController } from '../../hooks';
import {
  OtpInputSection,
  EmailVerificationSuccessSection,
  EmailVerificationExpiredSection,
  type PageState,
} from '../sections/email-verification';

interface EmailVerificationProps {
  onNavigate?: (screen: string) => void;
  userEmail?: string;
  registrationToken?: string;
}

export function EmailVerification({ 
  onNavigate, 
  userEmail = 'user@example.com', 
  registrationToken 
}: EmailVerificationProps) {
  const router = useRouter();
  const controller = useAuthController();
  
  // State
  const [pageState, setPageState] = useState<PageState>('otp');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  
  // Refs for OTP inputs and animations
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Entrance animations
  useEffect(() => {
    const animate = async () => {
      if (logoRef.current) fadeInUp(logoRef.current, 0);
      if (titleRef.current) fadeInUp(titleRef.current, 100);
      if (formRef.current) fadeInUp(formRef.current, 200);
    };
    animate();
  }, [pageState]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (pageState === 'otp') {
      const timer = setTimeout(() => inputRefs.current[0]?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [pageState]);

  // Error shake animation
  useEffect(() => {
    if (controller.verifyOtpError && errorRef.current) {
      shake(errorRef.current);
    }
  }, [controller.verifyOtpError]);

  // Success animation
  useEffect(() => {
    if (pageState === 'verified' && successRef.current) {
      scaleIn(successRef.current);
    }
  }, [pageState]);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const newDigits = pastedData.split('');
      setOtpDigits(newDigits);
      inputRefs.current[5]?.focus();
    }
  };

  const isOtpComplete = otpDigits.every(digit => digit !== '');

  const handleVerify = async () => {
    if (!isOtpComplete) return;

    const otp = otpDigits.join('');
    const result = await controller.verifyOtp({
      registrationToken: registrationToken || '',
      otp,
    });

    if (result.success && result.accessToken) {
      setPageState('verified');
    } else {
      // Reset OTP on error
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (controller.resendCooldown > 0) return;

    const result = await controller.resendOtp(userEmail);

    if (result.success) {
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleChangeEmail = () => {
    setOtpDigits(['', '', '', '', '', '']);
    const emailParam = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
    handleNavigate(`${ROUTES.signup}${emailParam}`);
  };

  const formatCooldown = () => {
    const mins = Math.floor(controller.resendCooldown / 60);
    const secs = controller.resendCooldown % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Render sections based on page state
  if (pageState === 'verified') {
    return (
      <EmailVerificationSuccessSection
        successRef={successRef}
        onContinueSetup={() => handleNavigate(ROUTES.onboardingWizard)}
      />
    );
  }

  if (pageState === 'expired') {
    return (
      <EmailVerificationExpiredSection
        onResend={handleResend}
        onBack={() => setPageState('otp')}
      />
    );
  }

  // OTP Form State (default)
  return (
    <OtpInputSection
      logoRef={logoRef}
      titleRef={titleRef}
      formRef={formRef}
      errorRef={errorRef}
      inputRefs={inputRefs}
      userEmail={userEmail}
      otpDigits={otpDigits}
      isOtpComplete={isOtpComplete}
      error={controller.verifyOtpError}
      isVerifying={controller.isVerifyingOtp}
      isResending={controller.isResendingOtp}
      resendCooldown={controller.resendCooldown}
      onDigitChange={handleDigitChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onVerify={handleVerify}
      onResend={handleResend}
      onChangeEmail={handleChangeEmail}
      formatCooldown={formatCooldown}
      onDevSetVerified={() => setPageState('verified')}
      onDevSetExpired={() => setPageState('expired')}
    />
  );
}

export default EmailVerification;

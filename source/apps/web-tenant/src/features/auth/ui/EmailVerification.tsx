/**
 * EmailVerification Page - New UI Design
 * Consistent with Login page style - Olive/Emerald theme
 */

'use client';

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, CheckCircle, XCircle, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card, CardContent } from '@/shared/components/Card';
import { ROUTES, config } from '@/shared/config';
import { fadeInUp, shake, scaleIn } from '@/shared/utils/animations';
import { authService } from '../data/factory';
import { AuthPageHeader } from './AuthPageHeader';

/* ===================================
   TYPES
   =================================== */

interface EmailVerificationProps {
  onNavigate?: (screen: string) => void;
  userEmail?: string;
  registrationToken?: string;
}

type PageState = 'otp' | 'verified' | 'expired';

/* ===================================
   MAIN COMPONENT
   =================================== */

export function EmailVerification({ 
  onNavigate, 
  userEmail = 'user@example.com', 
  registrationToken 
}: EmailVerificationProps) {
  const router = useRouter();
  
  // State
  const [pageState, setPageState] = useState<PageState>('otp');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  
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

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Error shake animation
  useEffect(() => {
    if (error && errorRef.current) {
      shake(errorRef.current);
    }
  }, [error]);

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
    setError(null);

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
      setError(null);
      inputRefs.current[5]?.focus();
    }
  };

  const isOtpComplete = otpDigits.every(digit => digit !== '');

  const handleVerify = async () => {
    if (!isOtpComplete) return;

    setIsLoading(true);
    setError(null);

    try {
      const otp = otpDigits.join('');
      const result = await authService.verifyOtp({
        registrationToken: registrationToken || '',
        otp,
      });

      // If we get here with accessToken, it's successful
      if (result.accessToken) {
        setPageState('verified');
      } else {
        setError('Verification failed. Please try again.');
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('[EmailVerification] Verify error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setError(errorMessage);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.resendOtp({
        email: userEmail,
      });

      if (result.success) {
        setResendCooldown(60);
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.message || 'Failed to resend code');
      }
    } catch (err) {
      console.error('[EmailVerification] Resend error:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setOtpDigits(['', '', '', '', '', '']);
    setError(null);
    setResendCooldown(0);
    const emailParam = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
    handleNavigate(`${ROUTES.signup}${emailParam}`);
  };

  const formatCooldown = () => {
    const mins = Math.floor(resendCooldown / 60);
    const secs = resendCooldown % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Success State
  if (pageState === 'verified') {
    return (
      <div className="min-h-screen flex flex-col">
        <AuthPageHeader showBackButton={false} />
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <div ref={successRef} className="flex flex-col items-center gap-6 text-center opacity-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  Email Verified!
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </h2>
                <p className="text-gray-600">
                  Your email has been successfully verified. Let's set up your restaurant.
                </p>
              </div>

              <Button 
                onClick={() => handleNavigate(ROUTES.onboardingWizard)}
                className="w-full h-12 text-base font-semibold"
              >
                Continue to Setup
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  // Expired State
  if (pageState === 'expired') {
    return (
      <div className="min-h-screen flex flex-col">
        <AuthPageHeader />
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <XCircle className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-bold text-gray-900">Code Expired</h2>
                <p className="text-gray-600">
                  This verification code has expired. Please request a new code.
                </p>
              </div>

              <div className="w-full space-y-3">
                <Button 
                  onClick={handleResend}
                  className="w-full h-12 text-base font-semibold"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Resend Code
                </Button>
                <button
                  onClick={() => setPageState('otp')}
                  className="w-full text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  // OTP Form State
  return (
    <div className="min-h-screen flex flex-col">
      <AuthPageHeader backHref={ROUTES.signup} backLabel="Change email" />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 relative">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300/30 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 relative z-10">
        <CardContent className="p-8">

          {/* Logo */}
          <div ref={logoRef} className="flex justify-center mb-6 opacity-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Mail className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <div ref={titleRef} className="text-center mb-8 opacity-0">
            <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to
            </p>
            <p className="text-emerald-600 font-semibold mt-1">
              {userEmail}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div 
              ref={errorRef}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* OTP Form */}
          <div ref={formRef} className="space-y-6 opacity-0">
            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                  aria-label={`Digit ${index + 1} of 6`}
                  className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold border-2 border-gray-200 rounded-lg bg-white text-gray-900 
                    focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 
                    disabled:bg-gray-100 disabled:cursor-not-allowed 
                    transition-all duration-200
                    hover:border-gray-300"
                />
              ))}
            </div>

            {/* Timer hint */}
            <p className="text-center text-sm text-gray-500">
              Code expires in <span className="font-medium text-gray-700">10 minutes</span>
            </p>

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              disabled={!isOtpComplete || isLoading}
              className="w-full h-12 text-base font-semibold"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </Button>

            {/* Resend section */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn't receive a code?
              </p>
              {resendCooldown > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend available in <span className="font-mono font-medium text-emerald-600">{formatCooldown()}</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                >
                  Resend code
                </button>
              )}
            </div>

            {/* Dev-only actions */}
            {config.useMockData && (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex gap-3 items-center justify-center">
                  <button
                    onClick={() => setPageState('verified')}
                    className="text-xs text-gray-400 hover:text-emerald-500 transition-colors uppercase tracking-wider"
                  >
                    DEV: Verified
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setPageState('expired')}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider"
                  >
                    DEV: Expired
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default EmailVerification;

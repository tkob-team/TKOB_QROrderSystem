/**
 * OtpInputSection - Presentational Component
 * OTP input UI for email verification
 */

import React, { RefObject, KeyboardEvent, ClipboardEvent } from 'react';
import { Mail, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card, CardContent } from '@/shared/components/Card';
import { AuthPageHeader } from '../../components/AuthPageHeader';
import { ROUTES, config } from '@/shared/config';

export interface OtpInputSectionProps {
  // Animation refs
  logoRef: RefObject<HTMLDivElement>;
  titleRef: RefObject<HTMLDivElement>;
  formRef: RefObject<HTMLDivElement>;
  errorRef: RefObject<HTMLDivElement>;
  inputRefs: RefObject<(HTMLInputElement | null)[]>;
  
  // Data
  userEmail: string;
  otpDigits: string[];
  isOtpComplete: boolean;
  error: string | null;
  
  // Loading states
  isVerifying: boolean;
  isResending: boolean;
  resendCooldown: number;
  
  // Handlers
  onDigitChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: ClipboardEvent<HTMLInputElement>) => void;
  onVerify: () => void;
  onResend: () => void;
  onChangeEmail: () => void;
  formatCooldown: () => string;
  onDevSetVerified?: () => void;
  onDevSetExpired?: () => void;
}

export function OtpInputSection(props: OtpInputSectionProps) {
  const {
    logoRef,
    titleRef,
    formRef,
    errorRef,
    inputRefs,
    userEmail,
    otpDigits,
    isOtpComplete,
    error,
    isVerifying,
    isResending,
    resendCooldown,
    onDigitChange,
    onKeyDown,
    onPaste,
    onVerify,
    onResend,
    formatCooldown,
    onDevSetVerified,
    onDevSetExpired,
  } = props;

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
                We&apos;ve sent a 6-digit code to
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
                    ref={el => { if (inputRefs.current) inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => onDigitChange(index, e.target.value)}
                    onKeyDown={(e) => onKeyDown(index, e)}
                    onPaste={index === 0 ? onPaste : undefined}
                    disabled={isVerifying || isResending}
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
                onClick={onVerify}
                disabled={!isOtpComplete || isVerifying}
                className="w-full h-12 text-base font-semibold"
              >
                {isVerifying ? (
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
                  Didn&apos;t receive a code?
                </p>
                {resendCooldown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend available in <span className="font-mono font-medium text-emerald-600">{formatCooldown()}</span>
                  </p>
                ) : (
                  <button
                    onClick={onResend}
                    disabled={isResending}
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
                      onClick={onDevSetVerified}
                      className="text-xs text-gray-400 hover:text-emerald-500 transition-colors uppercase tracking-wider"
                    >
                      DEV: Verified
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={onDevSetExpired}
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

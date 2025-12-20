import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { QrCode, Mail, CheckCircle, XCircle } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { config } from '@/lib/config';
import { authService } from './services';
import "../../styles/globals.css";

interface EmailVerificationProps {
  onNavigate?: (screen: string) => void;
  userEmail?: string;
  registrationToken?: string;
  onChangeEmail?: (email: string) => void;
}

export function EmailVerification({ onNavigate, userEmail = 'user@example.com', registrationToken }: EmailVerificationProps) {
  const [state, setState] = useState<'otp' | 'verified' | 'expired'>('otp');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Debug logging
  useEffect(() => {
    console.log('[EmailVerification] Props received:', {
      userEmail,
      registrationToken,
      registrationTokenExists: !!registrationToken,
    });
  }, [userEmail, registrationToken]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow numeric input
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setError(null);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Backspace on empty field moves to previous
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newDigits = pastedData.split('');
      setOtpDigits(newDigits);
      setError(null);
      // Focus last input
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
      console.log('[EmailVerification] Sending verify request:', {
        registrationToken,
        registrationTokenExists: !!registrationToken,
        otp: '***REDACTED***',
      });

      const result = await authService.registerConfirm({
        registrationToken: registrationToken || '',
        otp,
      });

      if (result.success) {
        setState('verified');
      } else {
        setError(result.message || 'Invalid code. Please try again.');
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('[EmailVerification] Verify error:', error);
      setError('Verification failed. Please try again.');
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
    } catch (error) {
      console.error('[EmailVerification] Resend error:', error);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = () => {
    // Clear OTP state
    setOtpDigits(['', '', '', '', '', '']);
    setError(null);
    setResendCooldown(0);
    
    // Navigate to signup with email prefilled
    const emailParam = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
    onNavigate?.(`${ROUTES.signup}${emailParam}`);
  };

  const renderContent = () => {
    switch (state) {
      case 'otp':
        return (
          <>
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-emerald-500" />
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-gray-900">Verify your email</h2>
              <p className="text-gray-600 text-center">
                We&apos;ve sent a 6-digit verification code to
              </p>
              <p className="text-gray-900 text-center" style={{ fontWeight: 600 }}>
                {userEmail}
              </p>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex flex-col gap-3 w-full">
              <div className="flex justify-center gap-2">
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
                    className="w-12 h-14 text-center border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                    style={{ fontSize: '20px', fontWeight: 600 }}
                  />
                ))}
              </div>

              {/* Helper text */}
              <p className="text-gray-500 text-center" style={{ fontSize: '12px' }}>
                Code expires in 10 minutes
              </p>

              {/* Error message */}
              {error && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-center" style={{ fontSize: '14px' }}>
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Verify Button */}
            <Button 
              onClick={handleVerify} 
              className="w-full"
              disabled={!isOtpComplete || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>

            {/* Resend Code */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-gray-600" style={{ fontSize: '14px' }}>
                Didn&apos;t receive a code?
              </p>
              {resendCooldown > 0 ? (
                <p className="text-gray-500" style={{ fontSize: '14px' }}>
                  Resend available in {String(Math.floor(resendCooldown / 60)).padStart(2, '0')}:{String(resendCooldown % 60).padStart(2, '0')}
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  Resend code
                </button>
              )}
            </div>

            {/* Use a different email */}
            <button
              onClick={handleChangeEmail}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              style={{ fontSize: '14px' }}
            >
              Use a different email
            </button>

            {/* Dev-only actions */}
            {config.useMockData && (
              <div className="flex gap-2 items-center justify-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => setState('verified')}
                  className="text-gray-400 hover:text-emerald-500 transition-colors"
                  style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  DEV: Simulate verified
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setState('expired')}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  DEV: Simulate expired
                </button>
              </div>
            )}
          </>
        );

      case 'verified':
        return (
          <>
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-gray-900">Email verified!</h2>
              <p className="text-gray-600 text-center">
                Your email has been successfully verified. Let&apos;s set up your restaurant.
              </p>
            </div>
            <Button onClick={() => onNavigate?.(ROUTES.onboardingWizard)} className="w-full">
              Continue to Setup
            </Button>
          </>
        );

      case 'expired':
        return (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-gray-900">Code expired</h2>
              <p className="text-gray-600 text-center">
                This verification code has expired. Please request a new code.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <Button onClick={handleResend} className="w-full">
                Resend code
              </Button>
              <Button variant="tertiary" onClick={() => setState('otp')} className="w-full">
                Back
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="font-semibold text-gray-900" style={{ fontSize: '20px' }}>TKQR</span>
        </div>
      </div>

      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center gap-8">
          {renderContent()}
        </div>
      </Card>
    </div>
  );
}

export default EmailVerification;

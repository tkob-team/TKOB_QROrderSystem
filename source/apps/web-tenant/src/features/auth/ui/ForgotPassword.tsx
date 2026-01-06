'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Card, CardContent } from '@/shared/components/Card';
import { UtensilsCrossed, Mail, CheckCircle } from 'lucide-react';
import { ROUTES } from '@/shared/config';
import { authService } from '../data/factory';
import { toast } from 'sonner';
import { fadeInUp, scaleIn } from '@/shared/utils/animations';
import { AuthPageHeader } from './AuthPageHeader';
import "../../../styles/globals.css";

interface ForgotPasswordProps {
  onNavigate?: (path: string) => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('EN');
  const [isLinkSent, setIsLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for animations
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Entrance animations
  useEffect(() => {
    const animateEntrance = async () => {
      if (logoRef.current) fadeInUp(logoRef.current, 0);
      if (titleRef.current) fadeInUp(titleRef.current, 100);
      if (subtitleRef.current) fadeInUp(subtitleRef.current, 200);
      if (formRef.current) fadeInUp(formRef.current, 300);
    };
    animateEntrance();
  }, []);

  // Success animation
  useEffect(() => {
    if (isLinkSent && successRef.current) {
      scaleIn(successRef.current);
    }
  }, [isLinkSent]);

  const handleSendLink = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.forgotPassword({ email });

      if (result.success) {
        setIsLinkSent(true);
        toast.success(result.message || 'Reset link sent');
      } else {
        toast.error(result.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('[ForgotPassword] Error:', error);
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Navigation Header */}
      <AuthPageHeader />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
        {/* Emerald gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-neutral-50 to-emerald-100/30" />
        
        {/* Animated background shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />

      <Card className="w-full max-w-md shadow-xl border-0 relative z-10">
        <CardContent className="p-8 sm:p-10">
          {!isLinkSent ? (
            <div className="flex flex-col gap-8">
              {/* Logo & Title */}
              <div className="flex flex-col items-center gap-4">
                <div ref={logoRef} className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Mail className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <h2 ref={titleRef} className="text-2xl sm:text-3xl font-bold text-neutral-900 text-center">Forgot password?</h2>
                  <p ref={subtitleRef} className="text-neutral-600 text-center text-sm">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>
              </div>

              {/* Form */}
              <div ref={formRef} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-neutral-700">
                    Email <span className="text-error-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="admin@restaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="p-4 bg-info-50 rounded-lg border border-info-200">
                  <p className="text-info-900 text-xs">
                    If your email exists in our system, you will receive an email with instructions.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4 pt-2">
                  <Button 
                    onClick={handleSendLink} 
                    fullWidth
                    disabled={isLoading || !email}
                  >
                    {isLoading ? 'Sending...' : 'Send reset link'}
                  </Button>
                  
                  <div className="text-center">
                    <button 
                      onClick={() => onNavigate?.(ROUTES.login)}
                      className="text-sm text-primary-500 hover:text-primary-600 transition-colors font-medium underline-offset-2 hover:underline"
                    >
                      Back to login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div ref={successRef} className="flex flex-col gap-8 items-center text-center py-4">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-11 h-11 text-white" strokeWidth={2.5} />
              </div>
              
              {/* Success Message */}
              <div className="flex flex-col gap-3">
                <h2 className="text-2xl font-bold text-neutral-900">Check your email</h2>
                <p className="text-neutral-600 text-sm max-w-sm">
                  We&apos;ve sent a password reset link to <span className="font-semibold text-neutral-900">{email}</span>
                </p>
                <p className="text-neutral-500 text-xs">
                  Didn&apos;t receive the email? Check your spam folder or try again.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 w-full pt-2">
                <Button 
                  onClick={() => onNavigate?.(ROUTES.resetPassword)}
                  fullWidth
                >
                  Go to reset password
                </Button>
                
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setIsLinkSent(false);
                    setEmail('');
                  }}
                  fullWidth
                >
                  Send again
                </Button>
                
                <div className="text-center pt-2">
                  <button 
                    onClick={() => onNavigate?.(ROUTES.login)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors font-medium underline-offset-2 hover:underline"
                  >
                    Back to login
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default ForgotPassword;

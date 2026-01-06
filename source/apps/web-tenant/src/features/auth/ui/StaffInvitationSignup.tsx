/**
 * StaffInvitationSignup Page - New UI Design
 * Staff invitation acceptance - Olive/Emerald theme
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Eye, EyeOff, CheckCircle, Users, Check, X, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Card, CardContent } from '@/shared/components/Card';
import { ROUTES } from '@/shared/config';
import { fadeInUp, shake, scaleIn } from '@/shared/utils/animations';
import { AuthPageHeader } from './AuthPageHeader';

/* ===================================
   TYPES
   =================================== */

interface StaffInvitationSignupProps {
  onNavigate?: (path: string) => void;
}

type PageState = 'form' | 'success' | 'expired';

interface InvitationDetails {
  email: string;
  role: string;
  restaurantName: string;
  inviterName: string;
}

/* ===================================
   MAIN COMPONENT
   =================================== */

export function StaffInvitationSignup({ onNavigate }: StaffInvitationSignupProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  
  // Mock invitation details (would come from API in production)
  const [invitationDetails] = useState<InvitationDetails>({
    email: 'mike@tkob.com',
    role: 'Kitchen Staff',
    restaurantName: 'TKOB Restaurant',
    inviterName: 'Admin',
  });

  // State
  const [pageState, setPageState] = useState<PageState>('form');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for animations
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Password strength calculation
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };
  
  const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
  
  const getStrengthColor = () => {
    if (passedChecks <= 1) return 'bg-red-500';
    if (passedChecks <= 2) return 'bg-orange-500';
    if (passedChecks <= 3) return 'bg-amber-500';
    if (passedChecks <= 4) return 'bg-emerald-400';
    return 'bg-emerald-500';
  };

  const getStrengthText = () => {
    if (passedChecks <= 1) return 'Weak';
    if (passedChecks <= 2) return 'Fair';
    if (passedChecks <= 3) return 'Good';
    if (passedChecks <= 4) return 'Strong';
    return 'Very Strong';
  };

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
    if (error && errorRef.current) {
      shake(errorRef.current);
    }
  }, [error]);

  // Success animation
  useEffect(() => {
    if (pageState === 'success' && successRef.current) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passedChecks < 3) {
      setError('Password is too weak. Please meet more requirements.');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: API call to complete staff invitation
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPageState('success');
    } catch (err) {
      console.error('[StaffInvitationSignup] Error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex flex-col">
        <AuthPageHeader showBackButton={false} />
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <div ref={successRef} className="flex flex-col items-center gap-6 text-center opacity-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-bold text-gray-900">
                  Welcome to the Team!
                </h2>
                <p className="text-gray-600">
                  Your account has been created. You're now part of <span className="font-semibold text-emerald-600">{invitationDetails.restaurantName}</span>.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg w-full">
                <p className="text-sm text-emerald-700">
                  <span className="font-semibold">Your role:</span> {invitationDetails.role}
                </p>
              </div>

              <Button 
                onClick={() => handleNavigate(ROUTES.dashboard)}
                className="w-full h-12 text-base font-semibold"
              >
                Go to Dashboard
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
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-bold text-gray-900">Invitation Expired</h2>
                <p className="text-gray-600">
                  This invitation link has expired or is no longer valid. Please contact your administrator for a new invitation.
                </p>
              </div>

              <Button 
                onClick={() => handleNavigate(ROUTES.login)}
                className="w-full h-12 text-base font-semibold"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  // Form State
  return (
    <div className="min-h-screen flex flex-col">
      <AuthPageHeader />
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <div ref={titleRef} className="text-center mb-6 opacity-0">
            <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">
              Join {invitationDetails.restaurantName}
            </h1>
            <p className="text-gray-600">
              You've been invited by <span className="font-semibold">{invitationDetails.inviterName}</span>
            </p>
          </div>

          {/* Role badge */}
          <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 rounded-lg mb-6">
            <Users className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Role: {invitationDetails.role}
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div 
              ref={errorRef}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 opacity-0">
            {/* Email (read-only) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <span className="text-gray-700">{invitationDetails.email}</span>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Create Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Strength indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          level <= passedChecks ? getStrengthColor() : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Strength: <span className={`font-medium ${passedChecks >= 4 ? 'text-emerald-600' : passedChecks >= 3 ? 'text-amber-600' : 'text-red-600'}`}>{getStrengthText()}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm font-medium text-gray-700">Password must have:</p>
              <ul className="space-y-1.5">
                {[
                  { key: 'length', label: 'At least 8 characters' },
                  { key: 'uppercase', label: 'One uppercase letter' },
                  { key: 'lowercase', label: 'One lowercase letter' },
                  { key: 'number', label: 'One number' },
                  { key: 'special', label: 'One special character' },
                ].map(({ key, label }) => (
                  <li key={key} className="flex items-center gap-2 text-sm">
                    {passwordChecks[key as keyof typeof passwordChecks] ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={passwordChecks[key as keyof typeof passwordChecks] ? 'text-emerald-700' : 'text-gray-500'}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading || !fullName || !password || !confirmPassword || password !== confirmPassword}
              className="w-full h-12 text-base font-semibold"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account & Join Team'
              )}
            </Button>

            {/* Login link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleNavigate(ROUTES.login)}
                className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Sign in
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default StaffInvitationSignup;

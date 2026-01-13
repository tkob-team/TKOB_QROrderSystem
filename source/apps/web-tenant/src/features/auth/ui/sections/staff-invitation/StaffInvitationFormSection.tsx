/**
 * StaffInvitationFormSection - Presentational Component
 * Form UI for accepting staff invitation
 */

import React, { RefObject } from 'react';
import { Shield, Eye, EyeOff, CheckCircle, Users, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Card, CardContent } from '@/shared/components/Card';
import { AuthPageHeader } from '../../components/AuthPageHeader';
import type { InvitationDetails } from './types';
import type { PasswordChecks } from '../../../utils/passwordStrength';

export interface StaffInvitationFormSectionProps {
  // Animation refs
  logoRef: RefObject<HTMLDivElement>;
  titleRef: RefObject<HTMLDivElement>;
  formRef: RefObject<HTMLFormElement>;
  errorRef: RefObject<HTMLDivElement>;
  
  // Data
  invitationDetails: InvitationDetails;
  
  // Form state
  fullName: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  error: string | null;
  isLoading: boolean;
  
  // Password strength
  passwordChecks: PasswordChecks;
  passedChecks: number;
  strengthColor: string;
  strengthText: string;
  
  // Handlers
  onFullNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onNavigateLogin: () => void;
}

export function StaffInvitationFormSection(props: StaffInvitationFormSectionProps) {
  const {
    logoRef,
    titleRef,
    formRef,
    errorRef,
    invitationDetails,
    fullName,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    error,
    isLoading,
    passwordChecks,
    passedChecks,
    strengthColor,
    strengthText,
    onFullNameChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onTogglePassword,
    onToggleConfirmPassword,
    onSubmit,
    onNavigateLogin,
  } = props;

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
                You&apos;ve been invited by <span className="font-semibold">{invitationDetails.inviterName}</span>
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
            <form ref={formRef} onSubmit={onSubmit} className="space-y-5 opacity-0">
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
                  onChange={(e) => onFullNameChange(e.target.value)}
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
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={onTogglePassword}
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
                            level <= passedChecks ? strengthColor : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Strength: <span className={`font-medium ${passedChecks >= 4 ? 'text-emerald-600' : passedChecks >= 3 ? 'text-amber-600' : 'text-red-600'}`}>{strengthText}</span>
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
                    onChange={(e) => onConfirmPasswordChange(e.target.value)}
                    error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={onToggleConfirmPassword}
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
                      {passwordChecks[key as keyof PasswordChecks] ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300" />
                      )}
                      <span className={passwordChecks[key as keyof PasswordChecks] ? 'text-emerald-700' : 'text-gray-500'}>
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
                  onClick={onNavigateLogin}
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

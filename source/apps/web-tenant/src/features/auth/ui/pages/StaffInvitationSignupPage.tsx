/**
 * StaffInvitationSignup Page - Thin Orchestrator
 * Staff invitation acceptance - orchestrates sections
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { logger } from '@/shared/utils/logger';
import { ROUTES, getHomeRouteForRole } from '@/shared/config';
import type { UserRole } from '@/shared/config';
import { 
  useStaffControllerVerifyInviteToken,
  staffControllerAcceptInvitation 
} from '@/services/generated/staff-management/staff-management';
import { useAuth } from '../hooks/useAuth';
import { fadeInUp, shake, scaleIn } from '@/shared/utils/animations';
import {
  StaffInvitationFormSection,
  StaffInvitationSuccessSection,
  StaffInvitationExpiredSection,
  type PageState,
  type InvitationDetails,
} from '../sections/staff-invitation';
import {
  getPasswordChecks,
  getStrengthColor,
  getStrengthText,
  countPassedChecks,
} from '../../utils/passwordStrength';

interface StaffInvitationSignupProps {
  onNavigate?: (path: string) => void;
}

export function StaffInvitationSignup({ onNavigate }: StaffInvitationSignupProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { login } = useAuth();
  
  // Fetch invitation details from token
  const { data: verifyData, isLoading: isVerifying, error: verifyError } = useStaffControllerVerifyInviteToken(
    { token },
    { query: { enabled: !!token } }
  );
  
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails>({
    email: '',
    role: '',
    restaurantName: '',
    inviterName: '',
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

  // Handle invitation verification
  useEffect(() => {
    if (verifyError) {
      logger.error('[auth] INVITATION_TOKEN_INVALID', { error: verifyError });
      setPageState('expired');
    } else if (verifyData && verifyData.valid) {
      setInvitationDetails({
        email: verifyData.email || '',
        role: verifyData.role || '',
        restaurantName: verifyData.tenantName || 'Restaurant',
        inviterName: 'Admin',
      });
      logger.info('[auth] INVITATION_TOKEN_VERIFIED', { email: verifyData.email });
    } else if (verifyData && !verifyData.valid) {
      setPageState('expired');
    }
  }, [verifyData, verifyError]);

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
      // Accept invitation and create account
      const response = await staffControllerAcceptInvitation({
        token,
        fullName: fullName.trim(),
        password,
      });
      
      logger.info('[auth] STAFF_INVITATION_ACCEPTED', { 
        email: response.email,
        userId: response.userId,
        tenantId: response.tenantId 
      });
      
      // Show success page - user needs to login separately
      setPageState('success');
    } catch (err) {
      logger.error('[auth] STAFF_INVITATION_SIGNUP_ERROR', { message: err instanceof Error ? err.message : 'Unknown error' });
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render sections based on page state
  if (pageState === 'success') {
    return (
      <StaffInvitationSuccessSection
        successRef={successRef}
        invitationDetails={invitationDetails}
        onNavigateDashboard={() => handleNavigate(ROUTES.login)}
      />
    );
  }

  if (pageState === 'expired') {
    return (
      <StaffInvitationExpiredSection
        onNavigateLogin={() => handleNavigate(ROUTES.login)}
      />
    );
  }

  // Form state (default)
  return (
    <StaffInvitationFormSection
      logoRef={logoRef}
      titleRef={titleRef}
      formRef={formRef}
      errorRef={errorRef}
      invitationDetails={invitationDetails}
      fullName={fullName}
      password={password}
      confirmPassword={confirmPassword}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      error={error}
      isLoading={isLoading}
      passwordChecks={passwordChecks}
      passedChecks={passedChecks}
      strengthColor={strengthColor}
      strengthText={strengthText}
      onFullNameChange={setFullName}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onTogglePassword={() => setShowPassword(!showPassword)}
      onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
      onSubmit={handleSubmit}
      onNavigateLogin={() => handleNavigate(ROUTES.login)}
    />
  );
}

export default StaffInvitationSignup;

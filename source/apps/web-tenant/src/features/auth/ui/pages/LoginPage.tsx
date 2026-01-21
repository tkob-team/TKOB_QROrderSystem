/**
 * Login Page - New UI Design
 * Modern implementation with animations
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { logger } from '@/shared/utils/logger';
import { config, ROUTES, getHomeRouteForRole } from '@/shared/config';
import type { UserRole } from '@/shared/config';
import { AuthPageHeader } from '../components/AuthPageHeader';
import {
  fadeInUp,
  shake,
} from '@/shared/utils/animations';
import { LoginFormSection, LoginFormValues } from '../sections/login';

/* ===================================
   TYPES
   =================================== */

interface LoginProps {
  onNavigate?: (screen: string) => void;
}

/* ===================================
   MAIN COMPONENT
   =================================== */

export function Login({ onNavigate }: LoginProps) {
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { devLogin, login, getDefaultRoute } = useAuth();
  const router = useRouter();
  const isDev = config.useMockData;

  // Refs for animations
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /* ===================================
     EFFECTS
     =================================== */

  // Load saved email from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('rememberMeEmail');
      const wasRemembered = localStorage.getItem('rememberMe') === 'true';

      if (savedEmail && wasRemembered) {
        // Use setTimeout to avoid React Hook Form warnings
        setTimeout(() => {
          const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
          if (emailInput) {
            emailInput.value = savedEmail;
          }
        }, 0);
        setRememberMe(true);
      }
    }
  }, []);

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

  // Shake animation on error
  useEffect(() => {
    if (serverError && errorRef.current) {
      shake(errorRef.current);
    }
  }, [serverError]);

  /* ===================================
     HANDLERS
     =================================== */

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError(null);

      // Development mock authentication
      if (isDev) {
        devLogin('admin');
        return;
      }

      // Production authentication
      logger.debug('[auth] LOGIN_PAGE_ATTEMPT');
      const result = await login(data.email, data.password, rememberMe);

      // Save remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMeEmail', data.email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMeEmail');
        localStorage.removeItem('rememberMe');
      }

      // Navigate using role from login response (not from state which may be stale)
      // result.role is already lowercase (from AuthProvider)
      const userRole = result?.role || 'admin';
      const defaultRoute = getHomeRouteForRole(userRole as UserRole);
      logger.debug('[auth] LOGIN_PAGE_NAVIGATE', { route: defaultRoute, role: userRole, result });
      
      // Use window.location for hard redirect to avoid React Router race conditions
      window.location.href = defaultRoute;
    } catch (error: unknown) {
      logger.error('[auth] LOGIN_PAGE_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });

      if (isDev && error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          setServerError(`Login failed: ${axiosError.response.data.message}`);
          return;
        }
      }

      setServerError('Wrong Email or Password. Please try again.');
    }
  };

  const handleDevLogin = (role: 'admin' | 'kds' | 'waiter') => {
    logger.debug('[auth] LOGIN_PAGE_DEV_LOGIN', { role });
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    devLogin(role);
  };

  /* ===================================
     RENDER
     =================================== */

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
        {/* Animated background shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />

        {/* Login Card */}
        <LoginFormSection
          logoRef={logoRef}
          titleRef={titleRef}
          subtitleRef={subtitleRef}
          formRef={formRef}
          errorRef={errorRef}
          serverError={serverError}
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          rememberMe={rememberMe}
          onToggleRememberMe={(checked) => setRememberMe(checked)}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          onSubmit={handleSubmit(onSubmit)}
          onForgotPassword={() =>
            onNavigate ? onNavigate(ROUTES.forgotPassword) : router.push(ROUTES.forgotPassword)
          }
          onSignup={() =>
            onNavigate ? onNavigate(ROUTES.signup) : router.push(ROUTES.signup)
          }
          isDev={isDev}
          onDevLogin={handleDevLogin}
        />
      </div>
    </div>
  );
}

export default Login;

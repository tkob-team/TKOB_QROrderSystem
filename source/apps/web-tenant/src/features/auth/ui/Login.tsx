/**
 * Login Page - New UI Design
 * Modern implementation with animations
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { UtensilsCrossed, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { config, ROUTES } from '@/shared/config';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Card, CardContent } from '@/shared/components/Card';
import { AuthPageHeader } from './AuthPageHeader';
import {
  fadeInUp,
  shake,
} from '@/shared/utils/animations';

/* ===================================
   TYPES
   =================================== */

interface LoginProps {
  onNavigate?: (screen: string) => void;
}

interface LoginFormData {
  email: string;
  password: string;
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
  } = useForm<LoginFormData>({
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

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);

      // Development mock authentication
      if (isDev) {
        devLogin('admin');
        return;
      }

      // Production authentication
      console.log('[Login] Calling login with:', data.email);
      await login(data.email, data.password, rememberMe);

      // Save remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMeEmail', data.email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMeEmail');
        localStorage.removeItem('rememberMe');
      }

      // Navigate to default route
      const defaultRoute = getDefaultRoute();
      console.log('[Login] Navigating to:', defaultRoute);
      router.push(defaultRoute);
    } catch (error: unknown) {
      console.error('[Login] Login failed:', error);

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
    console.log('[Login] Dev login:', role);
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
      <Card className="relative w-full max-w-md shadow-xl border-0 z-10">
        <CardContent className="p-8 sm:p-10">
          <div className="flex flex-col gap-8">
            {/* Logo & Branding */}
            <div className="flex flex-col items-center gap-4">
              <div
                ref={logoRef}
                className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg opacity-0"
              >
                <UtensilsCrossed className="w-9 h-9 text-white" strokeWidth={2} />
              </div>
              <div className="flex flex-col items-center gap-2">
                <h1
                  ref={titleRef}
                  className="text-2xl sm:text-3xl font-bold text-neutral-900 opacity-0 text-center"
                >
                  Welcome back
                </h1>
                <p
                  ref={subtitleRef}
                  className="text-sm text-neutral-600 opacity-0"
                >
                  Sign in to your dashboard
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form
              ref={formRef}
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5 opacity-0"
            >
              {/* Error Message */}
              {serverError && (
                <div
                  ref={errorRef}
                  className="p-3 rounded-lg bg-error-50 border border-error-200"
                >
                  <p className="text-sm text-error-700">
                    {serverError}
                  </p>
                </div>
              )}

              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-neutral-700">
                  Email Address <span className="text-error-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="admin@restaurant.com"
                  autoComplete="off"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email format',
                    },
                  })}
                />
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-neutral-700">
                  Password <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="off"
                    error={errors.password?.message}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm text-neutral-600">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-primary-500 hover:text-primary-600 transition-colors font-medium underline-offset-2 hover:underline"
                  onClick={() =>
                    onNavigate ? onNavigate(ROUTES.forgotPassword) : router.push(ROUTES.forgotPassword)
                  }
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                fullWidth
                className="mt-2"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Sign Up Link */}
              <div className="text-center pt-2">
                <span className="text-sm text-neutral-600">
                  Don&apos;t have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate ? onNavigate(ROUTES.signup) : router.push(ROUTES.signup)
                  }
                  className="text-sm text-primary-500 hover:text-primary-600 transition-colors font-medium underline-offset-2 hover:underline"
                >
                  Sign up
                </button>
              </div>
            </form>

            {/* Dev Quick Login */}
            {isDev && (
              <div className="pt-6 border-t border-neutral-200">
                <p className="text-xs text-neutral-500 mb-3 text-center">
                  Quick Login (Development)
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDevLogin('admin')}
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDevLogin('waiter')}
                  >
                    Waiter
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDevLogin('kds')}
                  >
                    KDS
                  </Button>
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

export default Login;

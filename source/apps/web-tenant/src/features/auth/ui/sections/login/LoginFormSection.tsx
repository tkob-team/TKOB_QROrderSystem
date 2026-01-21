import React, { RefObject } from 'react';
import { UtensilsCrossed, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Card, CardContent } from '@/shared/components/Card';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

export type LoginFormValues = {
  email: string;
  password: string;
};

export interface LoginFormSectionProps {
  logoRef: RefObject<HTMLDivElement>;
  titleRef: RefObject<HTMLHeadingElement>;
  subtitleRef: RefObject<HTMLParagraphElement>;
  formRef: RefObject<HTMLFormElement>;
  errorRef: RefObject<HTMLDivElement>;
  serverError: string | null;
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  isSubmitting: boolean;
  rememberMe: boolean;
  onToggleRememberMe: (checked: boolean) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onForgotPassword: () => void;
  onSignup: () => void;
  isDev: boolean;
  onDevLogin: (role: 'admin' | 'kds' | 'waiter') => void;
}

export function LoginFormSection(props: LoginFormSectionProps) {
  const {
    logoRef,
    titleRef,
    subtitleRef,
    formRef,
    errorRef,
    serverError,
    register,
    errors,
    isSubmitting,
    rememberMe,
    onToggleRememberMe,
    showPassword,
    onTogglePassword,
    onSubmit,
    onForgotPassword,
    onSignup,
    isDev,
    onDevLogin,
  } = props;

  return (
    <Card className="relative w-full max-w-md shadow-xl border-0 z-10">
      <CardContent className="p-8 sm:p-10">
        <div className="flex flex-col gap-8">
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

          <form
            ref={formRef}
            onSubmit={onSubmit}
            className="flex flex-col gap-5 opacity-0"
          >
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
                  onClick={onTogglePassword}
                  className="cursor-pointer absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => onToggleRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                  tabIndex={-1}
                />
                <span className="text-sm text-neutral-600">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="cursor-pointer text-sm text-primary-500 hover:text-primary-600 transition-colors font-medium underline-offset-2 hover:underline"
                onClick={onForgotPassword}
                tabIndex={-1}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              fullWidth
              className="mt-2"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 border-t border-neutral-200" />
              <span className="text-xs text-neutral-500">or continue with</span>
              <div className="flex-1 border-t border-neutral-200" />
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={() => {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                window.location.href = `${apiUrl}/api/v1/auth/google`;
              }}
              className="cursor-pointer w-full flex items-center justify-center gap-3 px-4 py-3 border border-neutral-300 rounded-lg transition-all duration-200 hover:bg-neutral-50 hover:shadow-md bg-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-neutral-700 font-medium">Continue with Google</span>
            </button>

            <div className="text-center pt-2">
              <span className="text-sm text-neutral-600">
                Don&apos;t have an account?{' '}
              </span>
              <button
                type="button"
                onClick={onSignup}
                className="cursor-pointer text-sm text-primary-500 hover:text-primary-600 transition-colors font-medium underline-offset-2 hover:underline"
              >
                Sign up
              </button>
            </div>
          </form>

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
                  onClick={() => onDevLogin('admin')}
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => onDevLogin('waiter')}
                >
                  Waiter
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => onDevLogin('kds')}
                >
                  KDS
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default LoginFormSection;

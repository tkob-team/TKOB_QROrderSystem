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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => onToggleRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-neutral-600">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-primary-500 hover:text-primary-600 transition-colors font-medium underline-offset-2 hover:underline"
                onClick={onForgotPassword}
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

            <div className="text-center pt-2">
              <span className="text-sm text-neutral-600">
                Don&apos;t have an account?{' '}
              </span>
              <button
                type="button"
                onClick={onSignup}
                className="text-sm text-primary-500 hover:text-primary-600 transition-colors font-medium underline-offset-2 hover:underline"
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

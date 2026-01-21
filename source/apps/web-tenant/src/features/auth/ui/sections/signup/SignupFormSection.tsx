import React, { RefObject } from 'react';
import { Button, Card, CardContent, Input } from '@/shared/components';
import { UtensilsCrossed, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

export type SignupFormValues = {
  restaurantName: string;
  slug?: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
};

export interface SignupFormSectionProps {
  logoRef: RefObject<HTMLDivElement>;
  titleRef: RefObject<HTMLDivElement>;
  subtitleRef: RefObject<HTMLParagraphElement>;
  formRef: RefObject<HTMLFormElement>;
  errorRef: RefObject<HTMLDivElement>;
  register: UseFormRegister<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  isSubmitting: boolean;
  slugCheckResult: { available: boolean; message?: string } | null;
  isCheckingSlug: boolean;
  onCheckSlug: () => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onNavigateLogin: () => void;
  slugPreview: string;
  isSlugAuto: boolean;
}

export function SignupFormSection(props: SignupFormSectionProps) {
  const {
    logoRef,
    titleRef,
    subtitleRef,
    formRef,
    errorRef,
    register,
    errors,
    isSubmitting,
    slugCheckResult,
    isCheckingSlug,
    onCheckSlug,
    onSubmit,
    showPassword,
    showConfirmPassword,
    onTogglePassword,
    onToggleConfirmPassword,
    onNavigateLogin,
    slugPreview,
    isSlugAuto,
  } = props;

  return (
    <Card className="w-full max-w-2xl shadow-xl border-0 relative z-10">
      <CardContent className="p-8 sm:p-10">
        <div className="flex flex-col gap-8">
          {/* Logo & Title */}
          <div className="flex flex-col items-center gap-4">
            <div ref={logoRef} className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UtensilsCrossed className="w-9 h-9 text-white" strokeWidth={2} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 ref={titleRef} className="text-2xl sm:text-3xl font-bold text-neutral-900 text-center">Create your account</h2>
              <p ref={subtitleRef} className="text-neutral-600 text-center">Start managing your restaurant today</p>
            </div>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5">
            {/* Restaurant Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-neutral-700">
                Restaurant Name <span className="text-error-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Your Restaurant Name"
                {...register('restaurantName')}
                error={errors.restaurantName?.message}
                helperText={errors.restaurantName?.message}
              />
            </div>

            {/* Restaurant Slug Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-neutral-700">
                Restaurant Slug (optional)
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g. tkob-restaurant"
                  {...register('slug')}
                  error={errors.slug?.message}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCheckSlug}
                  disabled={isCheckingSlug}
                  className="shrink-0"
                  tabIndex={-1}
                >
                  {isCheckingSlug ? 'Checking...' : 'Check'}
                </Button>
              </div>
              <p className="text-xs text-neutral-500">
                This will be used in your restaurant URL. Leave empty to auto-generate from the restaurant name.
              </p>

              {slugPreview && (
                <div className="text-sm text-neutral-600">
                  Preview: <span className="text-primary-600 font-medium">{slugPreview}.tkqr.com</span>
                  {isSlugAuto && <span className="text-neutral-400"> (auto)</span>}
                </div>
              )}

              {slugCheckResult && (
                <div ref={errorRef} className={`flex items-center gap-2 text-sm ${slugCheckResult.available ? 'text-success-600' : 'text-error-600'}`}>
                  {slugCheckResult.available ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {slugCheckResult.message}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-neutral-700">
                  Full Name <span className="text-error-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Nguyen Van A"
                  {...register('fullName')}
                  error={errors.fullName?.message}
                  helperText={errors.fullName?.message}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-neutral-700">
                  Email <span className="text-error-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="admin@restaurant.com"
                  {...register('email')}
                  error={errors.email?.message}
                  helperText={errors.email?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-neutral-700">
                  Password <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    {...register('password')}
                    error={errors.password?.message}
                    helperText={errors.password?.message || 'Must be at least 8 characters with a number and special character'}
                  />
                  <button
                    type="button"
                    onClick={onTogglePassword}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-neutral-700">
                  Confirm Password <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                    helperText={errors.confirmPassword?.message}
                  />
                  <button
                    type="button"
                    onClick={onToggleConfirmPassword}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register('agreedToTerms')}
                className="w-4 h-4 mt-0.5 text-primary-500 border-neutral-300 rounded focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-neutral-600">
                I agree to the{' '}
                <button type="button" className="text-primary-500 hover:text-primary-600 transition-colors font-medium underline-offset-2 hover:underline" tabIndex={-1}>
                  Terms and Conditions
                </button>
              </span>
            </label>
            {errors.agreedToTerms && (
              <p className="text-error-600 text-xs flex items-center gap-1 -mt-3">
                <AlertCircle className="w-3 h-3" /> {errors.agreedToTerms.message}
              </p>
            )}

            <div className="flex flex-col gap-4 pt-2">
              <Button type="submit" disabled={isSubmitting} fullWidth>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
              <div className="text-center">
                <span className="text-sm text-neutral-600">Already have an account? </span>
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="text-sm text-primary-500 hover:text-primary-600 transition-colors font-medium underline-offset-2 hover:underline"
                >
                  Log in
                </button>
              </div>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

export default SignupFormSection;

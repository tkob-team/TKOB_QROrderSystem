'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Card, CardContent, Input } from '@/shared/components';
import { UtensilsCrossed, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/config';
import { authService } from '../data/factory';
import { fadeInUp, shake } from '@/shared/utils/animations';
import { AuthPageHeader } from './AuthPageHeader';
import "../../../styles/globals.css";

// Validation schema
const signupSchema = z.object({
  restaurantName: z.string()
    .min(3, 'Restaurant name must be at least 3 characters')
    .max(50, 'Restaurant name must be at most 50 characters'),
  slug: z.string().default(''),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character (!@#$%^&*...)'),
  confirmPassword: z.string(),
  agreedToTerms: z.boolean().refine((val: boolean) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupProps {
  onNavigate?: (screen: string) => void;
  initialEmail?: string;
}

export function Signup({ onNavigate, initialEmail }: SignupProps) {
  const [language, setLanguage] = useState('EN');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugCheckResult, setSlugCheckResult] = useState<{ available: boolean; message?: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Refs for animations
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit: formHandleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: {
      email: initialEmail || '',
      agreedToTerms: false,
      slug: '',
    },
  });

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

  // Shake animation for errors
  useEffect(() => {
    if (Object.keys(errors).length > 0 && errorRef.current) {
      shake(errorRef.current);
    }
  }, [errors]);

  const restaurantName = watch('restaurantName');
  const slug = watch('slug');

  // Generate slug from restaurant name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Collapse multiple hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Auto-generate slug when restaurant name changes
  useEffect(() => {
    if (restaurantName && !slug) {
      const generated = generateSlug(restaurantName);
      setValue('slug', generated);
    }
  }, [restaurantName, slug, setValue]);

  // Check slug availability
  const handleCheckAvailability = async () => {
    const effectiveSlug = slug || generateSlug(restaurantName);
    if (!effectiveSlug) {
      toast.error('Please enter a restaurant name first');
      return;
    }

    setIsCheckingSlug(true);
    try {
      const result = await authService.checkSlugAvailability(effectiveSlug);
      setSlugCheckResult(result);
      
      if (result.available) {
        toast.success('✅ Slug is available');
      } else {
        toast.error(result.message || 'Slug is not available');
      }
    } catch (error) {
      console.error('[Signup] Check slug error:', error);
      toast.error('Failed to check availability');
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Get effective slug for preview
  const getEffectiveSlug = (): string => {
    if (slug) return slug;
    if (restaurantName) return generateSlug(restaurantName);
    return '';
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      const result = await authService.signup({
        tenantName: data.restaurantName,
        slug: data.slug || generateSlug(data.restaurantName),
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      if (result.registrationToken) {
        toast.success(result.message || 'Check your email for OTP');
        
        // Navigate to email verification with email and registration token as query params
        const params = new URLSearchParams({
          email: data.email,
          ...(result.registrationToken && { token: result.registrationToken }),
        });
        onNavigate?.(`${ROUTES.emailVerification}?${params.toString()}`);
      } else {
        toast.error(result.message || 'Signup failed');
      }
    } catch (error) {
      console.error('[Signup] Signup error:', error);
      toast.error('Signup failed. Please try again.');
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
            <form ref={formRef} onSubmit={formHandleSubmit(onSubmit)} className="flex flex-col gap-5">
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
                    onClick={handleCheckAvailability}
                    disabled={isCheckingSlug}
                    className="shrink-0"
                  >
                    {isCheckingSlug ? 'Checking...' : 'Check'}
                  </Button>
                </div>
                
                {/* Helper text */}
                <p className="text-xs text-neutral-500">
                  This will be used in your restaurant URL. Leave empty to auto-generate from the restaurant name.
                </p>
                
                {/* URL Preview */}
                {getEffectiveSlug() && (
                  <div className="text-sm text-neutral-600">
                    Preview: <span className="text-primary-600 font-medium">{getEffectiveSlug()}.tkqr.com</span>
                    {!slug && <span className="text-neutral-400"> (auto)</span>}
                  </div>
                )}
                
                {/* Slug check result */}
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
                {/* Full Name */}
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

                {/* Email */}
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
                {/* Password */}
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
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms Agreement */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('agreedToTerms')}
                  className="w-4 h-4 mt-0.5 text-primary-500 border-neutral-300 rounded focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-neutral-600">
                  I agree to the{' '}
                  <button type="button" className="text-primary-500 hover:text-primary-600 transition-colors font-medium underline-offset-2 hover:underline">
                    Terms and Conditions
                  </button>
                </span>
              </label>
              {errors.agreedToTerms && (
                <p className="text-error-600 text-xs flex items-center gap-1 -mt-3">
                  <AlertCircle className="w-3 h-3" /> {errors.agreedToTerms.message}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-4 pt-2">
                <Button type="submit" disabled={isSubmitting} fullWidth>
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </Button>
                
                <div className="text-center">
                  <span className="text-sm text-neutral-600">
                    Already have an account?{' '}
                  </span>
                  <button 
                    type="button"
                    onClick={() => onNavigate?.(ROUTES.login)}
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
      </div>
    </div>
  );
}

export default Signup;

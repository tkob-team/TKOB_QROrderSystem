'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { logger } from '@/shared/utils/logger';
import { ROUTES } from '@/shared/config';
import { fadeInUp, shake } from '@/shared/utils/animations';
import { AuthPageHeader } from '../components/AuthPageHeader';
import { useAuthController } from '../../hooks';
import { SignupFormSection } from '../sections/signup';

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
  // Auth controller
  const controller = useAuthController();
  
  const [language, setLanguage] = useState('EN');
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

    const result = await controller.checkSlugAvailability(effectiveSlug);
    if (!result) return;
    
    setSlugCheckResult(result);
    
    if (result.available) {
      toast.success('✅ Slug is available');
    } else {
      toast.error(result.message || 'Slug is not available');
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
      const result = await controller.adapter.signup({
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
      // Extract and display the error message from the API response
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      logger.error('[auth] SIGNUP_ERROR', { message: errorMessage });
      
      // Display the actual error message to the user
      toast.error(errorMessage);
    }
  };

  const effectiveSlug = getEffectiveSlug();
  const handleFormSubmit = formHandleSubmit(onSubmit);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <AuthPageHeader />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-neutral-50 to-emerald-100/30" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />

        <SignupFormSection
          logoRef={logoRef}
          titleRef={titleRef}
          subtitleRef={subtitleRef}
          formRef={formRef}
          errorRef={errorRef}
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          slugCheckResult={slugCheckResult}
          isCheckingSlug={controller.isCheckingSlug}
          onCheckSlug={handleCheckAvailability}
          onSubmit={handleFormSubmit}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
          onNavigateLogin={() => onNavigate?.(ROUTES.login)}
          slugPreview={effectiveSlug}
          isSlugAuto={!slug && !!restaurantName}
        />
      </div>
    </div>
  );
}

export default Signup;

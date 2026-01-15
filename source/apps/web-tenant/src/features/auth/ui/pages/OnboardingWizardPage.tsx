/**
 * OnboardingWizard Page - New UI Design
 * Multi-step restaurant setup wizard - Olive/Emerald theme
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/Card';
import { useAuth } from '@/shared/context/AuthContext';
import { useAuthController } from '../../hooks';
import { ROUTES } from '@/shared/config';
import { logger } from '@/shared/utils/logger';
import { 
  tenantControllerUpdateProfile,
  tenantControllerUpdateOpeningHours,
  tenantControllerCompleteOnboarding
} from '@/services/generated/tenants/tenants';
import { fadeInUp } from '@/shared/utils/animations';
import {
  OnboardingHeaderSection,
  WorkspaceSetupSection,
  RestaurantSetupSection,
  ReviewConfirmSection,
  OnboardingFooterActionsSection,
  DayKey,
  FormData,
  OpeningHoursDay,
  OnboardingStep,
} from '../sections/onboarding';

interface OnboardingWizardProps {
  onNavigate?: (screen: string) => void;
}

const DAYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const STEPS: OnboardingStep[] = [
  { number: 1, label: 'Restaurant Info', icon: Store },
  { number: 2, label: 'Opening Hours', icon: Clock },
  { number: 3, label: 'Review', icon: CheckCircle },
];

const INITIAL_FORM_DATA: FormData = {
  name: '',
  slug: '',
  description: '',
  phone: '',
  address: '',
  logoUrl: '',
  language: 'en',
  theme: 'emerald',
  openingHours: {
    monday: { enabled: true, openTime: '09:00', closeTime: '22:00' },
    tuesday: { enabled: true, openTime: '09:00', closeTime: '22:00' },
    wednesday: { enabled: true, openTime: '09:00', closeTime: '22:00' },
    thursday: { enabled: true, openTime: '09:00', closeTime: '22:00' },
    friday: { enabled: true, openTime: '09:00', closeTime: '22:00' },
    saturday: { enabled: true, openTime: '09:00', closeTime: '22:00' },
    sunday: { enabled: true, openTime: '09:00', closeTime: '22:00' },
  },
};

type StringField = keyof Omit<FormData, 'openingHours'>;

export function OnboardingWizard({ onNavigate }: OnboardingWizardProps) {
  const router = useRouter();
  const { devLogin } = useAuth();
  const controller = useAuthController();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [sourceDay, setSourceDay] = useState<DayKey>('monday');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepContentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) fadeInUp(headerRef.current, 0);
    if (stepContentRef.current) fadeInUp(stepContentRef.current, 100);
  }, [currentStep]);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const isTimeInvalid = (day: DayKey): boolean => {
    const hours = formData.openingHours[day];
    if (!hours.enabled) return false;
    if (!hours.openTime || !hours.closeTime) return true;
    return hours.closeTime <= hours.openTime;
  };

  const hasValidationErrors = (): boolean => {
    if (currentStep === 1 && !formData.name.trim()) {
      return true;
    }
    if (currentStep === 2) {
      return DAYS.some((day) => isTimeInvalid(day));
    }
    return false;
  };

  const handleNext = async () => {
    setError(null);

    if (currentStep === 1 && !formData.name.trim()) {
      setError('Please enter your restaurant name');
      return;
    }

    if (currentStep === 1 && !formData.slug && formData.name) {
      setFormData({ ...formData, slug: generateSlug(formData.name) });
    }

    if (currentStep === 2) {
      const hasInvalidTimes = DAYS.some((day) => isTimeInvalid(day));
      if (hasInvalidTimes) {
        setError('Please fix the invalid opening hours');
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoading(true);
      try {
        // Helper to map OpeningHoursDay to DaySchedule format
        const mapToDaySchedule = (day: OpeningHoursDay) => ({
          open: day.openTime,
          close: day.closeTime,
          closed: !day.enabled,
        });

        // Step 1: Update profile
        await tenantControllerUpdateProfile({
          name: formData.name,
          slug: formData.slug || generateSlug(formData.name),
          description: formData.description || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          logoUrl: formData.logoUrl || undefined,
        });

        // Step 2: Update opening hours
        await tenantControllerUpdateOpeningHours({
          monday: mapToDaySchedule(formData.openingHours.monday),
          tuesday: mapToDaySchedule(formData.openingHours.tuesday),
          wednesday: mapToDaySchedule(formData.openingHours.wednesday),
          thursday: mapToDaySchedule(formData.openingHours.thursday),
          friday: mapToDaySchedule(formData.openingHours.friday),
          saturday: mapToDaySchedule(formData.openingHours.saturday),
          sunday: mapToDaySchedule(formData.openingHours.sunday),
        });

        // Step 3: Complete onboarding
        await tenantControllerCompleteOnboarding();

        handleNavigate(ROUTES.dashboard);
      } catch (err) {
        logger.error('Onboarding error:', err);
        setError('Failed to complete setup. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleLogoUpload = () => {
    setFormData({ ...formData, logoUrl: 'https://via.placeholder.com/200x200/10B981/FFFFFF?text=Logo' });
  };

  const handleFieldChange = (field: StringField, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateDayHours = (day: DayKey, updates: Partial<OpeningHoursDay>) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: { ...formData.openingHours[day], ...updates },
      },
    });
  };

  const applyToAllDays = () => {
    const sourceHours = formData.openingHours[sourceDay];
    const updatedHours = { ...formData.openingHours };
    
    DAYS.forEach((day) => {
      updatedHours[day] = {
        enabled: true,
        openTime: sourceHours.openTime,
        closeTime: sourceHours.closeTime,
      };
    });
    
    setFormData({ ...formData, openingHours: updatedHours });
  };

  const enabledDays = DAYS.filter((day) => formData.openingHours[day].enabled);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300/30 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-3xl shadow-xl border-0 relative z-10">
        <CardContent className="p-6 sm:p-8">
          <OnboardingHeaderSection headerRef={headerRef} steps={STEPS} currentStep={currentStep} />

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div ref={stepContentRef} className="min-h-[400px] opacity-0">
            {currentStep === 1 && (
              <WorkspaceSetupSection
                formData={formData}
                onFieldChange={(field, value) => handleFieldChange(field, value)}
                onLogoUpload={handleLogoUpload}
              />
            )}
            {currentStep === 2 && (
              <RestaurantSetupSection
                openingHours={formData.openingHours}
                sourceDay={sourceDay}
                onSourceDayChange={setSourceDay}
                onApplyToAllDays={applyToAllDays}
                onToggleDay={(day, enabled) => updateDayHours(day, { enabled })}
                onTimeChange={(day, payload) => updateDayHours(day, payload)}
                isTimeInvalid={isTimeInvalid}
              />
            )}
            {currentStep === 3 && (
              <ReviewConfirmSection
                formData={formData}
                enabledDays={enabledDays}
                openingHours={formData.openingHours}
              />
            )}
          </div>

          <OnboardingFooterActionsSection
            currentStep={currentStep}
            canGoBack={currentStep > 1}
            isLoading={isLoading}
            disableNext={hasValidationErrors()}
            onBack={handleBack}
            onNext={handleNext}
            onSkip={() => handleNavigate(ROUTES.dashboard)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default OnboardingWizard;

/**
 * OnboardingWizard Page - New UI Design
 * Multi-step restaurant setup wizard - Olive/Emerald theme
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  Upload, 
  Copy, 
  Store, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Globe,
  Palette,
  Phone,
  MapPin
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Card, CardContent } from '@/shared/components/Card';
import { useAuth } from '@/shared/context/AuthContext';
import { ROUTES } from '@/shared/config';
import { fadeInUp } from '@/shared/utils/animations';

/* ===================================
   TYPES
   =================================== */

interface OnboardingWizardProps {
  onNavigate?: (screen: string) => void;
}

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

type OpeningHoursDay = {
  enabled: boolean;
  openTime: string;
  closeTime: string;
};

interface FormData {
  name: string;
  slug: string;
  description: string;
  phone: string;
  address: string;
  logoUrl: string;
  language: string;
  theme: string;
  openingHours: Record<DayKey, OpeningHoursDay>;
}

const DAYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const STEPS = [
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

/* ===================================
   MAIN COMPONENT
   =================================== */

export function OnboardingWizard({ onNavigate }: OnboardingWizardProps) {
  const router = useRouter();
  const { devLogin } = useAuth();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [sourceDay, setSourceDay] = useState<DayKey>('monday');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for animations
  const stepContentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Entrance animations
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

  // Auto-generate slug from name
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

    // Auto-generate slug if empty on step 1
    if (currentStep === 1 && !formData.slug && formData.name) {
      setFormData({ ...formData, slug: generateSlug(formData.name) });
    }

    // Validate opening hours on step 2
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
      // Complete onboarding
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        devLogin('admin');
        handleNavigate(ROUTES.dashboard);
      } catch (err) {
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

  // Render Step 1 - Restaurant Info
  const renderStep1 = () => (
    <div className="space-y-5">
      <Input
        label="Restaurant Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="My Restaurant"
        required
      />
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
        <Input
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="my-restaurant"
        />
        <p className="text-xs text-gray-500">
          Used in URLs. Leave empty to auto-generate.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Tell us about your restaurant..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 
            resize-y focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 
            transition-all duration-200 text-sm"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Phone className="w-4 h-4" />
            Phone
          </label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 234 567 8900"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4" />
            Address
          </label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main Street"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Globe className="w-4 h-4" />
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 
              focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 
              transition-all duration-200 text-sm cursor-pointer"
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
            <option value="th">ไทย (Thai)</option>
            <option value="zh">中文 (Chinese)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Palette className="w-4 h-4" />
            Theme
          </label>
          <select
            value={formData.theme}
            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 
              focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 
              transition-all duration-200 text-sm cursor-pointer"
          >
            <option value="emerald">Emerald (Green)</option>
            <option value="ocean">Ocean (Blue)</option>
            <option value="sunset">Sunset (Orange)</option>
          </select>
        </div>
      </div>

      {/* Logo Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Logo</label>
        {formData.logoUrl ? (
          <div className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
            <img 
              src={formData.logoUrl} 
              alt="Logo preview" 
              className="w-16 h-16 rounded-lg object-cover shadow-sm"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Logo uploaded</p>
              <p className="text-xs text-gray-500">Click to change</p>
            </div>
            <Button variant="secondary" onClick={handleLogoUpload}>
              Change
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleLogoUpload}
            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg 
              hover:border-emerald-400 hover:bg-emerald-50/50 
              transition-all duration-200 group"
          >
            <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-emerald-600">
              <Upload className="w-8 h-8" />
              <span className="text-sm font-medium">Click to upload logo</span>
              <span className="text-xs">(Simulated in demo)</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );

  // Render Step 2 - Opening Hours
  const renderStep2 = () => (
    <div className="space-y-5">
      {/* Apply to all control */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-emerald-800">Copy from:</span>
          <select
            value={sourceDay}
            onChange={(e) => setSourceDay(e.target.value as DayKey)}
            className="px-3 py-2 text-sm border border-emerald-300 rounded-lg bg-white 
              text-gray-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <Button variant="secondary" onClick={applyToAllDays} className="text-sm">
          <Copy className="w-4 h-4 mr-2" />
          Apply to all
        </Button>
      </div>

      {/* Schedule grid */}
      <div className="space-y-3">
        {DAYS.map((day) => {
          const hours = formData.openingHours[day];
          const invalid = isTimeInvalid(day);
          
          return (
            <div key={day} className="space-y-1">
              <div className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                invalid ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                {/* Day checkbox */}
                <label className="flex items-center gap-3 min-w-[130px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hours.enabled}
                    onChange={(e) => updateDayHours(day, { enabled: e.target.checked })}
                    className="w-5 h-5 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className={`text-sm font-medium capitalize ${hours.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                    {day}
                  </span>
                </label>

                {/* Time inputs */}
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={hours.openTime}
                    onChange={(e) => updateDayHours(day, { openTime: e.target.value })}
                    disabled={!hours.enabled}
                    className={`px-3 py-2 text-sm border rounded-lg transition-all
                      ${!hours.enabled 
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="time"
                    value={hours.closeTime}
                    onChange={(e) => updateDayHours(day, { closeTime: e.target.value })}
                    disabled={!hours.enabled}
                    className={`px-3 py-2 text-sm border rounded-lg transition-all
                      ${!hours.enabled 
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                  />
                </div>
              </div>
              
              {invalid && (
                <p className="text-xs text-red-600 ml-4">
                  {!hours.openTime || !hours.closeTime
                    ? 'Please set both opening and closing times.'
                    : 'Closing time must be later than opening time.'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        Enable the days your restaurant operates and set the hours for each day.
      </p>
    </div>
  );

  // Render Step 3 - Review
  const renderStep3 = () => {
    const enabledDays = DAYS.filter((day) => formData.openingHours[day].enabled);

    return (
      <div className="space-y-6">
        {/* Success banner */}
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Sparkles className="w-6 h-6 text-emerald-600" />
          <div>
            <p className="font-medium text-emerald-800">Almost done!</p>
            <p className="text-sm text-emerald-700">Review your information and complete the setup.</p>
          </div>
        </div>

        {/* Info sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Restaurant Info */}
          <div className="p-5 bg-gray-50 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              Restaurant Info
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Name</span>
                <p className="font-medium text-gray-900">{formData.name || 'Not set'}</p>
              </div>
              <div>
                <span className="text-gray-500">Slug</span>
                <p className="font-medium text-gray-900">{formData.slug || 'Auto-generated'}</p>
              </div>
              {formData.phone && (
                <div>
                  <span className="text-gray-500">Phone</span>
                  <p className="font-medium text-gray-900">{formData.phone}</p>
                </div>
              )}
              {formData.address && (
                <div>
                  <span className="text-gray-500">Address</span>
                  <p className="font-medium text-gray-900">{formData.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="p-5 bg-gray-50 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-600" />
              Settings
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Language</span>
                <p className="font-medium text-gray-900">
                  {formData.language === 'en' && 'English'}
                  {formData.language === 'vi' && 'Tiếng Việt'}
                  {formData.language === 'th' && 'ไทย'}
                  {formData.language === 'zh' && '中文'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Theme</span>
                <p className="font-medium text-gray-900">
                  {formData.theme === 'emerald' && 'Emerald (Green)'}
                  {formData.theme === 'ocean' && 'Ocean (Blue)'}
                  {formData.theme === 'sunset' && 'Sunset (Orange)'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Logo</span>
                <p className="font-medium text-gray-900">
                  {formData.logoUrl ? 'Uploaded' : 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="p-5 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Opening Hours
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {enabledDays.map((day) => {
              const hours = formData.openingHours[day];
              return (
                <div key={day} className="flex justify-between p-2 bg-white rounded-lg">
                  <span className="font-medium text-gray-900 capitalize">{day}</span>
                  <span className="text-gray-600">{hours.openTime} - {hours.closeTime}</span>
                </div>
              );
            })}
          </div>
          
          {enabledDays.length === 0 && (
            <p className="text-sm text-gray-500">No operating days selected</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300/30 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-3xl shadow-xl border-0 relative z-10">
        <CardContent className="p-6 sm:p-8">
          {/* Header */}
          <div ref={headerRef} className="flex items-center gap-4 pb-6 border-b border-gray-100 opacity-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-2xl">🍽️</span>
            </div>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">Welcome to TKQR</h1>
              <p className="text-sm text-gray-600">Let's set up your restaurant</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center py-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' 
                        : isActive 
                          ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' 
                          : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${
                      isActive || isCompleted ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-12 sm:w-24 h-1 mx-2 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <div ref={stepContentRef} className="min-h-[400px] opacity-0">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
            <div>
              {currentStep > 1 && (
                <Button variant="secondary" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavigate(ROUTES.dashboard)}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip for now
              </button>
              <Button 
                onClick={handleNext}
                disabled={isLoading || hasValidationErrors()}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Completing...
                  </span>
                ) : currentStep === 3 ? (
                  <>
                    Complete Setup
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OnboardingWizard;

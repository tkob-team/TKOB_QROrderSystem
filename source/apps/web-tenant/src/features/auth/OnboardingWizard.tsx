import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { Check, Upload, Copy } from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { ROUTES } from '@/lib/routes';
import "../../styles/globals.css";

interface OnboardingWizardProps {
  onNavigate?: (screen: string) => void;
}

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

type OpeningHoursDay = {
  enabled: boolean;
  openTime: string;
  closeTime: string;
};

export function OnboardingWizard({ onNavigate }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [sourceDay, setSourceDay] = useState<DayKey>('monday');
  const { devLogin } = useAuth();
  const [formData, setFormData] = useState({
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
    } as Record<DayKey, OpeningHoursDay>,
  });

  const days: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const steps = [
    { number: 1, label: 'Update Profile' },
    { number: 2, label: 'Opening Hours' },
    { number: 3, label: 'Review' },
  ];

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNext = () => {
    if (currentStep < 3) {
      // Auto-generate slug if empty on step 1
      if (currentStep === 1 && !formData.slug && formData.name) {
        setFormData({ ...formData, slug: generateSlug(formData.name) });
      }
      
      // Validate step 2 before moving to step 3
      if (currentStep === 2) {
        const hasInvalidTimes = days.some((day) => {
          const hours = formData.openingHours[day];
          if (hours.enabled && hours.closeTime <= hours.openTime) {
            return true;
          }
          if (hours.enabled && (!hours.openTime || !hours.closeTime)) {
            return true;
          }
          return false;
        });
        
        if (hasInvalidTimes) {
          return; // Don't proceed if validation fails
        }
      }
      
      setCurrentStep(currentStep + 1);
    } else {
      // After completing onboarding, log user in as admin
      devLogin('admin');
      onNavigate?.(ROUTES.dashboard);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLogoUpload = () => {
    // Demo mode: set a placeholder logo URL
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
    const updatedHours: Record<DayKey, OpeningHoursDay> = { ...formData.openingHours };
    
    days.forEach((day) => {
      updatedHours[day] = {
        enabled: true, // Enable all days
        openTime: sourceHours.openTime,
        closeTime: sourceHours.closeTime,
      };
    });
    
    setFormData({ ...formData, openingHours: updatedHours });
  };

  const isTimeInvalid = (day: DayKey): boolean => {
    const hours = formData.openingHours[day];
    if (!hours.enabled) return false;
    if (!hours.openTime || !hours.closeTime) return true;
    return hours.closeTime <= hours.openTime;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col gap-4">
            <Input
              label="Restaurant / Tenant Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Restaurant"
              required
            />
            
            <div className="flex flex-col gap-2">
              <Input
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="my-restaurant"
              />
              <p className="text-gray-500" style={{ fontSize: '13px' }}>
                Optional. Used in URLs. Leave empty to auto-generate from the name.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-900">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell us about your restaurant..."
                className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 resize-y focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20"
                rows={4}
                style={{ fontSize: '15px', minHeight: '96px' }}
              />
            </div>

            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 8900"
            />

            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main Street, City"
            />

            <div className="flex flex-col gap-2">
              <label className="text-gray-900">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20"
                style={{ fontSize: '15px' }}
                required
              >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
                <option value="th">ไทย (Thai)</option>
                <option value="zh">中文 (Chinese)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-900">Theme</label>
              <select
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20"
                style={{ fontSize: '15px' }}
                required
              >
                <option value="emerald">Emerald (Green)</option>
                <option value="ocean">Ocean (Blue)</option>
                <option value="sunset">Sunset (Orange)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-900">Logo</label>
              {formData.logoUrl ? (
                <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl">
                  <img 
                    src={formData.logoUrl} 
                    alt="Logo preview" 
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                      Logo uploaded
                    </p>
                    <p className="text-gray-500" style={{ fontSize: '13px' }}>
                      Click button to change
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleLogoUpload}>
                    Change
                  </Button>
                </div>
              ) : (
                <div>
                  <Button variant="secondary" onClick={handleLogoUpload} className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose logo
                  </Button>
                  <p className="text-gray-500 mt-2" style={{ fontSize: '13px' }}>
                    Logo upload is simulated in demo mode.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-4">
            {/* Apply to all days control */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <label className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Copy from:
                </label>
                <select
                  value={sourceDay}
                  onChange={(e) => setSourceDay(e.target.value as DayKey)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20"
                  style={{ fontSize: '14px' }}
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="secondary" size="sm" onClick={applyToAllDays}>
                <Copy className="w-4 h-4 mr-2" />
                Apply to all days
              </Button>
            </div>

            {/* Per-day schedule */}
            <div className="flex flex-col gap-2">
              {days.map((day) => {
                const hours = formData.openingHours[day];
                const invalid = isTimeInvalid(day);
                
                return (
                  <div key={day} className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-white">
                      {/* Checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer min-w-[120px]">
                        <input
                          type="checkbox"
                          checked={hours.enabled}
                          onChange={(e) => updateDayHours(day, { enabled: e.target.checked })}
                          className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-gray-900 capitalize" style={{ fontSize: '15px', fontWeight: 500 }}>
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
                          className={`px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 ${
                            !hours.enabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                          }`}
                          style={{ fontSize: '14px' }}
                        />
                        <span className="text-gray-500">—</span>
                        <input
                          type="time"
                          value={hours.closeTime}
                          onChange={(e) => updateDayHours(day, { closeTime: e.target.value })}
                          disabled={!hours.enabled}
                          className={`px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 ${
                            !hours.enabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                          }`}
                          style={{ fontSize: '14px' }}
                        />
                      </div>
                    </div>
                    
                    {/* Validation error */}
                    {invalid && (
                      <p className="text-red-500 ml-4" style={{ fontSize: '13px' }}>
                        {!hours.openTime || !hours.closeTime
                          ? 'Please set both opening and closing times.'
                          : 'Closing time must be later than opening time.'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-gray-500 mt-2" style={{ fontSize: '13px' }}>
              Enable the days your restaurant operates and set the hours for each day.
            </p>
          </div>
        );

      case 3:
        const selectedDays = days
          .filter((day) => formData.openingHours[day].enabled)
          .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
          .join(', ');

        return (
          <div className="flex flex-col gap-6">
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-gray-900 mb-4">Review Your Information</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-gray-600" style={{ fontSize: '13px' }}>Name</p>
                  <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                    {formData.name || 'Not set'}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-600" style={{ fontSize: '13px' }}>Slug</p>
                  <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                    {formData.slug || 'Auto-generated'}
                  </p>
                </div>

                {formData.description && (
                  <div>
                    <p className="text-gray-600" style={{ fontSize: '13px' }}>Description</p>
                    <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                      {formData.description.length > 100 
                        ? formData.description.substring(0, 100) + '...' 
                        : formData.description}
                    </p>
                  </div>
                )}

                {formData.phone && (
                  <div>
                    <p className="text-gray-600" style={{ fontSize: '13px' }}>Phone</p>
                    <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                      {formData.phone}
                    </p>
                  </div>
                )}

                {formData.address && (
                  <div>
                    <p className="text-gray-600" style={{ fontSize: '13px' }}>Address</p>
                    <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                      {formData.address}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-gray-600" style={{ fontSize: '13px' }}>Language</p>
                  <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                    {formData.language === 'en' && 'English'}
                    {formData.language === 'vi' && 'Tiếng Việt'}
                    {formData.language === 'th' && 'ไทย (Thai)'}
                    {formData.language === 'zh' && '中文 (Chinese)'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600" style={{ fontSize: '13px' }}>Theme</p>
                  <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                    {formData.theme === 'emerald' && 'Emerald (Green)'}
                    {formData.theme === 'ocean' && 'Ocean (Blue)'}
                    {formData.theme === 'sunset' && 'Sunset (Orange)'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600" style={{ fontSize: '13px' }}>Logo</p>
                  {formData.logoUrl ? (
                    <div className="flex items-center gap-2 mt-1">
                      <img 
                        src={formData.logoUrl} 
                        alt="Logo" 
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                        Logo uploaded
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                      Not set
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-gray-600" style={{ fontSize: '13px' }}>Operating Hours</p>
                  <div className="flex flex-col gap-1 mt-1">
                    {days.map((day) => {
                      const hours = formData.openingHours[day];
                      if (!hours.enabled) return null;
                      return (
                        <div key={day} className="flex items-center justify-between">
                          <span className="text-gray-900 capitalize" style={{ fontSize: '14px', fontWeight: 500 }}>
                            {day}
                          </span>
                          <span className="text-gray-600" style={{ fontSize: '14px' }}>
                            {hours.openTime} - {hours.closeTime}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {selectedDays && (
                    <p className="text-gray-500 mt-2" style={{ fontSize: '13px' }}>
                      Operating days: {selectedDays}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <Card className="w-full max-w-3xl p-8">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white" style={{ fontSize: '24px' }}>🍽️</span>
            </div>
            <div>
              <h2 className="text-gray-900">Welcome to TKQR</h2>
              <p className="text-gray-600" style={{ fontSize: '14px' }}>
                Let's set up your restaurant
              </p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep > step.number
                        ? 'bg-emerald-500'
                        : currentStep === step.number
                        ? 'bg-emerald-500'
                        : 'bg-gray-200'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <span
                        className={currentStep === step.number ? 'text-white' : 'text-gray-600'}
                        style={{ fontSize: '14px', fontWeight: 600 }}
                      >
                        {step.number}
                      </span>
                    )}
                  </div>
                  <span
                    className={currentStep >= step.number ? 'text-gray-900' : 'text-gray-600'}
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Content */}
          <div className="min-h-[400px]">{renderStepContent()}</div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <Button variant="secondary" onClick={handleBack}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="tertiary" onClick={() => onNavigate?.(ROUTES.dashboard)}>
                Skip for now
              </Button>
              <Button onClick={handleNext}>
                {currentStep === 3 ? 'Complete Setup' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default OnboardingWizard;

import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { QrCode, Check } from 'lucide-react';
import "../../styles/globals.css";

interface OnboardingWizardProps {
  onNavigate?: (screen: string) => void;
}

export function OnboardingWizard({ onNavigate }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    restaurantName: '',
    address: '',
    phone: '',
    timezone: 'UTC+7',
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
    openTime: '09:00',
    closeTime: '22:00',
  });

  const steps = [
    { number: 1, label: 'Restaurant Info' },
    { number: 2, label: 'Opening Hours' },
    { number: 3, label: 'Upload Images' },
    { number: 4, label: 'Review' },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onNavigate?.('dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col gap-4">
            <Input
              label="Restaurant Name"
              value={formData.restaurantName}
              onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
              placeholder="My Restaurant"
            />
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main Street, City"
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 8900"
            />
            <div className="flex flex-col gap-2">
              <label className="text-gray-900">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20"
              >
                <option>UTC+7 (Bangkok, Hanoi)</option>
                <option>UTC+8 (Singapore, Hong Kong)</option>
                <option>UTC-5 (New York)</option>
                <option>UTC+0 (London)</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-gray-900">Operating Days</label>
              <div className="grid grid-cols-2 gap-3">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <label key={day} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[day as keyof typeof formData] as boolean}
                      onChange={(e) => setFormData({ ...formData, [day]: e.target.checked })}
                      className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-gray-900 capitalize" style={{ fontSize: '14px' }}>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Opening Time"
                type="time"
                value={formData.openTime}
                onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
              />
              <Input
                label="Closing Time"
                type="time"
                value={formData.closeTime}
                onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-gray-900">Restaurant Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-emerald-500 transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                    Click to upload logo
                  </p>
                  <p className="text-gray-600" style={{ fontSize: '13px' }}>
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-900">Cover Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-emerald-500 transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                    Click to upload cover
                  </p>
                  <p className="text-gray-600" style={{ fontSize: '13px' }}>
                    PNG, JPG up to 5MB (recommended: 1200x400)
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col gap-6">
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-gray-900 mb-4">Review Your Information</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-gray-600" style={{ fontSize: '13px' }}>Restaurant Name</p>
                  <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                    {formData.restaurantName || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600" style={{ fontSize: '13px' }}>Address</p>
                  <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                    {formData.address || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600" style={{ fontSize: '13px' }}>Phone</p>
                  <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                    {formData.phone || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600" style={{ fontSize: '13px' }}>Operating Hours</p>
                  <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                    {formData.openTime} - {formData.closeTime}
                  </p>
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
              <QrCode className="w-7 h-7 text-white" />
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
              <Button variant="tertiary" onClick={() => onNavigate?.('dashboard')}>
                Skip for now
              </Button>
              <Button onClick={handleNext}>
                {currentStep === 4 ? 'Complete Setup' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default OnboardingWizard;

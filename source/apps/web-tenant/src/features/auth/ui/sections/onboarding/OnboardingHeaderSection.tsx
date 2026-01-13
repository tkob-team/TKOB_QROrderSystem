import React, { RefObject } from 'react';
import { Check } from 'lucide-react';
import type { OnboardingStep } from './types';

interface OnboardingHeaderSectionProps {
  headerRef: RefObject<HTMLDivElement>;
  steps: OnboardingStep[];
  currentStep: number;
}

export function OnboardingHeaderSection({ headerRef, steps, currentStep }: OnboardingHeaderSectionProps) {
  return (
    <>
      <div ref={headerRef} className="flex items-center gap-4 pb-6 border-b border-gray-100 opacity-0">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <span className="text-2xl">🍽️</span>
        </div>
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">Welcome to TKQR</h1>
          <p className="text-sm text-gray-600">Let&apos;s set up your restaurant</p>
        </div>
      </div>

      <div className="flex items-center justify-center py-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                      : isActive
                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                        : 'bg-gray-100'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isActive || isCompleted ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-24 h-1 mx-2 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}

export default OnboardingHeaderSection;

import React from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/Button';

interface OnboardingFooterActionsSectionProps {
  currentStep: number;
  canGoBack: boolean;
  isLoading: boolean;
  disableNext: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingFooterActionsSection({
  currentStep,
  canGoBack,
  isLoading,
  disableNext,
  onBack,
  onNext,
  onSkip,
}: OnboardingFooterActionsSectionProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
      <div>
        {canGoBack && (
          <Button variant="secondary" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onSkip}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Skip for now
        </button>
        <Button 
          onClick={onNext}
          disabled={isLoading || disableNext}
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
  );
}

export default OnboardingFooterActionsSection;

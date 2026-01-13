'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';

interface ChefRecommendationIndicatorProps {
  enabled: boolean;
}

export function ChefRecommendationIndicator({ enabled }: ChefRecommendationIndicatorProps) {
  const [showMobileHint, setShowMobileHint] = useState(false);

  if (!enabled) return null;

  const handleMobileHint = () => {
    setShowMobileHint(true);
    // Auto-dismiss after 1.5 seconds on mobile
    setTimeout(() => setShowMobileHint(false), 1500);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger
          asChild
          onClick={handleMobileHint}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400 rounded-full"
        >
          <button
            type="button"
            aria-label="Chef's recommendation"
            className="flex items-center justify-center p-1 rounded-full transition-all hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400"
          >
            {/* Soft background container */}
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm ring-1 ring-black/5 shadow-sm">
              <Star
                className="w-4 h-4 text-amber-400 flex-shrink-0"
                fill="currentColor"
                strokeWidth={0}
                aria-hidden="true"
              />
            </div>
          </button>
        </TooltipTrigger>

        {/* Desktop Tooltip */}
        <TooltipContent
          side="bottom"
          sideOffset={8}
          className="px-2 py-1 bg-gray-900 text-white rounded-md text-xs font-medium pointer-events-none"
        >
          Chef&apos;s recommendation
        </TooltipContent>
      </Tooltip>

      {/* Mobile Hint Popover */}
      {showMobileHint && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center pb-16 md:hidden">
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg pointer-events-auto flex items-center gap-2 mb-safe animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span>Chef&apos;s recommendation</span>
            <button
              onClick={() => setShowMobileHint(false)}
              className="ml-2 p-0 hover:bg-gray-800 rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}

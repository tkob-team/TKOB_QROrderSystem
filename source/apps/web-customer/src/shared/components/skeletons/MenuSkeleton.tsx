/**
 * MenuSkeleton Component
 * 
 * Skeleton loader for menu page
 * Based on UI/UX Pro Max guidelines:
 * - Use skeleton screens for loading states
 * - animate-pulse for shimmer effect
 * - Match actual content structure
 * - Respects prefers-reduced-motion
 */

import { colors } from '@/styles/design-tokens'

export function MenuSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Category skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="px-4 py-2 rounded-full animate-pulse"
            style={{
              backgroundColor: colors.neutral[200],
              minWidth: '80px',
              height: '36px',
            }}
          />
        ))}
      </div>

      {/* Menu items skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border p-4"
            style={{ borderColor: colors.border.light }}
          >
            <div className="flex gap-4">
              {/* Image skeleton */}
              <div
                className="flex-shrink-0 rounded-lg animate-pulse"
                style={{
                  backgroundColor: colors.neutral[200],
                  width: '112px',
                  height: '112px',
                }}
              />

              {/* Content skeleton */}
              <div className="flex-1 space-y-2">
                {/* Title */}
                <div
                  className="h-5 rounded animate-pulse"
                  style={{
                    backgroundColor: colors.neutral[200],
                    width: '70%',
                  }}
                />
                
                {/* Description */}
                <div
                  className="h-4 rounded animate-pulse"
                  style={{
                    backgroundColor: colors.neutral[200],
                    width: '90%',
                  }}
                />
                <div
                  className="h-4 rounded animate-pulse"
                  style={{
                    backgroundColor: colors.neutral[200],
                    width: '60%',
                  }}
                />

                {/* Price & button */}
                <div className="flex items-center justify-between mt-2">
                  <div
                    className="h-6 rounded animate-pulse"
                    style={{
                      backgroundColor: colors.neutral[200],
                      width: '60px',
                    }}
                  />
                  <div
                    className="w-9 h-9 rounded-full animate-pulse"
                    style={{
                      backgroundColor: colors.neutral[200],
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

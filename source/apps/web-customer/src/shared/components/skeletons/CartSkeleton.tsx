/**
 * CartSkeleton Component
 * 
 * Skeleton loader for cart page
 * Based on UI/UX Pro Max guidelines:
 * - Use skeleton screens for loading states
 * - animate-pulse for shimmer effect
 * - Match actual cart item structure
 * - Respects prefers-reduced-motion
 */

import { colors } from '@/styles/design-tokens'

export function CartSkeleton() {
  return (
    <div className="p-4 pb-24 space-y-3">
      {/* Cart items skeleton */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border p-4"
          style={{ borderColor: colors.border.light }}
        >
          <div className="flex gap-3">
            {/* Image skeleton */}
            <div
              className="flex-shrink-0 rounded-lg animate-pulse"
              style={{
                backgroundColor: colors.neutral[200],
                width: '80px',
                height: '80px',
              }}
            />

            {/* Content skeleton */}
            <div className="flex-1 space-y-2">
              {/* Title */}
              <div
                className="h-5 rounded animate-pulse"
                style={{
                  backgroundColor: colors.neutral[200],
                  width: '80%',
                }}
              />
              
              {/* Details */}
              <div
                className="h-4 rounded animate-pulse"
                style={{
                  backgroundColor: colors.neutral[200],
                  width: '60%',
                }}
              />

              {/* Price & quantity */}
              <div className="flex items-center justify-between mt-2">
                <div
                  className="h-5 rounded animate-pulse"
                  style={{
                    backgroundColor: colors.neutral[200],
                    width: '50px',
                  }}
                />
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded animate-pulse"
                    style={{
                      backgroundColor: colors.neutral[200],
                    }}
                  />
                  <div
                    className="w-8 h-6 rounded animate-pulse"
                    style={{
                      backgroundColor: colors.neutral[200],
                    }}
                  />
                  <div
                    className="w-8 h-8 rounded animate-pulse"
                    style={{
                      backgroundColor: colors.neutral[200],
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Summary skeleton */}
      <div
        className="bg-white rounded-xl border p-4 mt-4"
        style={{ borderColor: colors.border.light }}
      >
        <div className="space-y-2">
          <div
            className="h-5 rounded animate-pulse"
            style={{
              backgroundColor: colors.neutral[200],
              width: '40%',
            }}
          />
          <div
            className="h-4 rounded animate-pulse"
            style={{
              backgroundColor: colors.neutral[200],
              width: '100%',
            }}
          />
          <div
            className="h-4 rounded animate-pulse"
            style={{
              backgroundColor: colors.neutral[200],
              width: '100%',
            }}
          />
          <div
            className="h-4 rounded animate-pulse mt-2"
            style={{
              backgroundColor: colors.neutral[200],
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Button skeleton */}
      <div
        className="w-full h-12 rounded-full animate-pulse mt-4"
        style={{
          backgroundColor: colors.neutral[200],
        }}
      />

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

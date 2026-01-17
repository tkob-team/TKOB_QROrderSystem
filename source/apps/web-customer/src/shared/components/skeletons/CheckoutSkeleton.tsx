/**
 * CheckoutSkeleton Component
 * 
 * Skeleton loader for checkout page
 * Based on UI/UX Pro Max guidelines:
 * - Use skeleton screens for loading states
 * - animate-pulse for shimmer effect
 * - Match checkout form structure
 * - Respects prefers-reduced-motion
 */

import { colors } from '@/styles/design-tokens'

export function CheckoutSkeleton() {
  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Form fields skeleton */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div
              className="h-4 rounded animate-pulse"
              style={{
                backgroundColor: colors.neutral[200],
                width: '30%',
              }}
            />
            <div
              className="h-12 rounded-lg animate-pulse"
              style={{
                backgroundColor: colors.neutral[200],
              }}
            />
          </div>
        ))}
      </div>

      {/* Payment methods skeleton */}
      <div className="space-y-3 mt-6">
        <div
          className="h-5 rounded animate-pulse"
          style={{
            backgroundColor: colors.neutral[200],
            width: '40%',
          }}
        />
        
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border p-4"
            style={{ borderColor: colors.border.light }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full animate-pulse"
                style={{
                  backgroundColor: colors.neutral[200],
                }}
              />
              <div
                className="h-5 rounded animate-pulse flex-1"
                style={{
                  backgroundColor: colors.neutral[200],
                  width: '60%',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary skeleton */}
      <div
        className="bg-white rounded-xl border p-4 mt-6"
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div
                className="h-4 rounded animate-pulse"
                style={{
                  backgroundColor: colors.neutral[200],
                  width: '30%',
                }}
              />
              <div
                className="h-4 rounded animate-pulse"
                style={{
                  backgroundColor: colors.neutral[200],
                  width: '20%',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Button skeleton */}
      <div
        className="w-full h-12 rounded-full animate-pulse mt-6"
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

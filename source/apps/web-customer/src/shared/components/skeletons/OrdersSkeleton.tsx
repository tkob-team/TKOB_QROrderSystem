/**
 * OrdersSkeleton Component
 * 
 * Skeleton loader for orders page
 * Based on UI/UX Pro Max guidelines:
 * - Use skeleton screens for loading states
 * - animate-pulse for shimmer effect
 * - Match order card structure
 * - Respects prefers-reduced-motion
 */

import { colors } from '@/styles/design-tokens'

export function OrdersSkeleton() {
  return (
    <div className="p-4 pb-24 space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border p-4"
          style={{ borderColor: colors.border.light }}
        >
          <div className="space-y-3">
            {/* Order header */}
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
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
                    width: '30%',
                  }}
                />
              </div>
              <div
                className="px-3 py-1 rounded-full animate-pulse"
                style={{
                  backgroundColor: colors.neutral[200],
                  width: '80px',
                  height: '28px',
                }}
              />
            </div>

            {/* Order items */}
            <div className="space-y-2">
              {[1, 2].map((j) => (
                <div key={j} className="flex justify-between">
                  <div
                    className="h-4 rounded animate-pulse"
                    style={{
                      backgroundColor: colors.neutral[200],
                      width: '50%',
                    }}
                  />
                  <div
                    className="h-4 rounded animate-pulse"
                    style={{
                      backgroundColor: colors.neutral[200],
                      width: '15%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Order total */}
            <div className="border-t pt-3" style={{ borderColor: colors.border.light }}>
              <div className="flex justify-between">
                <div
                  className="h-5 rounded animate-pulse"
                  style={{
                    backgroundColor: colors.neutral[200],
                    width: '20%',
                  }}
                />
                <div
                  className="h-5 rounded animate-pulse"
                  style={{
                    backgroundColor: colors.neutral[200],
                    width: '25%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

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

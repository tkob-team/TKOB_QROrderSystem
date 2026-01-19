'use client'

import { AlertTriangle, Crown, X } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PlanLimitWarningProps {
  /** Current count of items */
  currentCount: number
  /** Maximum allowed by plan */
  maxAllowed: number
  /** Type of resource */
  resourceType: 'menu_items' | 'tables' | 'staff' | 'categories'
  /** Plan name */
  planName?: string
  /** Whether to show inline or as banner */
  variant?: 'inline' | 'banner' | 'modal'
  /** Dismiss callback */
  onDismiss?: () => void
}

const RESOURCE_LABELS: Record<string, string> = {
  menu_items: 'menu items',
  tables: 'tables',
  staff: 'staff members',
  categories: 'categories',
}

export function PlanLimitWarning({
  currentCount,
  maxAllowed,
  resourceType,
  planName = 'Free',
  variant = 'inline',
  onDismiss,
}: PlanLimitWarningProps) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  const resourceLabel = RESOURCE_LABELS[resourceType] || resourceType
  const isAtLimit = currentCount >= maxAllowed
  const isNearLimit = currentCount >= maxAllowed * 0.8 && !isAtLimit
  const remaining = maxAllowed - currentCount

  if (dismissed || (!isAtLimit && !isNearLimit)) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const handleUpgrade = () => {
    router.push('/settings/subscription#plans')
  }

  // Colors based on state
  const colors = isAtLimit
    ? {
        bg: 'var(--red-50)',
        border: 'var(--red-200)',
        text: 'var(--red-700)',
        icon: 'var(--red-500)',
      }
    : {
        bg: 'var(--amber-50)',
        border: 'var(--amber-200)',
        text: 'var(--amber-700)',
        icon: 'var(--amber-500)',
      }

  if (variant === 'inline') {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{
          backgroundColor: colors.bg,
          borderWidth: '1px',
          borderColor: colors.border,
        }}
      >
        <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: colors.icon }} />
        <span style={{ color: colors.text, fontSize: '13px' }}>
          {isAtLimit
            ? `You've reached the limit of ${maxAllowed} ${resourceLabel} on the ${planName} plan.`
            : `${remaining} ${resourceLabel} remaining on ${planName} plan.`}
        </span>
        <button
          onClick={handleUpgrade}
          className="ml-auto shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors hover:brightness-95"
          style={{
            backgroundColor: 'var(--orange-500)',
            color: 'white',
          }}
        >
          <Crown className="w-3 h-3" />
          Upgrade
        </button>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-4 px-4 py-3"
        style={{
          backgroundColor: colors.bg,
          borderBottomWidth: '1px',
          borderColor: colors.border,
        }}
      >
        <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: colors.icon }} />
        <span style={{ color: colors.text, fontSize: '14px' }}>
          {isAtLimit
            ? `Plan limit reached: ${currentCount}/${maxAllowed} ${resourceLabel}.`
            : `Approaching limit: ${currentCount}/${maxAllowed} ${resourceLabel}.`}
        </span>
        <button
          onClick={handleUpgrade}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:brightness-95"
          style={{
            backgroundColor: 'var(--orange-500)',
            color: 'white',
          }}
        >
          <Crown className="w-4 h-4" />
          Upgrade Plan
        </button>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md hover:bg-[var(--gray-200)] transition-colors ml-2"
          >
            <X className="w-4 h-4" style={{ color: colors.text }} />
          </button>
        )}
      </div>
    )
  }

  // Modal variant
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className="bg-white rounded-xl max-w-sm w-full p-6 text-center"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: colors.bg }}
        >
          <AlertTriangle className="w-8 h-8" style={{ color: colors.icon }} />
        </div>

        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--gray-900)' }}
        >
          {isAtLimit ? 'Plan Limit Reached' : 'Approaching Plan Limit'}
        </h3>

        <p style={{ color: 'var(--gray-600)', fontSize: '14px', marginBottom: '16px' }}>
          {isAtLimit
            ? `You've used all ${maxAllowed} ${resourceLabel} available on the ${planName} plan. Upgrade to add more.`
            : `You're using ${currentCount} of ${maxAllowed} ${resourceLabel}. Consider upgrading for more capacity.`}
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2.5 rounded-lg border transition-colors hover:bg-[var(--gray-50)]"
            style={{ borderColor: 'var(--gray-300)', color: 'var(--gray-700)' }}
          >
            {isAtLimit ? 'Close' : 'Maybe Later'}
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors hover:brightness-95"
            style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
          >
            <Crown className="w-4 h-4" />
            Upgrade
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to check plan limits
 */
export function usePlanLimits() {
  // This would typically fetch from an API or context
  // For now, return mock data
  return {
    menuItems: { current: 0, max: 50 },
    tables: { current: 0, max: 10 },
    staff: { current: 0, max: 3 },
    categories: { current: 0, max: 10 },
    planName: 'Free',
    isLoading: false,
  }
}

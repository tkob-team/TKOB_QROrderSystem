'use client'

import { ChefHat, CheckCircle, Clock, Timer } from 'lucide-react'

/**
 * FEAT-05: Item Processing Status Badge
 * Shows the current status of a specific order item
 * 
 * Statuses:
 * - Queued: Item is waiting to be prepared
 * - Preparing: Item is currently being made in the kitchen
 * - Ready: Item is ready to be served
 */

export type ItemStatus = 'queued' | 'preparing' | 'ready' | 'served'

interface ItemStatusBadgeProps {
  /** Whether the item has been prepared (preparedAt is set) */
  prepared?: boolean
  /** The timestamp when the item was prepared */
  preparedAt?: string | Date | null
  /** Override status if known from backend */
  status?: ItemStatus
  /** Show as compact badge or extended with text */
  variant?: 'badge' | 'extended'
  /** Size of the badge */
  size?: 'sm' | 'md'
}

interface StatusConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
}

const STATUS_CONFIGS: Record<ItemStatus, StatusConfig> = {
  queued: {
    label: 'Queued',
    color: 'var(--blue-600)',
    bgColor: 'var(--blue-50)',
    borderColor: 'var(--blue-200)',
    icon: Clock,
  },
  preparing: {
    label: 'Preparing',
    color: 'var(--orange-600)',
    bgColor: 'var(--orange-50)',
    borderColor: 'var(--orange-200)',
    icon: ChefHat,
  },
  ready: {
    label: 'Ready',
    color: 'var(--emerald-600)',
    bgColor: 'var(--emerald-50)',
    borderColor: 'var(--emerald-200)',
    icon: CheckCircle,
  },
  served: {
    label: 'Served',
    color: 'var(--gray-600)',
    bgColor: 'var(--gray-100)',
    borderColor: 'var(--gray-300)',
    icon: CheckCircle,
  },
}

export function ItemStatusBadge({
  prepared,
  preparedAt,
  status: overrideStatus,
  variant = 'badge',
  size = 'sm',
}: ItemStatusBadgeProps) {
  // Determine status based on prepared flag or override
  let status: ItemStatus = 'queued'
  
  if (overrideStatus) {
    status = overrideStatus
  } else if (prepared || preparedAt) {
    status = 'ready'
  }
  
  const config = STATUS_CONFIGS[status]
  const Icon = config.icon
  
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  const fontSize = size === 'sm' ? '11px' : '13px'
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1'
  
  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-medium ${padding}`}
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
          fontSize,
          borderWidth: '1px',
          borderColor: config.borderColor,
        }}
      >
        <Icon className={iconSize} style={{ color: config.color }} />
        {config.label}
      </span>
    )
  }
  
  // Extended variant - shows more info
  return (
    <div
      className="flex items-center gap-2 rounded-lg p-2"
      style={{
        backgroundColor: config.bgColor,
        borderWidth: '1px',
        borderColor: config.borderColor,
      }}
    >
      <Icon className="w-5 h-5" style={{ color: config.color }} />
      <div className="flex flex-col">
        <span style={{ color: config.color, fontSize: '14px', fontWeight: 500 }}>
          {config.label}
        </span>
        {preparedAt && (
          <span style={{ color: 'var(--gray-500)', fontSize: '12px' }}>
            Ready at {new Date(preparedAt).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Helper to get progress for a list of items
 */
export function getItemsProgress(items: Array<{ prepared?: boolean }>) {
  if (!items || items.length === 0) return { prepared: 0, total: 0, percent: 0 }
  
  const prepared = items.filter(item => item.prepared).length
  const total = items.length
  const percent = Math.round((prepared / total) * 100)
  
  return { prepared, total, percent }
}

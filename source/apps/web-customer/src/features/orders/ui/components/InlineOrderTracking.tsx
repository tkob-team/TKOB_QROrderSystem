/**
 * InlineOrderTracking - Compact tracking display for Orders page
 * Shows order status progress and item-level status in a collapsible card
 */

'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Clock, CheckCircle2, Circle, AlertCircle, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { useOrderTracking } from '../../hooks/useOrderTracking'
import { useOrderRealtimeUpdates } from '../../hooks/useOrderRealtimeUpdates'
import { useSession } from '@/features/tables/hooks'
import type { Order } from '../../model/types'
import type { OrderTrackingTimelineStep } from '../../data/tracking'

interface InlineOrderTrackingProps {
  order: Order
  defaultExpanded?: boolean
  onReview?: () => void
}

// Status to progress mapping (0-100)
const STATUS_PROGRESS: Record<string, number> = {
  PENDING: 0,
  RECEIVED: 25,
  PREPARING: 50,
  READY: 75,
  SERVED: 100,
  COMPLETED: 100,
  CANCELLED: 0,
}

// Status badge colors
const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'var(--gray-100)', text: 'var(--gray-600)', dot: 'var(--gray-400)' },
  RECEIVED: { bg: 'var(--blue-50)', text: 'var(--blue-700)', dot: 'var(--blue-500)' },
  PREPARING: { bg: 'var(--orange-50)', text: 'var(--orange-700)', dot: 'var(--orange-500)' },
  READY: { bg: 'var(--emerald-50)', text: 'var(--emerald-700)', dot: 'var(--emerald-500)' },
  SERVED: { bg: 'var(--emerald-100)', text: 'var(--emerald-700)', dot: 'var(--emerald-600)' },
  COMPLETED: { bg: 'var(--gray-100)', text: 'var(--gray-600)', dot: 'var(--gray-400)' },
  CANCELLED: { bg: 'var(--red-50)', text: 'var(--red-700)', dot: 'var(--red-500)' },
}

// Status display labels
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  RECEIVED: 'Accepted',
  PREPARING: 'Cooking',
  READY: 'Ready',
  SERVED: 'Served',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export function InlineOrderTracking({ order, defaultExpanded = false, onReview }: InlineOrderTrackingProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const { session } = useSession()
  
  // Fetch tracking data for this order
  const { tracking, isLoading } = useOrderTracking({
    orderId: order.id,
    enabled: !!order.id,
    polling: false, // WebSocket handles real-time
  })
  
  // Real-time updates via WebSocket
  const { isRealtimeConnected } = useOrderRealtimeUpdates({
    tenantId: session?.tenantId || '',
    tableId: session?.tableId || '',
    orderId: order.id,
    enabled: isExpanded && !!session?.tenantId && !!session?.tableId,
  })
  
  const currentStatus = tracking?.currentStatus || order.status || 'PENDING'
  const progress = STATUS_PROGRESS[currentStatus] ?? 0
  const statusColor = STATUS_COLORS[currentStatus] || STATUS_COLORS.PENDING
  const statusLabel = STATUS_LABELS[currentStatus] || currentStatus
  
  const isTerminal = ['SERVED', 'COMPLETED', 'CANCELLED'].includes(currentStatus)
  const isCancelled = currentStatus === 'CANCELLED'

  // Format time ago
  const timeAgo = formatRelativeTime(order.createdAt)
  
  return (
    <div 
      className="bg-white rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--gray-200)' }}
    >
      {/* Collapsed Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--gray-900)', fontWeight: 500 }}>
              Order #{order.id.slice(-8).toUpperCase()}
            </span>
            
            {/* Status Badge */}
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
              style={{ 
                backgroundColor: statusColor.bg, 
                color: statusColor.text 
              }}
            >
              {!isTerminal && (
                <span 
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: statusColor.dot }}
                />
              )}
              {statusLabel}
            </span>
            
            {/* Real-time indicator when expanded */}
            {isExpanded && !isTerminal && (
              isRealtimeConnected ? (
                <Wifi className="w-3.5 h-3.5" style={{ color: 'var(--emerald-500)' }} />
              ) : (
                <WifiOff className="w-3.5 h-3.5" style={{ color: 'var(--gray-400)' }} />
              )
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
              {timeAgo}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
            ) : (
              <ChevronDown className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        {!isCancelled && (
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--gray-200)' }}>
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${progress}%`,
                backgroundColor: isTerminal ? 'var(--emerald-500)' : 'var(--orange-500)',
              }}
            />
          </div>
        )}
        
        {/* Mini Status Steps (collapsed view) */}
        {!isExpanded && !isCancelled && (
          <div className="flex justify-between mt-2 px-1">
            {['RECEIVED', 'PREPARING', 'READY', 'SERVED'].map((step) => {
              const stepProgress = STATUS_PROGRESS[step]
              const isCompleted = progress >= stepProgress
              const isCurrent = currentStatus === step
              
              return (
                <div key={step} className="flex flex-col items-center">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: isCompleted 
                        ? 'var(--emerald-500)' 
                        : 'var(--gray-300)',
                      boxShadow: isCurrent ? '0 0 0 3px var(--emerald-100)' : 'none',
                    }}
                  />
                  <span 
                    className="text-[10px] mt-1"
                    style={{ 
                      color: isCompleted ? 'var(--gray-700)' : 'var(--gray-400)',
                      fontWeight: isCurrent ? 600 : 400,
                    }}
                  >
                    {STATUS_LABELS[step]}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        
        {/* Items count and total (collapsed view) */}
        {!isExpanded && (
          <div className="flex items-center justify-between mt-3">
            <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </span>
            <span style={{ color: 'var(--orange-500)', fontWeight: 500 }}>
              ${order.total.toFixed(2)}
            </span>
          </div>
        )}
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div 
          className="px-4 pb-4 space-y-4"
          style={{ 
            borderTop: '1px solid var(--gray-100)',
            animation: 'slideDown 0.2s ease-out',
          }}
        >
          {/* Timeline */}
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gray-400)' }} />
            </div>
          ) : tracking ? (
            <CompactTimeline 
              timeline={tracking.timeline} 
              currentStatus={currentStatus}
              estimatedTimeRemaining={tracking.estimatedTimeRemaining}
            />
          ) : (
            <div className="py-4 text-center" style={{ color: 'var(--gray-500)' }}>
              Unable to load tracking data
            </div>
          )}
          
          {/* Order Items */}
          <div>
            <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--gray-700)' }}>
              Items
            </h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div 
                  key={item.id || index}
                  className="flex items-center justify-between py-2 px-3 rounded-lg"
                  style={{ backgroundColor: 'var(--gray-50)' }}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium"
                      style={{ 
                        backgroundColor: 'var(--gray-200)',
                        color: 'var(--gray-600)',
                      }}
                    >
                      {item.quantity}
                    </span>
                    <span style={{ color: 'var(--gray-800)', fontSize: '14px' }}>
                      {item.name}
                    </span>
                    {item.size && (
                      <span 
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'var(--gray-200)', color: 'var(--gray-600)' }}
                      >
                        {item.size}
                      </span>
                    )}
                  </div>
                  <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Total */}
          <div 
            className="flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid var(--gray-200)' }}
          >
            <span style={{ color: 'var(--gray-700)', fontWeight: 500 }}>
              Order Total
            </span>
            <span style={{ color: 'var(--orange-500)', fontWeight: 600, fontSize: '18px' }}>
              ${order.total.toFixed(2)}
            </span>
          </div>
          
          {/* Leave Review Button - Show when order is SERVED or COMPLETED */}
          {(currentStatus === 'SERVED' || currentStatus === 'COMPLETED') && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReview?.()
              }}
              className="w-full mt-3 py-2.5 rounded-lg text-sm font-semibold transition-all hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: 'var(--orange-500)',
                color: 'white',
              }}
            >
              ⭐ Leave Review
            </button>
          )}
        </div>
      )}
      
      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

// Compact Timeline for expanded view
function CompactTimeline({ 
  timeline, 
  currentStatus,
  estimatedTimeRemaining,
}: { 
  timeline: OrderTrackingTimelineStep[]
  currentStatus: string
  estimatedTimeRemaining: number | null
}) {
  return (
    <div className="py-2">
      {/* Estimated Time */}
      {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
        <div 
          className="flex items-center gap-2 mb-3 p-2 rounded-lg"
          style={{ backgroundColor: 'var(--orange-50)' }}
        >
          <Clock className="w-4 h-4" style={{ color: 'var(--orange-600)' }} />
          <span style={{ color: 'var(--orange-700)', fontSize: '13px' }}>
            ~{estimatedTimeRemaining} min remaining
          </span>
        </div>
      )}
      
      {/* Timeline Steps */}
      <div className="flex items-center justify-between">
        {timeline.map((step, index) => {
          const isCompleted = step.completed
          const isCurrent = step.status === currentStatus && isCompleted
          const isLast = index === timeline.length - 1
          
          return (
            <div key={step.status} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: isCompleted ? 'var(--emerald-500)' : 'var(--gray-200)',
                    boxShadow: isCurrent ? '0 0 0 3px var(--emerald-100)' : 'none',
                    transition: 'all 0.3s ease-out',
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Circle className="w-3 h-3" style={{ color: 'var(--gray-400)' }} />
                  )}
                </div>
                <span 
                  className="text-[10px] mt-1 text-center max-w-[50px]"
                  style={{ 
                    color: isCompleted ? 'var(--gray-700)' : 'var(--gray-400)',
                    fontWeight: isCurrent ? 600 : 400,
                  }}
                >
                  {step.label}
                </span>
                {step.timestamp && (
                  <span 
                    className="text-[9px]"
                    style={{ color: 'var(--gray-400)' }}
                  >
                    {formatTime(step.timestamp)}
                  </span>
                )}
              </div>
              
              {/* Connecting Line */}
              {!isLast && (
                <div 
                  className="flex-1 h-0.5 mx-1"
                  style={{
                    backgroundColor: timeline[index + 1]?.completed 
                      ? 'var(--emerald-500)' 
                      : 'var(--gray-200)',
                    transition: 'background-color 0.3s ease-out',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Helper: Format relative time
function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const secs = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (secs < 60) return 'just now'
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
    return date.toLocaleDateString()
  } catch {
    return dateStr
  }
}

// Helper: Format timestamp to time only
function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

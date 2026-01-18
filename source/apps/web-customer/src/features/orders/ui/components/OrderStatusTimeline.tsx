import { CheckCircle } from 'lucide-react'
import { OrderStatus } from '@/types/order'

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus
}

// Status display labels for user-friendly UI
const STATUS_LABELS: Record<string, string> = {
  'PENDING': 'Pending',
  'RECEIVED': 'Accepted',
  'PREPARING': 'Preparing',
  'READY': 'Ready',
  'SERVED': 'Served',
  'COMPLETED': 'Completed',
}

// Normalize status to UPPERCASE to match backend
const normalizeStatus = (status: string): string => {
  // Map Title Case to UPPERCASE for backward compatibility
  const mappings: Record<string, string> = {
    'Pending': 'PENDING',
    'Accepted': 'RECEIVED',
    'Preparing': 'PREPARING',
    'Ready': 'READY',
    'Served': 'SERVED',
    'Completed': 'COMPLETED',
    'Cancelled': 'CANCELLED',
  }
  return mappings[status] || status.toUpperCase()
}

export function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  // Use UPPERCASE statuses to match backend API
  const steps = ['PENDING', 'RECEIVED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED']

  const normalizedStatus = normalizeStatus(currentStatus)

  const getCurrentStepIndex = () => {
    return steps.indexOf(normalizedStatus)
  }

  const currentIndex = getCurrentStepIndex()

  return (
    <div className="space-y-4">
      {steps.map((status, index) => {
        const isActive = index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <div key={status} className="flex items-center gap-3">
            {/* Step Indicator */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--emerald-500)' : 'var(--gray-200)',
                  boxShadow: isCurrent ? '0 0 0 4px var(--emerald-100)' : 'none',
                }}
              >
                {isActive && (
                  <CheckCircle className="w-5 h-5" style={{ color: 'white' }} />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className="w-0.5 h-8 my-1"
                  style={{
                    backgroundColor: isActive && index < currentIndex ? 'var(--emerald-500)' : 'var(--gray-200)',
                  }}
                />
              )}
            </div>

            {/* Step Info */}
            <div className="flex-1">
              <div
                style={{
                  color: isActive ? 'var(--gray-900)' : 'var(--gray-500)',
                  fontSize: '15px',
                }}
              >
                {STATUS_LABELS[status] || status}
              </div>
              {isCurrent && (
                <p style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                  In progress...
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

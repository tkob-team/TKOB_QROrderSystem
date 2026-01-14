import { CheckCircle } from 'lucide-react'
import { OrderStatus } from '@/types/order'

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus
}

export function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  const steps: OrderStatus[] = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Served', 'Completed']

  const getCurrentStepIndex = () => {
    return steps.indexOf(currentStatus)
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
                {status}
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

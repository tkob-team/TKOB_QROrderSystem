// Enhanced Order Tracking Timeline - uses real API data

import { CheckCircle, Clock, Circle } from 'lucide-react'
import type { OrderTrackingTimelineStep } from '../../data/tracking'

interface OrderTrackingTimelineProps {
  timeline: OrderTrackingTimelineStep[]
  currentStatus: string
  estimatedTimeRemaining?: number | null
  elapsedMinutes?: number
}

/**
 * Enhanced timeline component that displays real tracking data from API
 * Shows completed steps with timestamps and remaining steps as pending
 * Includes smooth animations when status changes
 */
export function OrderTrackingTimeline({
  timeline,
  currentStatus,
  estimatedTimeRemaining,
  elapsedMinutes,
}: OrderTrackingTimelineProps) {
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return null
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-1">
      {/* Estimated Time Header */}
      {estimatedTimeRemaining !== null && estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
        <div 
          className="flex items-center gap-2 mb-4 p-3 rounded-lg animate-pulse"
          style={{ backgroundColor: 'var(--orange-50)' }}
        >
          <Clock className="w-5 h-5" style={{ color: 'var(--orange-600)' }} />
          <span style={{ color: 'var(--orange-700)', fontSize: '14px' }}>
            Estimated time: <strong>{estimatedTimeRemaining} min</strong>
          </span>
        </div>
      )}

      {/* Timeline Steps */}
      {timeline.map((step, index) => {
        const isCompleted = step.completed
        const isCurrent = step.status === currentStatus && isCompleted
        const isLast = index === timeline.length - 1

        return (
          <div 
            key={step.status} 
            className="flex gap-3"
            style={{
              // Animate new completed steps
              animation: isCompleted ? 'fadeSlideIn 0.4s ease-out' : 'none',
            }}
          >
            {/* Line + Circle Column */}
            <div className="flex flex-col items-center">
              {/* Circle Indicator */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: isCompleted ? 'var(--emerald-500)' : 'var(--gray-200)',
                  boxShadow: isCurrent ? '0 0 0 4px var(--emerald-100)' : 'none',
                  transition: 'all 0.4s ease-out',
                  transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {isCompleted ? (
                  <CheckCircle 
                    className="w-5 h-5" 
                    style={{ 
                      color: 'white',
                      animation: isCurrent ? 'checkPop 0.3s ease-out' : 'none',
                    }} 
                  />
                ) : (
                  <Circle className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                )}
              </div>
              {/* Connecting Line */}
              {!isLast && (
                <div
                  className="w-0.5 flex-1 min-h-[24px]"
                  style={{
                    backgroundColor: isCompleted && timeline[index + 1]?.completed 
                      ? 'var(--emerald-500)' 
                      : 'var(--gray-200)',
                    transition: 'background-color 0.4s ease-out',
                  }}
                />
              )}
            </div>

            {/* Step Content */}
            <div className={`flex-1 pb-4 ${isLast ? 'pb-0' : ''}`}>
              <div className="flex items-center justify-between">
                <span
                  style={{
                    color: isCompleted ? 'var(--gray-900)' : 'var(--gray-400)',
                    fontSize: '15px',
                    fontWeight: isCurrent ? 600 : 400,
                    transition: 'all 0.3s ease-out',
                  }}
                >
                  {step.label}
                </span>
                {step.timestamp && (
                  <span 
                    style={{ 
                      color: 'var(--gray-500)', 
                      fontSize: '12px',
                      opacity: isCompleted ? 1 : 0,
                      transition: 'opacity 0.3s ease-out',
                    }}
                  >
                    {formatTimestamp(step.timestamp)}
                  </span>
                )}
              </div>
              {step.description && isCompleted && (
                <p 
                  style={{ 
                    color: 'var(--gray-500)', 
                    fontSize: '13px', 
                    marginTop: '2px',
                    opacity: 1,
                    transition: 'opacity 0.3s ease-out',
                  }}
                >
                  {step.description}
                </p>
              )}
              {isCurrent && (
                <p 
                  className="flex items-center gap-1"
                  style={{ 
                    color: 'var(--emerald-600)', 
                    fontSize: '13px', 
                    marginTop: '2px',
                  }}
                >
                  <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--emerald-500)' }} />
                  In progress...
                </p>
              )}
            </div>
          </div>
        )
      })}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes checkPop {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>

      {/* Elapsed Time Footer */}
      {elapsedMinutes !== undefined && elapsedMinutes > 0 && (
        <div 
          className="mt-4 p-3 rounded-lg"
          style={{ backgroundColor: 'var(--gray-50)' }}
        >
          <p style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
            Order placed {elapsedMinutes} {elapsedMinutes === 1 ? 'minute' : 'minutes'} ago
          </p>
        </div>
      )}
    </div>
  )
}

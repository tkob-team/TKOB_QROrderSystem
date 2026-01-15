// useOrderTracking - hook for fetching and polling order tracking data

'use client'

import { useQuery } from '@tanstack/react-query'
import { orderTrackingApi, type OrderTrackingResponse } from '../data/tracking'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'

interface UseOrderTrackingOptions {
  orderId: string
  /**
   * Enable polling for real-time updates
   * @default true
   */
  polling?: boolean
  /**
   * Polling interval in milliseconds
   * @default 10000 (10 seconds)
   */
  pollingInterval?: number
  /**
   * Disable fetching
   */
  enabled?: boolean
}

interface UseOrderTrackingResult {
  tracking: OrderTrackingResponse | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook for fetching order tracking data with optional polling
 * 
 * @example
 * ```tsx
 * const { tracking, isLoading } = useOrderTracking({ orderId: '123' })
 * 
 * // With custom polling interval
 * const { tracking } = useOrderTracking({ 
 *   orderId: '123', 
 *   pollingInterval: 5000 
 * })
 * ```
 */
export function useOrderTracking({
  orderId,
  polling = true,
  pollingInterval = 10000,
  enabled = true,
}: UseOrderTrackingOptions): UseOrderTrackingResult {
  // Stop polling for terminal statuses
  const shouldPoll = (data: OrderTrackingResponse | undefined) => {
    if (!polling || !data) return false
    // Don't poll for completed/cancelled orders
    const terminalStatuses = ['COMPLETED', 'SERVED', 'CANCELLED']
    return !terminalStatuses.includes(data.currentStatus)
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orderTracking', orderId],
    queryFn: async () => {
      const startTime = Date.now()
      
      log('data', 'Fetching order tracking', {
        orderId: maskId(orderId),
      }, { feature: 'tracking', dedupe: true, dedupeTtlMs: 5000 })
      
      try {
        const tracking = await orderTrackingApi.getOrderTracking(orderId)
        
        log('data', 'Order tracking fetched', {
          orderId: maskId(orderId),
          status: tracking.currentStatus,
          timelineSteps: tracking.timeline.length,
          durationMs: Date.now() - startTime,
        }, { feature: 'tracking' })
        
        return tracking
      } catch (err) {
        logError('data', 'Failed to fetch order tracking', err, { feature: 'tracking' })
        throw err
      }
    },
    enabled: enabled && !!orderId,
    refetchInterval: (query) => {
      return shouldPoll(query.state.data) ? pollingInterval : false
    },
    staleTime: 5000, // Consider data stale after 5 seconds
    retry: 2,
  })

  return {
    tracking: data ?? null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}

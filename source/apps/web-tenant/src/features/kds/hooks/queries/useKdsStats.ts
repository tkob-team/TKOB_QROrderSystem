/**
 * useKdsStats - Internal Query Hook
 * Fetches KDS statistics from adapter (mock or API)
 */

import { useEffect, useState, useCallback } from 'react'
import { kdsAdapter, type KdsStats } from '../../data'
import { logger } from '@/shared/utils/logger'

export function useKdsStats() {
  const [stats, setStats] = useState<KdsStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    logger.info('[kds] STATS_QUERY_ATTEMPT')

    setIsLoading(true)
    setError(null)
    try {
      const data = await kdsAdapter.getStats()
      setStats(data)

      logger.info('[kds] STATS_QUERY_SUCCESS', {
        totalActive: data.totalActive,
        todayCompleted: data.todayCompleted,
      })
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error('Unknown error')
      setError(normalized)

      logger.error('[kds] STATS_QUERY_ERROR', {
        message: normalized.message,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, isLoading, error, refetch: fetchStats }
}

/**
 * useKdsAutoRefresh - Auto-refresh fallback when WebSocket fails
 * 
 * Strategy:
 * - Primary: WebSocket real-time (no polling)
 * - Fallback: Polling when disconnected (15s interval)
 * - Manual: User can toggle auto-refresh
 */

'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/shared/utils/logger';

interface UseKdsAutoRefreshOptions {
  /**
   * Enable auto-refresh polling
   */
  enabled?: boolean;
  /**
   * Polling interval in milliseconds (default: 15000 = 15s)
   */
  intervalMs?: number;
  /**
   * Whether WebSocket is currently connected
   */
  wsConnected?: boolean;
}

export function useKdsAutoRefresh({
  enabled = true,
  intervalMs = 15000,
  wsConnected = true,
}: UseKdsAutoRefreshOptions) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Don't poll if WebSocket is connected
    if (wsConnected && enabled) {
      logger.info('[kds-refresh] Using WebSocket (no polling)', { wsConnected });
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start polling if WebSocket is down
    if (!wsConnected && enabled) {
      logger.warn('[kds-refresh] WebSocket disconnected - starting polling fallback', {
        intervalMs,
      });

      intervalRef.current = setInterval(() => {
        logger.debug('[kds-refresh] Polling refetch', { intervalMs });
        queryClient.invalidateQueries({ queryKey: ['kds', 'orders'] });
        queryClient.invalidateQueries({ queryKey: ['kds', 'stats'] });
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, wsConnected, intervalMs, queryClient]);

  return {
    isPolling: !wsConnected && enabled,
  };
}

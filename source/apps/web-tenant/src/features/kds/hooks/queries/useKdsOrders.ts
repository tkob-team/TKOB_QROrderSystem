/**
 * useKdsOrders - Internal Query Hook
 * Fetches KDS orders from adapter (mock or API) with React Query
 * 
 * Note: Real-time updates are handled by useKdsWebSocket hook
 * which invalidates this query on new order/status change events.
 */

import { useQuery } from '@tanstack/react-query';
import { kdsAdapter } from '../../data/factory';
import { logger } from '@/shared/utils/logger';

export function useKdsOrders() {
  return useQuery({
    queryKey: ['kds', 'orders'],
    queryFn: async () => {
      logger.info('[kds] ORDERS_QUERY_ATTEMPT');
      
      const data = await kdsAdapter.getKdsOrders();
      
      logger.info('[kds] ORDERS_QUERY_SUCCESS', {
        count: data.length,
        statusBreakdown: {
          pending: data.filter(o => o.status === 'pending').length,
          preparing: data.filter(o => o.status === 'preparing').length,
          ready: data.filter(o => o.status === 'ready').length,
          served: data.filter(o => o.status === 'served').length,
        },
        sampleIds: data.slice(0, 3).map(o => o.id),
      });
      
      return data;
    },
    // No polling - WebSocket handles real-time updates via useKdsWebSocket
    staleTime: 30000, // Consider data stale after 30s
    refetchOnWindowFocus: true,
  });
}


/**
 * Internal Query Hook - Service Orders
 * DO NOT export from feature root
 * 
 * Note: Real-time updates are handled by useWaiterWebSocket hook
 * which invalidates this query on new order/status change events.
 */

import { useQuery } from '@tanstack/react-query';
import { waiterAdapter } from '../../data/factory';
import { logger } from '@/shared/utils/logger';

export function useServiceOrders() {
  return useQuery({
    queryKey: ['waiter', 'service-orders'],
    queryFn: async () => {
      logger.info('[waiter] SERVICE_ORDERS_QUERY_ATTEMPT');

      const data = await waiterAdapter.getServiceOrders();
      
      // Log success with safe counts and status breakdown
      logger.info('[waiter] SERVICE_ORDERS_QUERY_SUCCESS', {
        count: data.length,
        statusBreakdown: {
          placed: data.filter(o => o.status === 'placed').length,
          confirmed: data.filter(o => o.status === 'confirmed').length,
          preparing: data.filter(o => o.status === 'preparing').length,
          ready: data.filter(o => o.status === 'ready').length,
          served: data.filter(o => o.status === 'served').length,
          completed: data.filter(o => o.status === 'completed').length,
        },
        sampleIds: data.slice(0, 3).map(o => o.orderNumber),
      });
      
      return data;
    },
    // No polling - WebSocket handles real-time updates via useWaiterWebSocket
    staleTime: 30000, // Consider data stale after 30s
    refetchOnWindowFocus: true,
  });
}


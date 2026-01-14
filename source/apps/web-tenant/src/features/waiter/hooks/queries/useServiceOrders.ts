/**
 * Internal Query Hook - Service Orders
 * DO NOT export from feature root
 */

import { useState, useEffect, useRef } from 'react';
import { waiterAdapter } from '../../data/factory';
import { logger } from '@/shared/utils/logger';
import type { ServiceOrder } from '../../model/types';

interface UseServiceOrdersResult {
  orders: ServiceOrder[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useServiceOrders(): UseServiceOrdersResult {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const fetchCountRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    const currentFetch = ++fetchCountRef.current;

    async function fetchOrders() {
      logger.info('[waiter] SERVICE_ORDERS_QUERY_ATTEMPT', { fetchId: currentFetch });

      try {
        setIsLoading(true);
        setError(null);
        const data = await waiterAdapter.getServiceOrders();
        
        if (mounted) {
          setOrders(data);
          
          // Log success with safe counts and status breakdown
          logger.info('[waiter] SERVICE_ORDERS_QUERY_SUCCESS', {
            fetchId: currentFetch,
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
        }
      } catch (err) {
        const normalized = err instanceof Error ? err : new Error('Failed to fetch orders');
        
        if (mounted) {
          setError(normalized);
          
          logger.error('[waiter] SERVICE_ORDERS_QUERY_ERROR', {
            fetchId: currentFetch,
            message: normalized.message,
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      mounted = false;
    };
  }, [refreshTrigger]);

  const refetch = () => setRefreshTrigger(prev => prev + 1);

  return { orders, isLoading, error, refetch };
}

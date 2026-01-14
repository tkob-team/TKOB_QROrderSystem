/**
 * useKdsOrders - Internal Query Hook
 * Fetches KDS orders from adapter (mock or API)
 */

import { useEffect, useRef, useState } from 'react';
import { kdsAdapter } from '../../data/factory';
import { logger } from '@/shared/utils/logger';
import type { KdsOrder } from '../../model/types';

export function useKdsOrders() {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchCountRef = useRef(0);

  useEffect(() => {
    const fetchId = ++fetchCountRef.current;

    const fetchOrders = async () => {
      logger.info('[kds] ORDERS_QUERY_ATTEMPT', { fetchId });

      setIsLoading(true);
      setError(null);
      try {
        const data = await kdsAdapter.getKdsOrders();
        setOrders(data);

        logger.info('[kds] ORDERS_QUERY_SUCCESS', {
          fetchId,
          count: data.length,
          statusBreakdown: {
            pending: data.filter(o => o.status === 'pending').length,
            preparing: data.filter(o => o.status === 'preparing').length,
            ready: data.filter(o => o.status === 'ready').length,
            served: data.filter(o => o.status === 'served').length,
          },
          sampleIds: data.slice(0, 3).map(o => o.id),
        });
      } catch (err) {
        const normalized = err instanceof Error ? err : new Error('Unknown error');
        setError(normalized);

        logger.error('[kds] ORDERS_QUERY_ERROR', {
          fetchId,
          message: normalized.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { orders, isLoading, error, setOrders };
}

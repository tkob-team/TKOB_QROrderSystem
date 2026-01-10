/**
 * Internal Query Hook - Service Orders
 * DO NOT export from feature root
 */

import { useState, useEffect } from 'react';
import { waiterAdapter } from '../../data/factory';
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

  useEffect(() => {
    let mounted = true;

    async function fetchOrders() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await waiterAdapter.getServiceOrders();
        if (mounted) {
          setOrders(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
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

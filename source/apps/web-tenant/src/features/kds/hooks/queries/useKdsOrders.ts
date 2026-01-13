/**
 * useKdsOrders - Internal Query Hook
 * Fetches KDS orders from adapter (mock or API)
 */

import { useEffect, useState } from 'react';
import { kdsAdapter } from '../../data/factory';
import type { KdsOrder } from '../../model/types';

export function useKdsOrders() {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await kdsAdapter.getKdsOrders();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { orders, isLoading, error, setOrders };
}

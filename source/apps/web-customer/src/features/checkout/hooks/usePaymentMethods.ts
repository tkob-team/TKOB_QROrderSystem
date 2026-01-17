/**
 * Hook to fetch available payment methods for current tenant
 * Checks which payment methods are enabled (SePay, Cash, etc.)
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { useSession } from '@/features/tables/hooks/useSession';
import { log, logError } from '@/shared/logging/logger';

export type PaymentMethod = 'BILL_TO_TABLE' | 'SEPAY_QR';

interface PaymentMethodsResponse {
  methods: PaymentMethod[];
  sepayEnabled: boolean;
}

export function usePaymentMethods() {
  const { session } = useSession();

  return useQuery<PaymentMethodsResponse>({
    queryKey: ['payment-methods', session?.tenantId],
    queryFn: async () => {
      if (!session?.tenantId) {
        throw new Error('No active session');
      }

      log('data', 'FETCH_PAYMENT_METHODS', {
        tenantId: session.tenantId,
      });

      try {
        const response = await apiClient.get<{data: PaymentMethodsResponse}>(
          `/admin/payment-config/public/payment-methods`,
          {
            params: { tenantId: session.tenantId },
          }
        );

        // Unwrap response (backend returns {success, data, timestamp, ...})
        const data = (response.data as any).data || response.data;

        log('data', 'PAYMENT_METHODS_RECEIVED', {
          methods: data.methods,
          sepayEnabled: data.sepayEnabled,
        });

        return data;
      } catch (error) {
        logError('data', 'FETCH_PAYMENT_METHODS_ERROR', error);
        throw error;
      }
    },
    enabled: !!session?.tenantId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });
}

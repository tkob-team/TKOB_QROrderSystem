/**
 * Hook for cancelling bill request
 * Customer can cancel bill request to order more items
 * This unlocks the session - customer can place more orders
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@/shared/logging/logger';
import { orderApi } from '../data';

interface CancelBillResponse {
  success: boolean;
  message: string;
  sessionId: string;
}

export function useCancelBillRequest() {
  const queryClient = useQueryClient();
  
  return useMutation<CancelBillResponse, Error, void>({
    mutationFn: async () => {
      log('data', '[useCancelBillRequest] Cancelling bill request', {});

      const data = await orderApi.cancelSessionBillRequest();
      
      log('data', '[useCancelBillRequest] Bill request cancelled', {});

      return data;
    },
    onSuccess: () => {
      // Invalidate session query to update billRequestedAt (should be null now)
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['table-session'] });
    },
    onError: (error) => {
      log('data', '[useCancelBillRequest] Failed to cancel bill request', { error: error.message });
    },
  });
}

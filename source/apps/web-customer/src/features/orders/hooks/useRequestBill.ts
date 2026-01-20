/**
 * Hook for requesting bill/check for entire session
 * Customer requests staff to bring physical bill for all orders in session
 * This locks the session - no more orders can be placed until cancelled
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@/shared/logging/logger';
import { orderApi, RequestBillResponse } from '../data';

export function useRequestBill() {
  const queryClient = useQueryClient();
  
  return useMutation<RequestBillResponse, Error, void>({
    mutationFn: async () => {
      log('data', '[useRequestBill] Requesting bill for session', {});

      const data = await orderApi.requestSessionBill();
      
      log('data', '[useRequestBill] Bill requested successfully', {
        tableNumber: data.tableNumber,
        totalAmount: data.totalAmount,
        orderCount: data.orderCount,
      });

      return data;
    },
    onSuccess: () => {
      // Invalidate session query to update billRequestedAt
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['table-session'] });
    },
    onError: (error) => {
      log('data', '[useRequestBill] Failed to request bill', { error: error.message });
    },
  });
}

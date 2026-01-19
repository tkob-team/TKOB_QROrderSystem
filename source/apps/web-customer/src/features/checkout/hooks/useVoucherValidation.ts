/**
 * Hook to validate voucher/promo codes
 */

import { useMutation } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { log, logError } from '@/shared/logging/logger';

interface ValidateVoucherRequest {
  code: string;
  orderSubtotal: number;
}

interface ValidateVoucherResponse {
  valid: boolean;
  error?: string;
  promotion?: {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minOrderValue?: number;
    maxDiscount?: number;
  };
  discountAmount?: number;
}

export function useVoucherValidation() {
  return useMutation<ValidateVoucherResponse, Error, ValidateVoucherRequest>({
    mutationFn: async ({ code, orderSubtotal }) => {
      log('data', 'VALIDATE_VOUCHER', { code, orderSubtotal });

      try {
        const response = await apiClient.post<{ data: ValidateVoucherResponse }>(
          `/checkout/validate-promo`,
          { code, orderSubtotal }
        );

        const data = (response.data as any).data || response.data;

        log('data', 'VOUCHER_VALIDATION_RESULT', {
          valid: data.valid,
          discountAmount: data.discountAmount,
        });

        return data;
      } catch (error: any) {
        logError('data', 'VALIDATE_VOUCHER_ERROR', error);
        
        // Extract error message from API response
        const errorMessage = error.response?.data?.message || 'Failed to validate voucher';
        throw new Error(errorMessage);
      }
    },
  });
}

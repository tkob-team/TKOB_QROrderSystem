// Real payment adapter - calls actual payment API

import { ApiResponse } from '@/types';
import apiClient from '@/api/client';
import type { IPaymentAdapter } from '../adapter.interface';

/**
 * Feature-owned real payment adapter
 * Calls actual backend payment endpoints
 */
export class PaymentAdapter implements IPaymentAdapter {
  async processCardPayment(data: {
    orderId: string;
    amount: number;
  }): Promise<ApiResponse<{
    transactionId: string;
    status: 'completed' | 'failed';
  }>> {
    const response = await apiClient.post('/api/payment/process', data);
    return response.data;
  }

  async verifyPayment(transactionId: string): Promise<ApiResponse<{
    status: 'completed' | 'pending' | 'failed';
  }>> {
    const response = await apiClient.get(`/api/payment/verify/${transactionId}`);
    return response.data;
  }
}

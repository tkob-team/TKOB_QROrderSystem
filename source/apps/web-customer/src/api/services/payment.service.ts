// Payment service - handles payment processing

import apiClient from '@/api/client';
import { ApiResponse } from '@/types';

export const PaymentService = {
  /**
   * Process card payment
   */
  async processCardPayment(data: {
    orderId: string;
    amount: number;
  }): Promise<ApiResponse<{
    transactionId: string;
    status: 'completed' | 'failed';
  }>> {
    const response = await apiClient.post('/api/payment/process', data);
    return response.data;
  },
  
  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<ApiResponse<{
    status: 'completed' | 'pending' | 'failed';
  }>> {
    const response = await apiClient.get(`/api/payment/verify/${transactionId}`);
    return response.data;
  },
};

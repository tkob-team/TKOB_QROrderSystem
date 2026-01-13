// Payment feature adapter interface

import { ApiResponse } from '@/types';

/**
 * Payment adapter interface
 * Defines the contract for payment data access implementations
 */
export interface IPaymentAdapter {
  processCardPayment(data: {
    orderId: string;
    amount: number;
    sessionId?: string;
  }): Promise<ApiResponse<{
    transactionId: string;
    status: 'completed' | 'failed';
  }>>;

  verifyPayment(transactionId: string): Promise<ApiResponse<{
    status: 'completed' | 'pending' | 'failed';
  }>>;
}

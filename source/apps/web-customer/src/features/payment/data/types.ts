// Payment data layer types

import { ApiResponse } from '@/types';

export interface IPaymentStrategy {
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

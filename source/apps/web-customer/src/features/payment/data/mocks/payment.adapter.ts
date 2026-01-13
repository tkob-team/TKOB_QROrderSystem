// Mock payment adapter - simulates payment processing

import { ApiResponse } from '@/types';
import { paymentHandlers } from '@/api/mocks/handlers/payment.handler';
import type { IPaymentAdapter } from '../adapter.interface';

/**
 * Feature-owned mock payment adapter
 * Uses existing mock handlers to simulate payment operations
 */
export class MockPaymentAdapter implements IPaymentAdapter {
  async processCardPayment(data: {
    orderId: string;
    amount: number;
    sessionId?: string;
  }): Promise<ApiResponse<{
    transactionId: string;
    status: 'completed' | 'failed';
  }>> {
    return paymentHandlers.processCardPayment(data);
  }

  async verifyPayment(transactionId: string): Promise<ApiResponse<{
    status: 'completed' | 'pending' | 'failed';
  }>> {
    return paymentHandlers.verifyPayment(transactionId);
  }
}

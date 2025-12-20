// Mock handlers for payment-related API calls

import { ApiResponse } from '@/types';
import { delay, createSuccessResponse, createErrorResponse } from '../utils';

export const paymentHandlers = {
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
    // Simulate payment processing time
    await delay(2000);
    
    // Simulate random failure (10% chance)
    if (Math.random() < 0.1) {
      return createErrorResponse('Payment failed. Please try again.');
    }
    
    return createSuccessResponse({
      transactionId: `txn-${Date.now()}`,
      status: 'completed',
    }, 'Payment processed successfully');
  },
  
  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<ApiResponse<{
    status: 'completed' | 'pending' | 'failed';
  }>> {
    await delay(300);
    
    return createSuccessResponse({
      status: 'completed',
    });
  },
};

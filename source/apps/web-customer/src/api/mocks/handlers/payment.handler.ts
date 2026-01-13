// Mock handlers for payment-related API calls

import { ApiResponse } from '@/types';
import { delay, createSuccessResponse, createErrorResponse } from '../utils';
import { updateOrderPaymentStatus as updatePaymentInStorage } from '@/features/orders/data/mock/orderStorage';
import { debugOrder } from '@/features/orders/dev/orderDebug';

export const paymentHandlers = {
  /**
   * Update order payment status after successful payment
   * 
   * Uses canonical orderStorage module to ensure deterministic persistence
   */
  async updateOrderPaymentStatus(
    orderId: string, 
    sessionId?: string
  ): Promise<ApiResponse<void>> {
    await delay(100);
    
    if (!sessionId) {
      debugOrder('payment-update-error', {
        orderId,
        error: 'No sessionId provided',
        callsite: 'payment.handler.updateOrderPaymentStatus',
      });
      
      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.warn('[Payment Handler] No sessionId provided for payment update');
      }
      return createErrorResponse('Session ID required for payment tracking');
    }
    
    try {
      // Use canonical storage module to update payment status
      const updated = updatePaymentInStorage(sessionId, orderId, 'PAID');
      
      if (!updated) {
        debugOrder('payment-update-failed', {
          orderId,
          sessionId,
          reason: 'Order not found',
          storageKey: `tkob_mock_orders:${sessionId}`,
          callsite: 'payment.handler.updateOrderPaymentStatus',
        });
        
        return createErrorResponse('Order not found');
      }
      
      // Log successful payment status update
      debugOrder('payment-persisted', {
        orderId,
        sessionId,
        paymentStatus: 'Paid',
        storageKey: `tkob_mock_orders:${sessionId}`,
        callsite: 'payment.handler.updateOrderPaymentStatus',
      });
      
      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.log('[Payment Handler] Updated order payment status via canonical storage:', orderId, '-> Paid');
      }
      
      return createSuccessResponse(undefined, 'Payment status updated');
    } catch (err) {
      debugOrder('payment-update-error', {
        orderId,
        sessionId,
        error: String(err),
        callsite: 'payment.handler.updateOrderPaymentStatus',
      });
      
      console.error('[Payment Handler] Failed to update payment status:', err);
      return createErrorResponse('Failed to update payment status');
    }
  },

  /**
   * Process card payment
   */
  async processCardPayment(data: {
    orderId: string;
    amount: number;
    sessionId?: string;
  }): Promise<ApiResponse<{
    transactionId: string;
    status: 'completed' | 'failed';
  }>> {
    // Log payment start
    debugOrder('payment-start', {
      orderId: data.orderId,
      sessionId: data.sessionId,
      amount: data.amount,
      callsite: 'payment.handler.processCardPayment',
    });

    // Simulate payment processing time
    await delay(2000);
    
    // Simulate random failure (10% chance)
    if (Math.random() < 0.1) {
      debugOrder('payment-failed', {
        orderId: data.orderId,
        sessionId: data.sessionId,
        amount: data.amount,
        reason: 'Simulated payment failure',
        callsite: 'payment.handler.processCardPayment',
      });
      
      return createErrorResponse('Payment failed. Please try again.');
    }
    
    // Update order payment status after successful payment
    await this.updateOrderPaymentStatus(data.orderId, data.sessionId);
    
    const transactionId = `txn-${Date.now()}`;
    debugOrder('payment-success', {
      orderId: data.orderId,
      sessionId: data.sessionId,
      amount: data.amount,
      transactionId,
      callsite: 'payment.handler.processCardPayment',
    });

    return createSuccessResponse({
      transactionId,
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

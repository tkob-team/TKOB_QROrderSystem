// Checkout API Service - calls backend checkout and payment endpoints

import apiClient from '@/api/client';
import { log, logError } from '@/shared/logging/logger';
import { maskId } from '@/shared/logging/helpers';
import type { 
  CheckoutRequest, 
  CheckoutResponse,
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentStatusResponse,
} from './types';

/**
 * Checkout API Service
 * 
 * Handles order creation and payment flow
 * All operations use session cookie for authentication
 */
export class CheckoutApiService {
  private static instance: CheckoutApiService;

  static getInstance(): CheckoutApiService {
    if (!this.instance) {
      this.instance = new CheckoutApiService();
    }
    return this.instance;
  }

  /**
   * Create order from current cart
   * Cart is automatically fetched from session on backend
   */
  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    log('data', 'Creating order via checkout', { 
      paymentMethod: request.paymentMethod,
      hasTip: !!request.tipPercent,
    }, { feature: 'checkout' });

    const response = await apiClient.post<{ success: boolean; data: CheckoutResponse }>('/checkout', request);
    
    log('data', 'Order created', { 
      orderId: maskId(response.data.data.id),
      orderNumber: response.data.data.orderNumber,
      total: response.data.data.total,
    }, { feature: 'checkout' });
    
    return response.data.data;
  }

  /**
   * Create payment intent for SePay QR payment
   * Call this after checkout for SEPAY_QR payment method
   */
  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    log('data', 'Creating payment intent', { 
      orderId: maskId(request.orderId),
    }, { feature: 'payment' });

    const response = await apiClient.post<{ success: boolean; data: PaymentIntentResponse }>('/payment/intent', request);
    
    log('data', 'Payment intent created', { 
      paymentId: maskId(response.data.data.paymentId),
      amount: response.data.data.amount,
      expiresAt: response.data.data.expiresAt,
    }, { feature: 'payment' });
    
    return response.data.data;
  }

  /**
   * Get payment status
   * Use this to poll payment status until completed or expired
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    const response = await apiClient.get<{ success: boolean; data: PaymentStatusResponse }>(`/payment/${paymentId}`);
    return response.data.data;
  }

  /**
   * Poll payment status until completed/failed/expired
   * Returns final status
   */
  async pollPaymentStatus(
    paymentId: string, 
    options: {
      intervalMs?: number;
      maxAttempts?: number;
      onStatusChange?: (status: PaymentStatusResponse) => void;
    } = {}
  ): Promise<PaymentStatusResponse> {
    const { 
      intervalMs = 3000, 
      maxAttempts = 300, // 15 minutes at 3s intervals
      onStatusChange 
    } = options;

    let attempts = 0;

    while (attempts < maxAttempts) {
      const status = await this.getPaymentStatus(paymentId);
      
      if (onStatusChange) {
        onStatusChange(status);
      }

      // Terminal states
      if (['COMPLETED', 'FAILED', 'EXPIRED'].includes(status.status)) {
        log('data', 'Payment polling completed', { 
          paymentId: maskId(paymentId),
          finalStatus: status.status,
          attempts,
        });
        return status;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    }

    // Max attempts reached
    logError('data', `Payment polling timeout: paymentId=${maskId(paymentId)}, attempts=${attempts}`, new Error('Max attempts reached'), { 
      feature: 'payment',
    });

    throw new Error('Payment status polling timeout');
  }
}

// Export singleton instance
export const checkoutApi = CheckoutApiService.getInstance();

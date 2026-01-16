/**
 * Checkout API Service
 * Uses Orval-generated API functions for type-safe checkout & payment operations
 * 
 * Architecture (Refactored):
 * - Uses generated functions from @/services/generated
 * - Type-safe with auto-generated TypeScript types
 * - Auto-sync with backend API changes
 * 
 * Handles order creation and payment flow
 * All operations use session cookie for authentication
 */

import {
  orderControllerCheckout,
} from '@/services/generated/orders/orders';

import {
  paymentControllerCreatePaymentIntent,
  paymentControllerGetPaymentStatus,
  paymentControllerCheckPaymentViaPoll,
} from '@/services/generated/payments/payments';

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
 * Singleton wrapper around generated checkout & payment API functions
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

    const order = await orderControllerCheckout(request as any);
    
    log('data', 'Order created', { 
      orderId: maskId(order.id),
      orderNumber: order.orderNumber,
      total: order.total,
    }, { feature: 'checkout' });
    
    return order as any;
  }

  /**
   * Create payment intent for SePay QR payment
   * Call this after checkout for SEPAY_QR payment method
   */
  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    log('data', 'Creating payment intent', { 
      orderId: maskId(request.orderId),
    }, { feature: 'payment' });

    const intent = await paymentControllerCreatePaymentIntent(request as any);
    
    log('data', 'Payment intent created', { 
      paymentId: maskId(intent.paymentId),
      amount: intent.amount,
      expiresAt: intent.expiresAt,
    }, { feature: 'payment' });
    
    return intent as any;
  }

  /**
   * Get payment status
   * Use this to poll payment status until completed or expired
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    const status = await paymentControllerGetPaymentStatus(paymentId);
    return status as any;
  }

  /**
   * Check payment via SePay polling
   * This calls SePay API to check if payment has been received
   * Better than basic status check as it polls actual bank transactions
   */
  async checkPaymentViaPoll(paymentId: string): Promise<{
    found: boolean;
    completed: boolean;
    status?: string;
    message?: string;
    transaction?: any;
  }> {
    log('data', 'Checking payment via SePay poll', { 
      paymentId: maskId(paymentId),
    }, { feature: 'payment' });

    const result = await paymentControllerCheckPaymentViaPoll(paymentId);
    
    log('data', 'Payment poll result', { 
      paymentId: maskId(paymentId),
      completed: result.completed,
      found: result.found,
    }, { feature: 'payment' });
    
    return result as any;
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

// Order Tracking API Service

import apiClient from '@/api/client'
import type { OrderTrackingResponse } from './types'

/**
 * Service for fetching order tracking data from backend
 * Uses session cookie for authentication
 */
class OrderTrackingApiService {
  private baseUrl = '/orders'

  /**
   * Get order tracking info for customer view
   * GET /orders/tracking/:orderId
   */
  async getOrderTracking(orderId: string): Promise<OrderTrackingResponse> {
    const response = await apiClient.get<OrderTrackingResponse>(
      `${this.baseUrl}/tracking/${orderId}`
    )
    return response.data
  }
}

// Singleton instance
export const orderTrackingApi = new OrderTrackingApiService()

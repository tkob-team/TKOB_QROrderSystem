// Order Tracking API Service

import apiClient from '@/api/client'
import type { OrderTrackingResponse } from './types'

/**
 * Service for fetching order tracking data from backend
 * Uses session cookie for authentication
 * 
 * NOTE: apiClient already has baseURL with /api/v1 prefix
 * Do NOT include /api/v1 in paths here to avoid double prefix
 */
class OrderTrackingApiService {
  // Do NOT include /api/v1 here - apiClient.baseURL already has it
  private baseUrl = '/orders'

  /**
   * Get order tracking info for customer view
   * GET /api/v1/orders/tracking/:orderId
   */
  async getOrderTracking(orderId: string): Promise<OrderTrackingResponse> {
    // Backend returns wrapped response: { success: true, data: trackingData }
    const response = await apiClient.get<{ success: boolean; data: OrderTrackingResponse }>(
      `${this.baseUrl}/tracking/${orderId}`
    )
    return response.data.data
  }
}

// Singleton instance
export const orderTrackingApi = new OrderTrackingApiService()

// KDS API Types - matching backend DTOs

import type { OrderResponse } from '../../../orders/data/api/types'

/**
 * KDS Orders grouped by priority
 */
export interface KdsOrdersResponse {
  normal: OrderResponse[]
  high: OrderResponse[]
  urgent: OrderResponse[]
}

/**
 * KDS Statistics
 */
export interface KdsStatsResponse {
  totalActive: number
  urgent: number
  high: number
  normal: number
  avgPrepTime?: number
  todayCompleted: number
}

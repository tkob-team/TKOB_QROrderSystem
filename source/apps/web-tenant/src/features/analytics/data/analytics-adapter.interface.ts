/**
 * Analytics Adapter Interface
 * Abstract contract for analytics data operations
 */

import type {
  OrderDataPoint,
  PeakHourData,
  TopSellingItem,
  RevenueDataPoint,
  TimeRange,
} from '../model/types';

export interface IAnalyticsAdapter {
  /**
   * Get order trends over time
   */
  getOrdersData(range: TimeRange): Promise<OrderDataPoint[]>;

  /**
   * Get peak hours data
   */
  getPeakHours(): Promise<PeakHourData[]>;

  /**
   * Get top selling items
   */
  getTopSellingItems(): Promise<TopSellingItem[]>;

  /**
   * Get revenue data by period
   */
  getRevenueData(period: 'daily' | 'weekly' | 'monthly'): Promise<RevenueDataPoint[]>;
}

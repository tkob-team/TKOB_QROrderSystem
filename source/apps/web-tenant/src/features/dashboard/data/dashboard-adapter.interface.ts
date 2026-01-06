/**
 * Dashboard Adapter Interface
 * Abstract contract for dashboard data operations
 */

import type {
  MockOrder,
  RevenueDataPoint,
  TopSellingItem,
  PopularItemData,
  RecentOrder,
  KPIData,
  TimePeriod,
  ChartPeriod,
} from '../model/types';

export interface IDashboardAdapter {
  /**
   * Get orders for status breakdown
   */
  getOrders(): Promise<MockOrder[]>;

  /**
   * Get revenue chart data by period
   */
  getRevenueData(period: ChartPeriod): Promise<RevenueDataPoint[]>;

  /**
   * Get top selling items
   */
  getTopSellingItems(): Promise<TopSellingItem[]>;

  /**
   * Get popular items for chart
   */
  getPopularItems(): Promise<PopularItemData[]>;

  /**
   * Get recent orders list
   */
  getRecentOrders(): Promise<RecentOrder[]>;

  /**
   * Get KPI data by time period
   */
  getKPIData(period: TimePeriod): Promise<KPIData>;
}

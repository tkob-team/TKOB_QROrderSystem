/**
 * Dashboard API Adapter
 * Real API implementation for dashboard data
 */

import type { IDashboardAdapter } from '../adapter.interface';
import type {
  MockOrder,
  RevenueDataPoint,
  TopSellingItem,
  PopularItemData,
  RecentOrder,
  KPIData,
  TimePeriod,
  ChartPeriod,
} from '../../model/types';

export class ApiDashboardAdapter implements IDashboardAdapter {
  constructor(private apiUrl: string) {}

  async getOrders(): Promise<MockOrder[]> {
    // @todo implement API call to /dashboard/orders
    throw new Error('ApiDashboardAdapter.getOrders not yet implemented');
  }

  async getRevenueData(period: ChartPeriod): Promise<RevenueDataPoint[]> {
    // @todo implement API call to /dashboard/revenue
    throw new Error('ApiDashboardAdapter.getRevenueData not yet implemented');
  }

  async getTopSellingItems(): Promise<TopSellingItem[]> {
    // @todo implement API call to /dashboard/top-selling
    throw new Error('ApiDashboardAdapter.getTopSellingItems not yet implemented');
  }

  async getPopularItems(): Promise<PopularItemData[]> {
    // @todo implement API call to /dashboard/popular-items
    throw new Error('ApiDashboardAdapter.getPopularItems not yet implemented');
  }

  async getRecentOrders(): Promise<RecentOrder[]> {
    // @todo implement API call to /dashboard/recent-orders
    throw new Error('ApiDashboardAdapter.getRecentOrders not yet implemented');
  }

  async getKPIData(period: TimePeriod): Promise<KPIData> {
    // @todo implement API call to /dashboard/kpi
    throw new Error('ApiDashboardAdapter.getKPIData not yet implemented');
  }
}

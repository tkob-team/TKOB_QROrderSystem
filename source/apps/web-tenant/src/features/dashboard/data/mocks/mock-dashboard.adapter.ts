/**
 * Dashboard Mock Adapter
 * Mock implementation for dashboard data
 */

import type { IDashboardAdapter } from '../adapter.interface';
import type {
  TimePeriod,
  ChartPeriod,
} from '../../model/types';
import {
  MOCK_ORDERS,
  MOCK_REVENUE_DATA,
  MOCK_TOP_SELLING_ITEMS,
  MOCK_POPULAR_ITEMS,
  MOCK_RECENT_ORDERS,
  MOCK_KPI_DATA,
} from './mock-dashboard.data';

export class MockDashboardAdapter implements IDashboardAdapter {
  async getOrders() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_ORDERS;
  }

  async getRevenueData(period: ChartPeriod) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_REVENUE_DATA[period];
  }

  async getTopSellingItems() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_TOP_SELLING_ITEMS;
  }

  async getPopularItems() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_POPULAR_ITEMS;
  }

  async getRecentOrders() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_RECENT_ORDERS;
  }

  async getKPIData(period: TimePeriod, rangeFilter?: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_KPI_DATA[period];
  }
}

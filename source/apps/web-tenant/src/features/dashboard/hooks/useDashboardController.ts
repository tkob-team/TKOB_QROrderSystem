'use client';

/**
 * Dashboard Controller Hook
 * Orchestrates page logic and data queries
 */

import { useDashboardPage } from './useDashboardPage';
import {
  useDashboardOrders,
  useDashboardRevenueData,
  useDashboardTopSelling,
  useDashboardRecentOrders,
  useDashboardKPI,
} from './queries/useDashboard';

export function useDashboardController() {
  // Page logic (state, handlers, animation, mappers, effects)
  const page = useDashboardPage();

  // Extract state needed for queries
  const { timePeriod } = page.state;
  const { getChartPeriod } = page.mappers;
  const chartPeriod = getChartPeriod();

  // Data queries
  const orders = useDashboardOrders();
  const revenue = useDashboardRevenueData(chartPeriod);
  const topSelling = useDashboardTopSelling();
  const recentOrders = useDashboardRecentOrders();
  const kpi = useDashboardKPI(timePeriod);

  // Aggregate loading state
  const isLoading =
    orders.isLoading ||
    revenue.isLoading ||
    topSelling.isLoading ||
    recentOrders.isLoading ||
    kpi.isLoading;

  return {
    page,
    queries: {
      orders,
      revenue,
      topSelling,
      recentOrders,
      kpi,
    },
    isLoading,
  };
}

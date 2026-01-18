'use client';

/**
 * Dashboard Controller Hook
 * Orchestrates page logic and data queries
 */

import { useEffect, useRef } from 'react';
import { logger } from '@/shared/utils/logger';
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
  const { timePeriod, rangeFilter } = page.state;
  const { getChartPeriod } = page.mappers;
  const chartPeriod = getChartPeriod();

  // Data queries
  const orders = useDashboardOrders();
  const revenue = useDashboardRevenueData(chartPeriod, rangeFilter);
  const topSelling = useDashboardTopSelling();
  const recentOrders = useDashboardRecentOrders();
  const kpi = useDashboardKPI(timePeriod, rangeFilter);

  // Aggregate loading state
  const isLoading =
    orders.isLoading ||
    revenue.isLoading ||
    topSelling.isLoading ||
    recentOrders.isLoading ||
    kpi.isLoading;

  // Track if data has been loaded to avoid logging on every render
  const hasLoggedDataRef = useRef(false);

  // Log widget data mapping when all data is loaded (once per mount)
  useEffect(() => {
    if (!isLoading && !hasLoggedDataRef.current) {
      hasLoggedDataRef.current = true;
      
      logger.info('[dashboard] WIDGETS_MAPPED', {
        timePeriod,
        chartPeriod,
        ordersCount: orders.data?.length || 0,
        revenuePointsCount: revenue.data?.length || 0,
        topSellingCount: topSelling.data?.length || 0,
        recentOrdersCount: recentOrders.data?.length || 0,
        kpiPresent: !!kpi.data,
      });
    }
  }, [isLoading, timePeriod, chartPeriod, orders.data, revenue.data, topSelling.data, recentOrders.data, kpi.data]);

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

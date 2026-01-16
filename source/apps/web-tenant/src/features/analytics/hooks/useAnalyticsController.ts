'use client';

/**
 * Analytics Controller Hook
 * Owns UI state and orchestrates analytics queries
 */

import { useState } from 'react';
import { useOverview, useOrdersData, usePeakHours, useTopSellingItems, useRevenueData } from './queries/useAnalytics';
import type { TimeRange, RevenueChartPeriod } from '../model/types';

export function useAnalyticsController() {
  const [timeRange, setTimeRange] = useState<TimeRange>('Last 7 days');
  const [revenueChartPeriod, setRevenueChartPeriod] = useState<RevenueChartPeriod>('daily');

  const overviewQuery = useOverview();
  const ordersQuery = useOrdersData(timeRange);
  const peakHoursQuery = usePeakHours();
  const topSellingQuery = useTopSellingItems();
  const revenueQuery = useRevenueData(revenueChartPeriod);

  const isLoading = Boolean(
    overviewQuery.isLoading || ordersQuery.isLoading || peakHoursQuery.isLoading || topSellingQuery.isLoading || revenueQuery.isLoading
  );

  return {
    state: { timeRange, revenueChartPeriod },
    handlers: { setTimeRange, setRevenueChartPeriod },
    queries: { overviewQuery, ordersQuery, peakHoursQuery, topSellingQuery, revenueQuery },
    isLoading,
  } as const;
}

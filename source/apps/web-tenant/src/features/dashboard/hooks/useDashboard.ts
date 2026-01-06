/**
 * Dashboard Hooks
 * React Query wrappers for dashboard data
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardAdapter } from '../data/factory';
import type { TimePeriod, ChartPeriod } from '../model/types';

export function useDashboardOrders() {
  return useQuery({
    queryKey: ['dashboard', 'orders'],
    queryFn: () => dashboardAdapter.getOrders(),
  });
}

export function useDashboardRevenueData(period: ChartPeriod) {
  return useQuery({
    queryKey: ['dashboard', 'revenue', period],
    queryFn: () => dashboardAdapter.getRevenueData(period),
  });
}

export function useDashboardTopSelling() {
  return useQuery({
    queryKey: ['dashboard', 'top-selling'],
    queryFn: () => dashboardAdapter.getTopSellingItems(),
  });
}

export function useDashboardPopularItems() {
  return useQuery({
    queryKey: ['dashboard', 'popular-items'],
    queryFn: () => dashboardAdapter.getPopularItems(),
  });
}

export function useDashboardRecentOrders() {
  return useQuery({
    queryKey: ['dashboard', 'recent-orders'],
    queryFn: () => dashboardAdapter.getRecentOrders(),
  });
}

export function useDashboardKPI(period: TimePeriod) {
  return useQuery({
    queryKey: ['dashboard', 'kpi', period],
    queryFn: () => dashboardAdapter.getKPIData(period),
  });
}

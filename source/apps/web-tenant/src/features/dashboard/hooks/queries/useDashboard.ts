/**
 * Dashboard Hooks
 * React Query wrappers for dashboard data
 */

import { useQuery } from '@tanstack/react-query';
import { logger } from '@/shared/utils/logger';
import { dashboardAdapter } from '../../data/factory';
import type { TimePeriod, ChartPeriod } from '../../model/types';

export function useDashboardOrders() {
  return useQuery({
    queryKey: ['dashboard', 'orders'],
    queryFn: async () => {
      logger.info('[dashboard] ORDERS_QUERY_ATTEMPT');
      try {
        const result = await dashboardAdapter.getOrders();
        logger.info('[dashboard] ORDERS_QUERY_SUCCESS', { count: result?.length || 0 });
        return result;
      } catch (error) {
        logger.error('[dashboard] ORDERS_QUERY_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      }
    },
  });
}

export function useDashboardRevenueData(period: ChartPeriod) {
  return useQuery({
    queryKey: ['dashboard', 'revenue', period],
    queryFn: async () => {
      logger.info('[dashboard] REVENUE_QUERY_ATTEMPT', { period });
      try {
        const result = await dashboardAdapter.getRevenueData(period);
        logger.info('[dashboard] REVENUE_QUERY_SUCCESS', { pointsCount: result?.length || 0, period });
        return result;
      } catch (error) {
        logger.error('[dashboard] REVENUE_QUERY_ERROR', { message: error instanceof Error ? error.message : 'Unknown error', period });
        throw error;
      }
    },
  });
}

export function useDashboardTopSelling() {
  return useQuery({
    queryKey: ['dashboard', 'top-selling'],
    queryFn: async () => {
      logger.info('[dashboard] TOP_SELLING_QUERY_ATTEMPT');
      try {
        const result = await dashboardAdapter.getTopSellingItems();
        logger.info('[dashboard] TOP_SELLING_QUERY_SUCCESS', { count: result?.length || 0 });
        return result;
      } catch (error) {
        logger.error('[dashboard] TOP_SELLING_QUERY_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      }
    },
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
    queryFn: async () => {
      logger.info('[dashboard] RECENT_ORDERS_QUERY_ATTEMPT');
      try {
        const result = await dashboardAdapter.getRecentOrders();
        logger.info('[dashboard] RECENT_ORDERS_QUERY_SUCCESS', { count: result?.length || 0 });
        return result;
      } catch (error) {
        logger.error('[dashboard] RECENT_ORDERS_QUERY_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      }
    },
  });
}

export function useDashboardKPI(period: TimePeriod) {
  return useQuery({
    queryKey: ['dashboard', 'kpi', period],
    queryFn: async () => {
      logger.info('[dashboard] KPI_QUERY_ATTEMPT', { period });
      try {
        const result = await dashboardAdapter.getKPIData(period);
        logger.info('[dashboard] KPI_QUERY_SUCCESS', { 
          period,
          hasOrders: !!result?.orders,
          hasRevenue: !!result?.revenue,
          hasAvgOrder: !!result?.avgOrder,
          hasTables: !!result?.tables
        });
        return result;
      } catch (error) {
        logger.error('[dashboard] KPI_QUERY_ERROR', { message: error instanceof Error ? error.message : 'Unknown error', period });
        throw error;
      }
    },
  });
}

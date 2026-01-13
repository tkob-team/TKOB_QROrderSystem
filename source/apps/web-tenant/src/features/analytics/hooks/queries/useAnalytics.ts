/**
 * Analytics Hooks
 * React Query wrappers for analytics data
 */

import { useQuery } from '@tanstack/react-query';
import { logger } from '@/shared/utils/logger';
import { analyticsAdapter } from '../../data/factory';
import type { TimeRange } from '../../model/types';

export function useOrdersData(range: TimeRange) {
  return useQuery({
    queryKey: ['analytics', 'orders', range],
    queryFn: async () => {
      logger.info('[analytics] ORDERS_DATA_QUERY_ATTEMPT', { range });
      try {
        const result = await analyticsAdapter.getOrdersData(range);
        logger.info('[analytics] ORDERS_DATA_QUERY_SUCCESS', { count: result?.length || 0 });
        return result;
      } catch (error) {
        logger.error('[analytics] ORDERS_DATA_QUERY_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      }
    },
  });
}

export function usePeakHours() {
  return useQuery({
    queryKey: ['analytics', 'peak-hours'],
    queryFn: async () => {
      logger.info('[analytics] PEAK_HOURS_QUERY_ATTEMPT');
      try {
        const result = await analyticsAdapter.getPeakHours();
        logger.info('[analytics] PEAK_HOURS_QUERY_SUCCESS', { count: result?.length || 0 });
        return result;
      } catch (error) {
        logger.error('[analytics] PEAK_HOURS_QUERY_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      }
    },
  });
}

export function useTopSellingItems() {
  return useQuery({
    queryKey: ['analytics', 'top-selling'],
    queryFn: async () => {
      logger.info('[analytics] TOP_SELLING_QUERY_ATTEMPT');
      try {
        const result = await analyticsAdapter.getTopSellingItems();
        logger.info('[analytics] TOP_SELLING_QUERY_SUCCESS', { count: result?.length || 0 });
        return result;
      } catch (error) {
        logger.error('[analytics] TOP_SELLING_QUERY_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      }
    },
  });
}

export function useRevenueData(period: 'daily' | 'weekly' | 'monthly') {
  return useQuery({
    queryKey: ['analytics', 'revenue', period],
    queryFn: async () => {
      logger.info('[analytics] REVENUE_DATA_QUERY_ATTEMPT', { period });
      try {
        const result = await analyticsAdapter.getRevenueData(period);
        logger.info('[analytics] REVENUE_DATA_QUERY_SUCCESS');
        return result;
      } catch (error) {
        logger.error('[analytics] REVENUE_DATA_QUERY_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      }
    },
  });
}

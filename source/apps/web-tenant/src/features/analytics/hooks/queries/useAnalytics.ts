/**
 * Analytics Hooks
 * React Query wrappers for analytics data
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsAdapter } from '../../data/factory';
import type { TimeRange } from '../../model/types';

export function useOrdersData(range: TimeRange) {
  return useQuery({
    queryKey: ['analytics', 'orders', range],
    queryFn: () => analyticsAdapter.getOrdersData(range),
  });
}

export function usePeakHours() {
  return useQuery({
    queryKey: ['analytics', 'peak-hours'],
    queryFn: () => analyticsAdapter.getPeakHours(),
  });
}

export function useTopSellingItems() {
  return useQuery({
    queryKey: ['analytics', 'top-selling'],
    queryFn: () => analyticsAdapter.getTopSellingItems(),
  });
}

export function useRevenueData(period: 'daily' | 'weekly' | 'monthly') {
  return useQuery({
    queryKey: ['analytics', 'revenue', period],
    queryFn: () => analyticsAdapter.getRevenueData(period),
  });
}

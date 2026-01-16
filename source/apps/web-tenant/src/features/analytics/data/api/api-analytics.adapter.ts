/**
 * Analytics API Adapter
 * Real API implementation for analytics data using generated services
 */

import type { IAnalyticsAdapter } from '../adapter.interface';
import type {
  OrderDataPoint,
  PeakHourData,
  TopSellingItem,
  RevenueDataPoint,
  TimeRange,
  KPIOverview,
} from '../../model/types';
import {
  analyticsControllerGetOrderStats,
  analyticsControllerGetHourlyDistribution,
  analyticsControllerGetPopularItems,
  analyticsControllerGetRevenue,
  analyticsControllerGetOverview,
} from '@/services/generated/analytics/analytics';
import { AnalyticsControllerGetRevenueGroupBy } from '@/services/generated/models';
import { logger } from '@/shared/utils/logger';

export class ApiAnalyticsAdapter implements IAnalyticsAdapter {
  constructor(private apiUrl: string) {}

  /**
   * Get KPI overview data
   */
  async getOverview(): Promise<KPIOverview> {
    try {
      logger.debug('[api-analytics] GET_OVERVIEW_ATTEMPT');
      
      const response = await analyticsControllerGetOverview();
      const data = (response as any)?.data || {};
      
      const overview: KPIOverview = {
        thisMonth: {
          orders: data.thisMonth?.orders || 0,
          revenue: data.thisMonth?.revenue || 0,
        },
        avgOrderValue: data.avgOrderValue || 0,
        growth: {
          revenue: data.growth?.revenue || 0,
          orders: data.growth?.orders || 0,
        },
        activeTables: data.activeTables || 0,
      };
      
      logger.debug('[api-analytics] GET_OVERVIEW_SUCCESS', overview);
      return overview;
    } catch (error) {
      logger.error('[api-analytics] GET_OVERVIEW_ERROR', { 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Get orders data over time
   */
  async getOrdersData(range: TimeRange): Promise<OrderDataPoint[]> {
    try {
      logger.debug('[api-analytics] GET_ORDERS_DATA_ATTEMPT', { range });
      
      const { from, to } = this.getDateRangeForTimeRange(range);
      
      const response = await analyticsControllerGetOrderStats({ from, to });
      const data = (response as any)?.data || {};
      
      // Backend might return daily breakdown or we need to group data
      // For now, return simplified data points
      const orderData: OrderDataPoint[] = [];
      
      // If backend returns daily data array
      if (data.daily && Array.isArray(data.daily)) {
        orderData.push(...data.daily.map((item: any) => ({
          date: item.date || item.day,
          orders: item.orders || item.count || 0,
        })));
      } else {
        // Fallback: create single data point from totals
        orderData.push({
          date: to,
          orders: data.totalOrders || 0,
        });
      }
      
      logger.debug('[api-analytics] GET_ORDERS_DATA_SUCCESS', { 
        range, 
        pointsCount: orderData.length 
      });
      return orderData;
    } catch (error) {
      logger.error('[api-analytics] GET_ORDERS_DATA_ERROR', { 
        message: error instanceof Error ? error.message : 'Unknown error',
        range
      });
      throw error;
    }
  }

  /**
   * Get peak hours data
   */
  async getPeakHours(): Promise<PeakHourData[]> {
    try {
      logger.debug('[api-analytics] GET_PEAK_HOURS_ATTEMPT');
      
      const response = await analyticsControllerGetHourlyDistribution();
      const data = (response as any)?.data || [];
      
      // Map to PeakHourData format
      const peakHours: PeakHourData[] = data.map((item: any) => ({
        hour: this.formatHour(item.hour),
        orders: item.orderCount || item.orders || 0,
      }));
      
      logger.debug('[api-analytics] GET_PEAK_HOURS_SUCCESS', { count: peakHours.length });
      return peakHours;
    } catch (error) {
      logger.error('[api-analytics] GET_PEAK_HOURS_ERROR', { 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Get top selling items with trend
   */
  async getTopSellingItems(): Promise<TopSellingItem[]> {
    try {
      logger.debug('[api-analytics] GET_TOP_SELLING_ATTEMPT');
      
      const response = await analyticsControllerGetPopularItems({
        limit: 10, // Top 10 items
      });
      
      const items = (response as any)?.data || [];
      
      // Map to TopSellingItem format
      const topSelling: TopSellingItem[] = items.map((item: any, index: number) => ({
        rank: index + 1,
        itemName: item.name || item.itemName || 'Unknown',
        category: item.category || 'Uncategorized',
        orders: item.orderCount || item.orders || 0,
        revenue: item.revenue || item.totalRevenue || 0,
        trendPercent: item.trendPercent || item.trend || 0,
      }));
      
      logger.debug('[api-analytics] GET_TOP_SELLING_SUCCESS', { count: topSelling.length });
      return topSelling;
    } catch (error) {
      logger.error('[api-analytics] GET_TOP_SELLING_ERROR', { 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Get revenue data for chart
   */
  async getRevenueData(period: 'daily' | 'weekly' | 'monthly'): Promise<RevenueDataPoint[]> {
    try {
      logger.debug('[api-analytics] GET_REVENUE_DATA_ATTEMPT', { period });
      
      const { from, to, groupBy } = this.getDateRangeForRevenuePeriod(period);
      
      const response = await analyticsControllerGetRevenue({
        from,
        to,
        groupBy,
      });
      
      const data = (response as any)?.data || [];
      
      // Map to RevenueDataPoint format
      const revenueData: RevenueDataPoint[] = data.map((item: any) => {
        const dataPoint: RevenueDataPoint = {
          revenue: item.total || item.revenue || 0,
        };
        
        // Add appropriate time key based on period
        if (period === 'daily') {
          dataPoint.time = item.hour || item.time || '';
          dataPoint.day = item.day || item.date || '';
        } else if (period === 'weekly') {
          dataPoint.day = item.day || item.date || '';
        } else {
          dataPoint.week = item.week || item.date || '';
        }
        
        return dataPoint;
      });
      
      logger.debug('[api-analytics] GET_REVENUE_DATA_SUCCESS', { 
        period, 
        pointsCount: revenueData.length 
      });
      return revenueData;
    } catch (error) {
      logger.error('[api-analytics] GET_REVENUE_DATA_ERROR', { 
        message: error instanceof Error ? error.message : 'Unknown error',
        period
      });
      throw error;
    }
  }

  // Helper methods

  private getDateRangeForTimeRange(range: TimeRange): { from: string; to: string } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const from = new Date(today);
    
    if (range === 'Last 7 days') {
      from.setDate(from.getDate() - 7);
    } else if (range === 'Last 30 days') {
      from.setDate(from.getDate() - 30);
    } else {
      // Last 90 days
      from.setDate(from.getDate() - 90);
    }
    
    return {
      from: from.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    };
  }

  private getDateRangeForRevenuePeriod(period: 'daily' | 'weekly' | 'monthly'): { 
    from: string; 
    to: string; 
    groupBy: AnalyticsControllerGetRevenueGroupBy
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const from = new Date(today);
    
    if (period === 'daily') {
      // Last 24 hours
      from.setDate(from.getDate() - 1);
      return {
        from: from.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
        groupBy: AnalyticsControllerGetRevenueGroupBy.day,
      };
    } else if (period === 'weekly') {
      // Last 7 days
      from.setDate(from.getDate() - 7);
      return {
        from: from.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
        groupBy: AnalyticsControllerGetRevenueGroupBy.day,
      };
    } else {
      // Last 30 days
      from.setDate(from.getDate() - 30);
      return {
        from: from.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
        groupBy: AnalyticsControllerGetRevenueGroupBy.week,
      };
    }
  }

  private formatHour(hour: number | string): string {
    const h = typeof hour === 'string' ? parseInt(hour, 10) : hour;
    if (isNaN(h)) return String(hour);
    
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}${period}`;
  }
}

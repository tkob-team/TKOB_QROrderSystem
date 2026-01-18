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
      // Axios interceptor already unwrapped { success, data } wrapper
      const data = response || {};
      
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
      
      // Use revenue API which returns daily breakdown including orders count
      const response = await analyticsControllerGetRevenue({ 
        from, 
        to, 
        groupBy: AnalyticsControllerGetRevenueGroupBy.day 
      });
      // Axios interceptor already unwrapped { success, data } wrapper
      const responseData = response || {};
      const dataPoints = responseData.data || [];
      
      // Backend returns: { period: {from, to}, groupBy: string, data: [{period: string, revenue: number, orders: number}] }
      // Map to OrderDataPoint format (date, orders)
      const orderData: OrderDataPoint[] = dataPoints.map((item: any) => ({
        date: item.period || '',
        orders: item.orders || 0,
      }));
      
      // Fill gaps for missing dates to show zero-order days
      const filledData = this.fillGapsInOrdersData(orderData, from, to);
      
      logger.debug('[api-analytics] GET_ORDERS_DATA_SUCCESS', { 
        range,
        rawPoints: orderData.length,
        filledPoints: filledData.length,
        totalOrders: filledData.reduce((sum, d) => sum + d.orders, 0)
      });
      return filledData;
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
      // Axios interceptor already unwrapped { success, data } wrapper
      const responseData = response || {};
      const distribution = responseData.distribution || [];
      
      // Backend returns: { period: {from, to}, distribution: [{hour, orders, revenue}] }
      // Map to PeakHourData format
      const peakHours: PeakHourData[] = distribution.map((item: any) => ({
        hour: this.formatHour(item.hour),
        orders: item.orders || 0,
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
      
      // Axios interceptor already unwrapped { success, data } wrapper
      const responseData = response || {};
      const items = responseData.items || [];
      
      // Backend returns: { period: {from, to}, items: [{rank, menuItemId, name, totalQuantity, totalRevenue}] }
      // Map to TopSellingItem format
      const topSelling: TopSellingItem[] = items.map((item: any) => ({
        rank: item.rank || 0,
        itemName: item.name || 'Unknown',
        category: item.category || 'Uncategorized',
        orders: item.totalQuantity || 0,
        revenue: item.totalRevenue || 0,
        trendPercent: item.trendPercent || 0,
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
      
      // Axios interceptor already unwrapped { success, data } wrapper
      const responseData = response || {};
      const dataPoints = responseData.data || [];
      
      // Backend returns: { period: {from, to}, groupBy: string, data: [{period: string, revenue: number, orders: number}] }
      // Backend period formats: day='2026-01-17', week='2026-W03', month='2026-01'
      // Map to RevenueDataPoint format
      const revenueData: RevenueDataPoint[] = dataPoints.map((item: any) => {
        const dataPoint: RevenueDataPoint = {
          revenue: item.revenue || 0,
        };
        
        // Map backend 'period' to appropriate chart dataKey
        if (period === 'daily') {
          dataPoint.time = item.period || '';  // '2026-01-17'
          dataPoint.day = item.period || '';
        } else if (period === 'weekly') {
          dataPoint.day = item.period || '';   // '2026-01-17' (daily points for 7-day view)
        } else {
          dataPoint.week = item.period || '';  // '2026-W03' (weekly aggregated)
        }
        
        return dataPoint;
      });
      
      // Fill gaps for missing dates to show zero-revenue days
      const filledData = this.fillGapsInRevenueData(revenueData, period, from, to);
      
      logger.debug('[api-analytics] GET_REVENUE_DATA_SUCCESS', { 
        period,
        rawPoints: revenueData.length,
        filledPoints: filledData.length
      });
      return filledData;
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
    // Tomorrow to include all of today's data (backend uses < endDate)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const from = new Date(today);
    
    if (range === 'Last 7 days') {
      from.setDate(from.getDate() - 7);
    } else if (range === 'Last 30 days') {
      from.setDate(from.getDate() - 30);
    } else {
      // Last 90 days
      from.setDate(from.getDate() - 90);
    }
    
    // Format dates manually to avoid timezone conversion issues
    const fromStr = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}`;
    const toStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    
    return { from: fromStr, to: toStr };
  }

  private getDateRangeForRevenuePeriod(period: 'daily' | 'weekly' | 'monthly'): { 
    from: string; 
    to: string; 
    groupBy: AnalyticsControllerGetRevenueGroupBy
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Tomorrow to include all of today's data (backend uses < endDate)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const from = new Date(today);
    
    // Format helper
    const formatDate = (d: Date) => 
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    if (period === 'daily') {
      // Last 24 hours - use tomorrow as end to include today
      from.setDate(from.getDate() - 1);
      return {
        from: formatDate(from),
        to: formatDate(tomorrow),
        groupBy: AnalyticsControllerGetRevenueGroupBy.day,
      };
    } else if (period === 'weekly') {
      // Last 7 days
      from.setDate(from.getDate() - 7);
      return {
        from: formatDate(from),
        to: formatDate(tomorrow),
        groupBy: AnalyticsControllerGetRevenueGroupBy.day,
      };
    } else {
      // Last 30 days
      from.setDate(from.getDate() - 30);
      return {
        from: formatDate(from),
        to: formatDate(tomorrow),
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

  /**
   * Fill missing dates/weeks in revenue data with zeros
   */
  private fillGapsInRevenueData(
    data: RevenueDataPoint[], 
    period: 'daily' | 'weekly' | 'monthly',
    fromStr: string, 
    toStr: string
  ): RevenueDataPoint[] {
    if (data.length === 0) return [];
    
    // Create map of existing data
    const dataMap = new Map<string, RevenueDataPoint>();
    data.forEach(item => {
      const key = item.time || item.day || item.week || '';
      dataMap.set(key, item);
    });
    
    const from = new Date(fromStr);
    const to = new Date(toStr);
    const result: RevenueDataPoint[] = [];
    
    if (period === 'daily' || period === 'weekly') {
      // Fill daily gaps
      const current = new Date(from);
      while (current < to) {
        const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        
        const dataPoint = dataMap.get(dateStr) || {
          revenue: 0,
          time: dateStr,
          day: dateStr,
        };
        result.push(dataPoint);
        
        current.setDate(current.getDate() + 1);
      }
    } else {
      // Monthly uses weekly aggregation - just return what backend provided
      // Week format like '2026-W03' is harder to fill gaps, trust backend
      return data;
    }
    
    return result;
  }

  /**
   * Fill missing dates in orders data with zeros
   */
  private fillGapsInOrdersData(
    data: OrderDataPoint[], 
    fromStr: string, 
    toStr: string
  ): OrderDataPoint[] {
    if (data.length === 0) return [];
    
    // Create map of existing data
    const dataMap = new Map<string, OrderDataPoint>();
    data.forEach(item => {
      dataMap.set(item.date, item);
    });
    
    const from = new Date(fromStr);
    const to = new Date(toStr);
    const result: OrderDataPoint[] = [];
    
    // Fill daily gaps
    const current = new Date(from);
    while (current < to) {
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      
      const dataPoint = dataMap.get(dateStr) || {
        date: dateStr,
        orders: 0,
      };
      result.push(dataPoint);
      
      current.setDate(current.getDate() + 1);
    }
    
    return result;
  }
}

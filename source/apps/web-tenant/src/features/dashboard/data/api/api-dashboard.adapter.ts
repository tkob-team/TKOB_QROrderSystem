/**
 * Dashboard API Adapter
 * Real API implementation for dashboard data using generated services
 */

import type { IDashboardAdapter } from '../adapter.interface';
import type {
  MockOrder,
  RevenueDataPoint,
  TopSellingItem,
  PopularItemData,
  RecentOrder,
  KPIData,
  TimePeriod,
  ChartPeriod,
  OrderStatus,
} from '../../model/types';
import { 
  analyticsControllerGetOverview,
  analyticsControllerGetRevenue,
  analyticsControllerGetPopularItems,
  analyticsControllerGetOrderStats,
} from '@/services/generated/analytics/analytics';
import { orderControllerGetOrders } from '@/services/generated/orders/orders';
import { AnalyticsControllerGetRevenueGroupBy } from '@/services/generated/models';
import { logger } from '@/shared/utils/logger';

export class ApiDashboardAdapter implements IDashboardAdapter {
  constructor(private apiUrl: string) {}

  /**
   * Get all orders (for status breakdown)
   */
  async getOrders(): Promise<MockOrder[]> {
    try {
      logger.debug('[api-dashboard] GET_ORDERS_ATTEMPT');
      const response = await orderControllerGetOrders({ 
        page: 1, 
        limit: 100 // Backend max limit is 100
      });
      
      // Backend returns PaginatedResponseDto with items array
      const orders = (response as any)?.data?.items || [];
      
      // Map to MockOrder format
      const mockOrders: MockOrder[] = orders.map((order: any) => ({
        id: order.id,
        status: this.mapOrderStatus(order.status),
      }));
      
      logger.debug('[api-dashboard] GET_ORDERS_SUCCESS', { count: mockOrders.length });
      return mockOrders;
    } catch (error) {
      logger.error('[api-dashboard] GET_ORDERS_ERROR', { 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Get revenue data for chart
   */
  async getRevenueData(period: ChartPeriod): Promise<RevenueDataPoint[]> {
    try {
      logger.debug('[api-dashboard] GET_REVENUE_ATTEMPT', { period });
      
      // Calculate date range based on period
      const { from, to, groupBy } = this.getDateRangeForPeriod(period);
      
      const response = await analyticsControllerGetRevenue({
        from,
        to,
        groupBy,
      });
      
      // Backend returns array of revenue data points
      const revenueData = (response as any)?.data || [];
      
      // Map to RevenueDataPoint format
      const mappedData: RevenueDataPoint[] = revenueData.map((item: any) => {
        const dataPoint: RevenueDataPoint = {
          revenue: item.total || item.revenue || 0,
        };
        
        // Add appropriate time key based on period
        if (period === 'today') {
          dataPoint.time = item.hour || item.time || '';
        } else if (period === 'week') {
          dataPoint.day = item.day || item.date || '';
        } else {
          dataPoint.week = item.week || item.date || '';
        }
        
        return dataPoint;
      });
      
      logger.debug('[api-dashboard] GET_REVENUE_SUCCESS', { 
        period, 
        pointsCount: mappedData.length 
      });
      return mappedData;
    } catch (error) {
      logger.error('[api-dashboard] GET_REVENUE_ERROR', { 
        message: error instanceof Error ? error.message : 'Unknown error',
        period
      });
      throw error;
    }
  }

  /**
   * Get top selling items
   */
  async getTopSellingItems(): Promise<TopSellingItem[]> {
    try {
      logger.debug('[api-dashboard] GET_TOP_SELLING_ATTEMPT');
      
      const response = await analyticsControllerGetPopularItems({
        limit: 5, // Top 5 items
      });
      
      const items = (response as any)?.data || [];
      
      // Map to TopSellingItem format
      const topSelling: TopSellingItem[] = items.map((item: any, index: number) => ({
        rank: index + 1,
        name: item.name || item.itemName || 'Unknown',
        orders: item.orderCount || item.orders || 0,
        revenue: item.revenue || item.totalRevenue || 0,
      }));
      
      logger.debug('[api-dashboard] GET_TOP_SELLING_SUCCESS', { count: topSelling.length });
      return topSelling;
    } catch (error) {
      logger.error('[api-dashboard] GET_TOP_SELLING_ERROR', { 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Get popular items (for chart)
   */
  async getPopularItems(): Promise<PopularItemData[]> {
    try {
      logger.debug('[api-dashboard] GET_POPULAR_ITEMS_ATTEMPT');
      
      const response = await analyticsControllerGetPopularItems({
        limit: 10, // Top 10 for chart
      });
      
      const items = (response as any)?.data || [];
      
      // Map to PopularItemData format
      const popularItems: PopularItemData[] = items.map((item: any) => ({
        name: item.name || item.itemName || 'Unknown',
        orders: item.orderCount || item.orders || 0,
      }));
      
      logger.debug('[api-dashboard] GET_POPULAR_ITEMS_SUCCESS', { count: popularItems.length });
      return popularItems;
    } catch (error) {
      logger.error('[api-dashboard] GET_POPULAR_ITEMS_ERROR', { 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(): Promise<RecentOrder[]> {
    try {
      logger.debug('[api-dashboard] GET_RECENT_ORDERS_ATTEMPT');
      
      const response = await orderControllerGetOrders({
        page: 1,
        limit: 5, // 5 most recent
        // Add sortBy: 'createdAt', sortOrder: 'DESC' if backend supports
      });
      
      const orders = (response as any)?.data?.items || [];
      
      // Map to RecentOrder format
      const recentOrders: RecentOrder[] = orders.map((order: any) => ({
        id: order.id,
        table: order.table?.displayName || order.tableId || 'Unknown',
        items: this.formatOrderItems(order.items || []),
        total: this.formatCurrency(order.totalAmount || 0),
        status: this.mapOrderStatus(order.status),
        time: this.formatTime(order.createdAt),
      }));
      
      logger.debug('[api-dashboard] GET_RECENT_ORDERS_SUCCESS', { count: recentOrders.length });
      return recentOrders;
    } catch (error) {
      logger.error('[api-dashboard] GET_RECENT_ORDERS_ERROR', { 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Get KPI data (orders, revenue, avg order, tables)
   */
  async getKPIData(period: TimePeriod): Promise<KPIData> {
    try {
      logger.debug('[api-dashboard] GET_KPI_ATTEMPT', { period });
      
      // Get date range for period
      const { from, to } = this.getDateRangeForTimePeriod(period);
      
      // Fetch overview data
      const overviewResponse = await analyticsControllerGetOverview();
      const overview = (overviewResponse as any)?.data || {};
      
      // Fetch order stats for trend
      const statsResponse = await analyticsControllerGetOrderStats({ from, to });
      const stats = (statsResponse as any)?.data || {};
      
      // Build KPI data
      const kpi: KPIData = {
        orders: {
          value: String(stats.totalOrders || overview.totalOrders || 0),
          trend: this.calculateTrend(stats.previousPeriodOrders, stats.totalOrders),
        },
        revenue: {
          value: this.formatCurrency(stats.totalRevenue || overview.totalRevenue || 0),
          trend: this.calculateTrend(stats.previousPeriodRevenue, stats.totalRevenue),
        },
        avgOrder: {
          value: this.formatCurrency(stats.averageOrderValue || overview.averageOrderValue || 0),
          trend: this.calculateTrend(stats.previousPeriodAvgOrder, stats.averageOrderValue),
        },
        tables: {
          value: String(overview.activeTables || 0),
        },
        label: period,
      };
      
      logger.debug('[api-dashboard] GET_KPI_SUCCESS', { period, kpi });
      return kpi;
    } catch (error) {
      logger.error('[api-dashboard] GET_KPI_ERROR', { 
        message: error instanceof Error ? error.message : 'Unknown error',
        period
      });
      throw error;
    }
  }

  // Helper methods

  private mapOrderStatus(status: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      PLACED: 'placed',
      CONFIRMED: 'confirmed',
      PREPARING: 'preparing',
      READY: 'ready',
      SERVED: 'served',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    };
    return statusMap[status] || 'placed';
  }

  private getDateRangeForPeriod(period: ChartPeriod): { from: string; to: string; groupBy: AnalyticsControllerGetRevenueGroupBy } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (period === 'today') {
      return {
        from: today.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
        groupBy: AnalyticsControllerGetRevenueGroupBy.day,
      };
    } else if (period === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return {
        from: weekAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
        groupBy: AnalyticsControllerGetRevenueGroupBy.day,
      };
    } else {
      // month
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return {
        from: monthAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
        groupBy: AnalyticsControllerGetRevenueGroupBy.week,
      };
    }
  }

  private getDateRangeForTimePeriod(period: TimePeriod): { from: string; to: string } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (period === 'Today') {
      return {
        from: today.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
      };
    } else if (period === 'This Week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return {
        from: weekAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
      };
    } else {
      // This Month
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return {
        from: monthAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
      };
    }
  }

  private formatOrderItems(items: any[]): string {
    if (!items || items.length === 0) return 'No items';
    if (items.length === 1) return items[0].menuItem?.name || items[0].name || 'Item';
    return `${items[0].menuItem?.name || items[0].name || 'Item'} +${items.length - 1}`;
  }

  private formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  private formatTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffMins < 1440) {
        return `${Math.floor(diffMins / 60)}h ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return 'Unknown';
    }
  }

  private calculateTrend(previous: number | undefined, current: number | undefined): number {
    if (!previous || previous === 0 || !current) return 0;
    return ((current - previous) / previous) * 100;
  }
}

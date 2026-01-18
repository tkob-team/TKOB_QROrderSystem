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
      
      // Backend returns PaginatedResponseDto { data: T[], meta: {...} }
      // customInstance already unwrapped the { success, data } wrapper
      const orders = (response as any)?.data || [];
      
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
      
      // Backend returns: { period: {from, to}, groupBy: string, data: [{period: string, revenue: number, orders: number}] }
      // Axios interceptor already unwrapped { success, data } wrapper
      const responseData = response || {};
      const dataPoints = responseData.data || [];
      
      // Map to RevenueDataPoint format
      const mappedData: RevenueDataPoint[] = dataPoints.map((item: any) => {
        const dataPoint: RevenueDataPoint = {
          revenue: item.revenue || 0,
        };
        
        // Backend uses 'period' field for all groupBy types
        // Map it to appropriate time key based on period
        if (period === 'today' || period === 'yesterday') {
          dataPoint.time = item.period || '';
        } else if (period === 'week') {
          dataPoint.day = item.period || '';
        } else {
          dataPoint.week = item.period || '';
        }
        
        return dataPoint;
      });
      
      logger.debug('[api-dashboard] GET_REVENUE_SUCCESS', { 
        period,
        from,
        to,
        groupBy,
        pointsCount: mappedData.length,
        rawDataPoints: dataPoints,
        mappedData 
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
      
      // Backend returns: { period: {from, to}, items: [{rank, menuItemId, name, totalQuantity, totalRevenue}] }
      // Axios interceptor already unwrapped { success, data } wrapper
      const responseData = response || {};
      const items = responseData.items || [];
      
      // Map to TopSellingItem format
      const topSelling: TopSellingItem[] = items.map((item: any) => ({
        rank: item.rank || 0,
        name: item.name || 'Unknown',
        orders: item.totalQuantity || 0,
        revenue: item.totalRevenue || 0,
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
      
      // Backend returns: { period: {from, to}, items: [{rank, menuItemId, name, totalQuantity, totalRevenue}] }
      // Axios interceptor already unwrapped { success, data } wrapper
      const responseData = response || {};
      const items = responseData.items || [];
      
      // Map to PopularItemData format
      const popularItems: PopularItemData[] = items.map((item: any) => ({
        name: item.name || 'Unknown',
        orders: item.totalQuantity || 0,
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
      
      const orders = (response as any)?.data || [];
      
      // Map to RecentOrder format
      const recentOrders: RecentOrder[] = orders.map((order: any) => ({
        id: order.id,
        table: order.table?.displayName || order.tableId || 'Unknown',
        items: this.formatOrderItems(order.items || []),
        total: this.formatCurrency(order.total || 0), // Backend returns 'total' field, not 'totalAmount'
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
  async getKPIData(period: TimePeriod, rangeFilter?: string): Promise<KPIData> {
    try {
      logger.debug('[api-dashboard] GET_KPI_ATTEMPT', { period, rangeFilter });
      
      // Get date range based on rangeFilter for stats API (Yesterday needs different range than period)
      const { from, to } = rangeFilter === 'Yesterday' 
        ? this.getDateRangeForPeriod('yesterday')
        : this.getDateRangeForTimePeriod(period);
      
      // Fetch overview data
      const overviewResponse = await analyticsControllerGetOverview();
      // Axios interceptor already unwrapped { success, data } wrapper
      const overview = overviewResponse || {};
      
      // Fetch order stats for trend (also used for Yesterday data)
      const statsResponse = await analyticsControllerGetOrderStats({ from, to });
      // Axios interceptor already unwrapped { success, data } wrapper
      const stats = statsResponse || {};
      
      // Extract data based on period and rangeFilter
      // Note: TimePeriod type uses 'Today', 'This Week', 'This Month' (capitalized)
      // Backend overview returns: { today: {orders, revenue}, thisMonth: {orders, revenue}, activeTables, avgOrderValue, growth }
      // Backend stats returns: { period: {from, to}, totalOrders, byStatus, byPaymentMethod, avgPrepTime }
      let ordersCount = 0;
      let revenueAmount = 0;
      
      // Special case: Yesterday needs data from stats API since overview doesn't have yesterday field
      if (rangeFilter === 'Yesterday') {
        // Use order stats API which was called with yesterday's date range
        ordersCount = stats.totalOrders || 0;
        // Calculate revenue from byPaymentMethod array
        const paymentMethods = stats.byPaymentMethod || [];
        revenueAmount = paymentMethods.reduce((sum: number, method: any) => sum + (Number(method.revenue) || 0), 0);
      } else if (period === 'Today') {
        // Use today's data from overview
        ordersCount = overview.today?.orders || 0;
        revenueAmount = overview.today?.revenue || 0;
      } else {
        // 'This Week' or 'This Month' - use thisMonth data from overview
        ordersCount = overview.thisMonth?.orders || 0;
        revenueAmount = overview.thisMonth?.revenue || 0;
      }
      
      // Build KPI data
      const kpi: KPIData = {
        orders: {
          value: String(ordersCount),
          trend: overview.growth?.orders || 0,
        },
        revenue: {
          value: this.formatCurrency(revenueAmount),
          trend: overview.growth?.revenue || 0,
        },
        avgOrder: {
          value: this.formatCurrency(overview.avgOrderValue || 0),
          trend: 0,
        },
        tables: {
          value: String(overview.activeTables || 0),
        },
        label: period,
      };
      
      logger.debug('[api-dashboard] GET_KPI_SUCCESS', { 
        period, 
        ordersCount,
        revenueAmount,
        todayData: overview.today,
        thisMonthData: overview.thisMonth,
        kpi 
      });
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
    // Get current date in local timezone
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    // Calculate yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    // Calculate tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    
    if (period === 'today') {
      // Today's data: from today to tomorrow (exclusive)
      return {
        from: todayStr,
        to: tomorrowStr,
        groupBy: AnalyticsControllerGetRevenueGroupBy.day,
      };
    } else if (period === 'yesterday') {
      // Yesterday's data: from yesterday to today (exclusive)
      return {
        from: yesterdayStr,
        to: todayStr,
        groupBy: AnalyticsControllerGetRevenueGroupBy.day,
      };
    } else if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;
      return {
        from: weekAgoStr,
        to: tomorrowStr,
        groupBy: AnalyticsControllerGetRevenueGroupBy.day,
      };
    } else {
      // month
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthAgoStr = `${monthAgo.getFullYear()}-${String(monthAgo.getMonth() + 1).padStart(2, '0')}-${String(monthAgo.getDate()).padStart(2, '0')}`;
      return {
        from: monthAgoStr,
        to: tomorrowStr,
        groupBy: AnalyticsControllerGetRevenueGroupBy.week,
      };
    }
  }

  private getDateRangeForTimePeriod(period: TimePeriod): { from: string; to: string } {
    // Get current date in local timezone  
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    // Calculate tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    
    if (period === 'Today') {
      // Today's orders: from today to tomorrow (exclusive)
      return {
        from: todayStr,
        to: tomorrowStr,
      };
    } else if (period === 'This Week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;
      return {
        from: weekAgoStr,
        to: tomorrowStr,
      };
    } else {
      // This Month
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthAgoStr = `${monthAgo.getFullYear()}-${String(monthAgo.getMonth() + 1).padStart(2, '0')}-${String(monthAgo.getDate()).padStart(2, '0')}`;
      return {
        from: monthAgoStr,
        to: tomorrowStr,
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

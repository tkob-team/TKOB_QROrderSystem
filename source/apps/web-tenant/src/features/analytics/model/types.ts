/**
 * Analytics Feature - Types
 */

export interface KPIOverview {
  thisMonth: {
    orders: number;
    revenue: number;
  };
  avgOrderValue: number;
  growth: {
    revenue: number;
    orders: number;
  };
  activeTables: number;
}

export interface KPIData {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  peakHour: string;
}

export interface OrderDataPoint {
  date: string;
  orders: number;
}

export interface PeakHourData {
  hour: string;
  orders: number;
}

export interface TopSellingItem {
  rank: number;
  itemName: string;
  category: string;
  orders: number;
  revenue: number;
  trendPercent: number;
}

export interface RevenueDataPoint {
  time?: string;
  day?: string;
  week?: string;
  revenue: number;
}

export type TimeRange = 'Last 7 days' | 'Last 30 days' | 'Last 90 days';
export type RevenueChartPeriod = 'daily' | 'weekly' | 'monthly';

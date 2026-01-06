// Dashboard Types

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type TimePeriod = 'Today' | 'This Week' | 'This Month';
export type ChartPeriod = 'today' | 'week' | 'month';
export type RangeOption = 'Today' | 'Yesterday' | 'Last 7 days' | 'Last 30 days';

export interface MockOrder {
  id: string;
  status: OrderStatus;
}

export interface OrderStatusData {
  name: string;
  value: number;
  color: string;
}

export interface RevenueDataPoint {
  time?: string;
  day?: string;
  week?: string;
  revenue: number;
}

export interface TopSellingItem {
  rank: number;
  name: string;
  orders: number;
  revenue: number;
}

export interface PopularItemData {
  name: string;
  orders: number;
}

export interface RecentOrder {
  id: string;
  table: string;
  items: string;
  total: string;
  status: OrderStatus;
  time: string;
}

export interface KPIData {
  orders: { value: string; trend: number };
  revenue: { value: string; trend: number };
  avgOrder: { value: string; trend: number };
  tables: { value: string };
  label: string;
}

export interface RevenueChartData {
  today: RevenueDataPoint[];
  week: RevenueDataPoint[];
  month: RevenueDataPoint[];
}

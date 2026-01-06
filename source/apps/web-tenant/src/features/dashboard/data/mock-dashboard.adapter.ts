/**
 * Dashboard Mock Adapter
 * Mock implementation for dashboard data
 */

import type { IDashboardAdapter } from './dashboard-adapter.interface';
import type {
  MockOrder,
  RevenueDataPoint,
  TopSellingItem,
  PopularItemData,
  RecentOrder,
  KPIData,
  TimePeriod,
  ChartPeriod,
  RevenueChartData,
} from '../model/types';

export class MockDashboardAdapter implements IDashboardAdapter {
  private mockOrders: MockOrder[] = [
    // Placed orders (8 orders)
    { id: '1', status: 'placed' },
    { id: '2', status: 'placed' },
    { id: '3', status: 'placed' },
    { id: '4', status: 'placed' },
    { id: '5', status: 'placed' },
    { id: '6', status: 'placed' },
    { id: '7', status: 'placed' },
    { id: '8', status: 'placed' },
    // Confirmed orders (12 orders)
    { id: '9', status: 'confirmed' },
    { id: '10', status: 'confirmed' },
    { id: '11', status: 'confirmed' },
    { id: '12', status: 'confirmed' },
    { id: '13', status: 'confirmed' },
    { id: '14', status: 'confirmed' },
    { id: '15', status: 'confirmed' },
    { id: '16', status: 'confirmed' },
    { id: '17', status: 'confirmed' },
    { id: '18', status: 'confirmed' },
    { id: '19', status: 'confirmed' },
    { id: '20', status: 'confirmed' },
    // Preparing orders (18 orders)
    { id: '21', status: 'preparing' },
    { id: '22', status: 'preparing' },
    { id: '23', status: 'preparing' },
    { id: '24', status: 'preparing' },
    { id: '25', status: 'preparing' },
    { id: '26', status: 'preparing' },
    { id: '27', status: 'preparing' },
    { id: '28', status: 'preparing' },
    { id: '29', status: 'preparing' },
    { id: '30', status: 'preparing' },
    { id: '31', status: 'preparing' },
    { id: '32', status: 'preparing' },
    { id: '33', status: 'preparing' },
    { id: '34', status: 'preparing' },
    { id: '35', status: 'preparing' },
    { id: '36', status: 'preparing' },
    { id: '37', status: 'preparing' },
    { id: '38', status: 'preparing' },
    // Ready orders (15 orders)
    { id: '39', status: 'ready' },
    { id: '40', status: 'ready' },
    { id: '41', status: 'ready' },
    { id: '42', status: 'ready' },
    { id: '43', status: 'ready' },
    { id: '44', status: 'ready' },
    { id: '45', status: 'ready' },
    { id: '46', status: 'ready' },
    { id: '47', status: 'ready' },
    { id: '48', status: 'ready' },
    { id: '49', status: 'ready' },
    { id: '50', status: 'ready' },
    { id: '51', status: 'ready' },
    { id: '52', status: 'ready' },
    { id: '53', status: 'ready' },
    // Served orders (14 orders)
    { id: '54', status: 'served' },
    { id: '55', status: 'served' },
    { id: '56', status: 'served' },
    { id: '57', status: 'served' },
    { id: '58', status: 'served' },
    { id: '59', status: 'served' },
    { id: '60', status: 'served' },
    { id: '61', status: 'served' },
    { id: '62', status: 'served' },
    { id: '63', status: 'served' },
    { id: '64', status: 'served' },
    { id: '65', status: 'served' },
    { id: '66', status: 'served' },
    { id: '67', status: 'served' },
    // Completed orders (89 orders - to make total 156)
    ...Array.from({ length: 89 }, (_, i) => ({ id: `${68 + i}`, status: 'completed' as const })),
  ];

  private revenueChartData: RevenueChartData = {
    today: [
      { time: '9 AM', revenue: 120 },
      { time: '10 AM', revenue: 280 },
      { time: '11 AM', revenue: 450 },
      { time: '12 PM', revenue: 890 },
      { time: '1 PM', revenue: 1240 },
      { time: '2 PM', revenue: 1450 },
      { time: '3 PM', revenue: 1680 },
      { time: '4 PM', revenue: 1820 },
    ],
    week: [
      { day: 'Mon', revenue: 2400 },
      { day: 'Tue', revenue: 2800 },
      { day: 'Wed', revenue: 2600 },
      { day: 'Thu', revenue: 3200 },
      { day: 'Fri', revenue: 4100 },
      { day: 'Sat', revenue: 4500 },
      { day: 'Sun', revenue: 3800 },
    ],
    month: [
      { week: 'Week 1', revenue: 12400 },
      { week: 'Week 2', revenue: 15800 },
      { week: 'Week 3', revenue: 14200 },
      { week: 'Week 4', revenue: 18900 },
    ],
  };

  private topSellingItems: TopSellingItem[] = [
    { rank: 1, name: 'Grilled Salmon', orders: 124, revenue: 2480 },
    { rank: 2, name: 'Caesar Salad', orders: 98, revenue: 1470 },
    { rank: 3, name: 'Margherita Pizza', orders: 87, revenue: 1305 },
    { rank: 4, name: 'Beef Burger', orders: 76, revenue: 1140 },
  ];

  private popularItemsData: PopularItemData[] = [
    { name: 'Grilled Salmon', orders: 124 },
    { name: 'Caesar Salad', orders: 98 },
    { name: 'Margherita Pizza', orders: 87 },
    { name: 'Beef Burger', orders: 76 },
    { name: 'Pasta Carbonara', orders: 64 },
  ];

  private recentOrders: RecentOrder[] = [
    { id: '#1245', table: 'Table 5', items: '3 items', total: '$45.50', status: 'ready', time: '12:30 PM' },
    { id: '#1244', table: 'Table 3', items: '2 items', total: '$32.00', status: 'preparing', time: '12:45 PM' },
    { id: '#1243', table: 'Table 8', items: '5 items', total: '$67.80', status: 'completed', time: '12:05 PM' },
    { id: '#1242', table: 'Table 2', items: '2 items', total: '$28.90', status: 'completed', time: '11:50 AM' },
    { id: '#1241', table: 'Table 7', items: '4 items', total: '$54.20', status: 'completed', time: '11:35 AM' },
  ];

  private kpiData: Record<TimePeriod, KPIData> = {
    'Today': {
      orders: { value: '156', trend: 12.5 },
      revenue: { value: '$12,450', trend: 8.2 },
      avgOrder: { value: '$42.50', trend: -2.1 },
      tables: { value: '8' },
      label: "Today's"
    },
    'This Week': {
      orders: { value: '540', trend: 15.3 },
      revenue: { value: '$18,200', trend: 11.4 },
      avgOrder: { value: '$33.70', trend: 5.2 },
      tables: { value: '20' },
      label: "This Week's"
    },
    'This Month': {
      orders: { value: '2,340', trend: 18.7 },
      revenue: { value: '$78,900', trend: 14.3 },
      avgOrder: { value: '$33.72', trend: 2.8 },
      tables: { value: '22' },
      label: "This Month's"
    }
  };

  async getOrders(): Promise<MockOrder[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.mockOrders;
  }

  async getRevenueData(period: ChartPeriod): Promise<RevenueDataPoint[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.revenueChartData[period] as RevenueDataPoint[];
  }

  async getTopSellingItems(): Promise<TopSellingItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.topSellingItems;
  }

  async getPopularItems(): Promise<PopularItemData[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.popularItemsData;
  }

  async getRecentOrders(): Promise<RecentOrder[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.recentOrders;
  }

  async getKPIData(period: TimePeriod): Promise<KPIData> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.kpiData[period];
  }
}

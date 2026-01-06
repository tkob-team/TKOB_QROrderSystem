/**
 * Analytics Mock Adapter
 * Mock implementation for analytics data
 */

import type { IAnalyticsAdapter } from './analytics-adapter.interface';
import type {
  OrderDataPoint,
  PeakHourData,
  TopSellingItem,
  RevenueDataPoint,
  TimeRange,
} from '../model/types';

export class MockAnalyticsAdapter implements IAnalyticsAdapter {
  private mockOrdersData: OrderDataPoint[] = [
    { date: 'Jan 1', orders: 45 },
    { date: 'Jan 2', orders: 52 },
    { date: 'Jan 3', orders: 48 },
    { date: 'Jan 4', orders: 61 },
    { date: 'Jan 5', orders: 78 },
    { date: 'Jan 6', orders: 85 },
    { date: 'Jan 7', orders: 72 },
    { date: 'Jan 8', orders: 68 },
    { date: 'Jan 9', orders: 90 },
    { date: 'Jan 10', orders: 95 },
  ];

  private mockPeakHours: PeakHourData[] = [
    { hour: '9 AM', orders: 12 },
    { hour: '10 AM', orders: 18 },
    { hour: '11 AM', orders: 28 },
    { hour: '12 PM', orders: 45 },
    { hour: '1 PM', orders: 52 },
    { hour: '2 PM', orders: 38 },
    { hour: '3 PM', orders: 22 },
    { hour: '4 PM', orders: 15 },
    { hour: '5 PM', orders: 24 },
    { hour: '6 PM', orders: 48 },
    { hour: '7 PM', orders: 65 },
    { hour: '8 PM', orders: 58 },
    { hour: '9 PM', orders: 42 },
    { hour: '10 PM', orders: 28 },
  ];

  private mockTopSellingItems: TopSellingItem[] = [
    { rank: 1, itemName: 'Margherita Pizza', category: 'Main Course', orders: 145, revenue: 2175, trendPercent: 18.5 },
    { rank: 2, itemName: 'Caesar Salad', category: 'Appetizers', orders: 132, revenue: 1584, trendPercent: 12.3 },
    { rank: 3, itemName: 'Burger Deluxe', category: 'Main Course', orders: 118, revenue: 1888, trendPercent: 8.7 },
    { rank: 4, itemName: 'Pasta Carbonara', category: 'Main Course', orders: 95, revenue: 1710, trendPercent: -3.2 },
    { rank: 5, itemName: 'Grilled Salmon', category: 'Main Course', orders: 87, revenue: 2436, trendPercent: 15.4 },
    { rank: 6, itemName: 'Steak Medium', category: 'Main Course', orders: 76, revenue: 2432, trendPercent: 5.8 },
    { rank: 7, itemName: 'Fish & Chips', category: 'Main Course', orders: 64, revenue: 896, trendPercent: -5.1 },
    { rank: 8, itemName: 'Chicken Wings', category: 'Appetizers', orders: 58, revenue: 812, trendPercent: 9.2 },
  ];

  private mockRevenueData = {
    daily: [
      { time: '9 AM', revenue: 320 },
      { time: '10 AM', revenue: 580 },
      { time: '11 AM', revenue: 920 },
      { time: '12 PM', revenue: 1840 },
      { time: '1 PM', revenue: 2680 },
      { time: '2 PM', revenue: 3120 },
      { time: '3 PM', revenue: 3450 },
      { time: '4 PM', revenue: 3720 },
    ],
    weekly: [
      { day: 'Mon', revenue: 3200 },
      { day: 'Tue', revenue: 3800 },
      { day: 'Wed', revenue: 3400 },
      { day: 'Thu', revenue: 4200 },
      { day: 'Fri', revenue: 5400 },
      { day: 'Sat', revenue: 6200 },
      { day: 'Sun', revenue: 5100 },
    ],
    monthly: [
      { week: 'Week 1', revenue: 18400 },
      { week: 'Week 2', revenue: 22800 },
      { week: 'Week 3', revenue: 20600 },
      { week: 'Week 4', revenue: 26200 },
    ],
  };

  async getOrdersData(range: TimeRange): Promise<OrderDataPoint[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.mockOrdersData;
  }

  async getPeakHours(): Promise<PeakHourData[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.mockPeakHours;
  }

  async getTopSellingItems(): Promise<TopSellingItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.mockTopSellingItems;
  }

  async getRevenueData(period: 'daily' | 'weekly' | 'monthly'): Promise<RevenueDataPoint[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.mockRevenueData[period] as RevenueDataPoint[];
  }
}

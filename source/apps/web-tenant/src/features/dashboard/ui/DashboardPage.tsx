/**
 * Dashboard Page - New Olive Garden Design
 * Complete UI redesign with charts, KPIs, and recent orders
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, StatCard, Badge, Select } from '@/shared/components';
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Grid,
  Calendar,
  ArrowRight 
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fadeInUp, staggerFadeIn, countUp } from '@/shared/utils/animations';
import {
  useDashboardOrders,
  useDashboardRevenueData,
  useDashboardTopSelling,
  useDashboardRecentOrders,
  useDashboardKPI,
} from '../hooks';
import type { TimePeriod, ChartPeriod, RangeOption, OrderStatus } from '../model/types';

/* ===================================
   TYPES
   =================================== */

interface DashboardPageProps {
  className?: string;
}

/* ===================================
   MAIN COMPONENT
   =================================== */

export function DashboardPage({ className }: DashboardPageProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Today');
  const [rangeFilter, setRangeFilter] = useState<RangeOption>('Today');

  // Refs for animations
  const headerRef = useRef<HTMLDivElement>(null);
  const kpiGridRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleRangeChange = (value: RangeOption) => {
    setRangeFilter(value);
    // Map range filter to time period for KPIs
    if (value === 'Today' || value === 'Yesterday') {
      setTimePeriod('Today');
    } else if (value === 'Last 7 days') {
      setTimePeriod('This Week');
    } else if (value === 'Last 30 days') {
      setTimePeriod('This Month');
    }
  };

  // Map rangeFilter to chart period for revenue chart
  const getChartPeriod = (): ChartPeriod => {
    if (rangeFilter === 'Today' || rangeFilter === 'Yesterday') {
      return 'today';
    } else if (rangeFilter === 'Last 7 days') {
      return 'week';
    } else {
      return 'month';
    }
  };

  const chartPeriod = getChartPeriod();

  // Data hooks
  const { data: mockOrders = [], isLoading: ordersLoading, error: ordersError } = useDashboardOrders();
  const { data: revenueChartData = [], isLoading: revenueLoading } = useDashboardRevenueData(chartPeriod);
  const { data: topSellingItems = [], isLoading: topSellingLoading } = useDashboardTopSelling();
  const { data: recentOrders = [], isLoading: recentLoading } = useDashboardRecentOrders();
  const { data: currentKPI, isLoading: kpiLoading } = useDashboardKPI(timePeriod);

  const isLoading = ordersLoading || revenueLoading || topSellingLoading || recentLoading || kpiLoading;

  // Orders by status data for donut chart
  const getOrderCountByStatus = () => {
    const counts: Record<OrderStatus, number> = {
      placed: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      served: 0,
      completed: 0,
      cancelled: 0,
    };

    mockOrders.forEach((order) => {
      counts[order.status as OrderStatus]++;
    });

    return counts;
  };

  const statusCounts = getOrderCountByStatus();

  const ordersByStatus = [
    { name: 'Placed', value: statusCounts.placed, color: '#3b82f6' },
    { name: 'Confirmed', value: statusCounts.confirmed, color: '#6b8e23' },
    { name: 'Preparing', value: statusCounts.preparing, color: '#f59e0b' },
    { name: 'Ready', value: statusCounts.ready, color: '#22c55e' },
    { name: 'Completed', value: statusCounts.completed, color: '#87877f' },
  ];

  // Entrance animations
  useEffect(() => {
    const animateEntrance = async () => {
      if (headerRef.current) fadeInUp(headerRef.current, 0);
      if (kpiGridRef.current) {
        const cards = kpiGridRef.current.querySelectorAll('.stat-card');
        if (cards.length > 0) {
          staggerFadeIn(Array.from(cards) as unknown as HTMLElement, 100);
        }
      }
      if (chartsRef.current) fadeInUp(chartsRef.current, 300);
      if (tableRef.current) fadeInUp(tableRef.current, 400);
    };

    if (!isLoading) {
      animateEntrance();
    }
  }, [isLoading]);

  // Count-up animation for KPI values
  useEffect(() => {
    if (!isLoading && currentKPI && kpiGridRef.current) {
      const valueElements = kpiGridRef.current.querySelectorAll('.stat-value');
      valueElements.forEach((el) => {
        const target = el as HTMLElement;
        const text = target.textContent || '0';
        const numMatch = text.match(/[\d,]+/);
        if (numMatch) {
          const value = parseInt(numMatch[0].replace(/,/g, ''), 10);
          if (!isNaN(value)) {
            const formatFn = text.includes('$') 
              ? (v: number) => `$${v.toLocaleString()}`
              : (v: number) => v.toLocaleString();
            countUp(target, 0, value, 1500, formatFn);
          }
        }
      });
    }
  }, [isLoading, currentKPI]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'preparing':
        return 'warning';
      case 'ready':
        return 'info';
      case 'placed':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-primary">
      {/* Main Content - All scrolls together */}
      <div className="flex-1 px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header - Inside content, scrolls with it */}
          <div ref={headerRef} className="mb-6 md:mb-8 opacity-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">Dashboard</h1>
                <p className="text-sm text-text-tertiary flex items-center gap-2 flex-wrap">
                  <span className="text-accent-500 font-medium">Welcome back!</span>
                  <span className="hidden sm:inline">—</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </p>
              </div>
              <Select
                options={[
                  { value: 'Today', label: 'Today' },
                  { value: 'Yesterday', label: 'Yesterday' },
                  { value: 'Last 7 days', label: 'Last 7 days' },
                  { value: 'Last 30 days', label: 'Last 30 days' },
                ]}
                value={rangeFilter}
                onChange={(value) => handleRangeChange(value as RangeOption)}
                size="md"
                triggerClassName="w-full sm:w-[160px] shadow-sm"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent-200 border-t-accent-600 mb-4"></div>
                <p className="text-text-secondary">Loading dashboard data...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {ordersError && !isLoading && (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <p className="text-error-text font-semibold text-lg">Error loading dashboard data</p>
                <p className="text-sm text-text-secondary mt-2">{String(ordersError)}</p>
              </div>
            </div>
          )}

          {/* Dashboard Content */}
          {!isLoading && !ordersError && (
            <div className="flex flex-col gap-6 md:gap-8">
              {/* KPI Cards */}
              {currentKPI && (
                <div ref={kpiGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    className="stat-card opacity-0"
                    title="Total Revenue"
                    value={currentKPI.revenue.value}
                    icon={DollarSign}
                    variant="primary"
                    trend={`${currentKPI.revenue.trend > 0 ? '+' : ''}${currentKPI.revenue.trend.toFixed(1)}%`}
                    trendDirection={currentKPI.revenue.trend > 0 ? 'up' : 'down'}
                  />
                  <StatCard
                    className="stat-card opacity-0"
                    title="Total Orders"
                    value={currentKPI.orders.value}
                    icon={ShoppingBag}
                    variant="success"
                    trend={`${currentKPI.orders.trend > 0 ? '+' : ''}${currentKPI.orders.trend.toFixed(1)}%`}
                    trendDirection={currentKPI.orders.trend > 0 ? 'up' : 'down'}
                  />
                  <StatCard
                    className="stat-card opacity-0"
                    title="Avg Order Value"
                    value={currentKPI.avgOrder.value}
                    icon={TrendingUp}
                    variant="warning"
                    trend={`${currentKPI.avgOrder.trend > 0 ? '+' : ''}${currentKPI.avgOrder.trend.toFixed(1)}%`}
                    trendDirection={currentKPI.avgOrder.trend > 0 ? 'up' : 'down'}
                  />
                  <StatCard
                    className="stat-card opacity-0"
                title="Active Tables"
                value={currentKPI.tables.value}
                icon={Grid}
                variant="info"
              />
            </div>
          )}

          {/* Charts Row */}
          <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 opacity-0">
            {/* Revenue Chart - 2 columns */}
            <Card className="p-4 md:p-6 col-span-1 lg:col-span-2">
              <div className="flex flex-col gap-4 md:gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base md:text-lg font-bold text-text-primary">Revenue Trend</h3>
                    <p className="text-xs text-text-tertiary">Showing data for: {rangeFilter}</p>
                  </div>
                </div>
                <div className="w-full h-64 md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e1e1dc" />
                      <XAxis
                        dataKey={chartPeriod === 'today' ? 'time' : chartPeriod === 'week' ? 'day' : 'week'}
                        stroke="#87877f"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        stroke="#87877f"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e1e1dc',
                          borderRadius: '8px',
                          fontSize: '13px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value) => [`$${value}`, 'Revenue']}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{ fill: '#22c55e', r: 5, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 7, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Orders by Status Donut Chart - 1 column */}
            <Card className="p-6">
              <div className="flex flex-col gap-5">
                <h3 className="text-lg font-bold text-neutral-900">Orders by Status</h3>
                <div className="flex items-center justify-center" style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ordersByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {ordersByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e1e1dc',
                          borderRadius: '8px',
                          fontSize: '13px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value, entry: any) => (
                          <span style={{ fontSize: '12px', color: '#87877f' }}>
                            {value} ({entry.payload.value})
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Selling Items */}
          <Card className="p-6">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-primary">Top Selling Items</h3>
                <a 
                  href="/admin/menu" 
                  className="text-sm text-emerald-500 hover:text-emerald-600 font-semibold transition-colors flex items-center gap-1 hover:gap-2"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topSellingItems.slice(0, 6).map((item, index) => {
                  // Colorful rank badges
                  const rankColors = [
                    'from-yellow-400 to-amber-500', // 1st
                    'from-gray-300 to-gray-400',     // 2nd
                    'from-amber-600 to-orange-500', // 3rd
                    'from-emerald-400 to-teal-500',
                    'from-blue-400 to-indigo-500',
                    'from-purple-400 to-pink-500',
                  ];
                  return (
                  <div
                    key={item.rank}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary border border-default hover:border-accent-300 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${rankColors[index] || rankColors[0]} text-white text-base font-bold shrink-0 shadow-md`}>
                      {item.rank}
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-500 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {item.orders} orders
                      </span>
                    </div>
                    <span className="text-sm font-bold text-accent-500 shrink-0">
                      ${item.revenue.toLocaleString()}
                    </span>
                  </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Recent Orders Table */}
          <Card ref={tableRef} className="p-6 opacity-0 border border-default">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-primary">Recent Orders</h3>
                <a 
                  href="/admin/orders" 
                  className="text-sm text-emerald-500 hover:text-emerald-600 font-semibold transition-colors flex items-center gap-1 hover:gap-2"
                >
                  Go to Orders Page
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-default bg-elevated">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                        Order Date
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-default hover:bg-accent-500/5 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                              <span className="text-lg">🍽️</span>
                            </div>
                            <span className="text-sm font-medium text-text-primary">
                              {order.items}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-text-secondary">{order.table}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-text-secondary">{order.time}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-bold text-text-primary">
                            {order.total}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <button className="w-8 h-8 rounded-full bg-accent-100 text-accent-600 hover:bg-accent-200 flex items-center justify-center transition-colors">
                            ✓
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

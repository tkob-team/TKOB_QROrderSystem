'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { KPICard } from '@/shared/components/ui/KPICard';
import { Badge } from '@/shared/components/ui/Badge';
import { ShoppingBag, DollarSign, TrendingUp, Grid } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

type TimePeriod = 'Today' | 'This Week' | 'This Month';
type ChartPeriod = 'today' | 'week' | 'month';
type RangeOption = 'Today' | 'Yesterday' | 'Last 7 days' | 'Last 30 days';
type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed';

export function DashboardPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Today');
  const [rangeFilter, setRangeFilter] = useState<RangeOption>('Today');

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

  // Mock orders dataset for deriving chart data
  const mockOrders = [
    // Placed orders (8 orders)
    { id: '1', status: 'placed' as OrderStatus },
    { id: '2', status: 'placed' as OrderStatus },
    { id: '3', status: 'placed' as OrderStatus },
    { id: '4', status: 'placed' as OrderStatus },
    { id: '5', status: 'placed' as OrderStatus },
    { id: '6', status: 'placed' as OrderStatus },
    { id: '7', status: 'placed' as OrderStatus },
    { id: '8', status: 'placed' as OrderStatus },
    // Confirmed orders (12 orders)
    { id: '9', status: 'confirmed' as OrderStatus },
    { id: '10', status: 'confirmed' as OrderStatus },
    { id: '11', status: 'confirmed' as OrderStatus },
    { id: '12', status: 'confirmed' as OrderStatus },
    { id: '13', status: 'confirmed' as OrderStatus },
    { id: '14', status: 'confirmed' as OrderStatus },
    { id: '15', status: 'confirmed' as OrderStatus },
    { id: '16', status: 'confirmed' as OrderStatus },
    { id: '17', status: 'confirmed' as OrderStatus },
    { id: '18', status: 'confirmed' as OrderStatus },
    { id: '19', status: 'confirmed' as OrderStatus },
    { id: '20', status: 'confirmed' as OrderStatus },
    // Preparing orders (18 orders)
    { id: '21', status: 'preparing' as OrderStatus },
    { id: '22', status: 'preparing' as OrderStatus },
    { id: '23', status: 'preparing' as OrderStatus },
    { id: '24', status: 'preparing' as OrderStatus },
    { id: '25', status: 'preparing' as OrderStatus },
    { id: '26', status: 'preparing' as OrderStatus },
    { id: '27', status: 'preparing' as OrderStatus },
    { id: '28', status: 'preparing' as OrderStatus },
    { id: '29', status: 'preparing' as OrderStatus },
    { id: '30', status: 'preparing' as OrderStatus },
    { id: '31', status: 'preparing' as OrderStatus },
    { id: '32', status: 'preparing' as OrderStatus },
    { id: '33', status: 'preparing' as OrderStatus },
    { id: '34', status: 'preparing' as OrderStatus },
    { id: '35', status: 'preparing' as OrderStatus },
    { id: '36', status: 'preparing' as OrderStatus },
    { id: '37', status: 'preparing' as OrderStatus },
    { id: '38', status: 'preparing' as OrderStatus },
    // Ready orders (15 orders)
    { id: '39', status: 'ready' as OrderStatus },
    { id: '40', status: 'ready' as OrderStatus },
    { id: '41', status: 'ready' as OrderStatus },
    { id: '42', status: 'ready' as OrderStatus },
    { id: '43', status: 'ready' as OrderStatus },
    { id: '44', status: 'ready' as OrderStatus },
    { id: '45', status: 'ready' as OrderStatus },
    { id: '46', status: 'ready' as OrderStatus },
    { id: '47', status: 'ready' as OrderStatus },
    { id: '48', status: 'ready' as OrderStatus },
    { id: '49', status: 'ready' as OrderStatus },
    { id: '50', status: 'ready' as OrderStatus },
    { id: '51', status: 'ready' as OrderStatus },
    { id: '52', status: 'ready' as OrderStatus },
    { id: '53', status: 'ready' as OrderStatus },
    // Served orders (14 orders)
    { id: '54', status: 'served' as OrderStatus },
    { id: '55', status: 'served' as OrderStatus },
    { id: '56', status: 'served' as OrderStatus },
    { id: '57', status: 'served' as OrderStatus },
    { id: '58', status: 'served' as OrderStatus },
    { id: '59', status: 'served' as OrderStatus },
    { id: '60', status: 'served' as OrderStatus },
    { id: '61', status: 'served' as OrderStatus },
    { id: '62', status: 'served' as OrderStatus },
    { id: '63', status: 'served' as OrderStatus },
    { id: '64', status: 'served' as OrderStatus },
    { id: '65', status: 'served' as OrderStatus },
    { id: '66', status: 'served' as OrderStatus },
    { id: '67', status: 'served' as OrderStatus },
    // Completed orders (89 orders - to make total 156)
    ...Array.from({ length: 89 }, (_, i) => ({ id: `${68 + i}`, status: 'completed' as OrderStatus })),
  ];

  // Derive Orders by Status chart data from mock orders
  const getOrderCountByStatus = () => {
    const counts: Record<OrderStatus, number> = {
      placed: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      served: 0,
      completed: 0,
    };

    mockOrders.forEach(order => {
      counts[order.status]++;
    });

    return counts;
  };

  const statusCounts = getOrderCountByStatus();

  // Orders by status data for donut chart - aligned with canonical statuses
  const ordersByStatus = [
    { name: 'Placed', value: statusCounts.placed, color: '#3B82F6' },      // Blue - informational
    { name: 'Confirmed', value: statusCounts.confirmed, color: '#6366F1' },  // Indigo - informational variant
    { name: 'Preparing', value: statusCounts.preparing, color: '#F59E0B' }, // Amber - warning
    { name: 'Ready', value: statusCounts.ready, color: '#10B981' },         // Emerald - success
    { name: 'Served', value: statusCounts.served, color: '#14B8A6' },       // Teal - success variant
    { name: 'Completed', value: statusCounts.completed, color: '#6B7280' }, // Gray - neutral/inactive
  ];

  // Revenue chart data
  const revenueChartData = {
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

  // Top selling items data
  const topSellingItems = [
    { rank: 1, name: 'Grilled Salmon', orders: 124, revenue: 2480 },
    { rank: 2, name: 'Caesar Salad', orders: 98, revenue: 1470 },
    { rank: 3, name: 'Margherita Pizza', orders: 87, revenue: 1305 },
    { rank: 4, name: 'Beef Burger', orders: 76, revenue: 1140 },
  ];

  // Popular items chart data
  const popularItemsData = [
    { name: 'Grilled Salmon', orders: 124 },
    { name: 'Caesar Salad', orders: 98 },
    { name: 'Margherita Pizza', orders: 87 },
    { name: 'Beef Burger', orders: 76 },
    { name: 'Pasta Carbonara', orders: 64 },
  ];

  const recentOrders = [
    { id: '#1245', table: 'Table 5', items: '3 items', total: '$45.50', status: 'ready', time: '12:30 PM' },
    { id: '#1244', table: 'Table 3', items: '2 items', total: '$32.00', status: 'preparing', time: '12:45 PM' },
    { id: '#1243', table: 'Table 8', items: '5 items', total: '$67.80', status: 'completed', time: '12:05 PM' },
    { id: '#1242', table: 'Table 2', items: '2 items', total: '$28.90', status: 'completed', time: '11:50 AM' },
    { id: '#1241', table: 'Table 7', items: '4 items', total: '$54.20', status: 'completed', time: '11:35 AM' },
  ];

  const kpiData = {
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

  const currentKPI = kpiData[timePeriod] || kpiData['Today'];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'preparing':
        return 'warning';
      case 'ready':
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="px-6 pt-3 pb-2 border-b border-gray-200 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-gray-900" style={{ fontSize: '26px', fontWeight: 700, lineHeight: '1.2', letterSpacing: '-0.02em' }}>
              Dashboard
            </h2>
            <p className="text-gray-600" style={{ fontSize: '14px' }}>
              Overview of today&apos;s restaurant performance
            </p>
          </div>
          
          <select
            className="px-4 py-2.5 border border-gray-300 bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all mt-0.5"
            style={{ fontSize: '14px', fontWeight: 500, borderRadius: '12px', height: '40px' }}
            value={rangeFilter}
            onChange={(e) => handleRangeChange(e.target.value as RangeOption)}
          >
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
            <KPICard
              title="Total Revenue"
              value={currentKPI.revenue.value}
              icon={DollarSign}
              trend={{ value: currentKPI.revenue.trend, isPositive: currentKPI.revenue.trend > 0 }}
            />
            <KPICard
              title="Total Orders"
              value={currentKPI.orders.value}
              icon={ShoppingBag}
              trend={{ value: currentKPI.orders.trend, isPositive: currentKPI.orders.trend > 0 }}
            />
            <KPICard
              title="Avg Order Value"
              value={currentKPI.avgOrder.value}
              icon={TrendingUp}
              trend={{ value: currentKPI.avgOrder.trend, isPositive: currentKPI.avgOrder.trend > 0 }}
            />
            <KPICard
              title="Active Tables"
              value={currentKPI.tables.value}
              icon={Grid}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-6">
            {/* Revenue Chart - Takes 2 columns */}
            <Card className="p-5 col-span-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 600 }}>
                      Revenue Chart
                    </h3>
                    <p className="text-gray-500" style={{ fontSize: '12px' }}>
                      Showing data for: {rangeFilter}
                    </p>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                    <LineChart data={revenueChartData[chartPeriod]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey={chartPeriod === 'today' ? 'time' : chartPeriod === 'week' ? 'day' : 'week'}
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#9CA3AF" 
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                        formatter={(value) => [`$${value}`, 'Revenue']}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: '#10B981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Orders by Status Donut Chart - Takes 1 column */}
            <Card className="p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="flex flex-col gap-5">
                <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 600 }}>
                  Orders by Status
                </h3>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                    <PieChart>
                      <Pie
                        data={ordersByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {ordersByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value, entry: any) => (
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>
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

          {/* Top Selling & Popular Items Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Top Selling Items - Left Card */}
            <Card className="p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 600 }}>
                    Top Selling Items
                  </h3>
                  <button
                    className="text-emerald-500 hover:text-emerald-600 transition-colors"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    View All
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  {topSellingItems.map((item) => (
                    <div 
                      key={item.rank}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600"
                          style={{ fontSize: '16px', fontWeight: 700 }}
                        >
                          {item.rank}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>
                            {item.name}
                          </span>
                          <span className="text-gray-500" style={{ fontSize: '13px' }}>
                            {item.orders} orders
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
                        ${item.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Popular Items Bar Chart - Right Card */}
            <Card className="p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="flex flex-col gap-5">
                <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 600 }}>
                  Popular Items
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={popularItemsData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        type="number" 
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                        formatter={(value) => [`${value} orders`, 'Orders']}
                      />
                      <Bar 
                        dataKey="orders" 
                        fill="#10B981"
                        radius={[0, 8, 8, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Orders Table */}
          <Card className="p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 600 }}>
                  Recent Orders
                </h3>
                <button
                  className="text-emerald-500 hover:text-emerald-600 transition-colors"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  View all
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Order #
                      </th>
                      <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Table
                      </th>
                      <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Items
                      </th>
                      <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Total
                      </th>
                      <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <span className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>
                            {order.id}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700" style={{ fontSize: '15px' }}>
                            {order.table}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-600" style={{ fontSize: '15px' }}>
                            {order.items}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>
                            {order.total}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={getStatusVariant(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-500" style={{ fontSize: '15px' }}>
                            {order.time}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

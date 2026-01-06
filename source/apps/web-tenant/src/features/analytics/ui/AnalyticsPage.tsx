'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { KPICard } from '@/shared/components/KPICard';
import { ShoppingBag, DollarSign, TrendingUp, Clock, FileText, FileSpreadsheet } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, Legend, PieChart, Pie } from 'recharts';
import { useOrdersData, usePeakHours, useTopSellingItems, useRevenueData } from '../hooks';
import type { TimeRange, RevenueChartPeriod } from '../model/types';

// Colorful chart palette
const CHART_COLORS = {
  primary: '#10B981',   // emerald-500
  secondary: '#14B8A6', // teal-500
  tertiary: '#06B6D4',  // cyan-500
  quaternary: '#3B82F6', // blue-500
  purple: '#8B5CF6',    // violet-500
  pink: '#EC4899',      // pink-500
  orange: '#F59E0B',    // amber-500
  red: '#EF4444',       // red-500
};

// Bar chart gradient colors
const BAR_COLORS = ['#10B981', '#14B8A6', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'];

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('Last 7 days');
  const [revenueChartPeriod, setRevenueChartPeriod] = useState<RevenueChartPeriod>('daily');

  // Use hooks instead of direct imports
  const { data: ordersData = [] } = useOrdersData(timeRange);
  const { data: peakHours = [] } = usePeakHours();
  const { data: topSellingItems = [] } = useTopSellingItems();
  const { data: revenueChartData = [] } = useRevenueData(revenueChartPeriod);

  // Export to PDF handler
  const handleExportPDF = () => {
    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Analytics Report - TKOB Restaurant</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              margin: 40px;
              color: #111827;
            }
            h1 {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
              color: #111827;
            }
            .subtitle {
              font-size: 15px;
              color: #6B7280;
              margin-bottom: 32px;
            }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 24px;
              margin-bottom: 32px;
            }
            .kpi-card {
              border: 1px solid #E5E7EB;
              border-radius: 12px;
              padding: 20px;
              background: white;
            }
            .kpi-title {
              font-size: 14px;
              color: #6B7280;
              margin-bottom: 8px;
            }
            .kpi-value {
              font-size: 32px;
              font-weight: 700;
              color: #111827;
              margin-bottom: 4px;
            }
            .kpi-trend {
              font-size: 13px;
              color: #10B981;
            }
            h2 {
              font-size: 22px;
              font-weight: 700;
              margin-top: 32px;
              margin-bottom: 16px;
              color: #111827;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 32px;
            }
            th {
              text-align: left;
              padding: 12px;
              background: #F9FAFB;
              border-bottom: 2px solid #E5E7EB;
              font-size: 12px;
              font-weight: 600;
              color: #374151;
              text-transform: uppercase;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #E5E7EB;
              font-size: 14px;
              color: #111827;
            }
            .footer {
              margin-top: 48px;
              padding-top: 24px;
              border-top: 2px solid #E5E7EB;
              font-size: 13px;
              color: #6B7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>Analytics Report</h1>
          <div class="subtitle">TKOB Restaurant • ${timeRange} • Generated on ${new Date().toLocaleDateString()}</div>
          
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Total Revenue</div>
              <div class="kpi-value">$28,450</div>
              <div class="kpi-trend">↑ 15% from last period</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total Orders</div>
              <div class="kpi-value">1,248</div>
              <div class="kpi-trend">↑ 12% from last period</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Avg Order Value</div>
              <div class="kpi-value">$22.79</div>
              <div class="kpi-trend">↑ 3% from last period</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Avg Prep Time</div>
              <div class="kpi-value">14 min</div>
              <div class="kpi-trend" style="color: #EF4444;">↓ 2 min from last period</div>
            </div>
          </div>

          <h2>Top Selling Items</h2>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th style="text-align: right;">Orders</th>
              </tr>
            </thead>
            <tbody>
              ${topSellingItems.map(item => `
                <tr>
                  <td>${item.itemName}</td>
                  <td style="text-align: right; font-weight: 600;">${item.orders}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Summary Insights</h2>
          <table>
            <tbody>
              <tr>
                <td style="font-weight: 600;">Most Ordered Item</td>
                <td>Margherita Pizza (145 orders)</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Busiest Day</td>
                <td>Saturday (Avg 95 orders/day)</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Peak Hour</td>
                <td>7 PM (Avg 65 orders/hour)</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            This report was generated by TKQR Analytics on ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  // Export to Excel (CSV) handler
  const handleExportExcel = () => {
    // Create CSV content from popular items
    let csvContent = 'Item Name,Orders\n';
    topSellingItems.forEach(item => {
      csvContent += `"${item.itemName}",${item.orders}\n`;
    });

    // Add summary section
    csvContent += '\n\nSummary Insights\n';
    csvContent += 'Metric,Value\n';
    csvContent += '"Most Ordered Item","Margherita Pizza (145 orders)"\n';
    csvContent += '"Busiest Day","Saturday (Avg 95 orders/day)"\n';
    csvContent += '"Peak Hour","7 PM (Avg 65 orders/hour)"\n';
    csvContent += '\n\nKPI Metrics\n';
    csvContent += 'Metric,Value,Trend\n';
    csvContent += '"Total Revenue","$28,450","↑ 15% from last period"\n';
    csvContent += '"Total Orders","1,248","↑ 12% from last period"\n';
    csvContent += '"Avg Order Value","$22.79","↑ 3% from last period"\n';
    csvContent += '"Avg Prep Time","14 min","↓ 2 min from last period"\n';

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="px-6 pt-3 pb-2 border-b border-default bg-secondary">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-text-primary text-[26px] font-bold leading-tight tracking-tight">
              Analytics
            </h2>
            <p className="text-text-secondary text-sm">
              Detailed insights and performance metrics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              className="px-4 py-2.5 h-10 border border-default bg-secondary text-text-primary cursor-pointer focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm font-medium rounded-lg mt-0.5"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last year</option>
              <option>Custom range</option>
            </select>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 h-10 bg-secondary hover:bg-elevated border-2 border-default text-text-secondary transition-all text-sm font-semibold rounded-lg"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 h-10 bg-secondary hover:bg-elevated border-2 border-default text-text-secondary transition-all text-sm font-semibold rounded-lg"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
            <KPICard
              title="Total Revenue"
              value="$28,450"
              icon={DollarSign}
              trend={{ value: 15, isPositive: true }}
            />
            <KPICard
              title="Total Orders"
              value="1,248"
              icon={ShoppingBag}
              trend={{ value: 12, isPositive: true }}
            />
            <KPICard
              title="Avg Order Value"
              value="$22.79"
              icon={TrendingUp}
              trend={{ value: 3, isPositive: true }}
            />
            <KPICard
              title="Avg Prep Time"
              value="14 min"
              icon={Clock}
              trend={{ value: -2, isPositive: false }}
            />
          </div>

          {/* Revenue Chart */}
          <Card className="p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-text-primary text-lg font-semibold">
                  Revenue Chart
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRevenueChartPeriod('daily')}
                    className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                      revenueChartPeriod === 'daily'
                        ? 'bg-accent-500 text-white'
                        : 'bg-elevated text-text-secondary hover:bg-elevated/80'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setRevenueChartPeriod('weekly')}
                    className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                      revenueChartPeriod === 'weekly'
                        ? 'bg-accent-500 text-white'
                        : 'bg-elevated text-text-secondary hover:bg-elevated/80'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setRevenueChartPeriod('monthly')}
                    className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                      revenueChartPeriod === 'monthly'
                        ? 'bg-accent-500 text-white'
                        : 'bg-elevated text-text-secondary hover:bg-elevated/80'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey={revenueChartPeriod === 'daily' ? 'time' : revenueChartPeriod === 'weekly' ? 'day' : 'week'}
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
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                      dot={{ fill: '#10B981', r: 4, stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* Orders Over Time */}
          <Card className="p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-text-primary text-lg font-semibold">Orders Over Time</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-text-secondary text-[13px]">Orders</span>
                  </div>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                  <AreaChart data={ordersData}>
                    <defs>
                      <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      style={{ fontSize: '13px' }}
                    />
                    <YAxis stroke="#9CA3AF" style={{ fontSize: '13px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        fontSize: '13px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fill="url(#ordersGradient)"
                      dot={{ fill: '#3B82F6', r: 4, stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            {/* Popular Items */}
            <Card className="p-6 shadow-sm">
              <div className="flex flex-col gap-6">
                <h3 className="text-text-primary text-lg font-semibold">Popular Items</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%" minHeight={384}>
                    <BarChart data={topSellingItems} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: '13px' }} />
                      <YAxis
                        type="category"
                        dataKey="itemName"
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          fontSize: '13px',
                        }}
                      />
                      <Bar dataKey="orders" radius={[0, 8, 8, 0]}>
                        {topSellingItems.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Peak Hours */}
            <Card className="p-6 shadow-sm">
              <div className="flex flex-col gap-6">
                <h3 className="text-text-primary text-lg font-semibold">Peak Hours</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%" minHeight={384}>
                    <BarChart data={peakHours}>
                      <defs>
                        <linearGradient id="peakHoursGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={1}/>
                          <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="hour"
                        stroke="#9CA3AF"
                        style={{ fontSize: '11px' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#9CA3AF" style={{ fontSize: '13px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          fontSize: '13px',
                        }}
                      />
                      <Bar dataKey="orders" fill="url(#peakHoursGradient)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Selling Items Table */}
          <Card className="p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              <h3 className="text-text-primary text-lg font-semibold">
                Top Selling Items
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-elevated">
                      <th className="px-4 py-3 text-left border-b-2 border-default text-xs font-semibold text-text-secondary uppercase tracking-wide">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left border-b-2 border-default text-xs font-semibold text-text-secondary uppercase tracking-wide">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left border-b-2 border-default text-xs font-semibold text-text-secondary uppercase tracking-wide">
                        Category
                      </th>
                      <th className="px-4 py-3 text-right border-b-2 border-default text-xs font-semibold text-text-secondary uppercase tracking-wide">
                        Orders
                      </th>
                      <th className="px-4 py-3 text-right border-b-2 border-default text-xs font-semibold text-text-secondary uppercase tracking-wide">
                        Revenue
                      </th>
                      <th className="px-4 py-3 text-right border-b-2 border-default text-xs font-semibold text-text-secondary uppercase tracking-wide">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingItems.map((item) => {
                      let rankBadgeColor = 'bg-elevated text-text-secondary';
                      if (item.rank === 1) rankBadgeColor = 'bg-amber-100 text-amber-700';
                      else if (item.rank === 2) rankBadgeColor = 'bg-gray-200 text-gray-700';
                      else if (item.rank === 3) rankBadgeColor = 'bg-orange-100 text-orange-700';

                      return (
                        <tr key={item.rank} className="hover:bg-elevated transition-colors">
                          <td className="px-4 py-4 border-b border-default">
                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${rankBadgeColor}`}>
                              {item.rank}
                            </div>
                          </td>
                          <td className="px-4 py-4 border-b border-default text-sm font-semibold text-text-primary">
                            {item.itemName}
                          </td>
                          <td className="px-4 py-4 border-b border-default text-sm text-text-secondary">
                            {item.category}
                          </td>
                          <td className="px-4 py-4 border-b border-default text-right text-sm font-semibold text-text-primary">
                            {item.orders}
                          </td>
                          <td className="px-4 py-4 border-b border-default text-right text-sm font-semibold text-text-primary">
                            ${item.revenue.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 border-b border-default text-right">
                            <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                              item.trendPercent > 0 ? 'text-success-text' : 'text-error-text'
                            }`}>
                              {item.trendPercent > 0 ? '↑' : '↓'} {Math.abs(item.trendPercent)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <span className="text-text-secondary text-sm">Most Ordered Item</span>
                <span className="text-text-primary text-2xl font-semibold">
                  Margherita Pizza
                </span>
                <span className="text-success-text text-sm font-medium">
                  145 orders
                </span>
              </div>
            </Card>

            <Card className="p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <span className="text-text-secondary text-sm">Busiest Day</span>
                <span className="text-text-primary text-2xl font-semibold">
                  Saturday
                </span>
                <span className="text-success-text text-sm font-medium">
                  Avg 95 orders/day
                </span>
              </div>
            </Card>

            <Card className="p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <span className="text-text-secondary text-sm">Peak Hour</span>
                <span className="text-text-primary text-2xl font-semibold">
                  7 PM
                </span>
                <span className="text-success-text text-sm font-medium">
                  Avg 65 orders/hour
                </span>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

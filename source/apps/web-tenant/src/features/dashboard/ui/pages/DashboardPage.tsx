/**
 * Dashboard Page - New Olive Garden Design
 * Complete UI redesign with charts, KPIs, and recent orders
 */

'use client';

import React, { useEffect } from 'react';
import { Select } from '@/shared/components';
import { Calendar } from 'lucide-react';
import { useDashboardController } from '../../hooks';
import type { RangeOption } from '../../model/types';
import { formatOrdersForChart } from '../../utils/dashboard';
import { KPISection } from '../components/sections/KPISection';
import { RevenueSection } from '../components/sections/RevenueSection';
import { OrdersByStatusSection } from '../components/sections/OrdersByStatusSection';
import { TopSellingSection } from '../components/sections/TopSellingSection';
import { RecentOrdersSection } from '../components/sections/RecentOrdersSection';

interface DashboardPageProps {
  className?: string;
}

export function DashboardPage({ className }: DashboardPageProps) {
  // Controller hook (orchestrates page logic and data queries)
  const dashboard = useDashboardController();

  // Destructure page logic for cleaner access
  const { state, handlers, animation, mappers, effects } = dashboard.page;
  const { timePeriod, rangeFilter } = state;
  const { handleRangeChange } = handlers;
  const { headerRef, kpiGridRef, chartsRef, tableRef } = animation;
  const { getChartPeriod } = mappers;
  const { setupAnimations } = effects;

  // Get chart period
  const chartPeriod = getChartPeriod();

  // Destructure queries for cleaner access
  const { orders, revenue, topSelling, recentOrders, kpi } = dashboard.queries;
  const { data: mockOrders = [], error: ordersError } = orders;
  const { data: revenueChartData = [] } = revenue;
  const { data: topSellingItems = [] } = topSelling;
  const { data: recentOrdersList = [] } = recentOrders;
  const { data: currentKPI } = kpi;

  const isLoading = dashboard.isLoading;

  // Set up animations when data finishes loading
  useEffect(() => {
    setupAnimations(isLoading, currentKPI);
  }, [isLoading, currentKPI, setupAnimations]);

  // Format chart data
  const ordersByStatus = formatOrdersForChart(mockOrders);

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
              <KPISection currentKPI={currentKPI} kpiGridRef={kpiGridRef} />

              {/* Charts Row */}
              <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 opacity-0">
                <RevenueSection
                  revenueChartData={revenueChartData}
                  chartPeriod={chartPeriod}
                  rangeFilter={rangeFilter}
                  chartsRef={chartsRef}
                />

                <OrdersByStatusSection ordersByStatus={ordersByStatus} />
              </div>

              {/* Top Selling Items */}
              <TopSellingSection topSellingItems={topSellingItems} />

              {/* Recent Orders Table */}
              <RecentOrdersSection recentOrdersList={recentOrdersList} tableRef={tableRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

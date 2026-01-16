"use client";

import React from 'react';
import { Card } from '@/shared/components/Card';
import { useAnalyticsController } from '../../hooks';
import type { TimeRange } from '../../model/types';
import { exportAnalyticsPDF, exportAnalyticsExcel } from '../../utils/analyticsExport';
import { PDFExportSection } from '../components/sections/PDFExportSection';
import { KPICardsSection } from '../components/sections/KPICardsSection';
import { RevenueChartSection } from '../components/sections/RevenueChartSection';
import { OrdersTrendSection } from '../components/sections/OrdersTrendSection';
import { PeakHoursSection } from '../components/sections/PeakHoursSection';
import { TopSellingSection } from '../components/sections/TopSellingSection';

export function AnalyticsPage() {
  const analytics = useAnalyticsController();

  const { timeRange, revenueChartPeriod } = analytics.state;
  const { setTimeRange, setRevenueChartPeriod } = analytics.handlers;

  const overviewData = analytics.queries.overviewQuery.data;
  const ordersData = analytics.queries.ordersQuery.data ?? [];
  const peakHours = analytics.queries.peakHoursQuery.data ?? [];
  const topSellingItems = analytics.queries.topSellingQuery.data ?? [];
  const revenueChartData = analytics.queries.revenueQuery.data ?? [];
  
  const isLoadingOverview = analytics.queries.overviewQuery.isLoading;

  const handleExportPDF = () => {
    exportAnalyticsPDF({ timeRange, topSellingItems: topSellingItems as any[] });
  };

  const handleExportExcel = () => {
    exportAnalyticsExcel({ topSellingItems: topSellingItems as any[] });
  };

  return (
    <div className="h-full flex flex-col">
      <PDFExportSection
        timeRange={timeRange}
        onTimeRangeChange={(v) => setTimeRange(v as TimeRange)}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <KPICardsSection data={overviewData} isLoading={isLoadingOverview} />

          <RevenueChartSection
            revenueChartPeriod={revenueChartPeriod}
            onPeriodChange={setRevenueChartPeriod}
            data={revenueChartData as any[]}
          />

          <OrdersTrendSection data={ordersData as any[]} />

          <div className="grid grid-cols-2 gap-6">
            <TopSellingSection items={topSellingItems as any[]} variant="chart" />
            <PeakHoursSection data={peakHours as any[]} />
          </div>

          <TopSellingSection items={topSellingItems as any[]} variant="table" />

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <span className="text-text-secondary text-sm">Most Ordered Item</span>
                <span className="text-text-primary text-2xl font-semibold">
                  {topSellingItems[0]?.itemName || 'N/A'}
                </span>
                <span className="text-success-text text-sm font-medium">
                  {topSellingItems[0]?.orders ? `${topSellingItems[0].orders} orders` : 'No data'}
                </span>
              </div>
            </Card>

            <Card className="p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <span className="text-text-secondary text-sm">Peak Hour</span>
                <span className="text-text-primary text-2xl font-semibold">
                  {peakHours.length > 0 
                    ? peakHours.reduce((max, h) => h.orders > max.orders ? h : max, peakHours[0]).hour 
                    : 'N/A'}
                </span>
                <span className="text-success-text text-sm font-medium">
                  {peakHours.length > 0 
                    ? `${Math.max(...peakHours.map(h => h.orders))} orders/hour` 
                    : 'No data'}
                </span>
              </div>
            </Card>

            <Card className="p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <span className="text-text-secondary text-sm">Active Tables</span>
                <span className="text-text-primary text-2xl font-semibold">
                  {overviewData?.activeTables || 0}
                </span>
                <span className="text-success-text text-sm font-medium">
                  Currently available
                </span>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

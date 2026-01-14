import React, { useEffect, useRef } from 'react';
import { Card } from '@/shared/components/Card';
import { logger } from '@/shared/utils/logger';
import { shouldLogBySignature } from '@/shared/logging/logDedupe';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import type { RevenueChartPeriod } from '../../../model/types';

type Props = {
  revenueChartPeriod: RevenueChartPeriod;
  onPeriodChange: (p: RevenueChartPeriod) => void;
  data: Array<Record<string, any>>;
};

export function RevenueChartSection({ revenueChartPeriod, onPeriodChange, data }: Props) {
  const lastSigRef = useRef<string>('');

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
      // Dedupe: only log when actual data content changes, not on harmless rerenders
      const sig = `${revenueChartPeriod}|len:${data.length}|first:${data[0]?.time}|last:${data[data.length - 1]?.time}`;
      if (!shouldLogBySignature(lastSigRef, sig)) {
        return; // Same data, skip log
      }

      logger.info('[ui] CHART_SERIES_APPLIED', {
        feature: 'analytics',
        chartType: 'revenue',
        period: revenueChartPeriod,
        dataPoints: data.length,
        sample: process.env.NEXT_PUBLIC_LOG_DATA === 'true' && data[0]
          ? data[0]
          : undefined,
      });
    }
  }, [data, revenueChartPeriod]);
  return (
    <Card className="p-6 shadow-sm">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-text-primary text-lg font-semibold">Revenue Chart</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onPeriodChange('daily')}
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                revenueChartPeriod === 'daily'
                  ? 'bg-accent-500 text-white'
                  : 'bg-elevated text-text-secondary hover:bg-elevated/80'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => onPeriodChange('weekly')}
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                revenueChartPeriod === 'weekly'
                  ? 'bg-accent-500 text-white'
                  : 'bg-elevated text-text-secondary hover:bg-elevated/80'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => onPeriodChange('monthly')}
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
        <div className="h-80" style={{ height: '320px' }}>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey={
                  revenueChartPeriod === 'daily' ? 'time' : revenueChartPeriod === 'weekly' ? 'day' : 'week'
                }
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} tickFormatter={(value) => `$${value}`} />
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
  );
}

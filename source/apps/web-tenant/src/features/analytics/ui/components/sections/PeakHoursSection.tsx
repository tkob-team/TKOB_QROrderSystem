import React, { useEffect, useRef } from 'react';
import { Card } from '@/shared/components/Card';
import { logger } from '@/shared/utils/logger';
import { shouldLogBySignature } from '@/shared/logging/logDedupe';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

type Props = {
  data: Array<{ hour: string; orders: number }>;
};

export function PeakHoursSection({ data }: Props) {
  const lastSigRef = useRef<string>('');

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
      // Dedupe: only log when actual data content changes, not on harmless rerenders
      const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
      const sig = `len:${data.length}|total:${totalOrders}|first:${data[0]?.hour}|last:${data[data.length - 1]?.hour}`;
      if (!shouldLogBySignature(lastSigRef, sig)) {
        return; // Same data, skip log
      }

      logger.info('[ui] CHART_SERIES_APPLIED', {
        feature: 'analytics',
        chartType: 'peakHours',
        dataPoints: data.length,
        sample: process.env.NEXT_PUBLIC_LOG_DATA === 'true' && data[0]
          ? data[0]
          : undefined,
      });
    }
  }, [data]);
  return (
    <Card className="p-6 shadow-sm">
      <div className="flex flex-col gap-6">
        <h3 className="text-text-primary text-lg font-semibold">Peak Hours</h3>
        <div className="h-96" style={{ height: '384px' }}>
          <ResponsiveContainer width="100%" height={384}>
            <BarChart data={data}>
              <defs>
                <linearGradient id="peakHoursGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={1} />
                  <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0.8} />
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
  );
}

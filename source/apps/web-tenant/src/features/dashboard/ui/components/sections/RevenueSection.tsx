import { Card } from '@/shared/components';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueDataPoint, ChartPeriod, RangeOption } from '../../../model/types';

interface RevenueSectionProps {
  revenueChartData: RevenueDataPoint[];
  chartPeriod: ChartPeriod;
  rangeFilter: RangeOption;
  chartsRef: React.RefObject<HTMLDivElement>;
}

export function RevenueSection({
  revenueChartData,
  chartPeriod,
  rangeFilter,
  chartsRef,
}: RevenueSectionProps) {
  return (
    <Card className="p-4 md:p-6 col-span-1 lg:col-span-2">
      <div className="flex flex-col gap-4 md:gap-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-base md:text-lg font-bold text-text-primary">Revenue Trend</h3>
            <p className="text-xs text-text-tertiary">Showing data for: {rangeFilter}</p>
          </div>
        </div>
        <div className="w-full h-64 md:h-[300px]" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height={300}>
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
  );
}

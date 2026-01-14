import React from 'react';
import { Card } from '@/shared/components/Card';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

type Props = {
  data: Array<{ date: string; orders: number }>;
};

export function OrdersTrendSection({ data }: Props) {
  return (
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
        <div className="h-80" style={{ height: '320px' }}>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '13px' }} />
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
  );
}

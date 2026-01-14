import React, { useEffect, useRef } from 'react';
import { Card } from '@/shared/components/Card';
import { logger } from '@/shared/utils/logger';
import { shouldLogBySignature } from '@/shared/logging/logDedupe';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts';

type TopSellingItem = {
  rank: number;
  itemName: string;
  category: string;
  orders: number;
  revenue: number;
  trendPercent: number;
};

type Props = {
  items: TopSellingItem[];
  variant: 'chart' | 'table';
};

const BAR_COLORS = ['#10B981', '#14B8A6', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'];

export function TopSellingSection({ items, variant }: Props) {
  const lastSigRef = useRef<string>('');

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
      // Dedupe: only log when actual items content changes, not on harmless rerenders
      const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);
      const sig = `${variant}|len:${items.length}|rev:${totalRevenue}|first:${items[0]?.itemName}`;
      if (!shouldLogBySignature(lastSigRef, sig)) {
        return; // Same data, skip log
      }

      logger.info('[ui] CHART_SERIES_APPLIED', {
        feature: 'analytics',
        chartType: 'topSelling',
        variant,
        itemsCount: items.length,
        sample: process.env.NEXT_PUBLIC_LOG_DATA === 'true' && items[0]
          ? {
              rank: items[0].rank,
              itemName: items[0].itemName,
              orders: items[0].orders,
              revenue: items[0].revenue,
            }
          : undefined,
      });
    }
  }, [items, variant]);
  if (variant === 'chart') {
    return (
      <Card className="p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <h3 className="text-text-primary text-lg font-semibold">Popular Items</h3>
          <div className="h-96" style={{ height: '384px' }}>
            <ResponsiveContainer width="100%" height={384}>
              <BarChart data={items} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: '13px' }} />
                <YAxis type="category" dataKey="itemName" stroke="#9CA3AF" style={{ fontSize: '12px' }} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="orders" radius={[0, 8, 8, 0]}>
                  {items.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex flex-col gap-6">
        <h3 className="text-text-primary text-lg font-semibold">Top Selling Items</h3>
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
              {items.map((item) => {
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
                    <td className="px-4 py-4 border-b border-default text-sm font-semibold text-text-primary">{item.itemName}</td>
                    <td className="px-4 py-4 border-b border-default text-sm text-text-secondary">{item.category}</td>
                    <td className="px-4 py-4 border-b border-default text-right text-sm font-semibold text-text-primary">{item.orders}</td>
                    <td className="px-4 py-4 border-b border-default text-right text-sm font-semibold text-text-primary">${'{'}item.revenue.toLocaleString(){'}'}</td>
                    <td className="px-4 py-4 border-b border-default text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-semibold ${
                          item.trendPercent > 0 ? 'text-success-text' : 'text-error-text'
                        }`}
                      >
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
  );
}

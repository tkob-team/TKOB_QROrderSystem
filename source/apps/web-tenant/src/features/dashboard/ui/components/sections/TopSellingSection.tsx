import { Card } from '@/shared/components';
import { ArrowRight } from 'lucide-react';
import type { TopSellingItem } from '../../../model/types';

interface TopSellingSectionProps {
  topSellingItems: TopSellingItem[];
}

export function TopSellingSection({ topSellingItems }: TopSellingSectionProps) {
  const rankColors = [
    'from-yellow-400 to-amber-500', // 1st
    'from-gray-300 to-gray-400', // 2nd
    'from-amber-600 to-orange-500', // 3rd
    'from-emerald-400 to-teal-500',
    'from-blue-400 to-indigo-500',
    'from-purple-400 to-pink-500',
  ];

  return (
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
          {topSellingItems.slice(0, 6).map((item, index) => (
            <div
              key={item.rank}
              className="flex items-center gap-4 p-4 rounded-lg bg-secondary border border-default hover:border-accent-300 hover:shadow-lg transition-all duration-200 group"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${rankColors[index] || rankColors[0]} text-white text-base font-bold shrink-0 shadow-md`}
              >
                {item.rank}
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-500 transition-colors">
                  {item.name}
                </span>
                <span className="text-xs text-text-tertiary">{item.orders} orders</span>
              </div>
              <span className="text-sm font-bold text-accent-500 shrink-0">${item.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

import { Card, Badge } from '@/shared/components';
import { ArrowRight } from 'lucide-react';
import type { RecentOrder } from '../../../model/types';
import { getStatusBadgeVariant } from '../../../utils/dashboard';

interface RecentOrdersSectionProps {
  recentOrdersList: RecentOrder[];
  tableRef: React.RefObject<HTMLDivElement>;
}

export function RecentOrdersSection({
  recentOrdersList,
  tableRef,
}: RecentOrdersSectionProps) {
  return (
    <Card ref={tableRef} className="p-6 opacity-0 border border-default">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">Recent Orders</h3>
          <a
            href="/admin/orders"
            className="text-sm text-emerald-500 hover:text-emerald-600 font-semibold transition-colors flex items-center gap-1 hover:gap-2"
          >
            Go to Orders Page
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-default bg-elevated">
                <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Item Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Qty
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Order Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrdersList.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-default hover:bg-accent-500/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                        <span className="text-lg">🍽️</span>
                      </div>
                      <span className="text-sm font-medium text-text-primary">{order.items}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-text-secondary">{order.table}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-text-secondary">{order.time}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-bold text-text-primary">{order.total}</span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <button className="w-8 h-8 rounded-full bg-accent-100 text-accent-600 hover:bg-accent-200 flex items-center justify-center transition-colors">
                      ✓
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

import { Card } from '@/shared/components';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { OrderStatusData } from '../../../model/types';

interface OrdersByStatusSectionProps {
  ordersByStatus: OrderStatusData[];
}

export function OrdersByStatusSection({ ordersByStatus }: OrdersByStatusSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-5">
        <h3 className="text-lg font-bold text-neutral-900">Orders by Status</h3>
        <div className="flex items-center justify-center" style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersByStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {ordersByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e1e1dc',
                  borderRadius: '8px',
                  fontSize: '13px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value, entry: any) => (
                  <span style={{ fontSize: '12px', color: '#87877f' }}>
                    {value} ({entry.payload.value})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

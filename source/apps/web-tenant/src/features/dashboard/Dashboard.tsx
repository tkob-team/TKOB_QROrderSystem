import React from 'react';
import { Card } from '@/shared/components/ui/Card';
import { ShoppingBag, DollarSign, TrendingUp, Grid } from 'lucide-react';
import "../../styles/globals.css";

interface DashboardProps {
  onNavigate?: (screen: string) => void;
}

const kpis = [
  {
    title: "Today's Orders",
    value: '124',
    icon: ShoppingBag,
    trend: { value: '12% from yesterday', isPositive: true },
  },
  {
    title: "Today's Revenue",
    value: '$2,845',
    icon: DollarSign,
    trend: { value: '8% from yesterday', isPositive: true },
  },
  {
    title: 'Average Order Value',
    value: '$22.94',
    icon: TrendingUp,
    trend: { value: '3% from yesterday', isPositive: false },
  },
  {
    title: 'Active Tables',
    value: '12/24',
    icon: Grid,
  },
];

const recentOrders = [
  { id: '#1234', table: 'Table 5', total: '$45.50', status: 'completed', time: '12:30 PM' },
  { id: '#1233', table: 'Table 3', total: '$32.00', status: 'preparing', time: '12:15 PM' },
  { id: '#1232', table: 'Table 8', total: '$67.80', status: 'ready', time: '12:05 PM' },
  { id: '#1231', table: 'Table 2', total: '$28.90', status: 'completed', time: '11:50 AM' },
  { id: '#1230', table: 'Table 7', total: '$54.20', status: 'completed', time: '11:35 AM' },
];

const statusVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'preparing':
      return 'warning';
    case 'ready':
      return 'info';
    default:
      return 'neutral';
  }
};

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-900">Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-600" style={{ fontSize: '13px' }}>{kpi.title}</span>
                  <span className="text-gray-900" style={{ fontSize: '24px', fontWeight: 700 }}>{kpi.value}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <kpi.icon className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              {kpi.trend && (
                <div className="mt-3">
                  <span
                    className={kpi.trend.isPositive ? 'text-emerald-600' : 'text-red-600'}
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    {kpi.trend.value}
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Recent Orders</h3>
            <button
              onClick={() => onNavigate?.('orders')}
              className="text-emerald-500 hover:text-emerald-600 transition-colors"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>Order #</th>
                  <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>Table</th>
                  <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>Total</th>
                  <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>Status</th>
                  <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>{order.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900" style={{ fontSize: '14px' }}>{order.table}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>{order.total}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`status-badge status-${statusVariant(order.status)}`}
                        style={{ fontSize: '12px', fontWeight: 600 }}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600" style={{ fontSize: '14px' }}>{order.time}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;

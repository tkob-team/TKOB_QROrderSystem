import React from 'react';
import { KPICard } from '@/shared/components/KPICard';
import { ShoppingBag, DollarSign, TrendingUp, Table } from 'lucide-react';
import type { KPIOverview } from '../../../model/types';
import { formatCurrency } from '@/shared/utils/helpers';

interface KPICardsSectionProps {
  data?: KPIOverview;
  isLoading?: boolean;
}

export function KPICardsSection({ data, isLoading }: KPICardsSectionProps) {
  const revenue = data?.thisMonth.revenue || 0;
  const orders = data?.thisMonth.orders || 0;
  const avgOrderValue = data?.avgOrderValue || 0;
  const activeTables = data?.activeTables || 0;
  
  const revenueGrowth = data?.growth.revenue || 0;
  const ordersGrowth = data?.growth.orders || 0;

  return (
    <div className="grid grid-cols-4 gap-6">
      <KPICard
        title="Total Revenue (This Month)"
        value={isLoading ? '-' : formatCurrency(revenue)}
        icon={DollarSign}
        trend={{ value: Math.abs(revenueGrowth), isPositive: revenueGrowth >= 0 }}
      />
      <KPICard
        title="Total Orders (This Month)"
        value={isLoading ? '-' : orders.toLocaleString()}
        icon={ShoppingBag}
        trend={{ value: Math.abs(ordersGrowth), isPositive: ordersGrowth >= 0 }}
      />
      <KPICard
        title="Avg Order Value"
        value={isLoading ? '-' : formatCurrency(avgOrderValue)}
        icon={TrendingUp}
        trend={{ value: 0, isPositive: true }}
      />
      <KPICard
        title="Active Tables"
        value={isLoading ? '-' : activeTables.toString()}
        icon={Table}
        trend={undefined}
      />
    </div>
  );
}

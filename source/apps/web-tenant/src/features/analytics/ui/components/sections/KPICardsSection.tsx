import React from 'react';
import { KPICard } from '@/shared/components/KPICard';
import { ShoppingBag, DollarSign, TrendingUp, Clock } from 'lucide-react';

export function KPICardsSection() {
  return (
    <div className="grid grid-cols-4 gap-6">
      <KPICard
        title="Total Revenue"
        value="$28,450"
        icon={DollarSign}
        trend={{ value: 15, isPositive: true }}
      />
      <KPICard
        title="Total Orders"
        value="1,248"
        icon={ShoppingBag}
        trend={{ value: 12, isPositive: true }}
      />
      <KPICard
        title="Avg Order Value"
        value="$22.79"
        icon={TrendingUp}
        trend={{ value: 3, isPositive: true }}
      />
      <KPICard
        title="Avg Prep Time"
        value="14 min"
        icon={Clock}
        trend={{ value: -2, isPositive: false }}
      />
    </div>
  );
}

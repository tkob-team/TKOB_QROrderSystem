import { StatCard } from '@/shared/components';
import { ShoppingBag, DollarSign, TrendingUp, Grid } from 'lucide-react';
import type { KPIData } from '../../../model/types';

interface KPISectionProps {
  currentKPI: KPIData | undefined;
  kpiGridRef: React.RefObject<HTMLDivElement>;
}

export function KPISection({ currentKPI, kpiGridRef }: KPISectionProps) {
  if (!currentKPI) return null;

  return (
    <div ref={kpiGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        className="stat-card opacity-0"
        title="Total Revenue"
        value={currentKPI.revenue.value}
        icon={DollarSign}
        variant="primary"
        trend={`${currentKPI.revenue.trend > 0 ? '+' : ''}${currentKPI.revenue.trend.toFixed(1)}%`}
        trendDirection={currentKPI.revenue.trend > 0 ? 'up' : 'down'}
      />
      <StatCard
        className="stat-card opacity-0"
        title="Total Orders"
        value={currentKPI.orders.value}
        icon={ShoppingBag}
        variant="success"
        trend={`${currentKPI.orders.trend > 0 ? '+' : ''}${currentKPI.orders.trend.toFixed(1)}%`}
        trendDirection={currentKPI.orders.trend > 0 ? 'up' : 'down'}
      />
      <StatCard
        className="stat-card opacity-0"
        title="Avg Order Value"
        value={currentKPI.avgOrder.value}
        icon={TrendingUp}
        variant="warning"
        trend={`${currentKPI.avgOrder.trend > 0 ? '+' : ''}${currentKPI.avgOrder.trend.toFixed(1)}%`}
        trendDirection={currentKPI.avgOrder.trend > 0 ? 'up' : 'down'}
      />
      <StatCard
        className="stat-card opacity-0"
        title="Active Tables"
        value={currentKPI.tables.value}
        icon={Grid}
        variant="info"
      />
    </div>
  );
}

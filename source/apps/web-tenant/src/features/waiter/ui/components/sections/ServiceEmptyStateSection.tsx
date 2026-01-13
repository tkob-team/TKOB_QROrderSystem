/**
 * Service Empty State Section
 * Display when no orders in current tab
 * Presentational only - accepts props, no hooks or data access
 */

'use client';

import type { OrderStatus } from '../../../model/types';
import { SERVICE_TABS } from '../../../model/constants';

interface EmptyOrdersStateProps {
  activeTab: OrderStatus;
}

/**
 * ServiceEmptyStateSection Component
 * Shows friendly empty state message when tab has no orders
 */
export function ServiceEmptyStateSection({ activeTab }: EmptyOrdersStateProps) {
  const tab = SERVICE_TABS.find((t) => t.id === activeTab);

  return (
    <div className="p-12 text-center bg-white rounded-lg shadow-sm">
      <div className="flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-elevated rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">✅</span>
        </div>
        <h4 className="text-text-primary mb-2 text-lg font-semibold">
          No orders
        </h4>
        <p className="text-text-secondary text-[15px]">
          No {tab?.label.toLowerCase()} orders at the moment
        </p>
      </div>
    </div>
  );
}

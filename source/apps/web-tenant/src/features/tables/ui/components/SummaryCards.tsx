/**
 * SummaryCards - Table Statistics Overview
 * 
 * Displays summary statistics for tables
 * Shows total tables, available, occupied, and total capacity
 */

import React from 'react';
import { Card } from '@/shared/components';
import type { TableSummary } from '@/features/tables/model/types';

interface SummaryCardsProps {
  summary: TableSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="p-4 sm:p-5">
        <p className="text-text-tertiary mb-1 text-xs font-medium uppercase tracking-wide">
          Total Tables
        </p>
        <p className="text-text-primary" style={{ fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: 700 }}>
          {summary.total}
        </p>
      </Card>
      
      <Card className="p-4 sm:p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20">
        <p className="text-green-400 mb-1 text-xs font-medium uppercase tracking-wide">
          Available
        </p>
        <p className="text-green-500" style={{ fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: 700 }}>
          {summary.available}
        </p>
      </Card>
      
      <Card className="p-4 sm:p-5 bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20">
        <p className="text-red-400 mb-1 text-xs font-medium uppercase tracking-wide">
          Occupied
        </p>
        <p className="text-red-500" style={{ fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: 700 }}>
          {summary.occupied}
        </p>
      </Card>
      
      <Card className="p-4 sm:p-5">
        <p className="text-text-tertiary mb-1 text-xs font-medium uppercase tracking-wide">
          Total Capacity
        </p>
        <p className="text-text-primary" style={{ fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: 700 }}>
          {summary.totalCapacity}
        </p>
      </Card>
    </div>
  );
}

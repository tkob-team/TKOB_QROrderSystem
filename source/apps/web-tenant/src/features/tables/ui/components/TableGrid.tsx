/**
 * TableGrid - Grid Layout for Table Cards
 * 
 * Displays tables in a responsive grid layout
 * Shows empty state when no tables match filters
 */

import React from 'react';
import { QrCode } from 'lucide-react';
import { TableCard } from './TableCard';
import type { Table } from '@/features/tables/model/types';

interface TableGridProps {
  tables: Table[];
  onEdit: (table: Table) => void;
  onViewQR: (table: Table) => void;
}

export function TableGrid({ tables, onEdit, onViewQR }: TableGridProps) {
  if (tables.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-elevated rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-10 h-10 text-text-tertiary" />
        </div>
        <h3 className="text-text-primary mb-2 text-lg font-bold">
          No tables found
        </h3>
        <p className="text-text-secondary text-[15px]">
          Try adjusting your filters or add a new table
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onEdit={onEdit}
          onViewQR={onViewQR}
        />
      ))}
    </div>
  );
}

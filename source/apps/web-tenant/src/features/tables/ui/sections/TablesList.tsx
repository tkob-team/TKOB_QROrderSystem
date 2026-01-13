'use client';

import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { SummaryCards, TableFilters, TableGrid } from '../components';
import type { TablesListProps } from '../../domain/types';

export function TablesList({
  summary,
  isLoading,
  tables,
  filters,
  onClearFilters,
  onEdit,
  onViewQR,
}: TablesListProps) {
  return (
    <>
      <SummaryCards summary={summary} />

      <TableFilters
        selectedStatus={filters.selectedStatus}
        selectedZone={filters.selectedZone}
        sortOption={filters.sortOption}
        onStatusChange={filters.setSelectedStatus}
        onZoneChange={filters.setSelectedZone}
        onSortChange={filters.setSortOption}
        activeOnly={filters.activeOnly}
        onActiveOnlyChange={filters.setActiveOnly}
        locations={filters.locations}
        onClearFilters={onClearFilters}
      />

      {isLoading ? (
        <div className="text-center py-16">
          <RefreshCcw className="w-8 h-8 animate-spin text-text-tertiary mx-auto mb-4" />
          <p className="text-text-secondary text-[15px]">Loading tables...</p>
        </div>
      ) : (
        <TableGrid tables={tables} onEdit={onEdit} onViewQR={onViewQR} />
      )}
    </>
  );
}

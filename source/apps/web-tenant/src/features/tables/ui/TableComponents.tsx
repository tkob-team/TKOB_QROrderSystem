/**
 * Tables Feature - UI Components
 * 
 * Colocated components for tables management UI
 * Following feature-based architecture with component colocation
 */

import React from 'react';
import { Users, MapPin, Edit, QrCode, Eye } from 'lucide-react';
import { Card, Select } from '@/shared/components';
import { StatusPill, TABLE_STATUS_CONFIG } from '@/shared/patterns';
import { ZONE_LABELS, STATUS_FILTER_OPTIONS, ZONE_FILTER_OPTIONS, SORT_OPTIONS } from '../constants';
import type { Table, TableSummary, SortOption } from '../types';

// ============================================================================
// SUMMARY CARDS
// ============================================================================

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

// ============================================================================
// TABLE FILTERS
// ============================================================================

interface TableFiltersProps {
  selectedStatus: string;
  selectedZone: string;
  sortOption: SortOption;
  onStatusChange: (status: string) => void;
  onZoneChange: (zone: string) => void;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
}

export function TableFilters({
  selectedStatus,
  selectedZone,
  sortOption,
  onStatusChange,
  onZoneChange,
  onSortChange,
  onClearFilters,
}: TableFiltersProps) {
  const hasActiveFilters = selectedStatus !== 'All' || selectedZone !== 'All Locations';

  return (
    <div className="flex flex-col md:flex-row lg:flex-nowrap md:items-center gap-3 md:gap-4 mb-4">
      {/* Status Filter */}
      <div className="flex-1">
        <Select
          options={STATUS_FILTER_OPTIONS.map((option) => ({
            value: option,
            label: option,
          }))}
          value={selectedStatus}
          onChange={onStatusChange}
          size="lg"
          triggerClassName="w-full font-medium"
        />
      </div>

      {/* Zone Filter */}
      <div className="flex-1">
        <Select
          options={ZONE_FILTER_OPTIONS.map((option) => ({
            value: option,
            label: option,
          }))}
          value={selectedZone}
          onChange={onZoneChange}
          size="lg"
          triggerClassName="w-full font-medium"
        />
      </div>

      {/* Sort Filter */}
      <div className="flex-1">
        <Select
          options={SORT_OPTIONS.map((option) => ({
            value: option,
            label: option,
          }))}
          value={sortOption}
          onChange={(value) => onSortChange(value as SortOption)}
          size="lg"
          triggerClassName="w-full font-medium"
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="px-4 sm:px-5 py-3 bg-elevated hover:bg-secondary text-text-secondary transition-colors whitespace-nowrap rounded-lg"
          style={{ fontSize: 'clamp(13px, 4vw, 15px)', fontWeight: 600, height: '48px' }}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

// ============================================================================
// TABLE CARD
// ============================================================================

interface TableCardProps {
  table: Table;
  onEdit: (table: Table) => void;
  onViewQR: (table: Table) => void;
}

export function TableCard({ table, onEdit, onViewQR }: TableCardProps) {
  return (
    <Card
      className="p-5 sm:p-6 hover-lift transition-all cursor-pointer border-2 border-default hover:border-accent-500"
      onClick={() => onViewQR(table)}
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-text-primary mb-1 truncate" style={{ fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 700 }}>
              {table.name}
            </h3>
            <div className="flex items-center gap-2">
              <StatusPill 
                {...TABLE_STATUS_CONFIG[table.status]} 
                size="sm"
              />
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(table);
            }}
            className="p-2 hover:bg-elevated rounded-lg transition-colors shrink-0"
          >
            <Edit className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-text-secondary">
            <Users className="w-4 h-4 shrink-0" />
            <span style={{ fontSize: 'clamp(13px, 3vw, 15px)', fontWeight: 500 }}>
              {table.capacity} seats
            </span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <MapPin className="w-4 h-4 shrink-0" />
            <span style={{ fontSize: 'clamp(13px, 3vw, 15px)', fontWeight: 500 }}>
              {ZONE_LABELS[table.zone]}
            </span>
          </div>
        </div>

        {/* Description */}
        {table.description && (
          <p className="text-text-secondary line-clamp-2" style={{ fontSize: 'clamp(13px, 3vw, 14px)', lineHeight: '1.6' }}>
            {table.description}
          </p>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-default flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewQR(table);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-colors rounded-lg"
            style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 600 }}
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">View QR</span>
            <span className="sm:hidden">QR</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(table);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-elevated hover:bg-secondary text-text-secondary transition-colors rounded-lg"
            style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 600 }}
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
            <span className="sm:hidden">Edit</span>
          </button>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// TABLE GRID
// ============================================================================

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

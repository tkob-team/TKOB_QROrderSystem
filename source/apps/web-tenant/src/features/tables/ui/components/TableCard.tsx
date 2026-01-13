/**
 * TableCard - Individual Table Display Card
 * 
 * Displays a single table with its information
 * Shows status, capacity, location, and action buttons
 */

import React from 'react';
import { Users, MapPin, Edit, QrCode } from 'lucide-react';
import { Card } from '@/shared/components';
import { StatusPill, TABLE_STATUS_CONFIG } from '@/shared/patterns';
import type { Table } from '@/features/tables/model/types';

interface TableCardProps {
  table: Table;
  onEdit: (table: Table) => void;
  onViewQR: (table: Table) => void;
}

export function TableCard({ table, onEdit, onViewQR }: TableCardProps) {
  return (
    <Card
      className="p-5 sm:p-6 hover-lift transition-all cursor-pointer border-2 border-default hover:border-accent-500 flex flex-col h-full"
      onClick={() => onViewQR(table)}
    >
      <div className="flex flex-col gap-4 flex-1">
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
            className="p-2 hover:bg-elevated rounded-lg transition-colors cursor-pointer shrink-0"
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
              {table.location}
            </span>
          </div>
        </div>

        {/* Description */}
        {table.description && (
          <p className="text-text-secondary line-clamp-2" style={{ fontSize: 'clamp(13px, 3vw, 14px)', lineHeight: '1.6' }}>
            {table.description}
          </p>
        )}
      </div>

      {/* Actions - pushed to bottom */}
      <div className="pt-3 border-t border-default flex gap-2 mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewQR(table);
          }}
          className="flex-1 flex items-center justify-center gap-2 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-colors cursor-pointer rounded-lg h-9"
          style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 600, lineHeight: '1.2' }}
        >
          <QrCode className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">View QR</span>
          <span className="sm:hidden">QR</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(table);
          }}
          className="flex-1 flex items-center justify-center gap-2 px-3 bg-elevated hover:bg-secondary text-text-secondary transition-colors cursor-pointer rounded-lg h-9"
          style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 600, lineHeight: '1.2' }}
        >
          <Edit className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Edit</span>
          <span className="sm:hidden">Edit</span>
        </button>
      </div>
    </Card>
  );
}

/**
 * Table Card Component
 * Displays a single table in the grid view
 */

'use client';

import React from 'react';
import { TableViewItem, TABLE_STATUS_CONFIG } from '../../../model/table-types';

interface TableCardProps {
  table: TableViewItem;
  selected?: boolean;
  onSelect: (table: TableViewItem) => void;
}

export function TableCard({ table, selected, onSelect }: TableCardProps) {
  const config = TABLE_STATUS_CONFIG[table.status];
  const hasActiveOrders = table.activeOrders.length > 0;
  const pendingOrders = table.activeOrders.filter(
    (o) => o.status === 'ready' || o.status === 'preparing'
  ).length;

  // Calculate time occupied
  const occupiedMinutes = table.occupiedSince
    ? Math.floor((Date.now() - new Date(table.occupiedSince).getTime()) / 60000)
    : 0;

  return (
    <button
      onClick={() => onSelect(table)}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5 text-left w-full
        ${config.bgColor} ${config.borderColor}
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${table.status === 'needs-service' ? 'animate-pulse' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-lg text-gray-900">{table.name}</span>
        <span className={`text-xl`}>{config.icon}</span>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.textColor} ${config.bgColor} border ${config.borderColor}`}>
        {config.label}
      </div>

      {/* Zone & Capacity */}
      <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
        {table.zone && <span>{table.zone}</span>}
        <span>•</span>
        <span>{table.capacity} chỗ</span>
      </div>

      {/* Active Session Info */}
      {table.status === 'occupied' && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {/* Guest count & time */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              👥 {table.guestCount || '?'} khách
            </span>
            <span className="text-gray-500">
              🕐 {occupiedMinutes} phút
            </span>
          </div>

          {/* Orders summary */}
          {hasActiveOrders && (
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                📋 {table.activeOrders.length} đơn
              </span>
              <span className="font-medium text-gray-900">
                {(table.totalSpent || 0).toLocaleString('vi-VN')}đ
              </span>
            </div>
          )}

          {/* Pending orders indicator */}
          {pendingOrders > 0 && (
            <div className="mt-2 px-2 py-1 bg-amber-100 rounded text-xs text-amber-800 text-center">
              {pendingOrders} items waiting
            </div>
          )}
        </div>
      )}

      {/* Reserved indicator */}
      {table.status === 'reserved' && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-purple-600">
            📅 Reserved
          </div>
        </div>
      )}

      {/* Needs service alert */}
      {table.status === 'needs-service' && (
        <div className="mt-3 px-2 py-1.5 bg-amber-100 border border-amber-300 rounded text-xs text-amber-800 text-center font-medium">
          🔔 Khách yêu cầu phục vụ
        </div>
      )}
    </button>
  );
}

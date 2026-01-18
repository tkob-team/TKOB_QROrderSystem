/**
 * Table Detail Panel
 * Sidebar showing selected table details and actions
 */

'use client';

import React from 'react';
import { X, Trash2, Plus, CreditCard, Clock, Users, Receipt } from 'lucide-react';
import { TableViewItem, TABLE_STATUS_CONFIG } from '../../../model/table-types';

interface TableDetailPanelProps {
  table: TableViewItem;
  onClose: () => void;
  onClearTable: (tableId: string) => void;
  onStartOrder: (tableId: string) => void;
}

export function TableDetailPanel({
  table,
  onClose,
  onClearTable,
  onStartOrder,
}: TableDetailPanelProps) {
  const config = TABLE_STATUS_CONFIG[table.status];
  const isOccupied = table.status === 'occupied' || table.status === 'needs-service';
  
  const occupiedMinutes = table.occupiedSince
    ? Math.floor((Date.now() - new Date(table.occupiedSince).getTime()) / 60000)
    : 0;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}p`;
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl">{table.name}</h2>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm ${config.textColor} ${config.bgColor}`}>
            {config.icon} {config.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Table Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Sức chứa</div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="font-medium">{table.capacity} chỗ</span>
            </div>
          </div>
          {table.zone && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Khu vực</div>
              <span className="font-medium">{table.zone}</span>
            </div>
          )}
        </div>

        {/* Session Info */}
        {isOccupied && (
          <div className="p-4 bg-blue-50 rounded-xl space-y-3">
            <h3 className="font-semibold text-blue-900">Phiên hiện tại</h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{table.guestCount || '?'} khách</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{formatTime(occupiedMinutes)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-700">Tổng chi tiêu</span>
                <span className="font-bold text-blue-900 text-lg">
                  {(table.totalSpent || 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Active Orders */}
        {table.activeOrders.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Đơn hàng ({table.activeOrders.length})</h3>
            
            <div className="space-y-2">
              {table.activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{order.orderNumber}</div>
                    <div className="text-xs text-gray-500">
                      {order.itemCount} món • {order.minutesAgo} phút trước
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {order.total.toLocaleString('vi-VN')}đ
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded ${
                      order.status === 'ready' ? 'bg-green-100 text-green-700' :
                      order.status === 'preparing' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'served' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status === 'ready' ? 'Ready' :
                       order.status === 'preparing' ? 'Preparing' :
                       order.status === 'served' ? 'Served' :
                       order.status === 'completed' ? 'Completed' : order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {/* Add order button */}
        <button
          onClick={() => onStartOrder(table.id)}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Order
        </button>

        {/* Clear table button - only if occupied */}
        {isOccupied && (
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to end the session for ${table.name}? All orders must be paid.`)) {
                onClearTable(table.id);
              }
            }}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Kết thúc phiên / Dọn bàn
          </button>
        )}
      </div>
    </div>
  );
}

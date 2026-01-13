'use client';

import React from 'react';
import { StatusPill, ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '@/shared/patterns';
import { Order } from '../../model/types';

interface OrderRowProps {
  order: Order;
  isSelected: boolean;
  isLast: boolean;
  onClick: () => void;
}

export function OrderRow({ order, isSelected, isLast, onClick }: OrderRowProps) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3.5 cursor-pointer transition-all relative ${
        !isLast ? 'border-b border-default' : ''
      } ${
        isSelected 
          ? 'bg-accent-500/10 border-l-4 border-l-accent-500' 
          : 'hover:bg-secondary border-l-4 border-l-transparent'
      }`}
    >
      <div className="flex items-center justify-between gap-5">
        {/* Left: Order Info */}
        <div className="flex items-center gap-5 flex-1">
          <div className="flex items-center gap-2.5 min-w-[140px]">
            <span className="text-text-primary text-base font-bold">
              {order.orderNumber}
            </span>
            <span className="text-text-secondary text-sm font-medium">
              {order.table}
            </span>
          </div>
          
          <span className="text-text-tertiary text-xs font-medium min-w-[60px]">
            {order.time}
          </span>

          <span className="text-text-tertiary text-xs">
            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Right: Status, Payment, Total */}
        <div className="flex items-center gap-3">
          <StatusPill {...ORDER_STATUS_CONFIG[order.orderStatus]} size="sm" />
          <StatusPill {...PAYMENT_STATUS_CONFIG[order.paymentStatus]} size="sm" />
          
          <span className="text-text-primary text-base font-bold min-w-[70px] text-right tabular-nums">
            ${order.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

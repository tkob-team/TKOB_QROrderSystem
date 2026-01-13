'use client';

import React from 'react';
import { StatusPill, ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '@/shared/patterns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Order } from '../../model/types';

interface DrawerHeaderProps {
  order: Order;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
}

export function DrawerHeader({
  order,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onClose,
}: DrawerHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-default bg-primary">
      <div className="flex items-center gap-3">
        <h3 className="text-text-primary text-xl font-bold">
          Order {order.orderNumber}
        </h3>
        <div className="flex gap-2">
          <StatusPill {...ORDER_STATUS_CONFIG[order.orderStatus]} size="sm" />
          <StatusPill {...PAYMENT_STATUS_CONFIG[order.paymentStatus]} size="sm" />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous/Next */}
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`p-2 rounded-lg transition-all ${
            canGoPrevious 
              ? 'hover:bg-elevated text-text-secondary active:bg-secondary' 
              : 'text-text-tertiary cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`p-2 rounded-lg transition-all ${
            canGoNext 
              ? 'hover:bg-elevated text-text-secondary active:bg-secondary' 
              : 'text-text-tertiary cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="p-2 hover:bg-elevated active:bg-secondary transition-colors ml-1.5 rounded-lg"
        >
          <X className="w-5 h-5 text-text-tertiary" />
        </button>
      </div>
    </div>
  );
}

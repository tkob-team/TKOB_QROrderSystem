'use client';

/**
 * Orders Feature - Order Detail Drawer
 * 
 * Sử dụng DetailDrawer pattern từ shared/patterns
 */

import React, { useEffect } from 'react';
import { Card } from '@/shared/components';
import { StatusPill, ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '@/shared/patterns';
import { Order } from '../../model/types';
import { OrderTimeline, OrderItemsList, DrawerHeader, DrawerActions } from '../components';

interface OrderDetailDrawerProps {
  isOpen: boolean;
  order: Order | null;
  orders: Order[];
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function OrderDetailDrawer({
  isOpen,
  order,
  orders,
  onClose,
  onAccept,
  onReject,
  onCancel,
  onNavigate,
}: OrderDetailDrawerProps) {
  // Body scroll lock + ESC handler
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  // Navigation availability
  const currentIndex = orders.findIndex(o => o.id === order.id);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < orders.length - 1;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-text-primary/10 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className="fixed top-0 right-0 h-full bg-white z-50 flex flex-col shadow-2xl"
        style={{ 
          width: '45%',
          maxWidth: '750px',
          minWidth: '520px',
          animation: 'slideInRight 0.25s ease-out'
        }}
      >
        {/* Header */}
        <DrawerHeader
          order={order}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onPrevious={() => onNavigate('prev')}
          onNext={() => onNavigate('next')}
          onClose={onClose}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            {/* Order Info + Timeline */}
            <Card className="p-5 shadow-sm border border-default">
              <div className="flex items-center gap-2.5 text-sm text-text-secondary mb-4">
                <span className="font-medium">
                  {order.table}
                </span>
                <span className="text-text-tertiary">•</span>
                <span>
                  {order.date} at {order.time}
                </span>
              </div>

              {/* Timeline */}
              <div className="pt-4 border-t border-default">
                <OrderTimeline order={order} />
              </div>
            </Card>

            {/* Items List */}
            <OrderItemsList order={order} />

            {/* Action Buttons */}
            <DrawerActions
              order={order}
              onAccept={onAccept}
              onReject={onReject}
              onCancel={onCancel}
            />
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

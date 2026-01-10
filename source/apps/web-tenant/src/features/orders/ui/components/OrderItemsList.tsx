'use client';

import React from 'react';
import { Card } from '@/shared/components';
import { Order } from '../../model/types';

interface OrderItemsListProps {
  order: Order;
}

export function OrderItemsList({ order }: OrderItemsListProps) {
  return (
    <Card className="p-5 shadow-sm border border-default">
      <h4 className="text-text-primary text-base font-bold mb-4">
        Order Items
      </h4>
      
      {/* Items */}
      <div className="flex flex-col gap-3.5">
        {order.items.map((item, index) => (
          <div key={index} className="flex items-start justify-between pb-3.5 border-b border-default last:border-0 last:pb-0">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-text-primary text-sm font-semibold">
                  {item.quantity}x {item.name}
                </span>
              </div>
              {item.modifiers && item.modifiers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {item.modifiers.map((mod, idx) => (
                    <span key={idx} className="text-text-secondary text-xs px-2 py-0.5 bg-elevated rounded-md">
                      {mod}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="text-text-primary text-sm font-semibold tabular-nums ml-3">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-5 pt-4 border-t border-default flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Subtotal</span>
          <span className="text-text-primary text-sm font-semibold tabular-nums">
            ${order.subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Tax</span>
          <span className="text-text-primary text-sm font-semibold tabular-nums">
            ${order.tax.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-default">
          <span className="text-text-primary text-base font-bold">Total</span>
          <span className="text-text-primary text-base font-bold tabular-nums">
            ${order.total.toFixed(2)}
          </span>
        </div>
      </div>
    </Card>
  );
}

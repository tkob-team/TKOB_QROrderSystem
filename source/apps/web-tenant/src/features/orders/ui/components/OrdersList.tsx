'use client';

import React from 'react';
import { EmptyState } from '@/shared/patterns';
import { ShoppingBag } from 'lucide-react';
import { Order } from '../../model/types';
import { OrderRow } from './OrderRow';

interface OrdersListProps {
  orders: Order[];
  selectedOrderId: string | null;
  onOrderClick: (order: Order) => void;
}

// Helper to group orders by date
function groupOrdersByDate(orders: Order[]): Record<string, Order[]> {
  const groups: Record<string, Order[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  orders.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);

    let dateKey: string;
    if (orderDate.getTime() === today.getTime()) {
      dateKey = 'Today';
    } else if (orderDate.getTime() === yesterday.getTime()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = orderDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: orderDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(order);
  });

  return groups;
}

export function OrdersList({ orders, selectedOrderId, onOrderClick }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl">
        <EmptyState
          icon={
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-gray-400" />
            </div>
          }
          title="No orders found"
          description="Try adjusting your filters to see more orders"
          className="py-16"
        />
      </div>
    );
  }

  // Group orders by date
  const groupedOrders = groupOrdersByDate(orders);

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(groupedOrders).map(([dateLabel, dateOrders]) => (
        <div key={dateLabel}>
          {/* Date Header */}
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-semibold text-gray-700">{dateLabel}</h3>
            <span className="text-xs text-gray-400 font-medium">
              {dateOrders.length} order{dateOrders.length !== 1 ? 's' : ''}
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Orders for this date */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {dateOrders.map((order, index) => (
              <OrderRow
                key={order.id}
                order={order}
                isSelected={selectedOrderId === order.id}
                isLast={index === dateOrders.length - 1}
                onClick={() => onOrderClick(order)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

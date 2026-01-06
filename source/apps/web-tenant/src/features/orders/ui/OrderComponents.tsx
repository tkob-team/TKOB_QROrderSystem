/**
 * Orders Feature - Sub-components
 * 
 * Extracted from OrdersPage để giảm độ phình.
 * Các component nhỏ colocate trong 1 file thay vì tạo nhiều folder.
 */

import React from 'react';
import { Card, Badge, Select } from '@/shared/components';
import { StatusPill, ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, EmptyState, Skeleton } from '@/shared/patterns';
import { Search, X, ChevronLeft, ChevronRight, ShoppingBag, Check } from 'lucide-react';
import { Order, OrderFilters } from '../types';
import { TIMELINE_STEPS, STEP_LABELS } from '../constants';

/* ============================================
   TOOLBAR: Search + Filters + Active Filters
   ============================================ */

interface OrdersToolbarProps {
  filters: OrderFilters;
  activeFilters: Array<{ key: string; label: string }>;
  onFilterChange: (key: keyof OrderFilters, value: string) => void;
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
}

export function OrdersToolbar({
  filters,
  activeFilters,
  onFilterChange,
  onRemoveFilter,
  onClearAll,
}: OrdersToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search orders by ID or table..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-default bg-secondary text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm rounded-lg h-10"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'placed', label: 'Placed' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'preparing', label: 'Preparing' },
              { value: 'ready', label: 'Ready' },
              { value: 'served', label: 'Served' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            value={filters.statusFilter}
            onChange={(value) => onFilterChange('statusFilter', value)}
            size="md"
            triggerClassName="min-w-[150px]"
          />

          <Select
            options={[
              { value: 'all', label: 'All Tables' },
              { value: 'Table 2', label: 'Table 2' },
              { value: 'Table 3', label: 'Table 3' },
              { value: 'Table 5', label: 'Table 5' },
              { value: 'Table 6', label: 'Table 6' },
              { value: 'Table 7', label: 'Table 7' },
              { value: 'Table 8', label: 'Table 8' },
              { value: 'Table 9', label: 'Table 9' },
              { value: 'Table 12', label: 'Table 12' },
            ]}
            value={filters.tableFilter}
            onChange={(value) => onFilterChange('tableFilter', value)}
            size="md"
            triggerClassName="min-w-[140px]"
          />

          <Select
            options={[
              { value: 'all', label: 'All Dates' },
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
            ]}
            value={filters.dateFilter}
            onChange={(value) => onFilterChange('dateFilter', value)}
            size="md"
            triggerClassName="min-w-[140px]"
          />
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-text-tertiary text-xs font-medium">
            Active:
          </span>
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => onRemoveFilter(filter.key)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-accent-500/10 border border-accent-500/20 text-accent-500 hover:bg-accent-500/20 transition-colors text-xs font-medium rounded-full"
            >
              {filter.label}
              <X className="w-3 h-3" />
            </button>
          ))}
          <button
            onClick={onClearAll}
            className="text-text-tertiary hover:text-text-secondary transition-colors text-xs font-medium underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================
   ORDER ROW: Single order item in list
   ============================================ */

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

/* ============================================
   ORDERS LIST: Container for order rows
   ============================================ */

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

/* ============================================
   ORDERS LIST SKELETON: Loading state
   ============================================ */

export function OrdersListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-secondary border border-default rounded-2xl overflow-hidden">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={`px-4 py-3.5 border-l-4 border-l-transparent ${
            index !== rows - 1 ? 'border-b border-default' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-5">
            {/* Left: Order Info */}
            <div className="flex items-center gap-5 flex-1">
              <div className="flex items-center gap-2.5 min-w-[140px]">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Right: Status, Payment, Total */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================
   ORDER TIMELINE: Progress visualization
   ============================================ */

interface OrderTimelineProps {
  order: Order;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  if (order.orderStatus === 'cancelled') {
    return (
      <div className="text-center py-6">
        <Badge variant="error">Order Cancelled</Badge>
        <p className="text-text-secondary text-sm mt-3 leading-relaxed">
          This order has been cancelled and will not be processed
        </p>
        {order.timeline.cancelled && (
          <p className="text-text-tertiary text-xs mt-2">
            Cancelled at {order.timeline.cancelled}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between relative">
      {/* Progress Line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-elevated">
        <div 
          className="h-full bg-accent-500 transition-all"
          style={{ 
            width: order.timeline.completed ? '100%' : 
                   order.timeline.ready ? '75%' : 
                   order.timeline.preparing ? '50%' : 
                   order.timeline.confirmed ? '25%' :
                   order.timeline.placed ? '0%' : '0%'
          }}
        />
      </div>

      {/* Steps */}
      {TIMELINE_STEPS.map((step) => {
        const isActive = order.timeline[step];
        
        return (
          <div key={step} className="flex flex-col items-center gap-2 relative z-10">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isActive 
                  ? 'bg-accent-500 text-white shadow-accent' 
                  : 'bg-elevated text-text-tertiary'
              }`}
            >
              {isActive && <Check className="w-5 h-5" />}
            </div>
            <div className="text-center">
              <p className={`text-xs font-semibold ${
                isActive ? 'text-text-primary' : 'text-text-tertiary'
              }`}>
                {STEP_LABELS[step]}
              </p>
              {isActive && (
                <p className="text-text-tertiary text-[10px] mt-0.5">
                  {order.timeline[step]}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================
   ORDER ITEMS LIST: Items + totals
   ============================================ */

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

/* ============================================
   DRAWER HEADER: Title + nav + close
   ============================================ */

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

/* ============================================
   DRAWER ACTIONS: Accept/Reject/Cancel buttons
   ============================================ */

interface DrawerActionsProps {
  order: Order;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
}

export function DrawerActions({ order, onAccept, onReject, onCancel }: DrawerActionsProps) {
  if (order.orderStatus === 'placed') {
    return (
      <div className="flex gap-3">
        <button
          onClick={onAccept}
          className="flex-1 px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 transition-colors rounded-lg text-sm font-semibold shadow-sm"
        >
          Accept & Send to Kitchen
        </button>
        <button
          onClick={onReject}
          className="flex-1 px-4 py-2.5 bg-white text-red-600 border-2 border-red-600 hover:bg-red-50 active:bg-red-100 transition-colors rounded-lg text-sm font-semibold"
        >
          Reject Order
        </button>
      </div>
    );
  }

  if (order.orderStatus === 'confirmed') {
    return (
      <button
        onClick={onCancel}
        className="w-full px-4 py-2.5 bg-white text-red-600 border-2 border-red-600 hover:bg-red-50 active:bg-red-100 transition-colors rounded-lg text-sm font-semibold"
      >
        Cancel Order
      </button>
    );
  }

  return null;
}

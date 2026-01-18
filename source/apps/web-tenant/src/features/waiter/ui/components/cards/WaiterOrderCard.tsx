/**
 * Waiter Order Card Component
 * Display order with status-based actions
 * Presentational only - accepts props, no hooks or data access
 */

'use client';

import React from 'react';
import { Card, Badge } from '@/shared/components';
import { StatusPill, PAYMENT_STATUS_CONFIG } from '@/shared/patterns';
import { Clock, ChevronDown, ChevronUp, QrCode, Banknote } from 'lucide-react';
import type { ServiceOrder, OrderStatus } from '../../../model/types';
import { ORDER_ACTION_CONFIG, BUTTON_HEIGHT } from '../../../model/constants';
import { OrderItemList } from './OrderItemList';


/**
 * WaiterOrderCard Props
 */
interface WaiterOrderCardProps {
  order: ServiceOrder;
  activeTab: OrderStatus;
  isExpanded: boolean;
  onToggleExpanded: (orderId: string) => void;
  onAcceptOrder: (order: ServiceOrder) => void;
  onRejectOrder: (order: ServiceOrder) => void;
  onCancelOrder: (order: ServiceOrder) => void;
  onMarkServed: (order: ServiceOrder) => void;
  onMarkCompleted: (order: ServiceOrder) => void;
  onMarkPaid: (order: ServiceOrder) => void;
  onCloseTable: (order: ServiceOrder) => void;
}

/**
 * Payment Method Badge Component
 */
function PaymentMethodBadge({ method }: { method: ServiceOrder['paymentMethod'] }) {
  if (method === 'SEPAY_QR') {
    return (
      <Badge variant="info" className="flex items-center gap-1">
        <QrCode className="w-3 h-3" />
        <span className="text-[10px]">QR Bank</span>
      </Badge>
    );
  }
  return (
    <Badge variant="warning" className="flex items-center gap-1">
      <Banknote className="w-3 h-3" />
      <span className="text-[10px]">Cash</span>
    </Badge>
  );
}


/**
 * WaiterOrderCard Props
 */
interface WaiterOrderCardProps {
  order: ServiceOrder;
  activeTab: OrderStatus;
  isExpanded: boolean;
  onToggleExpanded: (orderId: string) => void;
  onAcceptOrder: (order: ServiceOrder) => void;
  onRejectOrder: (order: ServiceOrder) => void;
  onCancelOrder: (order: ServiceOrder) => void;
  onMarkServed: (order: ServiceOrder) => void;
  onMarkCompleted: (order: ServiceOrder) => void;
  onMarkPaid: (order: ServiceOrder) => void;
  onCloseTable: (order: ServiceOrder) => void;
}

/**
 * WaiterOrderCard Component
 * Display order with status-based actions
 */
export function WaiterOrderCard({
  order,
  activeTab,
  isExpanded,
  onToggleExpanded,
  onAcceptOrder,
  onRejectOrder,
  onCancelOrder,
  onMarkServed,
  onMarkCompleted,
  onMarkPaid,
  onCloseTable,
}: WaiterOrderCardProps) {
  return (
    <Card
      className={`p-5 transition-all hover:shadow-lg shadow-sm ${
        activeTab === 'completed' ? 'opacity-75 bg-elevated' : 'bg-white'
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          {/* Order Number + Table */}
          <div>
            <span className="text-text-primary text-lg font-bold">
              {order.orderNumber}
            </span>
            <p className="text-text-primary mt-0.5 text-base font-semibold">
              {order.table}
            </p>
          </div>

          {/* Total + Badges */}
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-text-primary text-base font-bold">
              ${order.total.toFixed(2)}
            </span>
            <div className="flex flex-col gap-1">
              {/* Completed Badge */}
              {activeTab === 'completed' && (
                <Badge variant="default">
                  <span className="text-[11px]">Completed</span>
                </Badge>
              )}
              {/* Payment Method Badge (show on served/completed tabs) */}
              {(activeTab === 'served' || activeTab === 'completed') && (
                <PaymentMethodBadge method={order.paymentMethod} />
              )}
              {/* Payment Status Badge */}
              <StatusPill {...PAYMENT_STATUS_CONFIG[order.paymentStatus]} size="sm" />
            </div>
          </div>
        </div>

        {/* Time Info */}
        <div className="flex items-center gap-2 px-3 py-2 bg-elevated border border-default rounded-lg">
          <Clock className="w-4 h-4 text-text-secondary" />
          <div className="flex-1">
            <p className="text-text-primary text-[13px] font-semibold">
              {order.minutesAgo} {order.minutesAgo === 1 ? 'minute' : 'minutes'} ago
            </p>
            <p className="text-text-tertiary text-xs">
              {order.placedTime}
            </p>
          </div>
        </div>

        {/* Items List */}
        <OrderItemList
          items={order.items}
          isCollapsed={activeTab === 'preparing' && !isExpanded}
        />

        {/* Items Expansion Toggle (Preparing tab only) */}
        {activeTab === 'preparing' && (
          <button
            onClick={() => onToggleExpanded(order.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-elevated hover:bg-primary border border-default text-text-secondary rounded-lg transition-all text-sm font-semibold"
            style={{
              minHeight: ORDER_ACTION_CONFIG.preparing.primary.minHeight || BUTTON_HEIGHT.secondary,
            }}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                View Details
              </>
            )}
          </button>
        )}

        {/* Actions based on tab */}
        {activeTab === 'placed' && (
          <div className="flex flex-col gap-2">
            {/* Accept Button */}
            <button
              onClick={() => onAcceptOrder(order)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${ORDER_ACTION_CONFIG.placed.primary.className}`}
              style={{
                fontSize: '15px',
                fontWeight: 700,
                minHeight: BUTTON_HEIGHT.primary,
                boxShadow: ORDER_ACTION_CONFIG.placed.primary.shadow,
              }}
            >
              <ORDER_ACTION_CONFIG.placed.primary.icon className="w-5 h-5" />
              {ORDER_ACTION_CONFIG.placed.primary.label}
            </button>
            {/* Reject Button */}
            <button
              onClick={() => onRejectOrder(order)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${ORDER_ACTION_CONFIG.placed.secondary.className}`}
              style={{
                fontSize: '15px',
                fontWeight: 700,
                minHeight: BUTTON_HEIGHT.primary,
              }}
            >
              {React.createElement(ORDER_ACTION_CONFIG.placed.secondary.icon, { className: 'w-5 h-5' })}
              {ORDER_ACTION_CONFIG.placed.secondary.label}
            </button>
          </div>
        )}

        {activeTab === 'confirmed' && (
          <button
            onClick={() => onCancelOrder(order)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${ORDER_ACTION_CONFIG.confirmed.primary.className}`}
            style={{
              fontSize: '15px',
              fontWeight: 700,
              minHeight: BUTTON_HEIGHT.primary,
            }}
          >
            <ORDER_ACTION_CONFIG.confirmed.primary.icon className="w-5 h-5" />
            {ORDER_ACTION_CONFIG.confirmed.primary.label}
          </button>
        )}

        {activeTab === 'ready' && (
          <button
            onClick={() => onMarkServed(order)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${ORDER_ACTION_CONFIG.ready.primary.className}`}
            style={{
              fontSize: '15px',
              fontWeight: 700,
              minHeight: BUTTON_HEIGHT.primary,
              boxShadow: ORDER_ACTION_CONFIG.ready.primary.shadow,
            }}
          >
            <ORDER_ACTION_CONFIG.ready.primary.icon className="w-5 h-5" />
            {ORDER_ACTION_CONFIG.ready.primary.label}
          </button>
        )}

        {activeTab === 'served' && (
          <button
            onClick={() => onMarkCompleted(order)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${ORDER_ACTION_CONFIG.served.primary.className}`}
            style={{
              fontSize: '15px',
              fontWeight: 700,
              minHeight: BUTTON_HEIGHT.primary,
              boxShadow: ORDER_ACTION_CONFIG.served.primary.shadow,
            }}
          >
            <ORDER_ACTION_CONFIG.served.primary.icon className="w-5 h-5" />
            {ORDER_ACTION_CONFIG.served.primary.label}
          </button>
        )}

        {activeTab === 'completed' && (
          <>
            {/* For QR payments: they are auto-paid via webhook, just show close table */}
            {order.paymentMethod === 'SEPAY_QR' && order.paymentStatus === 'paid' && (
              <button
                onClick={() => onCloseTable(order)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${ORDER_ACTION_CONFIG.completed.paid.className}`}
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  minHeight: BUTTON_HEIGHT.primary,
                  boxShadow: ORDER_ACTION_CONFIG.completed.paid.shadow,
                }}
              >
                <ORDER_ACTION_CONFIG.completed.paid.icon className="w-5 h-5" />
                {ORDER_ACTION_CONFIG.completed.paid.label}
              </button>
            )}
            
            {/* For cash payments (BILL_TO_TABLE): need to mark as paid first if unpaid */}
            {order.paymentMethod === 'BILL_TO_TABLE' && order.paymentStatus === 'unpaid' && (
              <button
                onClick={() => onMarkPaid(order)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${ORDER_ACTION_CONFIG.completed.unpaid.className}`}
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  minHeight: BUTTON_HEIGHT.primary,
                  boxShadow: ORDER_ACTION_CONFIG.completed.unpaid.shadow,
                }}
              >
                <ORDER_ACTION_CONFIG.completed.unpaid.icon className="w-5 h-5" />
                Mark as Paid
              </button>
            )}
            
            {/* For cash payments: after marked paid, show close table */}
            {order.paymentMethod === 'BILL_TO_TABLE' && order.paymentStatus === 'paid' && (
              <button
                onClick={() => onCloseTable(order)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${ORDER_ACTION_CONFIG.completed.paid.className}`}
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  minHeight: BUTTON_HEIGHT.primary,
                  boxShadow: ORDER_ACTION_CONFIG.completed.paid.shadow,
                }}
              >
                <ORDER_ACTION_CONFIG.completed.paid.icon className="w-5 h-5" />
                {ORDER_ACTION_CONFIG.completed.paid.label}
              </button>
            )}
            
            {/* Handle edge case: QR payment but still unpaid (webhook failed) */}
            {order.paymentMethod === 'SEPAY_QR' && order.paymentStatus === 'unpaid' && (
              <div className="space-y-2">
                <p className="text-xs text-center text-amber-600">
                  ⚠️ QR payment not received. Verify or collect cash.
                </p>
                <button
                  onClick={() => onMarkPaid(order)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${ORDER_ACTION_CONFIG.completed.unpaid.className}`}
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    minHeight: BUTTON_HEIGHT.primary,
                    boxShadow: ORDER_ACTION_CONFIG.completed.unpaid.shadow,
                  }}
                >
                  <ORDER_ACTION_CONFIG.completed.unpaid.icon className="w-5 h-5" />
                  Mark as Paid
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

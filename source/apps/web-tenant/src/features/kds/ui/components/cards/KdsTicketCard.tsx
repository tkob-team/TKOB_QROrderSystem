/**
 * KDS Ticket Components
 * Components: KdsTicketCard, KdsTicketItemRow
 */

'use client';

import React from 'react';
import { Card } from '@/shared/components/Card';
import { Clock, AlertCircle } from 'lucide-react';
import type { KdsOrder, OrderItem, KdsButtonConfig } from '../../../model/types';

/**
 * KdsTicketItemRow Props
 */
interface KdsTicketItemRowProps {
  item: OrderItem;
}

/**
 * KDS Ticket Item Row
 * Displays order item with quantity, name, modifiers, and special notes
 */
export function KdsTicketItemRow({ item }: KdsTicketItemRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Item name with quantity */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-elevated rounded-md flex items-center justify-center shrink-0">
          <span className="text-text-primary" style={{ fontSize: '13px', fontWeight: 700 }}>
            {item.quantity}
          </span>
        </div>
        <span className="text-text-primary" style={{ fontSize: '15px', fontWeight: 600 }}>
          {item.name}
        </span>
      </div>

      {/* Modifiers */}
      {item.modifiers && item.modifiers.length > 0 && (
        <div className="ml-8 flex flex-col gap-1">
          {item.modifiers.map((modifier, modIndex) => (
            <div key={modIndex} className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-text-tertiary rounded-full" />
              <span
                className="text-text-secondary"
                style={{ fontSize: '13px', fontStyle: 'italic' }}
              >
                {modifier}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Special Notes */}
      {item.notes && (
        <div className="ml-8 mt-1 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span className="text-amber-400" style={{ fontSize: '12px', fontWeight: 600 }}>
              {item.notes}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * KdsTicketCard Props
 */
interface KdsTicketCardProps {
  order: KdsOrder;
  columnId: 'new' | 'preparing' | 'ready';
  buttonConfig: KdsButtonConfig;
  enableKitchenServe: boolean;
  loadingOrderId: string | null;
  onAction: (orderId: string, columnId: string) => void;
}

/**
 * KDS Ticket Card
 * Order card with header, items list, and action button
 */
export function KdsTicketCard({
  order,
  columnId,
  buttonConfig,
  enableKitchenServe,
  loadingOrderId,
  onAction,
}: KdsTicketCardProps) {
  const ButtonIcon = buttonConfig.icon;
  const isLoading = loadingOrderId === order.id;

  return (
    <Card
      className={`p-5 transition-all hover-lift ${
        order.isOverdue ? 'border-2 border-red-500 bg-red-500/10' : ''
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-text-primary" style={{ fontSize: '20px', fontWeight: 700 }}>
              {order.id}
            </span>
            <span className="text-text-secondary" style={{ fontSize: '15px', fontWeight: 500 }}>
              {order.table}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              order.isOverdue ? 'bg-red-500/20 border border-red-500/40' : 'bg-elevated'
            }`}
          >
            <Clock
              className={`w-4 h-4 ${order.isOverdue ? 'text-red-500' : 'text-text-tertiary'}`}
            />
            <span
              className={order.isOverdue ? 'text-red-500' : 'text-text-primary'}
              style={{ fontSize: '15px', fontWeight: 700 }}
            >
              {order.time} min
            </span>
          </div>
        </div>

        {/* Overdue Alert */}
        {order.isOverdue && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-red-400" style={{ fontSize: '13px', fontWeight: 600 }}>
              Exceeding standard preparation time
            </span>
          </div>
        )}

        {/* Items with Modifiers */}
        <div className="flex flex-col gap-3 py-3 border-y-2 border-default">
          {order.items.map((item, index) => (
            <KdsTicketItemRow key={index} item={item} />
          ))}
        </div>

        {/* Action Button */}
        {columnId === 'ready' && !enableKitchenServe ? (
          // For READY column when kitchen serve is disabled, show secondary message
          <div
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-elevated border-2 border-default text-text-tertiary rounded-lg"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              height: '48px',
            }}
          >
            Waiting for waiter to serve
          </div>
        ) : (
          <button
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              columnId === 'ready'
                ? 'bg-secondary hover:bg-elevated border-2 border-default text-text-secondary'
                : buttonConfig.className
            }`}
            style={{
              fontSize: '15px',
              fontWeight: columnId === 'ready' ? 600 : 700,
              height: '48px',
            }}
            onClick={() => onAction(order.id, columnId)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div
                  className={`w-5 h-5 border-2 rounded-full animate-spin ${
                    columnId === 'ready'
                      ? 'border-text-tertiary border-t-text-primary'
                      : 'border-white'
                  }`}
                />
                {columnId === 'ready' ? 'Marking served...' : buttonConfig.text}
              </>
            ) : (
              <>
                <ButtonIcon className="w-5 h-5" />
                {columnId === 'ready' ? 'Served (Fallback)' : buttonConfig.text}
              </>
            )}
          </button>
        )}
      </div>
    </Card>
  );
}

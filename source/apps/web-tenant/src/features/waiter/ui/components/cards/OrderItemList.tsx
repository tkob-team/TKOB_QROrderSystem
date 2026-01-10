/**
 * Order Item List Component
 * Display order items with modifiers
 * Presentational only - accepts props, no hooks or data access
 */

'use client';

import type { OrderItem } from '../../../model/types';

interface OrderItemListProps {
  items: OrderItem[];
  isCollapsed?: boolean;
}

/**
 * OrderItemList Component
 * Renders a list of order items with quantity and modifiers
 */
export function OrderItemList({ items, isCollapsed = false }: OrderItemListProps) {
  if (isCollapsed) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-[13px] font-semibold uppercase tracking-wide">
            Items ({items.length})
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-text-secondary text-[13px] font-semibold uppercase tracking-wide">
        Items ({items.length})
      </p>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            {/* Quantity Badge */}
            <span className="text-text-secondary text-[13px] font-semibold">
              {item.quantity}×
            </span>

            {/* Item Details */}
            <div className="flex-1">
              {/* Item Name */}
              <p className="text-text-primary text-[13px] font-medium">
                {item.name}
              </p>

              {/* Modifiers */}
              {item.modifiers && item.modifiers.length > 0 && (
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {item.modifiers.map((modifier, modIndex) => (
                    <div key={modIndex} className="flex items-center gap-1.5 text-text-tertiary">
                      <div className="w-1 h-1 bg-text-tertiary rounded-full" />
                      <span className="text-[11px] italic">{modifier}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

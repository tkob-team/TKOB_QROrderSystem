/**
 * KDS Column Section
 * Column containers with headers and empty state for order display
 */

'use client';

import React from 'react';
import { Card } from '@/shared/components/Card';
import { Check } from 'lucide-react';
import { KdsColumnConfig } from '../../../model/types';

// Color mapping for column display
const COLOR_MAP: Record<string, { hex: string; rgb: string }> = {
  blue: { hex: '#3B82F6', rgb: 'rgb(59, 130, 246)' },
  amber: { hex: '#F59E0B', rgb: 'rgb(245, 158, 11)' },
  emerald: { hex: '#10B981', rgb: 'rgb(16, 185, 129)' },
  red: { hex: '#EF4444', rgb: 'rgb(239, 68, 68)' },
};

export interface KdsColumnProps {
  column: KdsColumnConfig;
  orderCount: number;
  children?: React.ReactNode;
}

export interface KdsEmptyColumnProps {
  column: KdsColumnConfig;
}

export function KdsColumn({ column, orderCount, children }: KdsColumnProps) {
  const colorValue = COLOR_MAP[column.color] || COLOR_MAP.blue;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Column Header */}
      <div
        className="px-4 py-3 rounded-lg border-2"
        style={{ borderColor: colorValue.hex }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-text-tertiary"
              style={{
                fontSize: '12px',
                fontWeight: 500,
                opacity: 0.8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}
            >
              {column.title}
            </p>
            <p
              className="text-text-primary"
              style={{
                fontSize: '24px',
                fontWeight: 700,
              }}
            >
              {orderCount}
            </p>
          </div>
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: colorValue.hex,
              opacity: 0.1,
            }}
          >
            <Check className="w-6 h-6" style={{ color: colorValue.hex }} />
          </div>
        </div>
      </div>

      {/* Orders Container */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}

export function KdsEmptyColumn({ column }: KdsEmptyColumnProps) {
  const colorValue = COLOR_MAP[column.color] || COLOR_MAP.blue;

  return (
    <Card className="h-full flex items-center justify-center py-12">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            backgroundColor: colorValue.hex,
            opacity: 0.1,
          }}
        >
          <Check
            className="w-8 h-8"
            style={{ color: colorValue.hex, opacity: 0.5 }}
          />
        </div>
        <p
          className="text-text-tertiary"
          style={{
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          No orders in {column.title.toLowerCase()}
        </p>
      </div>
    </Card>
  );
}

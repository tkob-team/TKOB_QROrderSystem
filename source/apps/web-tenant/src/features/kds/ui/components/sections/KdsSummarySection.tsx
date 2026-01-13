/**
 * KDS Summary Section
 * Status summary pills showing counts for pending, cooking, ready, and overdue orders
 */

'use client';

import React from 'react';
import { KdsSummaryCounts } from '../../../model/types';

export interface KdsSummarySectionProps {
  counts: KdsSummaryCounts;
}

export function KdsSummarySection({ counts }: KdsSummarySectionProps) {
  const summaryItems = [
    {
      label: 'Pending',
      count: counts.pending,
      color: '#F59E0B', // Amber
      bgColor: '#FEF3C7', // Light amber bg
      textColor: '#92400E', // Dark amber text
    },
    {
      label: 'Cooking',
      count: counts.cooking,
      color: '#3B82F6', // Blue
      bgColor: '#DBEAFE', // Light blue bg
      textColor: '#1E40AF', // Dark blue text
    },
    {
      label: 'Ready',
      count: counts.ready,
      color: '#10B981', // Emerald
      bgColor: '#D1FAE5', // Light emerald bg
      textColor: '#065F46', // Dark emerald text
    },
    {
      label: 'Overdue',
      count: counts.overdue,
      color: '#EF4444', // Red
      bgColor: '#FEE2E2', // Light red bg
      textColor: '#7F1D1D', // Dark red text
    },
  ];

  return (
    <div className="p-6 bg-elevated border-b border-default">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="px-4 py-3 rounded-lg border-2"
            style={{
              backgroundColor: item.bgColor,
              borderColor: `${item.color}4D`, // 30% opacity via hex
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: item.textColor,
                opacity: 0.8,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: item.color,
                lineHeight: 1,
              }}
            >
              {item.count}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

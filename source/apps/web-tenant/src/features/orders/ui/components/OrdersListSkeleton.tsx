'use client';

import React from 'react';
import { Skeleton } from '@/shared/patterns';

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

'use client';

import React from 'react';
import { Badge } from '@/shared/components';
import { Check } from 'lucide-react';
import { Order } from '../../model/types';
import { TIMELINE_STEPS, STEP_LABELS } from '../../model/constants';

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

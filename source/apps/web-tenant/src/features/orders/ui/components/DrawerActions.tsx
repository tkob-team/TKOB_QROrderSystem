'use client';

import React from 'react';
import { Order } from '../../model/types';

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

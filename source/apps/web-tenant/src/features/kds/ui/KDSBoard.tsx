'use client';

import React from 'react';
import { Card } from '@/shared/components';
import '../../styles/globals.css';

export function KDSBoard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kitchen Display System</h1>
          <p className="text-gray-600 mt-2">Real-time order management for kitchen staff</p>
        </div>

        {/* Order Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* New Orders */}
          <div className="flex flex-col gap-4">
            <div className="bg-amber-500 text-white px-4 py-3 rounded-lg font-semibold">
              New Orders (0)
            </div>
            <Card className="p-6 text-center text-gray-500">
              No new orders
            </Card>
          </div>

          {/* In Progress */}
          <div className="flex flex-col gap-4">
            <div className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold">
              In Progress (0)
            </div>
            <Card className="p-6 text-center text-gray-500">
              No orders in progress
            </Card>
          </div>

          {/* Ready */}
          <div className="flex flex-col gap-4">
            <div className="bg-emerald-500 text-white px-4 py-3 rounded-lg font-semibold">
              Ready (0)
            </div>
            <Card className="p-6 text-center text-gray-500">
              No completed orders
            </Card>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-center">
            👨‍🍳 <strong>KDS Mode:</strong> This is the Kitchen Display System view. 
            Orders from customers will appear here in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default KDSBoard;

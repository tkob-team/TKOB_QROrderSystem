/**
 * TableOrdersGroup Component
 * Displays grouped orders from the same table/session with close table action
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CreditCard, Receipt } from 'lucide-react';
import type { TableOrdersGroup as TableOrdersGroupType } from '../../../model/types';
import { Card } from '@packages/ui';

interface TableOrdersGroupProps {
  tableGroup: TableOrdersGroupType;
  onCloseTable: (tableGroup: TableOrdersGroupType) => void;
  onMarkAsPaid: (tableGroup: TableOrdersGroupType) => void;
}

/**
 * Format currency - Backend returns amount in thousands (e.g., 43 = 43,000 VND)
 * Multiply by 1000 to get actual VND amount
 */
function formatCurrency(amount: number): string {
  const vndAmount = amount * 1000;
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(vndAmount) + ' $';
}

/**
 * TableOrdersGroup Component
 */
export function TableOrdersGroup({ tableGroup, onCloseTable, onMarkAsPaid }: TableOrdersGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if all orders are paid
  const allPaid = tableGroup.orders.every(order => order.paymentStatus === 'paid');
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-50 to-white border-b">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                {tableGroup.tableNumber}
              </h3>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                {tableGroup.orders.length} {tableGroup.orders.length === 1 ? 'order' : 'orders'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Session: {tableGroup.sessionId.slice(0, 8)}...
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Total</p>
            <p className="text-3xl font-bold text-emerald-600">
              {formatCurrency(tableGroup.totalAmount)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Orders List (Expandable) */}
      <div className="border-b">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-semibold text-gray-700">
            {isExpanded ? 'Hide' : 'Show'} order details
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {isExpanded && (
          <div className="px-6 pb-4 space-y-3">
            {tableGroup.orders.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.placedTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      <span className="font-medium">{item.quantity}x</span> {item.name}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <span className="text-gray-400 text-xs ml-2">
                          ({item.modifiers.join(', ')})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Payment Method */}
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  {order.paymentMethod === 'SEPAY_QR' ? (
                    <>
                      <CreditCard className="w-3 h-3" />
                      <span>QR Payment</span>
                    </>
                  ) : (
                    <>
                      <Receipt className="w-3 h-3" />
                      <span>Bill to Table</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="p-6 space-y-3">
        {/* Mark as Paid Button */}
        {!allPaid && (
          <button
            onClick={() => onMarkAsPaid(tableGroup)}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold text-lg transition-all bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
            style={{
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
            }}
          >
            <CreditCard className="w-6 h-6" />
            Mark all as paid
          </button>
        )}
        
        {/* Close Table Button */}
        <button
          onClick={() => onCloseTable(tableGroup)}
          disabled={!allPaid}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold text-lg transition-all ${
            allPaid
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          style={{
            boxShadow: allPaid ? '0 4px 14px 0 rgba(16, 185, 129, 0.39)' : 'none',
          }}
        >
          <Receipt className="w-6 h-6" />
          Close Table & Generate Bill
        </button>
        
        {!allPaid && (
          <p className="text-center text-sm text-amber-600">
            ⚠️ Please mark all orders as paid before closing table
          </p>
        )}
      </div>
    </Card>
  );
}

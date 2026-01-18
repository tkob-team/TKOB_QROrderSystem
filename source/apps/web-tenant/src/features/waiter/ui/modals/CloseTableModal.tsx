/**
 * CloseTableModal Component
 * Modal for closing table with discount/tip inputs and bill preview
 */

'use client';

import React, { useState } from 'react';
import { X, Receipt, Percent, DollarSign, StickyNote } from 'lucide-react';
import type { TableOrdersGroup, CloseTableData } from '../../../model/types';
import { Modal } from '@/shared/components';

interface CloseTableModalProps {
  tableGroup: TableOrdersGroup;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CloseTableData) => Promise<void>;
}

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * CloseTableModal Component
 */
export function CloseTableModal({
  tableGroup,
  isOpen,
  onClose,
  onConfirm,
}: CloseTableModalProps) {
  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const subtotal = tableGroup.totalAmount;
  const total = Math.max(0, subtotal - discount + tip);
  
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm({
        tableId: tableGroup.tableId,
        sessionId: tableGroup.sessionId,
        paymentMethod: 'BILL_TO_TABLE',
        discount: discount || 0,
        tip: tip || 0,
        notes: notes.trim() || undefined,
      });
      
      // Reset form
      setDiscount(0);
      setTip(0);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Failed to close table:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Receipt className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Close Table & Generate Bill</h2>
              <p className="text-sm text-emerald-100">{tableGroup.tableNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Orders Summary */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Orders ({tableGroup.orders.length})
            </h3>
            <div className="space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
              {tableGroup.orders.map((order) => (
                <div key={order.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{order.orderNumber}</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bill Calculation */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Bill Details</h3>
            
            {/* Subtotal */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold text-gray-900 text-lg">
                {formatCurrency(subtotal)}
              </span>
            </div>
            
            {/* Discount */}
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Percent className="w-4 h-4" />
                <span>Discount</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount || ''}
                  onChange={(e) => setDiscount(Math.min(subtotal, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="w-40 px-4 py-2 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <span className="text-gray-500 font-semibold">VND</span>
              </div>
            </div>
            
            {/* Tip */}
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>Tip</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={tip || ''}
                  onChange={(e) => setTip(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-40 px-4 py-2 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <span className="text-gray-500 font-semibold">VND</span>
              </div>
            </div>
            
            {/* Quick Tip Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setTip(Math.round(subtotal * 0.05))}
                className="flex-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                5%
              </button>
              <button
                onClick={() => setTip(Math.round(subtotal * 0.1))}
                className="flex-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                10%
              </button>
              <button
                onClick={() => setTip(Math.round(subtotal * 0.15))}
                className="flex-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                15%
              </button>
              <button
                onClick={() => setTip(0)}
                className="flex-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
            
            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span className="text-3xl font-bold text-emerald-600">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
          
          {/* Notes */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              <StickyNote className="w-4 h-4" />
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for this bill..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            style={{
              boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
            }}
          >
            {isSubmitting ? 'Generating Bill...' : 'Generate Bill & Close'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

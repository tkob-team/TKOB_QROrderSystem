'use client'

import { useState } from 'react'
import { X, Receipt, Printer, CreditCard, Banknote, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/services/axios'
import { printBill, type BillData } from '../../../utils/billPdf'

interface Order {
  id: string
  orderNumber?: string
  total: number
  subtotal?: number
  serviceCharge?: number
  tax?: number
  tip?: number  // Tip from customer (if already set during payment confirmation)
  items: Array<{
    id: string
    menuItemName?: string
    quantity: number
    unitPrice: number
    totalPrice?: number
    notes?: string
  }>
}

interface CloseTableModalProps {
  isOpen: boolean
  onClose: () => void
  tableId: string
  tableNumber: string
  sessionId: string
  orders: Order[]
  tenantName?: string
}

type PaymentMethod = 'CASH' | 'CARD' | 'BILL_TO_TABLE'

export function CloseTableModal({
  isOpen,
  onClose,
  tableId,
  tableNumber,
  sessionId,
  orders,
  tenantName = 'Restaurant',
}: CloseTableModalProps) {
  const queryClient = useQueryClient()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  
  // Initialize tip from orders (customer may have already set tip during payment confirmation)
  const existingTip = orders.reduce((sum, order) => sum + (order.tip || 0), 0)
  
  // Calculate discount from difference if orders have discounted totals
  const ordersSubtotal = orders.reduce((sum, order) => sum + (order.subtotal || 0), 0)
  const ordersTotal = orders.reduce((sum, order) => sum + (order.total || 0), 0)
  const ordersTax = orders.reduce((sum, order) => sum + (order.tax || 0), 0)
  const ordersServiceCharge = orders.reduce((sum, order) => sum + (order.serviceCharge || 0), 0)
  const existingDiscount = Math.max(0, ordersSubtotal + ordersTax + ordersServiceCharge + existingTip - ordersTotal)
  
  const [discount, setDiscount] = useState(existingDiscount)
  const [tip, setTip] = useState(existingTip)
  const [notes, setNotes] = useState('')

  // Calculate totals from all orders
  const subtotal = orders.reduce((sum, order) => sum + (order.subtotal || order.total), 0)
  const serviceCharge = orders.reduce((sum, order) => sum + (order.serviceCharge || 0), 0)
  const tax = orders.reduce((sum, order) => sum + (order.tax || 0), 0)
  const total = subtotal + serviceCharge + tax - discount + tip

  const closeTableMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/v1/admin/tables/${tableId}/close`, {
        sessionId,
        paymentMethod,
        discount,
        tip,
        notes,
      })
      return response.data?.data || response.data
    },
    onSuccess: (data) => {
      toast.success('Table closed successfully!')
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['waiter-orders'] })
      
      // Generate and print bill if response includes bill data
      if (data?.bill) {
        handlePrintBill(data.bill)
      }
      
      onClose()
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to close table'
      toast.error(message)
    },
  })

  const handlePrintBill = (billFromServer?: any) => {
    // Build items from all orders
    const allItems = orders.flatMap(order => 
      order.items.map(item => ({
        name: item.menuItemName || 'Item',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.totalPrice || (item.quantity * item.unitPrice),
        notes: item.notes,
      }))
    )

    const billData: BillData = {
      billNumber: billFromServer?.billNumber || `BILL-${Date.now()}`,
      tableNumber,
      tableId,
      sessionId,
      createdAt: new Date(),
      items: allItems,
      subtotal,
      serviceCharge,
      tax,
      discount,
      tip,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'BILL_TO_TABLE' ? 'COMPLETED' : 'PENDING',
      tenantName,
      notes,
    }

    printBill(billData)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--gray-200)' }}
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5" style={{ color: 'var(--orange-500)' }} />
            <h2 style={{ color: 'var(--gray-900)', fontSize: '18px', fontWeight: 600 }}>
              Close Table {tableNumber}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--gray-100)] transition-colors"
          >
            <X className="w-5 h-5" style={{ color: 'var(--gray-500)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Order Summary */}
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--gray-50)' }}
          >
            <p style={{ color: 'var(--gray-600)', fontSize: '14px', marginBottom: '8px' }}>
              {orders.length} order(s) • {orders.reduce((sum, o) => sum + o.items.length, 0)} items
            </p>
            <div className="space-y-1" style={{ fontSize: '14px' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--gray-600)' }}>Subtotal</span>
                <span style={{ color: 'var(--gray-900)' }}>${subtotal.toFixed(2)}</span>
              </div>
              {serviceCharge > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--gray-600)' }}>Service Charge</span>
                  <span style={{ color: 'var(--gray-900)' }}>${serviceCharge.toFixed(2)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--gray-600)' }}>Tax</span>
                  <span style={{ color: 'var(--gray-900)' }}>${tax.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label 
              style={{ color: 'var(--gray-700)', fontSize: '14px', fontWeight: 500 }}
              className="block mb-2"
            >
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'CASH', label: 'Cash', icon: Banknote },
                { value: 'CARD', label: 'Card', icon: CreditCard },
                { value: 'BILL_TO_TABLE', label: 'Bill to Table', icon: Receipt },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setPaymentMethod(value as PaymentMethod)}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border transition-all"
                  style={{
                    borderColor: paymentMethod === value ? 'var(--orange-500)' : 'var(--gray-200)',
                    backgroundColor: paymentMethod === value ? 'var(--orange-50)' : 'white',
                  }}
                >
                  <Icon 
                    className="w-5 h-5" 
                    style={{ color: paymentMethod === value ? 'var(--orange-500)' : 'var(--gray-500)' }} 
                  />
                  <span 
                    style={{ 
                      color: paymentMethod === value ? 'var(--orange-600)' : 'var(--gray-600)',
                      fontSize: '12px',
                    }}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Discount & Tip */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label 
                style={{ color: 'var(--gray-700)', fontSize: '14px', fontWeight: 500 }}
                className="block mb-1"
              >
                Discount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-lg border focus:outline-none"
                style={{ borderColor: 'var(--gray-200)' }}
              />
            </div>
            <div>
              <label 
                style={{ color: 'var(--gray-700)', fontSize: '14px', fontWeight: 500 }}
                className="block mb-1"
              >
                Tip ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={tip}
                onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-lg border focus:outline-none"
                style={{ borderColor: 'var(--gray-200)' }}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label 
              style={{ color: 'var(--gray-700)', fontSize: '14px', fontWeight: 500 }}
              className="block mb-1"
            >
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for the bill..."
              className="w-full p-2 rounded-lg border focus:outline-none resize-none"
              style={{ borderColor: 'var(--gray-200)' }}
              rows={2}
            />
          </div>

          {/* Total */}
          <div 
            className="p-3 rounded-lg border-2"
            style={{ 
              borderColor: 'var(--orange-500)', 
              backgroundColor: 'var(--orange-50)' 
            }}
          >
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--gray-700)', fontSize: '16px', fontWeight: 600 }}>
                Total
              </span>
              <span style={{ color: 'var(--orange-600)', fontSize: '24px', fontWeight: 700 }}>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div 
          className="p-4 border-t space-y-2"
          style={{ borderColor: 'var(--gray-200)' }}
        >
          <button
            onClick={() => handlePrintBill()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border transition-all hover:bg-[var(--gray-50)]"
            style={{ borderColor: 'var(--gray-300)' }}
          >
            <Printer className="w-5 h-5" style={{ color: 'var(--gray-600)' }} />
            <span style={{ color: 'var(--gray-700)' }}>Preview & Print Bill</span>
          </button>
          
          <button
            onClick={() => closeTableMutation.mutate()}
            disabled={closeTableMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--orange-500)', 
              color: 'white',
            }}
          >
            {closeTableMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Receipt className="w-5 h-5" />
                <span>Close Table</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

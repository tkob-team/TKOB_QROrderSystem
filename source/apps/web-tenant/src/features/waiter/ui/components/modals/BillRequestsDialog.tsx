'use client'

import { useState, useEffect } from 'react'
import { X, Receipt, Printer, Check, Clock, DollarSign, Users } from 'lucide-react'
import { printBill, type BillData } from '../../../utils/billPdf'
import { api } from '@/services/axios'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Bill request item from WebSocket or API
 */
export interface BillRequest {
  id: string // sessionId
  tableId: string
  tableNumber: string
  totalAmount: number
  orderCount: number
  requestedAt: Date
}

interface BillRequestsDialogProps {
  isOpen: boolean
  onClose: () => void
  billRequests: BillRequest[]
  onRequestHandled: (requestId: string) => void
  tenantName?: string
}

/**
 * Format time since request
 */
function formatTimeSince(date: Date): string {
  const now = new Date()
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)
  
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/**
 * Format currency - Backend returns amount in dollars
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * BillRequestsDialog Component
 * 
 * Shows list of pending bill requests from customers.
 * Waiter can:
 * - View bill details (table, amount, time since request)
 * - Print bill PDF
 * - Mark as handled (removes from list)
 */
export function BillRequestsDialog({
  isOpen,
  onClose,
  billRequests,
  onRequestHandled,
  tenantName = 'Restaurant',
}: BillRequestsDialogProps) {
  const queryClient = useQueryClient()
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  /**
   * Fetch session orders and print bill
   */
  const handlePrintBill = async (request: BillRequest) => {
    setLoadingIds(prev => new Set(prev).add(request.id))
    
    try {
      // Fetch orders for this session
      const response = await api.get(`/api/v1/admin/tables/${request.tableId}/session-orders`, {
        params: { sessionId: request.id }
      })
      
      const orders = response.data?.data || response.data || []
      
      if (!orders.length) {
        toast.error('No orders found for this session')
        return
      }

      // Build items from all orders
      const allItems = orders.flatMap((order: any) => 
        (order.items || []).map((item: any) => ({
          name: item.menuItem?.name || item.menuItemName || item.name || 'Item',
          quantity: item.quantity || 1,
          unitPrice: Number(item.price) || Number(item.unitPrice) || 0,
          total: (item.quantity || 1) * (Number(item.price) || Number(item.unitPrice) || 0),
          notes: item.notes,
        }))
      )

      // Calculate totals
      const subtotal = orders.reduce((sum: number, o: any) => sum + (Number(o.subtotal) || Number(o.total) || 0), 0)
      const serviceCharge = orders.reduce((sum: number, o: any) => sum + (Number(o.serviceCharge) || 0), 0)
      const tax = orders.reduce((sum: number, o: any) => sum + (Number(o.tax) || 0), 0)
      const total = subtotal + serviceCharge + tax

      const billData: BillData = {
        billNumber: `BILL-${request.tableNumber}-${Date.now().toString(36).toUpperCase()}`,
        tableNumber: request.tableNumber,
        tableId: request.tableId,
        sessionId: request.id,
        createdAt: new Date(),
        items: allItems,
        subtotal,
        serviceCharge,
        tax,
        discount: 0,
        tip: 0,
        total,
        paymentMethod: 'BILL_TO_TABLE',
        paymentStatus: 'PENDING',
        tenantName,
        notes: `${request.orderCount} order(s)`,
      }

      printBill(billData)
      toast.success('Bill printed successfully')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to print bill')
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev)
        next.delete(request.id)
        return next
      })
    }
  }

  /**
   * Mark bill request as handled
   */
  const handleMarkHandled = async (request: BillRequest) => {
    setLoadingIds(prev => new Set(prev).add(request.id))
    
    try {
      // Optional: Call API to mark bill as handled (if backend supports this)
      // For now, we just remove from local state
      
      onRequestHandled(request.id)
      toast.success(`Bill request for ${request.tableNumber} marked as handled`)
      
      // Refresh orders
      queryClient.invalidateQueries({ queryKey: ['waiter', 'service-orders'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    } catch (error: any) {
      toast.error('Failed to mark as handled')
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev)
        next.delete(request.id)
        return next
      })
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--gray-200)' }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--orange-100)' }}
            >
              <Receipt className="w-5 h-5" style={{ color: 'var(--orange-500)' }} />
            </div>
            <div>
              <h2 style={{ color: 'var(--gray-900)', fontSize: '18px', fontWeight: 600 }}>
                Bill Requests
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '12px' }}>
                {billRequests.length} pending request{billRequests.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--gray-100)] transition-colors"
          >
            <X className="w-5 h-5" style={{ color: 'var(--gray-500)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {billRequests.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--gray-300)' }} />
              <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                No pending bill requests
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {billRequests.map((request) => {
                const isLoading = loadingIds.has(request.id)
                
                return (
                  <div
                    key={request.id}
                    className="border rounded-xl overflow-hidden"
                    style={{ borderColor: 'var(--gray-200)' }}
                  >
                    {/* Request Info */}
                    <div 
                      className="p-4"
                      style={{ backgroundColor: 'var(--orange-50)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 style={{ 
                            color: 'var(--gray-900)', 
                            fontSize: '16px', 
                            fontWeight: 700,
                            marginBottom: '4px'
                          }}>
                            {request.tableNumber}
                          </h3>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span 
                              className="flex items-center gap-1"
                              style={{ color: 'var(--gray-600)', fontSize: '13px' }}
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              {formatCurrency(request.totalAmount)}
                            </span>
                            <span 
                              className="flex items-center gap-1"
                              style={{ color: 'var(--gray-600)', fontSize: '13px' }}
                            >
                              <Users className="w-3.5 h-3.5" />
                              {request.orderCount} order{request.orderCount !== 1 ? 's' : ''}
                            </span>
                            <span 
                              className="flex items-center gap-1"
                              style={{ color: 'var(--orange-600)', fontSize: '13px', fontWeight: 500 }}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              {formatTimeSince(request.requestedAt)}
                            </span>
                          </div>
                        </div>
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-semibold animate-pulse"
                          style={{ 
                            backgroundColor: 'var(--orange-100)', 
                            color: 'var(--orange-600)' 
                          }}
                        >
                          Pending
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div 
                      className="flex border-t"
                      style={{ borderColor: 'var(--gray-200)' }}
                    >
                      <button
                        onClick={() => handlePrintBill(request)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-[var(--gray-50)] transition-colors disabled:opacity-50"
                        style={{ borderRight: '1px solid var(--gray-200)' }}
                      >
                        <Printer className="w-4 h-4" style={{ color: 'var(--gray-600)' }} />
                        <span style={{ color: 'var(--gray-700)', fontSize: '13px', fontWeight: 500 }}>
                          Print Bill
                        </span>
                      </button>
                      <button
                        onClick={() => handleMarkHandled(request)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-[var(--emerald-50)] transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" style={{ color: 'var(--emerald-600)' }} />
                        <span style={{ color: 'var(--emerald-700)', fontSize: '13px', fontWeight: 500 }}>
                          Handled
                        </span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t"
          style={{ borderColor: 'var(--gray-200)' }}
        >
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg border transition-all hover:bg-[var(--gray-50)]"
            style={{ borderColor: 'var(--gray-300)' }}
          >
            <span style={{ color: 'var(--gray-700)', fontWeight: 500 }}>Close</span>
          </button>
        </div>
      </div>
    </div>
  )
}

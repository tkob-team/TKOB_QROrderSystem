import { ReceiptText, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'

interface RequestBillButtonProps {
  orderId?: string
  orderStatus?: string
  paymentStatus?: string
  onRequested?: () => void
}

const getBillRequestedKey = (orderId: string) => `tkob_mock_bill_requested:${orderId}`

const isBillRequestedInStorage = (orderId: string): boolean => {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(getBillRequestedKey(orderId)) === 'true'
  } catch {
    return false
  }
}

const setBillRequestedInStorage = (orderId: string) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getBillRequestedKey(orderId), 'true')
  } catch (err) {
    logError('data', 'Failed to store bill request state', err, { feature: 'orders' });
  }
}

export function RequestBillButton({ 
  orderId, 
  orderStatus, 
  paymentStatus,
  onRequested 
}: RequestBillButtonProps) {
  const [isRequested, setIsRequested] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Check localStorage on mount
  useEffect(() => {
    if (orderId && isBillRequestedInStorage(orderId)) {
      setIsRequested(true)
      log('ui', 'Bill request state loaded', { orderId: maskId(orderId), wasRequested: true }, { feature: 'orders' });
    }
  }, [orderId])

  // Determine if button should be shown
  const shouldShow = () => {
    if (!orderId) return false
    if (orderStatus === 'Cancelled') return false
    
    // Show if paid OR status is Ready/Served
    const isPaid = paymentStatus === 'Paid'
    const isReadyOrServed = orderStatus === 'Ready' || orderStatus === 'Served'
    
    return isPaid || isReadyOrServed
  }

  const handleRequestBill = async () => {
    if (!orderId) return
    
    setShowConfirm(false)
    setIsLoading(true)
    
    log('ui', 'Bill request initiated', { orderId: maskId(orderId) }, { feature: 'orders' });
    
    try {
      // TODO: Hook up to API once available
      // const response = await requestBillAPI(orderId)
      
      // Mock success for now
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      setIsRequested(true)
      setBillRequestedInStorage(orderId)
      toast.success('Bill requested. A server will assist you shortly.')
      
      log('ui', 'Bill request successful', { orderId: maskId(orderId) }, { feature: 'orders' });
      
      onRequested?.()
    } catch (error) {
      logError('ui', 'Bill request failed', error, { feature: 'orders' });
      toast.error('Failed to request bill. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!shouldShow()) {
    return null
  }

  // Success State Card
  if (isRequested) {
    return (
      <div 
        className="rounded-2xl p-5 border-2"
        style={{ 
          backgroundColor: 'var(--emerald-50)',
          borderColor: 'var(--emerald-200)',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
        }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--emerald-100)' }}
          >
            <CheckCircle className="w-6 h-6" style={{ color: 'var(--emerald-600)' }} />
          </div>
          <div className="flex-1 pt-1">
            <h4 className="mb-1" style={{ color: 'var(--emerald-900)', fontSize: '16px', fontWeight: '600' }}>
              Bill requested
            </h4>
            <p style={{ color: 'var(--emerald-700)', fontSize: '14px', lineHeight: '1.5' }}>
              A staff member will assist you shortly with the bill.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Confirm Dialog
  if (showConfirm) {
    const isPaid = paymentStatus === 'Paid'
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
          <div className="flex items-start gap-3 mb-4">
            <ReceiptText className="w-6 h-6 mt-1" style={{ color: 'var(--orange-500)' }} />
            <div>
              <h3 className="mb-2" style={{ color: 'var(--gray-900)', fontSize: '18px', fontWeight: '600' }}>
                Request the bill?
              </h3>
              <p style={{ color: 'var(--gray-600)', fontSize: '14px', lineHeight: '1.5' }}>
                {isPaid 
                  ? 'A staff member will assist you with a printed receipt or help close the table.'
                  : 'A staff member will bring the bill to your table shortly.'
                }
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-3 px-4 rounded-full border transition-all hover:bg-[var(--gray-50)] active:scale-95"
              style={{ borderColor: 'var(--gray-300)', color: 'var(--gray-700)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleRequestBill}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
            >
              {isLoading ? 'Requesting...' : 'Request bill'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Action Card (Default State)
  const isPaid = paymentStatus === 'Paid'
  return (
    <div 
      className="rounded-2xl p-5 border-2 transition-all cursor-pointer hover:shadow-md"
      style={{ 
        backgroundColor: 'white',
        borderColor: 'var(--gray-200)'
      }}
      onClick={() => setShowConfirm(true)}
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--orange-100)' }}
        >
          <ReceiptText className="w-6 h-6" style={{ color: 'var(--orange-600)' }} />
        </div>
        <div className="flex-1 pt-1">
          <h4 className="mb-1" style={{ color: 'var(--gray-900)', fontSize: '16px', fontWeight: '600' }}>
            Request bill
          </h4>
          <p style={{ color: 'var(--gray-600)', fontSize: '14px', lineHeight: '1.5' }}>
            {isPaid 
              ? 'Request a printed receipt or staff assistance'
              : 'Ask staff to prepare the bill'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

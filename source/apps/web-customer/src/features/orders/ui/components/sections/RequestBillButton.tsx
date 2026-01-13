import { ReceiptText } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface RequestBillButtonProps {
  orderId?: string
  onRequested?: () => void
}

export function RequestBillButton({ orderId, onRequested }: RequestBillButtonProps) {
  const [isRequested, setIsRequested] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRequestBill = async () => {
    setIsLoading(true)
    try {
      // TODO: Hook up to API once available
      // const response = await requestBillAPI(orderId)
      
      // Mock success for now
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      setIsRequested(true)
      toast.success('Bill requested. A server will assist you shortly.')
      onRequested?.()
    } catch (error) {
      toast.error('Failed to request bill. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isRequested) {
    return null
  }

  return (
    <button
      type="button"
      onClick={handleRequestBill}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-50"
      style={{ borderColor: 'var(--gray-300)', color: 'var(--gray-900)' }}
    >
      <ReceiptText className="w-4 h-4" />
      {isLoading ? 'Requesting...' : 'Request bill'}
    </button>
  )
}

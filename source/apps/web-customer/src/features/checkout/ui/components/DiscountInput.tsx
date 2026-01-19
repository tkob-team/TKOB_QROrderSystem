'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Tag, X, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import apiClient from '@/api/client'
import { log, logError } from '@/shared/logging/logger'
import { useSession } from '@/features/tables/hooks'

interface DiscountInfo {
  code: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  description?: string
}

interface DiscountInputProps {
  /** Current cart subtotal for calculating discount */
  subtotal: number
  /** Called when a valid discount is applied */
  onApply: (discount: DiscountInfo, discountAmount: number) => void
  /** Called when discount is removed */
  onRemove: () => void
  /** Currently applied discount code */
  appliedCode?: string
}

interface ValidatePromoResponse {
  valid: boolean
  type?: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value?: number
  description?: string
  discountAmount?: number
  minimumOrder?: number
  message?: string
}

export function DiscountInput({ 
  subtotal, 
  onApply, 
  onRemove, 
  appliedCode 
}: DiscountInputProps) {
  const [code, setCode] = useState(appliedCode || '')
  const [isApplied, setIsApplied] = useState(!!appliedCode)
  const { session } = useSession()
  const tenantId = session?.tenantId

  const validateMutation = useMutation({
    mutationFn: async (promoCode: string) => {
      if (!tenantId) throw new Error('No tenant ID')
      
      log('data', 'Validating promo code', { code: promoCode }, { feature: 'checkout' })
      
      const response = await apiClient.post(
        '/checkout/validate-promo',
        { 
          code: promoCode, 
          orderTotal: subtotal 
        },
        { params: { tenantId } }
      )
      
      return (response.data?.data || response.data) as ValidatePromoResponse
    },
    onSuccess: (data) => {
      if (data.valid && data.type && data.value !== undefined) {
        const discountAmount = data.discountAmount || calculateDiscount(data.type, data.value, subtotal)
        
        setIsApplied(true)
        onApply(
          {
            code: code.toUpperCase(),
            type: data.type,
            value: data.value,
            description: data.description,
          },
          discountAmount
        )
        toast.success(`Discount applied: ${formatDiscount(data.type, data.value)}`)
        log('data', 'Promo code applied', { code, discountAmount }, { feature: 'checkout' })
      } else {
        toast.error(data.message || 'Invalid discount code')
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.response?.data?.error?.message || 'Invalid discount code'
      toast.error(message)
      logError('data', 'Promo code validation failed', error, { feature: 'checkout' })
    },
  })

  const handleApply = () => {
    const trimmedCode = code.trim().toUpperCase()
    if (!trimmedCode) {
      toast.warning('Please enter a promo code')
      return
    }
    validateMutation.mutate(trimmedCode)
  }

  const handleRemove = () => {
    setCode('')
    setIsApplied(false)
    onRemove()
    toast.info('Discount removed')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleApply()
    }
  }

  if (isApplied && appliedCode) {
    // Show applied state
    return (
      <div
        className="flex items-center justify-between p-3 rounded-lg"
        style={{
          backgroundColor: 'var(--emerald-50)',
          borderWidth: '1px',
          borderColor: 'var(--emerald-200)',
        }}
      >
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5" style={{ color: 'var(--emerald-500)' }} />
          <span style={{ color: 'var(--emerald-700)', fontWeight: 500 }}>
            {appliedCode}
          </span>
          <span style={{ color: 'var(--emerald-600)', fontSize: '13px' }}>
            applied
          </span>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="p-1 rounded-full hover:bg-[var(--emerald-100)] transition-colors"
        >
          <X className="w-4 h-4" style={{ color: 'var(--emerald-600)' }} />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--gray-400)' }}
          />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Enter promo code"
            disabled={validateMutation.isPending}
            className="w-full pl-10 pr-4 py-3 rounded-lg transition-colors focus:outline-none"
            style={{
              backgroundColor: 'white',
              borderWidth: '1px',
              borderColor: 'var(--gray-200)',
              color: 'var(--gray-900)',
              fontSize: '14px',
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={validateMutation.isPending || !code.trim()}
          className="px-4 py-3 rounded-lg font-medium transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
          style={{
            backgroundColor: 'var(--orange-500)',
            color: 'white',
            fontSize: '14px',
          }}
        >
          {validateMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Apply'
          )}
        </button>
      </div>
    </div>
  )
}

// Helper functions
function calculateDiscount(
  type: 'PERCENTAGE' | 'FIXED_AMOUNT',
  value: number,
  subtotal: number
): number {
  if (type === 'PERCENTAGE') {
    return (subtotal * value) / 100
  }
  return Math.min(value, subtotal) // Don't exceed subtotal
}

function formatDiscount(type: 'PERCENTAGE' | 'FIXED_AMOUNT', value: number): string {
  if (type === 'PERCENTAGE') {
    return `${value}% off`
  }
  return `$${value.toFixed(2)} off`
}

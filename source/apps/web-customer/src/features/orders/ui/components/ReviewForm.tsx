'use client'

import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '@/api/client'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'

interface ReviewFormProps {
  orderId: string
  orderItemId: string
  itemName: string
  sessionId: string
  tenantId: string
  onSuccess?: () => void
  onClose?: () => void
}

interface CreateReviewPayload {
  rating: number
  comment?: string
}

export function ReviewForm({
  orderId,
  orderItemId,
  itemName,
  sessionId,
  tenantId,
  onSuccess,
  onClose,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  const submitReviewMutation = useMutation({
    mutationFn: async (payload: CreateReviewPayload) => {
      log('data', 'Submitting review', {
        orderId: maskId(orderId),
        orderItemId: maskId(orderItemId),
        rating: payload.rating,
      }, { feature: 'orders' })

      const response = await apiClient.post(
        `/orders/${orderId}/items/${orderItemId}/review`,
        payload,
        {
          params: { sessionId, tenantId },
        }
      )
      return response.data?.data || response.data
    },
    onSuccess: () => {
      log('data', 'Review submitted successfully', {
        orderId: maskId(orderId),
        orderItemId: maskId(orderItemId),
      }, { feature: 'orders' })
      toast.success('Thank you for your review!')
      onSuccess?.()
    },
    onError: (error) => {
      logError('data', 'Failed to submit review', error, { feature: 'orders' })
      toast.error('Failed to submit review. Please try again.')
    },
  })

  const handleSubmit = () => {
    if (rating === 0) {
      toast.warning('Please select a rating')
      return
    }

    submitReviewMutation.mutate({
      rating,
      comment: comment.trim() || undefined,
    })
  }

  const renderStar = (starValue: number) => {
    const filled = (hoverRating || rating) >= starValue
    return (
      <button
        key={starValue}
        type="button"
        onClick={() => setRating(starValue)}
        onMouseEnter={() => setHoverRating(starValue)}
        onMouseLeave={() => setHoverRating(0)}
        className="p-1 transition-transform active:scale-95"
        disabled={submitReviewMutation.isPending}
      >
        <Star
          className="w-8 h-8 transition-colors"
          fill={filled ? 'var(--orange-500)' : 'none'}
          style={{ color: filled ? 'var(--orange-500)' : 'var(--gray-300)' }}
        />
      </button>
    )
  }

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: 'var(--gray-50)',
        borderWidth: '1px',
        borderColor: 'var(--gray-200)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 style={{ color: 'var(--gray-900)', fontSize: '16px' }}>
            Rate your experience
          </h4>
          <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
            How was the <strong>{itemName}</strong>?
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[var(--gray-200)] transition-colors"
            disabled={submitReviewMutation.isPending}
          >
            <X className="w-5 h-5" style={{ color: 'var(--gray-500)' }} />
          </button>
        )}
      </div>

      {/* Star Rating */}
      <div className="flex justify-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>

      {/* Rating Label */}
      {rating > 0 && (
        <p className="text-center mb-4" style={{ color: 'var(--gray-700)', fontSize: '14px' }}>
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent!'}
        </p>
      )}

      {/* Comment Input */}
      <textarea
        placeholder="Share your thoughts (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={submitReviewMutation.isPending}
        className="w-full p-3 rounded-lg resize-none transition-colors focus:outline-none"
        style={{
          backgroundColor: 'white',
          borderWidth: '1px',
          borderColor: 'var(--gray-200)',
          color: 'var(--gray-900)',
          fontSize: '14px',
          minHeight: '80px',
        }}
        rows={3}
      />

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={rating === 0 || submitReviewMutation.isPending}
        className="w-full mt-4 py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: rating > 0 ? 'var(--orange-500)' : 'var(--gray-300)',
          color: 'white',
          fontSize: '15px',
        }}
      >
        {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  )
}

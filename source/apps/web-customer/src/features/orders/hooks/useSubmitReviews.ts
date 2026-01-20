/**
 * Hook for submitting item reviews
 * Uses the generated review API to submit reviews for order items
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reviewControllerCreateReview } from '@/services/generated/reviews/reviews'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'

interface ReviewSubmission {
  itemId: string
  orderId: string
  rating: number
  comment: string
}

interface UseSubmitReviewsOptions {
  tenantId: string
  sessionId: string
  reviewerName?: string // Customer name for the review
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useSubmitReviews({ tenantId, sessionId, reviewerName, onSuccess, onError }: UseSubmitReviewsOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reviews: ReviewSubmission[]) => {
      if (!tenantId || !sessionId) {
        throw new Error('Missing tenant or session ID')
      }

      log('data', 'Submitting reviews', { 
        reviewCount: reviews.length,
        tenantId: maskId(tenantId),
        sessionId: maskId(sessionId),
        reviewerName: reviewerName || 'Guest',
      }, { feature: 'orders' })

      // Submit all reviews in parallel
      const results = await Promise.allSettled(
        reviews.map(review =>
          reviewControllerCreateReview(
            review.orderId,
            review.itemId,
            {
              rating: review.rating,
              comment: review.comment || undefined,
              // Include reviewerName if available (will be added to DTO after codegen)
              ...(reviewerName ? { reviewerName } : {}),
            } as any, // Type assertion until codegen updates
            {
              tenantId,
              sessionId,
            }
          )
        )
      )

      // Count successes and failures
      const successes = results.filter(r => r.status === 'fulfilled').length
      const failures = results.filter(r => r.status === 'rejected').length

      log('data', 'Reviews submission complete', { 
        successes, 
        failures,
      }, { feature: 'orders' })

      if (failures > 0 && successes === 0) {
        throw new Error('Failed to submit reviews')
      }

      return { successes, failures }
    },
    onSuccess: (result) => {
      if (result.failures > 0) {
        toast.warning(`${result.successes} reviews submitted, ${result.failures} failed`)
      } else if (result.successes > 0) {
        toast.success(`${result.successes} review${result.successes > 1 ? 's' : ''} submitted!`)
      }
      
      // Invalidate order reviews cache
      queryClient.invalidateQueries({ queryKey: ['/api/v1/orders'] })
      
      onSuccess?.()
    },
    onError: (error: Error) => {
      logError('data', 'Failed to submit reviews', error, { feature: 'orders' })
      toast.error('Failed to submit reviews')
      onError?.(error)
    },
  })
}

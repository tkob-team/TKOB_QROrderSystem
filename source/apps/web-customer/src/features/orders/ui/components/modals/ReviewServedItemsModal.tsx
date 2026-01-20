/**
 * ReviewServedItemsModal - Multi-item review popup
 * 
 * Shown when customer clicks "Request Bill" on Orders page
 * Allows rating items that have been served before proceeding to bill
 */

'use client'

import { useState, useCallback } from 'react'
import { X, Star, ChevronRight, SkipForward, Send, AlertCircle } from 'lucide-react'
import type { Order, OrderItem } from '../../../model/types'

interface ReviewableItem {
  id: string
  name: string
  orderId: string
  quantity: number
  size?: string
}

interface ItemReview {
  itemId: string
  rating: number
  comment: string
}

interface ReviewServedItemsModalProps {
  open: boolean
  orders: Order[]
  onClose: () => void
  onSkip: () => void
  onSubmit: (reviews: ItemReview[]) => void
  isSubmitting?: boolean
}

const STAR_VALUES = [1, 2, 3, 4, 5]

export function ReviewServedItemsModal({
  open,
  orders,
  onClose,
  onSkip,
  onSubmit,
  isSubmitting = false,
}: ReviewServedItemsModalProps) {
  // Get all served items from orders
  // Check for both uppercase and Title Case status values
  const servedItems: ReviewableItem[] = orders
    .filter(order => {
      const status = order.status?.toString().toUpperCase()
      // Include SERVED, COMPLETED, and READY for review eligibility
      return status === 'SERVED' || status === 'COMPLETED' || status === 'READY'
    })
    .flatMap(order => 
      order.items.map(item => ({
        id: item.id,
        name: item.name,
        orderId: order.id,
        quantity: item.quantity,
        size: item.size,
      }))
    )
  
  // Track reviews for each item
  const [reviews, setReviews] = useState<Map<string, ItemReview>>(new Map())
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [currentRating, setCurrentRating] = useState(0)
  const [currentComment, setCurrentComment] = useState('')
  
  const currentItem = servedItems[currentItemIndex]
  const isLastItem = currentItemIndex === servedItems.length - 1
  const hasReviews = reviews.size > 0
  
  const handleSaveCurrentReview = useCallback(() => {
    if (!currentItem || currentRating === 0) return
    
    const newReviews = new Map(reviews)
    newReviews.set(currentItem.id, {
      itemId: currentItem.id,
      rating: currentRating,
      comment: currentComment.trim(),
    })
    setReviews(newReviews)
    
    // Reset for next item
    setCurrentRating(0)
    setCurrentComment('')
    
    if (!isLastItem) {
      setCurrentItemIndex(prev => prev + 1)
    }
  }, [currentItem, currentRating, currentComment, reviews, isLastItem])
  
  const handleSkipItem = useCallback(() => {
    setCurrentRating(0)
    setCurrentComment('')
    
    if (!isLastItem) {
      setCurrentItemIndex(prev => prev + 1)
    }
  }, [isLastItem])
  
  const handleSubmitAll = useCallback(() => {
    // Save current item if rating is set
    if (currentItem && currentRating > 0) {
      reviews.set(currentItem.id, {
        itemId: currentItem.id,
        rating: currentRating,
        comment: currentComment.trim(),
      })
    }
    
    const reviewsList = Array.from(reviews.values())
    onSubmit(reviewsList)
  }, [currentItem, currentRating, currentComment, reviews, onSubmit])
  
  if (!open) return null
  
  // If no served items, show info and allow proceeding
  if (servedItems.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
          onClick={onClose}
        />
        
        <div
          className="relative w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
          style={{ backgroundColor: 'white', border: '1px solid var(--gray-200)' }}
        >
          <div className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto" style={{ color: 'var(--orange-500)' }} />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--gray-900)' }}>
              No items to review yet
            </h3>
            <p style={{ color: 'var(--gray-600)' }}>
              Your order is still being prepared. You can review items after they&apos;ve been served.
            </p>
            <button
              onClick={onSkip}
              className="w-full py-3 rounded-xl font-semibold transition-colors"
              style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
            >
              Continue to Bill
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
        onClick={onClose}
      />
      
      <div
        className="relative w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
        style={{ backgroundColor: 'white', border: '1px solid var(--gray-200)' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid var(--gray-200)' }}
        >
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--gray-900)' }}>
              Rate Your Items
            </h3>
            <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
              {currentItemIndex + 1} of {servedItems.length} items
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: 'var(--gray-500)' }} />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1" style={{ backgroundColor: 'var(--gray-100)' }}>
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${((currentItemIndex + 1) / servedItems.length) * 100}%`,
              backgroundColor: 'var(--orange-500)',
            }}
          />
        </div>
        
        {/* Current Item Review */}
        <div className="p-6 space-y-5">
          {/* Item Info */}
          <div className="text-center space-y-2">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
              style={{ backgroundColor: 'var(--orange-50)', color: 'var(--orange-700)' }}
            >
              {currentItem.quantity}x {currentItem.size && `${currentItem.size} • `}
            </div>
            <h4 className="text-xl font-semibold" style={{ color: 'var(--gray-900)' }}>
              {currentItem.name}
            </h4>
          </div>
          
          {/* Star Rating */}
          <div className="flex justify-center gap-3">
            {STAR_VALUES.map((value) => {
              const active = value <= currentRating
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                  onClick={() => setCurrentRating(value)}
                  className="p-2 rounded-full transition-all hover:scale-110"
                  style={{ backgroundColor: active ? 'var(--orange-50)' : 'var(--gray-50)' }}
                >
                  <Star
                    className="w-8 h-8"
                    style={{ color: active ? 'var(--orange-500)' : 'var(--gray-300)' }}
                    fill={active ? 'var(--orange-500)' : 'none'}
                  />
                </button>
              )
            })}
          </div>
          
          {/* Rating Label */}
          <p className="text-center text-sm" style={{ color: 'var(--gray-500)' }}>
            {currentRating === 0 && 'Tap to rate'}
            {currentRating === 1 && 'Poor'}
            {currentRating === 2 && 'Fair'}
            {currentRating === 3 && 'Good'}
            {currentRating === 4 && 'Very Good'}
            {currentRating === 5 && 'Excellent!'}
          </p>
          
          {/* Comment Input - Only show if rating is set */}
          {currentRating > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--gray-700)' }}>
                Add a comment (optional)
              </label>
              <textarea
                value={currentComment}
                onChange={(e) => setCurrentComment(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'var(--gray-300)',
                  color: 'var(--gray-900)',
                  backgroundColor: 'var(--gray-50)',
                }}
                placeholder="What did you think about this dish?"
              />
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkipItem}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
              style={{ 
                backgroundColor: 'var(--gray-100)',
                color: 'var(--gray-700)',
              }}
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </button>
            
            {isLastItem ? (
              <button
                onClick={handleSubmitAll}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit & Continue'}
              </button>
            ) : (
              <button
                onClick={handleSaveCurrentReview}
                disabled={currentRating === 0}
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: currentRating > 0 ? 'var(--orange-500)' : 'var(--gray-300)',
                  color: 'white',
                }}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Footer - Reviews Summary */}
        {hasReviews && (
          <div 
            className="px-6 py-3 flex items-center justify-between"
            style={{ backgroundColor: 'var(--emerald-50)', borderTop: '1px solid var(--emerald-100)' }}
          >
            <span className="text-sm" style={{ color: 'var(--emerald-700)' }}>
              {reviews.size} item{reviews.size !== 1 ? 's' : ''} rated
            </span>
            <button
              onClick={handleSubmitAll}
              disabled={isSubmitting}
              className="text-sm font-medium flex items-center gap-1"
              style={{ color: 'var(--emerald-700)' }}
            >
              Submit all & continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

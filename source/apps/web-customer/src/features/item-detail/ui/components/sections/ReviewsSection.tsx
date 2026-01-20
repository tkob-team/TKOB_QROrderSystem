import { useRef } from 'react'
import { ChevronRight, Star } from 'lucide-react'
import type { Review } from '@/types'

interface RatingBreakdown {
  5: number
  4: number
  3: number
  2: number
  1: number
}

interface ReviewsSectionProps {
  averageRating: string
  totalReviews: number
  currentReviews: Review[]
  allReviews?: Review[] // For calculating breakdown (fallback)
  ratingDistribution?: RatingBreakdown | Record<number, number> | null // From API
  reviewPage: number
  totalReviewPages: number
  onPrevious: () => void
  onNext: () => void
  showFullList?: boolean // Toggle between preview and full list mode
  onToggleFullList?: () => void
}

export function ReviewsSection({
  averageRating,
  totalReviews,
  currentReviews,
  allReviews = [],
  ratingDistribution: apiRatingDistribution,
  reviewPage,
  totalReviewPages,
  onPrevious,
  onNext,
  showFullList = false,
  onToggleFullList,
}: ReviewsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  if (totalReviews === 0) return null

  // Use API rating distribution if available, otherwise calculate from reviews
  let ratingBreakdown: RatingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  
  if (apiRatingDistribution) {
    // Use API data (accurate server-side counts)
    ratingBreakdown = {
      5: apiRatingDistribution[5] || 0,
      4: apiRatingDistribution[4] || 0,
      3: apiRatingDistribution[3] || 0,
      2: apiRatingDistribution[2] || 0,
      1: apiRatingDistribution[1] || 0,
    }
  } else {
    // Fallback: calculate from available reviews (client-side)
    const reviewsToCount = allReviews.length > 0 ? allReviews : currentReviews
    reviewsToCount.forEach((review) => {
      const rating = Math.round(review.rating) as keyof RatingBreakdown
      if (rating >= 1 && rating <= 5) {
        ratingBreakdown[rating]++
      }
    })
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={sizeClass}
            fill={star <= rating ? 'var(--orange-500)' : 'none'}
            style={{ color: star <= rating ? 'var(--orange-500)' : 'var(--gray-300)' }}
          />
        ))}
      </div>
    )
  }

  const RatingBar = ({ stars, count }: { stars: number; count: number }) => {
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-3" style={{ color: 'var(--gray-600)' }}>{stars}</span>
        <Star className="w-3 h-3" fill="var(--orange-500)" style={{ color: 'var(--orange-500)' }} />
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--gray-200)' }}>
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%`, backgroundColor: 'var(--orange-500)' }}
          />
        </div>
        <span className="w-8 text-right" style={{ color: 'var(--gray-500)' }}>{count}</span>
      </div>
    )
  }

  // Preview mode: Show 3 reviews + "See all" button
  const displayReviews = showFullList ? currentReviews : currentReviews.slice(0, 3)

  return (
    <div ref={sectionRef} className="p-4 border-t" style={{ borderColor: 'var(--gray-200)' }}>
      {/* Header with Rating Summary */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--gray-900)' }}>
          Customer Reviews
        </h3>
        
        {/* Rating Summary Card */}
        <div className="flex gap-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--gray-50)' }}>
          {/* Left: Big rating number */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: 'var(--gray-900)' }}>
              {averageRating}
            </span>
            {renderStars(parseFloat(averageRating), 'md')}
            <span className="mt-1 text-sm" style={{ color: 'var(--gray-500)' }}>
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {/* Right: Rating breakdown bars */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => (
              <RatingBar key={stars} stars={stars} count={ratingBreakdown[stars as keyof RatingBreakdown]} />
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3 mb-4">
        {displayReviews.map((review) => (
          <div key={review.id} className="p-4 rounded-xl border" style={{ borderColor: 'var(--gray-200)' }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {/* Avatar placeholder */}
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: 'var(--orange-100)', color: 'var(--orange-600)' }}
                  >
                    {review.reviewerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium" style={{ color: 'var(--gray-900)' }}>
                    {review.reviewerName}
                  </span>
                </div>
                {renderStars(review.rating)}
              </div>
              <span className="text-xs" style={{ color: 'var(--gray-500)' }}>
                {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--gray-700)' }}>
              {review.comment}
            </p>
          </div>
        ))}
      </div>

      {/* See More / Pagination */}
      {!showFullList && totalReviews > 3 && onToggleFullList && (
        <button
          onClick={onToggleFullList}
          className="w-full py-3 rounded-xl border flex items-center justify-center gap-2 transition-all hover:bg-gray-50 active:scale-98"
          style={{ borderColor: 'var(--gray-300)' }}
        >
          <span style={{ color: 'var(--orange-500)' }} className="font-medium">
            See all {totalReviews} reviews
          </span>
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--orange-500)' }} />
        </button>
      )}

      {showFullList && totalReviewPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => { onPrevious(); sectionRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
            disabled={reviewPage === 1}
            className="px-4 py-2 rounded-full border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            style={{ borderColor: 'var(--gray-300)', color: 'var(--gray-700)' }}
          >
            Previous
          </button>

          <span className="text-sm" style={{ color: 'var(--gray-600)' }}>
            {reviewPage} / {totalReviewPages}
          </span>

          <button
            onClick={() => { onNext(); sectionRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
            disabled={reviewPage === totalReviewPages}
            className="px-4 py-2 rounded-full border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            style={{ borderColor: 'var(--gray-300)', color: 'var(--gray-700)' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

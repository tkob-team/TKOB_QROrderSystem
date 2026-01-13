import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import type { Review } from '@/types'

interface ReviewsSectionProps {
  averageRating: string
  totalReviews: number
  currentReviews: Review[]
  reviewPage: number
  totalReviewPages: number
  onPrevious: () => void
  onNext: () => void
}

export function ReviewsSection({
  averageRating,
  totalReviews,
  currentReviews,
  reviewPage,
  totalReviewPages,
  onPrevious,
  onNext,
}: ReviewsSectionProps) {
  if (totalReviews === 0) return null

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="w-4 h-4"
          fill={star <= rating ? 'var(--orange-500)' : 'none'}
          style={{ color: star <= rating ? 'var(--orange-500)' : 'var(--gray-300)' }}
        />
      ))}
    </div>
  )

  return (
    <div className="p-4" style={{ borderColor: 'var(--gray-200)' }}>
      <div className="mb-4">
        <h3 className="mb-2" style={{ color: 'var(--gray-900)' }}>
          Customer Reviews
        </h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5" fill="var(--orange-500)" style={{ color: 'var(--orange-500)' }} />
            <span style={{ color: 'var(--gray-900)', fontSize: '18px' }}>
              {averageRating}
            </span>
          </div>
          <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
            ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        {currentReviews.map((review) => (
          <div key={review.id} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--gray-50)' }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
                    {review.reviewerName}
                  </span>
                </div>
                {renderStars(review.rating)}
              </div>
              <span style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
                {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <p style={{ color: 'var(--gray-700)', fontSize: '14px', lineHeight: '1.5' }}>
              {review.comment}
            </p>
          </div>
        ))}
      </div>

      {totalReviewPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={onPrevious}
            disabled={reviewPage === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-full border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-(--gray-50) active:scale-95"
            style={{ borderColor: 'var(--gray-300)' }}
          >
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--gray-700)' }} />
            <span style={{ color: 'var(--gray-700)', fontSize: '14px' }}>Previous</span>
          </button>

          <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
            Page {reviewPage} of {totalReviewPages}
          </span>

          <button
            onClick={onNext}
            disabled={reviewPage === totalReviewPages}
            className="flex items-center gap-1 px-3 py-2 rounded-full border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-(--gray-50) active:scale-95"
            style={{ borderColor: 'var(--gray-300)' }}
          >
            <span style={{ color: 'var(--gray-700)', fontSize: '14px' }}>Next</span>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--gray-700)' }} />
          </button>
        </div>
      )}
    </div>
  )
}

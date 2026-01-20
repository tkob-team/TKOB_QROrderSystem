import { Clock, Star, Utensils } from 'lucide-react'
import type { MenuItem } from '@/types'

interface ItemInfoSectionProps {
  item: MenuItem
  averageRating?: string
  totalReviews?: number
  onViewReviews?: () => void
}

export function ItemInfoSection({ 
  item, 
  averageRating, 
  totalReviews = 0,
  onViewReviews 
}: ItemInfoSectionProps) {
  const hasRating = averageRating && parseFloat(averageRating) > 0

  return (
    <div className="p-4 border-b" style={{ borderColor: 'var(--gray-200)' }}>
      {/* Name and Price */}
      <div className="flex items-start justify-between mb-2">
        <h1 style={{ color: 'var(--gray-900)' }}>{item.name}</h1>
        <span className="text-xl font-semibold" style={{ color: 'var(--orange-500)' }}>
          ${item.basePrice.toFixed(2)}
        </span>
      </div>

      {/* Rating, Cooking Time, Dietary Info Row */}
      <div className="flex items-center flex-wrap gap-3 mb-3 text-sm">
        {/* Rating */}
        {hasRating && (
          <button 
            onClick={onViewReviews}
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <Star 
              className="w-4 h-4" 
              fill="var(--orange-500)" 
              style={{ color: 'var(--orange-500)' }} 
            />
            <span style={{ color: 'var(--gray-900)' }} className="font-medium">
              {averageRating}
            </span>
            <span style={{ color: 'var(--orange-500)' }}>
              ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </button>
        )}

        {/* Cooking Time */}
        {item.preparationTime && item.preparationTime > 0 && (
          <div className="flex items-center gap-1" style={{ color: 'var(--gray-600)' }}>
            <Clock className="w-4 h-4" />
            <span>~{item.preparationTime} min</span>
          </div>
        )}

        {/* Dietary Info inline */}
        {item.dietary && item.dietary.length > 0 && (
          <div className="flex items-center gap-1" style={{ color: 'var(--gray-600)' }}>
            <Utensils className="w-4 h-4" />
            <span>{item.dietary.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Availability Badge */}
      {item.availability && (
        <span 
          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-3"
          style={{
            backgroundColor: item.availability === 'Available' 
              ? 'var(--emerald-50)' 
              : item.availability === 'Sold out' 
                ? 'var(--red-50)' 
                : 'var(--gray-100)',
            color: item.availability === 'Available' 
              ? 'var(--emerald-600)' 
              : item.availability === 'Sold out' 
                ? 'var(--red-600)' 
                : 'var(--gray-600)',
          }}
        >
          • {item.availability}
        </span>
      )}

      {/* Description */}
      <p style={{ color: 'var(--gray-600)', fontSize: '14px', lineHeight: '1.6' }}>
        {item.description}
      </p>

      {/* Dietary Tags */}
      {item.dietary && item.dietary.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {item.dietary.map((badge) => (
            <span
              key={badge}
              className="px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--gray-100)',
                color: 'var(--gray-700)',
                fontSize: '12px',
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

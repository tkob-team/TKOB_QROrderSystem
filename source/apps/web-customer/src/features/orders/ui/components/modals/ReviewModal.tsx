import { useMemo, useState } from 'react'
import { Star } from 'lucide-react'

interface ReviewModalProps {
  open: boolean
  itemName?: string
  onClose: () => void
  onSubmit: (payload: { rating: number; comment: string }) => void
}

const stars = [1, 2, 3, 4, 5]

export function ReviewModal({ open, itemName = 'your order', onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const isSubmitDisabled = useMemo(() => rating === 0 || comment.trim().length === 0, [rating, comment])

  if (!open) return null

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
        <div className="p-6 space-y-5">
          <div className="space-y-2 text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--gray-500)' }}>
              Rate your experience
            </p>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--gray-900)' }}>
              {itemName}
            </h3>
          </div>

          <div className="flex justify-center gap-3">
            {stars.map((value) => {
              const active = value <= rating
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                  onClick={() => setRating(value)}
                  className="p-2 rounded-full transition-colors"
                  style={{ backgroundColor: active ? 'var(--orange-50)' : 'var(--gray-50)' }}
                >
                  <Star
                    className="w-6 h-6"
                    style={{ color: active ? 'var(--orange-500)' : 'var(--gray-400)' }}
                    fill={active ? 'var(--orange-500)' : 'none'}
                  />
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--gray-700)' }}>
              Tell us more
            </label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              style={{
                borderColor: 'var(--gray-300)',
                color: 'var(--gray-900)',
                backgroundColor: 'var(--gray-50)',
              }}
              placeholder="Share details about your order, service, or food quality"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors"
              style={{ borderColor: 'var(--gray-300)', color: 'var(--gray-800)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSubmit({ rating, comment: comment.trim() })}
              disabled={isSubmitDisabled}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
            >
              Submit review
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import type { MenuItem } from '@/types/menu';

interface ReviewModalProps {
  item: MenuItem;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export function ReviewModal({ item, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      return; // Rating is required
    }
    onSubmit(rating, comment);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      {/* Soft Backdrop - Light Dimming (6% opacity) */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.06)',
          backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
      />

      {/* Modal with smooth scale animation */}
      <div 
        className="relative bg-white w-full max-w-md mx-4 shadow-2xl"
        style={{ 
          maxHeight: '90vh',
          borderRadius: '20px',
          animation: 'modalSlideIn 0.3s ease-out',
        }}
      >
        {/* Header - Clear Separation */}
        <div 
          className="flex items-center justify-between p-5 border-b" 
          style={{ borderColor: 'var(--gray-200)' }}
        >
          <h3 style={{ color: 'var(--gray-900)', fontSize: '18px' }}>Write a review</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-[var(--gray-100)] active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" style={{ color: 'var(--gray-600)' }} />
          </button>
        </div>

        {/* Content - Better Spacing */}
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          {/* Item Info */}
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
            <p style={{ color: 'var(--gray-700)', fontSize: '13px', marginBottom: '4px' }}>
              Reviewing
            </p>
            <p style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
              {item.name}
            </p>
          </div>

          {/* Star Rating - Clear Section */}
          <div className="mb-6 pb-6 border-b" style={{ borderColor: 'var(--gray-200)' }}>
            <label className="block mb-3" style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
              Rating <span style={{ color: 'var(--red-500)' }}>*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform active:scale-90 hover:scale-110"
                >
                  <Star
                    className="w-10 h-10"
                    fill={star <= (hoveredRating || rating) ? 'var(--orange-500)' : 'none'}
                    style={{ 
                      color: star <= (hoveredRating || rating) ? 'var(--orange-500)' : 'var(--gray-300)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p style={{ color: 'var(--gray-600)', fontSize: '13px', marginTop: '8px' }}>
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
              </p>
            )}
          </div>

          {/* Comment - Clear Section */}
          <div>
            <label className="block mb-3" style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
              Comment <span style={{ color: 'var(--gray-500)', fontSize: '13px' }}>(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full p-3 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-[var(--orange-200)] focus:border-[var(--orange-500)] transition-all"
              style={{
                borderColor: 'var(--gray-300)',
                backgroundColor: 'white',
                color: 'var(--gray-900)',
                fontSize: '15px',
                lineHeight: '1.5',
              }}
              rows={4}
            />
            <p style={{ color: 'var(--gray-500)', fontSize: '12px', marginTop: '6px' }}>
              {comment.length}/500 characters
            </p>
          </div>
        </div>

        {/* Footer - Clear Action Area */}
        <div className="p-5 border-t" style={{ borderColor: 'var(--gray-200)', backgroundColor: 'var(--gray-50)' }}>
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full py-3 px-4 rounded-full transition-all disabled:cursor-not-allowed hover:shadow-lg active:scale-98"
            style={{
              backgroundColor: rating === 0 ? 'var(--gray-300)' : 'var(--orange-500)',
              color: 'white',
              minHeight: '48px',
              fontSize: '16px',
              opacity: rating === 0 ? 0.6 : 1,
            }}
          >
            Submit review
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
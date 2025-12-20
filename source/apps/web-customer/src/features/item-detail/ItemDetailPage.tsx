'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Minus, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MenuItem } from '@/types';
import { OptimizedImage } from '@packages/ui';
import { PeopleUsuallyAdd } from '@/components/sections/PeopleUsuallyAdd';
import { MenuService } from '@/api/services/menu.service';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface ItemDetailProps {
  itemId: string;
}

export function ItemDetailPage({ itemId }: ItemDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  
  // Fetch item data với React Query
  const { data: itemResponse, isLoading, error } = useQuery({
    queryKey: ['menu-item', itemId],
    queryFn: () => MenuService.getMenuItem(itemId)
  });
  
  // Fetch all menu items for recommendations
  const { data: menuResponse } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => MenuService.getPublicMenu('') // TODO: Add proper token
  });
  
  const item = itemResponse?.data;
  const allMenuItems = menuResponse?.data?.items || [];
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);

  const REVIEWS_PER_PAGE = 3;
  
  // Initialize selectedSize when item loads
  if (item && !selectedSize && item.sizes && item.sizes.length > 0) {
    setSelectedSize(item.sizes[0].size);
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p style={{ color: 'var(--gray-600)' }}>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p style={{ color: 'var(--gray-900)' }} className="text-xl mb-2">Item not found</p>
          <p style={{ color: 'var(--gray-600)' }} className="mb-4">The item you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 rounded-full"
            style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId)
        ? prev.filter((id) => id !== toppingId)
        : [...prev, toppingId]
    );
  };

  const calculateTotal = () => {
    let total = item.basePrice;

    // Add size price difference
    if (selectedSize && item.sizes) {
      const size = item.sizes.find((s) => s.size === selectedSize);
      if (size) {
        total = size.price;
      }
    }

    // Add topping prices
    if (item.toppings) {
      selectedToppings.forEach((toppingId) => {
        const topping = item.toppings!.find((t) => t.id === toppingId);
        if (topping) {
          total += topping.price;
        }
      });
    }

    return total * quantity;
  };

  const handleAddToCart = () => {
    if (!item) return;
    
    addItem({
      menuItem: item,
      selectedSize: selectedSize || undefined,
      selectedToppings,
      specialInstructions,
      quantity,
    });
    toast.success(`${item.name} added to cart!`);
    router.back();
  };

  // Handle quick add from recommendations
  const handleQuickAdd = (recommendedItem: MenuItem) => {
    addItem({
      menuItem: recommendedItem,
      selectedSize: recommendedItem.sizes ? recommendedItem.sizes[0].size : undefined,
      selectedToppings: [],
      specialInstructions: '',
      quantity: 1,
    });
    toast.success(`${recommendedItem.name} added to cart!`);
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handleItemClick = (clickedItem: MenuItem) => {
    router.push(`/menu/${clickedItem.id}`);
  };

  // Get related items from the same category
  const getRelatedItems = () => {
    return allMenuItems
      .filter(menuItem => 
        menuItem.id !== item.id && 
        menuItem.category === item.category &&
        (menuItem.availability === 'Available' || !menuItem.availability)
      )
      .slice(0, 4);
  };

  const relatedItems = getRelatedItems();

  // Reviews pagination
  const reviews = item.reviews || [];
  const totalReviews = reviews.length;
  const totalReviewPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);
  const reviewStartIndex = (reviewPage - 1) * REVIEWS_PER_PAGE;
  const reviewEndIndex = reviewStartIndex + REVIEWS_PER_PAGE;
  const currentReviews = reviews.slice(reviewStartIndex, reviewEndIndex);

  // Calculate average rating
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const handlePreviousReview = () => {
    setReviewPage(prev => Math.max(1, prev - 1));
  };

  const handleNextReview = () => {
    setReviewPage(prev => Math.min(totalReviewPages, prev + 1));
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
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
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Full-Width Hero Image */}
      <div className="relative">
        <OptimizedImage
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-64 object-cover"
        />
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md transition-all active:scale-95 hover:shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Item Info */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--gray-200)' }}>
          <div className="flex items-start justify-between mb-2">
            <h1 style={{ color: 'var(--gray-900)' }}>{item.name}</h1>
            <span style={{ color: 'var(--gray-900)' }}>
              ${item.basePrice.toFixed(2)}
            </span>
          </div>
          <p className="mb-3" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
            {item.description}
          </p>
          {item.dietary && item.dietary.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.dietary.map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: 'var(--emerald-50)',
                    color: 'var(--emerald-600)',
                    fontSize: '13px',
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Size Selection - Full Width Radio Options */}
        {item.sizes && item.sizes.length > 0 && (
          <div className="p-4 border-b" style={{ borderColor: 'var(--gray-200)' }}>
            <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
              Choose size
            </h3>
            <div className="space-y-2">
              {item.sizes.map((size) => (
                <button
                  key={size.size}
                  onClick={() => setSelectedSize(size.size)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    selectedSize === size.size
                      ? 'border-[var(--orange-500)] bg-[var(--orange-50)]'
                      : 'border-[var(--gray-200)] hover:border-[var(--gray-300)]'
                  }`}
                  style={{ minHeight: '48px' }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedSize === size.size
                        ? 'border-[var(--orange-500)]'
                        : 'border-[var(--gray-300)]'
                    }`}>
                      {selectedSize === size.size && (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--orange-500)' }} />
                      )}
                    </div>
                    <span style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
                      {size.size}
                    </span>
                  </div>
                  <span style={{ color: 'var(--gray-600)', fontSize: '15px' }}>
                    ${size.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Extras - Full Width Checkbox Options */}
        {item.toppings && item.toppings.length > 0 && (
          <div className="p-4 border-b" style={{ borderColor: 'var(--gray-200)' }}>
            <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
              Add extras
            </h3>
            <div className="space-y-2">
              {item.toppings.map((topping) => (
                <button
                  key={topping.id}
                  onClick={() => toggleTopping(topping.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    selectedToppings.includes(topping.id)
                      ? 'border-[var(--orange-500)] bg-[var(--orange-50)]'
                      : 'border-[var(--gray-200)] hover:border-[var(--gray-300)]'
                  }`}
                  style={{ minHeight: '48px' }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedToppings.includes(topping.id)
                        ? 'border-[var(--orange-500)] bg-[var(--orange-500)]'
                        : 'border-[var(--gray-300)]'
                    }`}>
                      {selectedToppings.includes(topping.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
                      {topping.name}
                    </span>
                  </div>
                  <span style={{ color: 'var(--gray-600)', fontSize: '15px' }}>
                    +${topping.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* You might also like */}
        {relatedItems.length > 0 && (
          <div className="p-4 border-b" style={{ borderColor: 'var(--gray-200)' }}>
            <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
              You might also like
            </h3>
            <div className="overflow-x-auto -mx-4 px-4 hide-scrollbar">
              <div className="flex gap-3">
                {relatedItems.map((relatedItem) => (
                  <button
                    key={relatedItem.id}
                    onClick={() => handleItemClick(relatedItem)}
                    className="flex-shrink-0 w-36 bg-white rounded-xl overflow-hidden border transition-all hover:shadow-md active:scale-98"
                    style={{ borderColor: 'var(--gray-200)' }}
                  >
                    <OptimizedImage
                      src={relatedItem.imageUrl}
                      alt={relatedItem.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-3">
                      <h4 
                        className="line-clamp-2 mb-1" 
                        style={{ 
                          color: 'var(--gray-900)', 
                          fontSize: '14px',
                          minHeight: '36px',
                        }}
                      >
                        {relatedItem.name}
                      </h4>
                      <span style={{ color: 'var(--orange-500)', fontSize: '14px' }}>
                        ${relatedItem.basePrice.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Special Instructions */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--gray-200)' }}>
          <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
            Special instructions
          </h3>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="No onions, extra cheese, etc."
            className="w-full p-3 rounded-xl border resize-none focus:outline-none focus:ring-2"
            style={{
              borderColor: 'var(--gray-300)',
              backgroundColor: 'white',
              color: 'var(--gray-900)',
            }}
            rows={3}
          />
        </div>

        {/* People Usually Add */}
        <PeopleUsuallyAdd
          item={item}
          allMenuItems={allMenuItems}
          onAddToCart={handleQuickAdd}
        />

        {/* Reviews */}
        {totalReviews > 0 && (
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

            {/* Review List */}
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

            {/* Pagination Controls */}
            {totalReviewPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={handlePreviousReview}
                  disabled={reviewPage === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-full border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--gray-50)] active:scale-95"
                  style={{ borderColor: 'var(--gray-300)' }}
                >
                  <ChevronLeft className="w-4 h-4" style={{ color: 'var(--gray-700)' }} />
                  <span style={{ color: 'var(--gray-700)', fontSize: '14px' }}>Previous</span>
                </button>

                <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                  Page {reviewPage} of {totalReviewPages}
                </span>

                <button
                  onClick={handleNextReview}
                  disabled={reviewPage === totalReviewPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-full border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--gray-50)] active:scale-95"
                  style={{ borderColor: 'var(--gray-300)' }}
                >
                  <span style={{ color: 'var(--gray-700)', fontSize: '14px' }}>Next</span>
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--gray-700)' }} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="max-w-[480px] mx-auto flex items-center gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 border rounded-full px-2 py-1" style={{ borderColor: 'var(--gray-300)' }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
              disabled={quantity <= 1}
            >
              <Minus className="w-5 h-5" style={{ color: 'var(--gray-700)' }} />
            </button>
            <span className="min-w-[24px] text-center" style={{ color: 'var(--gray-900)' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
            >
              <Plus className="w-5 h-5" style={{ color: 'var(--gray-700)' }} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-98 flex items-center justify-between"
            style={{
              backgroundColor: 'var(--orange-500)',
              color: 'white',
              minHeight: '48px',
            }}
          >
            <span>Add to cart</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </button>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
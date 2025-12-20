'use client'

import { Skeleton } from '@packages/ui'

/**
 * Skeleton for FoodCard component
 */
export function FoodCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Grid of food card skeletons
 */
export function FoodCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <FoodCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for CartItemCard component
 */
export function CartItemCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex gap-4">
        <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * List of cart item skeletons
 */
export function CartItemSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CartItemCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for Order card
 */
export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  )
}

/**
 * List of order skeletons
 */
export function OrderSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for Item Detail Page
 */
export function ItemDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      {/* Hero Image */}
      <Skeleton className="w-full h-64" />

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Title & Description */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Price */}
        <Skeleton className="h-6 w-24" />

        {/* Sizes */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-12 w-20" />
          </div>
        </div>

        {/* Toppings */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 flex-1" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for Menu Page
 */
export function MenuPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-full" />
      </div>

      {/* Categories */}
      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Food Grid */}
        <FoodCardSkeletonGrid count={6} />
      </div>
    </div>
  )
}

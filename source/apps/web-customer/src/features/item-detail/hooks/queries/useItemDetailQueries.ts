import { useQuery } from '@tanstack/react-query'
import { MenuDataFactory } from '@/features/menu/data'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'
import type { MenuItem, Review } from '@/types'
import apiClient from '@/api/client'

export function useItemDetailQuery(itemId: string) {
  return useQuery({
    queryKey: ['menu-item', itemId],
    queryFn: async () => {
      const adapter = MenuDataFactory.getStrategy()
      const startTime = Date.now()
      try {
        log('data', 'Fetching item detail', { itemId: maskId(itemId) }, { feature: 'item-detail' })
        const response = await adapter.getMenuItem(itemId)

        if (response.success && response.data) {
          log('data', 'Item loaded', { itemId: maskId(response.data.id), durationMs: Date.now() - startTime }, { feature: 'item-detail' })
          return response.data as MenuItem
        }

        const message = response.message || 'Failed to fetch item detail'
        logError('data', 'Item detail fetch failed', { message }, { feature: 'item-detail' })
        throw new Error(message)
      } catch (error) {
        logError('data', 'Item detail fetch error', error, { feature: 'item-detail' })
        throw error
      }
    },
  })
}

export function useMenuItemsQuery(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['menu-items', tenantId],
    enabled: Boolean(tenantId),
    queryFn: async () => {
      const adapter = MenuDataFactory.getStrategy()
      const response = await adapter.getPublicMenu()
      return response.data?.items as MenuItem[]
    },
  })
}

/**
 * Fetch reviews for a menu item from the API
 * Uses GET /menu-items/:menuItemId/reviews?tenantId=xxx
 */
export function useItemReviewsQuery(menuItemId: string | undefined, tenantId: string | undefined) {
  return useQuery({
    queryKey: ['menu-item-reviews', menuItemId, tenantId],
    enabled: Boolean(menuItemId) && Boolean(tenantId),
    queryFn: async () => {
      if (!menuItemId || !tenantId) return { reviews: [], averageRating: 0, totalReviews: 0 }
      
      try {
        log('data', 'Fetching item reviews', { menuItemId: maskId(menuItemId) }, { feature: 'item-detail' })
        const response = await apiClient.get(`/menu-items/${menuItemId}/reviews`, {
          params: { tenantId }
        })
        
        const data = response.data?.data || response.data
        
        // Map API response to Review type
        const reviews: Review[] = (data?.reviews || []).map((r: any) => ({
          id: r.id || r.reviewId,
          reviewerName: r.reviewerName || 'Anonymous',
          rating: r.rating || 0,
          comment: r.comment || r.content || '',
          date: r.createdAt || r.date || new Date().toISOString(),
        }))
        
        log('data', 'Reviews loaded', { 
          menuItemId: maskId(menuItemId), 
          count: reviews.length,
          averageRating: data?.averageRating 
        }, { feature: 'item-detail' })
        
        return {
          reviews,
          averageRating: data?.averageRating || 0,
          totalReviews: data?.totalReviews || reviews.length,
        }
      } catch (error) {
        logError('data', 'Reviews fetch error', error, { feature: 'item-detail' })
        // Return empty on error - don't break the UI
        return { reviews: [], averageRating: 0, totalReviews: 0 }
      }
    },
    // Don't refetch on window focus for reviews
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

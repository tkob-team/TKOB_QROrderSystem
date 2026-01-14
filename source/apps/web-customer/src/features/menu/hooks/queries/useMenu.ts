import { useState, useEffect } from 'react'
import { MenuDataFactory } from '../../data'
import { MenuItem, ApiResponse } from '@/types'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'

interface UseMenuItemReturn {
  item: MenuItem | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Feature hook to fetch single menu item by ID
 * Uses feature-owned data layer (MenuDataFactory)
 */
export function useMenuItem(itemId: string): UseMenuItemReturn {
  const [item, setItem] = useState<MenuItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItem = async () => {
    const startTime = Date.now()
    try {
      setIsLoading(true)
      setError(null)
      log('data', 'Menu item fetch attempt', { itemId: maskId(itemId) }, { feature: 'menu' });
      const strategy = MenuDataFactory.getStrategy()
      const response: ApiResponse<MenuItem> = await strategy.getMenuItem(itemId)

      if (response.success && response.data) {
        setItem(response.data)
        log('data', 'Menu item fetch success', { itemId: maskId(itemId), durationMs: Date.now() - startTime }, { feature: 'menu' });
      } else {
        setError(response.message || 'Failed to fetch item')
        logError('data', 'Menu item fetch failed', { message: response.message }, { feature: 'menu' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      logError('data', 'Menu item fetch error', err, { feature: 'menu' });
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (itemId) {
      fetchItem()
    }
  }, [itemId])

  return {
    item,
    isLoading,
    error,
    refetch: fetchItem,
  }
}

interface UseMenuReturn {
  data: MenuItem[] | null
  items: MenuItem[]
  categories: string[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Feature hook to fetch public menu (session-based)
 * Uses feature-owned data layer (MenuDataFactory)
 * 
 * No token needed - uses HttpOnly cookie automatically
 */
export function useMenu(tenantId?: string): UseMenuReturn {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenu = async () => {
    const startTime = Date.now()
    try {
      if (!tenantId) {
        // Wait until tenant context is available (session load)
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      setError(null)
      log('data', 'Fetching menu', { tenantId: maskId(tenantId || '') }, { feature: 'menu', dedupe: true, dedupeTtlMs: 10000 });
      const strategy = MenuDataFactory.getStrategy()
      const response = await strategy.getPublicMenu()

      if (response.success && response.data) {
        setItems(response.data.items)
        setCategories(response.data.categories)
        log('data', 'Menu loaded', { itemCount: response.data.items.length, categoryCount: response.data.categories.length, durationMs: Date.now() - startTime }, { feature: 'menu' });
      } else {
        setError(response.message || 'Failed to fetch menu')
        logError('data', 'Menu fetch failed', { message: response.message }, { feature: 'menu' });
      }
    } catch (err) {
      logError('data', 'Menu fetch error', err, { feature: 'menu' });
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
  }, [tenantId])

  return {
    data: items,
    items,
    categories,
    isLoading,
    error,
    refetch: fetchMenu,
  }
}

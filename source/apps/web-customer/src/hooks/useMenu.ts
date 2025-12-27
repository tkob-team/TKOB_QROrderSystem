import { useState, useEffect } from 'react'
import { MenuService } from '@/api/services/menu.service'
import { MenuItem, ApiResponse } from '@/types'

interface UseMenuItemReturn {
  item: MenuItem | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook to fetch single menu item by ID
 */
export function useMenuItem(itemId: string): UseMenuItemReturn {
  const [item, setItem] = useState<MenuItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItem = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response: ApiResponse<MenuItem> = await MenuService.getMenuItem(itemId)
      
      if (response.success && response.data) {
        setItem(response.data)
      } else {
        setError(response.message || 'Failed to fetch item')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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
 * Hook to fetch public menu (session-based)
 * No token needed - uses HttpOnly cookie automatically
 */
export function useMenu(tenantId?: string): UseMenuReturn {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenu = async () => {
    try {
      if (!tenantId) {
        // Wait until tenant context is available (session load)
        setIsLoading(false)
        return
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('[useMenu] fetching menu')
      }
      setIsLoading(true)
      setError(null)
      const response = await MenuService.getPublicMenu(tenantId)
      
      if (response.success && response.data) {
        setItems(response.data.items)
        setCategories(response.data.categories)
      } else {
        setError(response.message || 'Failed to fetch menu')
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[useMenu] fetchMenu error', err)
      }
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

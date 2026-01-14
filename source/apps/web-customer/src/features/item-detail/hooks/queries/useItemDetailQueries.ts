import { useQuery } from '@tanstack/react-query'
import { MenuDataFactory } from '@/features/menu/data'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'
import type { MenuItem } from '@/types'

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

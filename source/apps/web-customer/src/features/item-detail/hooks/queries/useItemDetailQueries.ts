import { useQuery } from '@tanstack/react-query'
import { MenuDataFactory } from '@/features/menu/data'
import type { MenuItem } from '@/types'

export function useItemDetailQuery(itemId: string) {
  return useQuery({
    queryKey: ['menu-item', itemId],
    queryFn: async () => {
      const adapter = MenuDataFactory.getStrategy()
      const response = await adapter.getMenuItem(itemId)
      return response.data as MenuItem
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

import { useQuery } from '@tanstack/react-query'
import { MenuService } from '@/api/services/menu.service'
import type { MenuItem } from '@/types'

export function useItemDetailQuery(itemId: string) {
  return useQuery({
    queryKey: ['menu-item', itemId],
    queryFn: async () => {
      const response = await MenuService.getMenuItem(itemId)
      return response.data as MenuItem
    },
  })
}

export function useMenuItemsQuery(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['menu-items', tenantId],
    enabled: Boolean(tenantId),
    queryFn: async () => {
      const response = await MenuService.getPublicMenu(tenantId!)
      return response.data?.items as MenuItem[]
    },
  })
}

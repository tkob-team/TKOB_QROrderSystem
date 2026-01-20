"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { log } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'
import { Order, type OrdersState, toFeatureOrder } from '../model'
import type { Order as ApiOrder } from '@/types/order'
import { OrdersDataFactory } from '../data'
import { orderQueryKeys } from '../data/cache/orderQueryKeys'
import { useSession } from '@/features/tables/hooks/useSession'
import { USE_MOCK_API } from '@/shared/config'
import { useCurrentUser } from '@/features/profile/hooks/queries/useCurrentUser'
import apiClient from '@/api/client'

export function useOrdersController() {
  const router = useRouter()
  const { session } = useSession()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Extract sessionId from session
  const sessionId = session?.tableId

  // Mock/API data (replace with real API calls)
  // Current session orders (all orders in this session, sorted desc)
  const { data: currentSessionOrders = [], isLoading: currentLoading } = useQuery({
    queryKey: orderQueryKeys.currentOrder(sessionId || 'default'),
    queryFn: async () => {
      const strategy = OrdersDataFactory.getStrategy()
      
      // Use getTableOrders() instead of deprecated getOrderHistory()
      let list: ApiOrder[];
      if (USE_MOCK_API) {
        // Mock adapter still uses getOrderHistory with sessionId
        const historyResp = await strategy.getOrderHistory('mock-user', sessionId)
        list = (historyResp.data || []) as ApiOrder[]
      } else {
        // Real API adapter uses getTableOrders() - session cookie auto-included
        list = await strategy.getTableOrders()
      }
      
      // Sort desc by createdAt (most recent first)
      if (process.env.NEXT_PUBLIC_USE_LOGGING) {
        log('data', 'getTableOrders returned orders for session', { count: list.length, sessionId: maskId(sessionId || '') }, { feature: 'orders' })
      }
      const sorted = list
        .slice()
        .sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime())
      return sorted.map(toFeatureOrder)
    },
    enabled: !!sessionId,
    // BUG FIX: Force refetch on mount and consider data always stale
    refetchOnMount: 'always',
    staleTime: 0, // Always consider data stale
    refetchInterval: false, // Don't poll (will use WebSocket later)
  })
  const { data: orderHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: orderQueryKeys.orderHistory(sessionId || 'default'),
    queryFn: async () => {
      const strategy = OrdersDataFactory.getStrategy()
      
      // Use getTableOrders() instead of deprecated getOrderHistory()
      let list: ApiOrder[];
      if (USE_MOCK_API) {
        // Mock adapter still uses getOrderHistory with sessionId
        const resp = await strategy.getOrderHistory('mock-user', sessionId)
        list = (resp.data || []) as ApiOrder[]
      } else {
        // Real API adapter uses getTableOrders() - session cookie auto-included
        list = await strategy.getTableOrders()
      }
      
      return list.map(toFeatureOrder)
    },
    enabled: !!sessionId,
  })

  // Get current user to check login status (must be before using userResponse)
  const { data: userResponse } = useCurrentUser()
  const isLoggedIn = !!userResponse?.data

  // Fetch logged-in user's order history from dedicated endpoint
  const { data: userOrderHistory = [], isLoading: userHistoryLoading } = useQuery({
    queryKey: ['customer-order-history', userResponse?.data?.id],
    queryFn: async () => {
      if (!userResponse?.data?.id) return []
      
      // Call the new /orders/history endpoint
      const response = await apiClient.get<{ data: { orders: ApiOrder[], total: number } }>('/orders/history', {
        params: { limit: 50 }
      })
      
      // Backend returns { success, data: { orders: [...], total: N } }
      const list = response.data?.data?.orders || []
      log('data', 'Fetched customer order history', { count: list.length }, { feature: 'orders' })
      
      return list.map(toFeatureOrder)
    },
    enabled: !!userResponse?.data?.id && !USE_MOCK_API,
  })

  // Combine order history: session orders + user's past orders (if logged in)
  const combinedOrderHistory = useMemo(() => {
    if (isLoggedIn && userOrderHistory.length > 0) {
      // Merge and deduplicate by order ID
      const allOrders = [...orderHistory, ...userOrderHistory]
      const uniqueOrders = Array.from(
        new Map(allOrders.map(o => [o.id, o])).values()
      )
      // Sort by createdAt desc
      return uniqueOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }
    return orderHistory
  }, [isLoggedIn, orderHistory, userOrderHistory])

  // State
  const state: OrdersState = useMemo(
    () => ({
      currentOrder: currentSessionOrders[0] || null,
      currentSessionOrders,
      orderHistory: combinedOrderHistory,
      selectedOrder,
      isLoggedIn,
      isLoading: currentLoading || historyLoading || userHistoryLoading,
      error: null,
    }),
    [currentSessionOrders, combinedOrderHistory, selectedOrder, isLoggedIn, currentLoading, historyLoading, userHistoryLoading]
  )

  // Actions
  const selectOrder = (order: Order) => {
    setSelectedOrder(order)
  }

  const openOrderDetails = (orderId: string) => {
    log('ui', 'Navigate to order detail from orders list', { orderId: maskId(orderId) }, { feature: 'orders' });
    // BUG-13 fix: Add ?from=orders param to enable smart back navigation
    router.push(`/orders/${orderId}?from=orders`)
  }

  const openTracking = (orderId: string) => {
    router.push(`/orders/${orderId}/tracking`)
  }

  const handleLogin = () => {
    router.push('/login')
  }

  const handlePayOrder = (order: Order) => {
    // Navigate to payment page with order ID
    router.push('/payment?orderId=' + order.id)
  }

  return {
    state,
    selectOrder,
    openOrderDetails,
    openTracking,
    handleLogin,
    handlePayOrder,
  }
}

// End of controller exports (toFeatureOrder moved to model/utils.ts)

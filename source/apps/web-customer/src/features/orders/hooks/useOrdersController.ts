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
      // In mock, returns all orders in current session
      // Pass sessionId for localStorage persistence
      const historyResp = await strategy.getOrderHistory('mock-user', sessionId)
      const list = (historyResp.data || []) as ApiOrder[]
      // Sort desc by createdAt (most recent first)
      if (process.env.NEXT_PUBLIC_USE_LOGGING) {
        log('data', 'getOrderHistory returned orders for session', { count: list.length, sessionId: maskId(sessionId || '') }, { feature: 'orders' })
      }
      const sorted = list
        .slice()
        .sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime())
      return sorted.map(toFeatureOrder)
    },
    enabled: !!sessionId,
  })
  const { data: orderHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: orderQueryKeys.orderHistory(sessionId || 'default'),
    queryFn: async () => {
      const strategy = OrdersDataFactory.getStrategy()
      const resp = await strategy.getOrderHistory('mock-user', sessionId)
      const list = (resp.data || []) as ApiOrder[]
      return list.map(toFeatureOrder)
    },
    enabled: !!sessionId,
  })

  // State
  const state: OrdersState = useMemo(
    () => ({
      currentOrder: currentSessionOrders[0] || null,
      currentSessionOrders,
      orderHistory,
      selectedOrder,
      isLoggedIn: false, // TODO: Get from auth context
      isLoading: currentLoading || historyLoading,
      error: null,
    }),
    [currentSessionOrders, orderHistory, selectedOrder, currentLoading, historyLoading]
  )

  // Actions
  const selectOrder = (order: Order) => {
    setSelectedOrder(order)
  }

  const openOrderDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  const openTracking = (orderId: string) => {
    router.push(`/orders/${orderId}/tracking`)
  }

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handlePayOrder = (order: Order) => {
    // TODO: Navigate to payment with order context
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

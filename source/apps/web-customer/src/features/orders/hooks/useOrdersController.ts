import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Order, type OrdersState } from '../model'
import { OrderService } from '@/api/services/order.service'

export function useOrdersController() {
  const router = useRouter()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Mock/API data (replace with real API calls)
  const { data: currentOrder, isLoading: currentLoading } = useQuery({
    queryKey: ['currentOrder'],
    queryFn: async () => {
      // TODO: Replace with real API or mock
      return null as Order | null
    },
  })

  const { data: orderHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['orderHistory'],
    queryFn: async () => {
      // TODO: Replace with real API or mock
      return [] as Order[]
    },
  })

  // State
  const state: OrdersState = useMemo(
    () => ({
      currentOrder: currentOrder || null,
      orderHistory,
      selectedOrder,
      isLoggedIn: false, // TODO: Get from auth context
      isLoading: currentLoading || historyLoading,
      error: null,
    }),
    [currentOrder, orderHistory, selectedOrder, currentLoading, historyLoading]
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

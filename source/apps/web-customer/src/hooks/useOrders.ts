import { useState, useEffect } from 'react'
import { OrderService } from '@/api/services'
import type { Order } from '@/types/order'

interface UseOrdersResult {
  orders: Order[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook to fetch order history for a customer
 */
export function useOrders(customerId?: string): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    if (!customerId) {
      setOrders([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const response = await OrderService.getOrderHistory(customerId)
      setOrders(response.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [customerId])

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
  }
}

interface UseOrderResult {
  order: Order | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook to fetch a single order by ID
 */
export function useOrder(orderId: string): UseOrderResult {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await OrderService.getOrder(orderId)
      setOrder(response.data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order')
      setOrder(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  return {
    order,
    isLoading,
    error,
    refetch: fetchOrder,
  }
}

interface UseCurrentSessionResult {
  currentOrder: Order | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook to fetch current session order (active order at table)
 * TODO: Implement getCurrentSession in OrderService when backend is ready
 */
export function useCurrentSession(tableId?: string): UseCurrentSessionResult {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCurrentSession = async () => {
    if (!tableId) {
      setCurrentOrder(null)
      setIsLoading(false)
      return
    }

    // TODO: Implement when OrderService.getCurrentSession is available
    // For now, return empty state
    setIsLoading(false)
    setCurrentOrder(null)
  }

  useEffect(() => {
    fetchCurrentSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId])

  return {
    currentOrder,
    isLoading,
    error,
    refetch: fetchCurrentSession,
  }
}

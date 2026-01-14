import { useState, useEffect } from 'react'
import { OrdersDataFactory } from '../../data'
import type { Order } from '@/types/order'

interface UseOrdersResult {
  orders: Order[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Feature hook to fetch order history for a customer
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
      const strategy = OrdersDataFactory.getStrategy()
      const response = await strategy.getOrderHistory(customerId)
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
 * Feature hook to fetch a single order by ID
 */
export function useOrder(orderId: string): UseOrderResult {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const strategy = OrdersDataFactory.getStrategy()
      const response = await strategy.getOrder(orderId)
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

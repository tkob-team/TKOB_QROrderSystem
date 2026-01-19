'use client'

import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/axios'

interface RevenueItem {
  id: string
  name: string
  revenue: number
  quantity: number
  percentageOfTotal: number
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number // percentage change
}

interface TopRevenueItemsProps {
  /** Number of items to show */
  limit?: number
  /** Time period for data */
  period?: 'today' | 'week' | 'month' | 'all'
  /** Title for the section */
  title?: string
}

export function TopRevenueItems({
  limit = 5,
  period = 'week',
  title = 'Top Revenue Items',
}: TopRevenueItemsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'top-revenue-items', period, limit],
    queryFn: async () => {
      try {
        const response = await api.get('/api/v1/admin/analytics/top-items', {
          params: { period, limit },
        })
        return response.data?.data || response.data
      } catch (e) {
        // Return mock data for demo if API doesn't exist yet
        return generateMockData(limit)
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  })

  const items: RevenueItem[] = data?.items || data || []
  const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0)

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 border" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="animate-pulse">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || items.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border" style={{ borderColor: 'var(--gray-200)' }}>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--gray-900)' }}>
          {title}
        </h3>
        <div className="text-center py-8">
          <Package className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--gray-300)' }} />
          <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
            No revenue data available yet
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 border" style={{ borderColor: 'var(--gray-200)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: 'var(--gray-900)' }}>
          {title}
        </h3>
        <span style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
          {period === 'today' && 'Today'}
          {period === 'week' && 'This Week'}
          {period === 'month' && 'This Month'}
          {period === 'all' && 'All Time'}
        </span>
      </div>

      {/* Total Revenue Summary */}
      <div
        className="flex items-center gap-3 p-3 rounded-lg mb-4"
        style={{ backgroundColor: 'var(--emerald-50)' }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--emerald-100)' }}
        >
          <DollarSign className="w-5 h-5" style={{ color: 'var(--emerald-600)' }} />
        </div>
        <div>
          <p style={{ color: 'var(--gray-600)', fontSize: '12px' }}>Total Revenue</p>
          <p style={{ color: 'var(--emerald-700)', fontSize: '18px', fontWeight: 600 }}>
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-[var(--gray-50)]"
          >
            {/* Rank Badge */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-semibold"
              style={{
                backgroundColor:
                  index === 0
                    ? 'var(--orange-100)'
                    : index === 1
                    ? 'var(--gray-200)'
                    : index === 2
                    ? 'var(--amber-100)'
                    : 'var(--gray-100)',
                color:
                  index === 0
                    ? 'var(--orange-600)'
                    : index === 1
                    ? 'var(--gray-600)'
                    : index === 2
                    ? 'var(--amber-700)'
                    : 'var(--gray-500)',
                fontSize: '14px',
              }}
            >
              {index + 1}
            </div>

            {/* Item Info */}
            <div className="flex-1 min-w-0">
              <p
                className="font-medium truncate"
                style={{ color: 'var(--gray-900)', fontSize: '14px' }}
              >
                {item.name}
              </p>
              <p style={{ color: 'var(--gray-500)', fontSize: '12px' }}>
                {item.quantity} sold • {item.percentageOfTotal.toFixed(1)}% of total
              </p>
            </div>

            {/* Revenue & Trend */}
            <div className="text-right shrink-0">
              <p
                className="font-semibold"
                style={{ color: 'var(--gray-900)', fontSize: '14px' }}
              >
                ${item.revenue.toFixed(2)}
              </p>
              {item.trend && item.trendValue !== undefined && (
                <div
                  className="flex items-center justify-end gap-1"
                  style={{
                    color:
                      item.trend === 'up'
                        ? 'var(--emerald-500)'
                        : item.trend === 'down'
                        ? 'var(--red-500)'
                        : 'var(--gray-500)',
                    fontSize: '12px',
                  }}
                >
                  {item.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {item.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                  <span>
                    {item.trend === 'up' ? '+' : ''}
                    {item.trendValue}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Bar Visualization */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--gray-200)' }}>
        <p style={{ color: 'var(--gray-600)', fontSize: '12px', marginBottom: '8px' }}>
          Revenue Distribution
        </p>
        <div className="flex gap-1 h-3 rounded-full overflow-hidden">
          {items.map((item, index) => (
            <div
              key={item.id}
              style={{
                width: `${item.percentageOfTotal}%`,
                backgroundColor: getBarColor(index),
              }}
              title={`${item.name}: ${item.percentageOfTotal.toFixed(1)}%`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function getBarColor(index: number): string {
  const colors = [
    'var(--orange-500)',
    'var(--blue-500)',
    'var(--emerald-500)',
    'var(--purple-500)',
    'var(--amber-500)',
    'var(--pink-500)',
    'var(--cyan-500)',
    'var(--indigo-500)',
  ]
  return colors[index % colors.length]
}

function generateMockData(limit: number): RevenueItem[] {
  const items = [
    { name: 'Margherita Pizza', revenue: 1250.00, quantity: 125 },
    { name: 'Grilled Salmon', revenue: 980.50, quantity: 65 },
    { name: 'Caesar Salad', revenue: 720.00, quantity: 90 },
    { name: 'Pasta Carbonara', revenue: 650.00, quantity: 50 },
    { name: 'Tiramisu', revenue: 480.00, quantity: 80 },
    { name: 'Garlic Bread', revenue: 320.00, quantity: 160 },
    { name: 'Chicken Wings', revenue: 290.00, quantity: 58 },
  ]

  const total = items.reduce((sum, item) => sum + item.revenue, 0)

  return items.slice(0, limit).map((item, index) => ({
    id: `item-${index}`,
    name: item.name,
    revenue: item.revenue,
    quantity: item.quantity,
    percentageOfTotal: (item.revenue / total) * 100,
    trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    trendValue: Math.round(Math.random() * 20),
  }))
}

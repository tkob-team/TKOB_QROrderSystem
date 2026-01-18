import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { Prisma } from '@prisma/client'

interface DateRangeOptions {
  from?: Date
  to?: Date
}

interface RevenueOptions extends DateRangeOptions {
  groupBy?: 'day' | 'week' | 'month'
}

interface PopularItemsOptions extends DateRangeOptions {
  limit?: number
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get overview dashboard stats
   */
  async getOverview(tenantId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

    // Today's orders
    const [todayOrders, thisMonthOrders, lastMonthOrders, activeTables] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          tenantId,
          createdAt: { gte: today },
          status: { notIn: ['CANCELLED'] },
        },
        _count: { id: true },
        _sum: { total: true },
      }),
      
      // This month's orders
      this.prisma.order.aggregate({
        where: {
          tenantId,
          createdAt: { gte: thisMonth },
          status: { notIn: ['CANCELLED'] },
        },
        _count: { id: true },
        _sum: { total: true },
      }),

      // Last month's orders (for comparison)
      this.prisma.order.aggregate({
        where: {
          tenantId,
          createdAt: { gte: lastMonth, lte: lastMonthEnd },
          status: { notIn: ['CANCELLED'] },
        },
        _count: { id: true },
        _sum: { total: true },
      }),

      // Active tables (AVAILABLE or OCCUPIED - not INACTIVE)
      this.prisma.table.count({
        where: { tenantId, status: { notIn: ['INACTIVE'] } },
      }),
    ])

    // Calculate average order value
    const avgOrderValue = thisMonthOrders._count.id > 0
      ? Number(thisMonthOrders._sum.total) / thisMonthOrders._count.id
      : 0

    // Calculate month-over-month growth
    const revenueGrowth = lastMonthOrders._sum.total
      ? ((Number(thisMonthOrders._sum.total) - Number(lastMonthOrders._sum.total)) / Number(lastMonthOrders._sum.total)) * 100
      : 0

    const ordersGrowth = lastMonthOrders._count.id
      ? ((thisMonthOrders._count.id - lastMonthOrders._count.id) / lastMonthOrders._count.id) * 100
      : 0

    return {
      today: {
        orders: todayOrders._count.id,
        revenue: Number(todayOrders._sum.total || 0),
      },
      thisMonth: {
        orders: thisMonthOrders._count.id,
        revenue: Number(thisMonthOrders._sum.total || 0),
      },
      activeTables,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      growth: {
        revenue: Math.round(revenueGrowth * 100) / 100,
        orders: Math.round(ordersGrowth * 100) / 100,
      },
    }
  }

  /**
   * Get revenue grouped by time period
   */
  async getRevenue(tenantId: string, options: RevenueOptions = {}) {
    const { from, to, groupBy = 'day' } = options

    // Default to last 30 days
    const endDate = to || new Date()
    const startDate = from || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    const dateFormat = {
      day: 'YYYY-MM-DD',
      week: 'IYYY-"W"IW',
      month: 'YYYY-MM',
    }[groupBy]

    // Use raw query for date grouping (PostgreSQL syntax)
    // Note: Using < endDate (exclusive) to match standard date range semantics
    // Frontend should send from=2026-01-18 to=2026-01-19 to get all orders on Jan 18
    const results = await this.prisma.$queryRaw<Array<{ period: string; total: any; count: any }>>(
      Prisma.sql`
        SELECT 
          TO_CHAR("created_at", ${Prisma.raw(`'${dateFormat}'`)}) as period,
          SUM(total)::numeric as total,
          COUNT(*)::bigint as count
        FROM orders
        WHERE tenant_id = ${tenantId}
          AND created_at >= ${startDate}
          AND created_at < ${endDate}
          AND status NOT IN ('CANCELLED')
        GROUP BY TO_CHAR("created_at", ${Prisma.raw(`'${dateFormat}'`)})
        ORDER BY period ASC
      `
    )

    return {
      period: { from: startDate, to: endDate },
      groupBy,
      data: results.map(r => ({
        period: r.period,
        revenue: Number(r.total),
        orders: Number(r.count),
      })),
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(tenantId: string, options: DateRangeOptions = {}) {
    const { from, to } = options
    const endDate = to || new Date()
    const startDate = from || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Note: Using lt (exclusive) for endDate to match standard date range semantics
    // Frontend should send from=2026-01-18 to=2026-01-19 to get all orders on Jan 18
    const whereClause: Prisma.OrderWhereInput = {
      tenantId,
      createdAt: { gte: startDate, lt: endDate },
    }

    const [
      totalOrders,
      statusBreakdown,
      paymentMethodBreakdown,
      avgPrepTime,
    ] = await Promise.all([
      // Total orders count
      this.prisma.order.count({ where: whereClause }),

      // Status breakdown
      this.prisma.order.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { id: true },
      }),

      // Payment method breakdown
      this.prisma.order.groupBy({
        by: ['paymentMethod'],
        where: { ...whereClause, status: { notIn: ['CANCELLED'] } },
        _count: { id: true },
        _sum: { total: true },
      }),

      // Average preparation time
      this.prisma.order.aggregate({
        where: { ...whereClause, actualPrepTime: { not: null } },
        _avg: { actualPrepTime: true },
      }),
    ])

    return {
      period: { from: startDate, to: endDate },
      totalOrders,
      byStatus: statusBreakdown.map(s => ({
        status: s.status,
        count: s._count.id,
      })),
      byPaymentMethod: paymentMethodBreakdown.map(p => ({
        method: p.paymentMethod,
        count: p._count.id,
        revenue: Number(p._sum.total || 0),
      })),
      avgPrepTime: avgPrepTime._avg.actualPrepTime
        ? Math.round(avgPrepTime._avg.actualPrepTime)
        : null,
    }
  }

  /**
   * Get top selling menu items
   */
  async getPopularItems(tenantId: string, options: PopularItemsOptions = {}) {
    const { limit = 10, from, to } = options
    const endDate = to || new Date()
    const startDate = from || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    const results = await this.prisma.orderItem.groupBy({
      by: ['menuItemId', 'name'],
      where: {
        order: {
          tenantId,
          createdAt: { gte: startDate, lt: endDate },
          status: { notIn: ['CANCELLED'] },
        },
      },
      _sum: {
        quantity: true,
        itemTotal: true,
      },
      orderBy: {
        _sum: { quantity: 'desc' },
      },
      take: limit,
    })

    return {
      period: { from: startDate, to: endDate },
      items: results.map((r, index) => ({
        rank: index + 1,
        menuItemId: r.menuItemId,
        name: r.name,
        totalQuantity: r._sum.quantity || 0,
        totalRevenue: Number(r._sum.itemTotal || 0),
      })),
    }
  }

  /**
   * Get orders distribution by hour of day
   */
  async getHourlyDistribution(tenantId: string, options: DateRangeOptions = {}) {
    const { from, to } = options
    const endDate = to || new Date()
    const startDate = from || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

const results = await this.prisma.$queryRaw<Array<{ hour: any; count: any; total: any }>>(
      Prisma.sql`
        SELECT 
          EXTRACT(HOUR FROM created_at)::integer as hour,
          COUNT(*)::bigint as count,
          SUM(total)::numeric as total
        FROM orders
        WHERE tenant_id = ${tenantId}
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
          AND status NOT IN ('CANCELLED')
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY hour ASC
      `
    )

    // Fill in missing hours with zeros
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const found = results.find(r => Number(r.hour) === hour)
      return {
        hour,
        orders: found ? Number(found.count) : 0,
        revenue: found ? Number(found.total) : 0,
      }
    })

    return {
      period: { from: startDate, to: endDate },
      distribution: hourlyData,
    }
  }

  /**
   * Get table performance metrics
   */
  async getTablePerformance(tenantId: string, options: DateRangeOptions = {}) {
    const { from, to } = options
    const endDate = to || new Date()
    const startDate = from || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    const results = await this.prisma.order.groupBy({
      by: ['tableId'],
      where: {
        tenantId,
        createdAt: { gte: startDate, lt: endDate },
        status: { notIn: ['CANCELLED'] },
      },
      _count: { id: true },
      _sum: { total: true },
      _avg: { total: true },
    })

    // Get table details
    const tableIds = results.map(r => r.tableId)
    const tables = await this.prisma.table.findMany({
      where: { id: { in: tableIds } },
      select: { id: true, tableNumber: true },
    })

    const tableMap = new Map(tables.map(t => [t.id, t]))

    return {
      period: { from: startDate, to: endDate },
      tables: results
        .map(r => ({
          tableId: r.tableId,
          tableNumber: tableMap.get(r.tableId)?.tableNumber || 'Unknown',
          orders: r._count.id,
          totalRevenue: Number(r._sum.total || 0),
          avgOrderValue: Number(r._avg.total || 0),
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue),
    }
  }
}

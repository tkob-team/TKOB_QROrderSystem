import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateReviewDto,
  ReviewResponseDto,
  OrderReviewSummaryDto,
  MenuItemReviewStatsDto,
  TenantReviewStatsDto,
} from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create or update a review for an order item
   */
  async createOrUpdateReview(
    tenantId: string,
    orderId: string,
    orderItemId: string,
    sessionId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    // Verify the order item exists and belongs to the order
    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        orderId: orderId,
        order: {
          tenantId: tenantId,
        },
      },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    // Verify the session matches the order
    if (orderItem.order.sessionId !== sessionId) {
      throw new ForbiddenException(
        'You can only review items from your own session',
      );
    }

    // Check if order is eligible for review (SERVED, READY, COMPLETED, or PAID)
    const reviewableStatuses = ['SERVED', 'READY', 'COMPLETED', 'PAID'];
    if (!reviewableStatuses.includes(orderItem.order.status)) {
      throw new BadRequestException(
        'You can only review items after they have been served',
      );
    }

    // Create or update the review
    const review = await this.prisma.itemReview.upsert({
      where: {
        orderItemId: orderItemId,
      },
      create: {
        orderItemId: orderItemId,
        sessionId: sessionId,
        tenantId: tenantId,
        rating: dto.rating,
        comment: dto.comment,
        reviewerName: dto.reviewerName,
      },
      update: {
        rating: dto.rating,
        comment: dto.comment,
        reviewerName: dto.reviewerName,
        updatedAt: new Date(),
      },
    });

    return {
      id: review.id,
      orderItemId: review.orderItemId,
      sessionId: review.sessionId,
      rating: review.rating,
      comment: review.comment ?? undefined,
      createdAt: review.createdAt,
      itemName: orderItem.name,
      reviewerName: review.reviewerName ?? undefined,
    };
  }

  /**
   * Get all reviews for an order
   */
  async getOrderReviews(
    tenantId: string,
    orderId: string,
  ): Promise<OrderReviewSummaryDto> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId: tenantId,
      },
      include: {
        items: {
          include: {
            review: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const reviews = order.items
      .filter((item) => item.review)
      .map((item) => ({
        id: item.review!.id,
        orderItemId: item.review!.orderItemId,
        sessionId: item.review!.sessionId,
        rating: item.review!.rating,
        comment: item.review!.comment ?? undefined,
        createdAt: item.review!.createdAt,
        itemName: item.name,
      }));

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating =
      reviews.length > 0 ? totalRating / reviews.length : 0;

    return {
      orderId: order.id,
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    };
  }

  /**
   * Get review statistics for a menu item
   */
  async getMenuItemReviewStats(
    tenantId: string,
    menuItemId: string,
  ): Promise<MenuItemReviewStatsDto> {
    const menuItem = await this.prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        category: {
          tenantId: tenantId,
        },
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    // Get all reviews for this menu item through order items
    const reviews = await this.prisma.itemReview.findMany({
      where: {
        tenantId: tenantId,
        orderItem: {
          menuItemId: menuItemId,
        },
      },
      include: {
        orderItem: {
          select: {
            name: true,
            order: {
              select: {
                customerName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalRating = 0;
    for (const review of reviews) {
      totalRating += review.rating;
      ratingDistribution[review.rating]++;
    }

    const averageRating =
      reviews.length > 0 ? totalRating / reviews.length : 0;

    // Map reviews to response format
    const reviewResponses = reviews.map((review, index) => ({
      id: review.id,
      orderItemId: review.orderItemId,
      sessionId: review.sessionId,
      rating: review.rating,
      comment: review.comment ?? undefined,
      createdAt: review.createdAt,
      itemName: review.orderItem.name,
      // Use saved reviewerName first, fallback to order customerName, then "Guest N"
      reviewerName: review.reviewerName || review.orderItem.order?.customerName || `Guest ${index + 1}`,
    }));

    return {
      menuItemId: menuItem.id,
      menuItemName: menuItem.name,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
      reviews: reviewResponses,
    };
  }

  /**
   * Get tenant-wide review statistics (for admin dashboard)
   */
  async getTenantReviewStats(tenantId: string): Promise<TenantReviewStatsDto> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all reviews for the tenant
    const allReviews = await this.prisma.itemReview.findMany({
      where: { tenantId },
      include: {
        orderItem: true,
      },
    });

    // Get recent reviews
    const recentReviews = allReviews.filter(
      (r) => r.createdAt >= thirtyDaysAgo,
    );

    // Calculate overall rating
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const overallRating =
      allReviews.length > 0 ? totalRating / allReviews.length : 0;

    // Group reviews by menu item
    const menuItemReviews = new Map<
      string,
      { name: string; ratings: number[] }
    >();

    for (const review of allReviews) {
      const menuItemId = review.orderItem.menuItemId;
      const existing = menuItemReviews.get(menuItemId);
      if (existing) {
        existing.ratings.push(review.rating);
      } else {
        menuItemReviews.set(menuItemId, {
          name: review.orderItem.name,
          ratings: [review.rating],
        });
      }
    }

    // Calculate stats per menu item
    const menuItemStats: MenuItemReviewStatsDto[] = [];
    for (const [menuItemId, data] of menuItemReviews) {
      const avg =
        data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;
      const distribution: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      data.ratings.forEach((r) => distribution[r]++);

      menuItemStats.push({
        menuItemId,
        menuItemName: data.name,
        averageRating: Math.round(avg * 10) / 10,
        totalReviews: data.ratings.length,
        ratingDistribution: distribution,
      });
    }

    // Sort to get top and low rated items
    const sortedByRating = [...menuItemStats].sort(
      (a, b) => b.averageRating - a.averageRating,
    );

    const topRatedItems = sortedByRating
      .filter((item) => item.totalReviews >= 3) // Minimum 3 reviews
      .slice(0, 5);

    const lowRatedItems = sortedByRating
      .filter((item) => item.totalReviews >= 3 && item.averageRating < 4)
      .reverse()
      .slice(0, 5);

    return {
      overallRating: Math.round(overallRating * 10) / 10,
      totalReviews: allReviews.length,
      recentReviewsCount: recentReviews.length,
      topRatedItems,
      lowRatedItems,
    };
  }

  /**
   * Get recent reviews for tenant (for admin list view)
   */
  async getRecentReviews(
    tenantId: string,
    limit: number = 20,
    page: number = 1,
  ) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.itemReview.findMany({
        where: { tenantId },
        include: {
          orderItem: {
            include: {
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  tableId: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.itemReview.count({ where: { tenantId } }),
    ]);

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        orderItemId: r.orderItemId,
        sessionId: r.sessionId,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        itemName: r.orderItem.name,
        orderNumber: r.orderItem.order.orderNumber,
        tableId: r.orderItem.order.tableId,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

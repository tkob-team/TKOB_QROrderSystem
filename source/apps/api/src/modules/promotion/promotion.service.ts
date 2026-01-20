import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PromotionType } from '@prisma/client';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  PromotionResponseDto,
  ValidatePromoDto,
  ValidatePromoResponseDto,
  PromotionListQueryDto,
} from './dto/promotion.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PromotionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new promotion
   */
  async createPromotion(
    tenantId: string,
    dto: CreatePromotionDto,
  ): Promise<PromotionResponseDto> {
    // Validate percentage value
    if (dto.type === PromotionType.PERCENTAGE && dto.value > 100) {
      throw new BadRequestException('Percentage value cannot exceed 100');
    }

    // Normalize code to uppercase
    const code = dto.code.toUpperCase().trim();

    // Check if code already exists for this tenant
    const existing = await this.prisma.promotion.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Promotion code "${code}" already exists`);
    }

    // Validate dates
    const startsAt = new Date(dto.startsAt);
    const expiresAt = new Date(dto.expiresAt);

    if (expiresAt <= startsAt) {
      throw new BadRequestException('Expiry date must be after start date');
    }

    const promotion = await this.prisma.promotion.create({
      data: {
        tenantId,
        code,
        description: dto.description,
        type: dto.type,
        value: dto.value,
        minOrderValue: dto.minOrderValue,
        maxDiscount: dto.maxDiscount,
        usageLimit: dto.usageLimit,
        startsAt,
        expiresAt,
        active: dto.active ?? true,
      },
    });

    return this.mapToResponse(promotion);
  }

  /**
   * Get all promotions for a tenant
   */
  async getPromotions(
    tenantId: string,
    query: PromotionListQueryDto,
  ): Promise<{
    promotions: PromotionResponseDto[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (query.active !== undefined) {
      where.active = query.active;
    }

    if (!query.includeExpired) {
      where.expiresAt = { gte: new Date() };
    }

    const [promotions, total] = await Promise.all([
      this.prisma.promotion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.promotion.count({ where }),
    ]);

    return {
      promotions: promotions.map((p) => this.mapToResponse(p)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single promotion by ID
   */
  async getPromotion(
    tenantId: string,
    promotionId: string,
  ): Promise<PromotionResponseDto> {
    const promotion = await this.prisma.promotion.findFirst({
      where: {
        id: promotionId,
        tenantId,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    return this.mapToResponse(promotion);
  }

  /**
   * Update a promotion
   */
  async updatePromotion(
    tenantId: string,
    promotionId: string,
    dto: UpdatePromotionDto,
  ): Promise<PromotionResponseDto> {
    const promotion = await this.prisma.promotion.findFirst({
      where: {
        id: promotionId,
        tenantId,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    const updateData: any = {};

    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.minOrderValue !== undefined) updateData.minOrderValue = dto.minOrderValue;
    if (dto.maxDiscount !== undefined) updateData.maxDiscount = dto.maxDiscount;
    if (dto.usageLimit !== undefined) updateData.usageLimit = dto.usageLimit;
    if (dto.startsAt !== undefined) updateData.startsAt = new Date(dto.startsAt);
    if (dto.expiresAt !== undefined) updateData.expiresAt = new Date(dto.expiresAt);
    if (dto.active !== undefined) updateData.active = dto.active;

    // Validate dates if both are being updated
    if (updateData.startsAt && updateData.expiresAt) {
      if (updateData.expiresAt <= updateData.startsAt) {
        throw new BadRequestException('Expiry date must be after start date');
      }
    }

    const updated = await this.prisma.promotion.update({
      where: { id: promotionId },
      data: updateData,
    });

    return this.mapToResponse(updated);
  }

  /**
   * Delete a promotion
   */
  async deletePromotion(tenantId: string, promotionId: string): Promise<void> {
    const promotion = await this.prisma.promotion.findFirst({
      where: {
        id: promotionId,
        tenantId,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    // Only allow deletion if never used
    if (promotion.usageCount > 0) {
      throw new BadRequestException(
        'Cannot delete a promotion that has been used. Deactivate it instead.',
      );
    }

    await this.prisma.promotion.delete({
      where: { id: promotionId },
    });
  }

  /**
   * Validate a promo code for checkout (customer-facing)
   */
  async validatePromoCode(
    tenantId: string,
    dto: ValidatePromoDto,
  ): Promise<ValidatePromoResponseDto> {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const code = dto.code.toUpperCase().trim();

    const promotion = await this.prisma.promotion.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code,
        },
      },
    });

    if (!promotion) {
      return { valid: false, error: 'Voucher is not valid' };
    }

    // Check if active
    if (!promotion.active) {
      return { valid: false, error: 'Voucher is no longer active' };
    }

    // Check date range
    const now = new Date();
    if (now < promotion.startsAt) {
      return { valid: false, error: 'Voucher is not yet valid' };
    }
    if (now > promotion.expiresAt) {
      return { valid: false, error: 'Voucher has expired' };
    }

    // Check usage limit
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return { valid: false, error: 'Voucher usage limit reached' };
    }

    // Check minimum order value
    const minOrderValue = promotion.minOrderValue
      ? Number(promotion.minOrderValue)
      : 0;
    if (dto.orderSubtotal < minOrderValue) {
      return {
        valid: false,
        error: `Minimum order value is ${minOrderValue.toLocaleString('en-US')} to apply this voucher`,
      };
    }

    // Calculate discount
    const discountAmount = this.calculateDiscount(
      promotion.type,
      Number(promotion.value),
      dto.orderSubtotal,
      promotion.maxDiscount ? Number(promotion.maxDiscount) : undefined,
    );

    return {
      valid: true,
      discountAmount,
      promotion: {
        code: promotion.code,
        type: promotion.type,
        value: Number(promotion.value),
        description: promotion.description || undefined,
      },
    };
  }

  /**
   * Apply a promo code (increment usage count)
   * Called by OrderService after successful order creation
   */
  async applyPromoCode(tenantId: string, code: string): Promise<void> {
    const normalizedCode = code.toUpperCase().trim();

    await this.prisma.promotion.update({
      where: {
        tenantId_code: {
          tenantId,
          code: normalizedCode,
        },
      },
      data: {
        usageCount: { increment: 1 },
      },
    });
  }

  /**
   * Calculate discount amount based on promotion type
   */
  calculateDiscount(
    type: PromotionType,
    value: number,
    orderSubtotal: number,
    maxDiscount?: number,
  ): number {
    let discount: number;

    if (type === PromotionType.PERCENTAGE) {
      discount = Math.round((orderSubtotal * value) / 100);
      // Apply max discount cap if set
      if (maxDiscount && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else {
      // FIXED amount
      discount = value;
    }

    // Discount cannot exceed order subtotal
    return Math.min(discount, orderSubtotal);
  }

  /**
   * Map Prisma model to response DTO
   */
  private mapToResponse(promotion: any): PromotionResponseDto {
    const now = new Date();
    const isValid =
      promotion.active &&
      now >= promotion.startsAt &&
      now <= promotion.expiresAt &&
      (!promotion.usageLimit || promotion.usageCount < promotion.usageLimit);

    return {
      id: promotion.id,
      tenantId: promotion.tenantId,
      code: promotion.code,
      description: promotion.description || undefined,
      type: promotion.type,
      value: Number(promotion.value),
      minOrderValue: promotion.minOrderValue
        ? Number(promotion.minOrderValue)
        : undefined,
      maxDiscount: promotion.maxDiscount
        ? Number(promotion.maxDiscount)
        : undefined,
      usageLimit: promotion.usageLimit || undefined,
      usageCount: promotion.usageCount,
      startsAt: promotion.startsAt,
      expiresAt: promotion.expiresAt,
      active: promotion.active,
      createdAt: promotion.createdAt,
      updatedAt: promotion.updatedAt,
      isValid,
    };
  }
}

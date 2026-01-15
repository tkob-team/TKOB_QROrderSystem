/**
 * Promotions Feature - Types
 */

export type PromotionType = 'PERCENTAGE' | 'FIXED';

export interface Promotion {
  id: string;
  tenantId: string;
  code: string;
  description?: string;
  type: PromotionType;
  value: number; // 20 for 20%, 50000 for 50k VND
  minOrderValue?: number;
  maxDiscount?: number; // Cap for percentage type
  usageLimit?: number;
  usageCount: number;
  startsAt: Date;
  expiresAt: Date;
  active: boolean;
  isValid?: boolean; // Computed: active + in date range + not exceeded
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromotionInput {
  code: string;
  description?: string;
  type: PromotionType;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startsAt: string; // ISO date
  expiresAt: string;
  active?: boolean;
}

export interface UpdatePromotionInput {
  description?: string;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  active?: boolean;
}

export interface PromotionListResponse {
  promotions: Promotion[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Helper to format discount display
export function formatDiscount(promo: Promotion): string {
  if (promo.type === 'PERCENTAGE') {
    return `${promo.value}%`;
  }
  return `${promo.value.toLocaleString('vi-VN')}đ`;
}

// Helper to check if promo is currently valid
export function isPromoValid(promo: Promotion): boolean {
  const now = new Date();
  return (
    promo.active &&
    new Date(promo.startsAt) <= now &&
    new Date(promo.expiresAt) >= now &&
    (!promo.usageLimit || promo.usageCount < promo.usageLimit)
  );
}

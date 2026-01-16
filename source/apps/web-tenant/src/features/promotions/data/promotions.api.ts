/**
 * Promotions API Adapter
 */

import { api } from '@/services/axios';
import type {
  Promotion,
  CreatePromotionInput,
  UpdatePromotionInput,
  PromotionListResponse,
} from '../model/types';

export const promotionsApi = {
  /**
   * Get all promotions for tenant
   */
  async getPromotions(params?: {
    page?: number;
    limit?: number;
    active?: boolean;
    includeExpired?: boolean;
  }): Promise<PromotionListResponse> {
    const response = await api.get('/api/v1/admin/promotions', { params });
    return response.data;
  },

  /**
   * Get single promotion by ID
   */
  async getPromotion(id: string): Promise<Promotion> {
    const response = await api.get(`/api/v1/admin/promotions/${id}`);
    return response.data;
  },

  /**
   * Create new promotion
   */
  async createPromotion(data: CreatePromotionInput): Promise<Promotion> {
    const response = await api.post('/api/v1/admin/promotions', data);
    return response.data;
  },

  /**
   * Update promotion
   */
  async updatePromotion(id: string, data: UpdatePromotionInput): Promise<Promotion> {
    const response = await api.put(`/api/v1/admin/promotions/${id}`, data);
    return response.data;
  },

  /**
   * Delete promotion (only if never used)
   */
  async deletePromotion(id: string): Promise<void> {
    await api.delete(`/api/v1/admin/promotions/${id}`);
  },

  /**
   * Toggle promotion active status
   */
  async toggleActive(id: string, active: boolean): Promise<Promotion> {
    return this.updatePromotion(id, { active });
  },
};

/**
 * Menu Category Mapper
 * Pure functions to transform MenuCategoryResponseDto to view models
 */

import type { MenuCategoryResponseDto } from '@/services/generated/models';

export type MenuCategoryVM = {
  id: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
  itemCount?: number;
};

/**
 * Maps MenuCategoryResponseDto to MenuCategoryVM view model
 * Pure function: no side effects, deterministic output
 */
export function mapCategoryDtoToVM(dto: any): MenuCategoryVM {
  const d = dto as Partial<MenuCategoryResponseDto> & Record<string, any>;
  return {
    id: String(d.id),
    name: d.name ?? '',
    description: d.description ?? undefined,
    displayOrder: d.displayOrder,
    isActive: Boolean(d.active ?? d.isActive ?? true),
    itemCount: d.itemCount,
  };
}

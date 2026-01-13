/**
 * Menu Item Mapper
 * Pure functions to transform MenuItemResponseDto to MenuItemVM
 */

import type { MenuItemResponseDto } from '@/services/generated/models';

export type MenuItemVM = {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isAvailable: boolean;
  dietary?: string[];
  allergens?: string[];
  chefRecommended?: boolean;
  popularity?: number;
  imageUrl?: string;
  displayOrder?: number;
  preparationTime?: number;
  modifierGroups?: any[];
  photos?: any[];
};

/**
 * Maps MenuItemResponseDto to MenuItemVM view model
 * Pure function: no side effects, deterministic output
 */
export function mapMenuItemDtoToVM(dto: any): MenuItemVM {
  const d = dto as Partial<MenuItemResponseDto> & Record<string, any>;
  return {
    id: String(d.id),
    name: d.name ?? '',
    description: d.description ?? undefined,
    price: Number(d.price ?? 0),
    categoryId: String(d.categoryId ?? ''),
    categoryName: (d as any).category?.name ?? d.categoryName,
    status: (d.status as any) ?? 'DRAFT',
    isAvailable: Boolean((d as any).available ?? (d as any).isAvailable),
    dietary: (d as any).tags ?? d.dietary ?? [],
    allergens: d.allergens as any,
    chefRecommended: Boolean(d.chefRecommended),
    popularity: (d as any).popularity,
    imageUrl: (d as any).imageUrl,
    displayOrder: (d as any).displayOrder,
    preparationTime: (d as any).preparationTime,
    modifierGroups: (d as any).modifierGroups ?? [],
    photos: (d as any).photos ?? [],
  };
}

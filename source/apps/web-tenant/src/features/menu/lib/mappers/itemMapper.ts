/**
 * Menu Item Mapper
 * Pure functions to transform MenuItemResponseDto to MenuItemVM
 */

import type { MenuItemResponseDto } from '@/services/generated/models';
import { logger } from '@/shared/utils/logger';
import { getTypeChanges, samplePayload } from '@/shared/utils/dataInspector';

const logDataEnabled = process.env.NEXT_PUBLIC_LOG_DATA === 'true';
const logFull =
  process.env.NEXT_PUBLIC_LOG_DATA === 'true' &&
  process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

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
  if (logDataEnabled) {
    const dtoKeys = dto && typeof dto === 'object' ? Object.keys(dto).slice(0, 8) : [];
    logger.info('[data] MAPPER_INPUT', {
      mapper: 'mapMenuItemDtoToVM',
      dtoKeys,
      hasId: !!dto?.id,
      hasPrice: !!dto?.price,
    });
  }

  const d = dto as Partial<MenuItemResponseDto> & Record<string, any>;
  const vm = {
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

  if (logFull) {
    logger.info('[data] MAPPER_SAMPLE', {
      mapper: 'mapMenuItemDtoToVM',
      dto: samplePayload(dto, { allowKeys: ['name', 'description', 'title', 'label', 'note'] }),
      vm: samplePayload(vm, { allowKeys: ['name', 'description', 'title', 'label', 'note'] }),
    });
  }

  if (logDataEnabled) {
    const vmKeys = Object.keys(vm).slice(0, 8);
    const typeChanges = getTypeChanges(dto ?? {}, vm, ['id', 'price', 'categoryId', 'status', 'isAvailable']);
    logger.info('[data] MAPPER_OUTPUT', {
      mapper: 'mapMenuItemDtoToVM',
      vmKeys,
      typeChanges,
    });
  }

  return vm;
}

/**
 * Menu Category Mapper
 * Pure functions to transform MenuCategoryResponseDto to view models
 */

import type { MenuCategoryResponseDto } from '@/services/generated/models';
import { logger } from '@/shared/utils/logger';
import { getTypeChanges, samplePayload } from '@/shared/utils/dataInspector';

const logDataEnabled = process.env.NEXT_PUBLIC_LOG_DATA === 'true';
const logFull =
  process.env.NEXT_PUBLIC_LOG_DATA === 'true' &&
  process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

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
  if (logDataEnabled) {
    const dtoKeys = dto && typeof dto === 'object' ? Object.keys(dto).slice(0, 8) : [];
    logger.info('[data] MAPPER_INPUT', {
      mapper: 'mapCategoryDtoToVM',
      dtoKeys,
      hasId: !!dto?.id,
      hasPrice: !!dto?.price,
    });
  }

  const d = dto as Partial<MenuCategoryResponseDto> & Record<string, any>;
  const vm = {
    id: String(d.id),
    name: d.name ?? '',
    description: d.description ?? undefined,
    displayOrder: d.displayOrder,
    isActive: Boolean(d.active ?? d.isActive ?? true),
    itemCount: d.itemCount,
  };

  if (logFull) {
    logger.info('[data] MAPPER_SAMPLE', {
      mapper: 'mapCategoryDtoToVM',
      dto: samplePayload(dto, { allowKeys: ['name', 'description', 'title', 'label', 'note'] }),
      vm: samplePayload(vm, { allowKeys: ['name', 'description', 'title', 'label', 'note'] }),
    });
  }

  if (logDataEnabled) {
    const vmKeys = Object.keys(vm).slice(0, 8);
    const typeChanges = getTypeChanges(dto ?? {}, vm, ['id', 'displayOrder', 'isActive']);
    logger.info('[data] MAPPER_OUTPUT', {
      mapper: 'mapCategoryDtoToVM',
      vmKeys,
      typeChanges,
    });
  }

  return vm;
}

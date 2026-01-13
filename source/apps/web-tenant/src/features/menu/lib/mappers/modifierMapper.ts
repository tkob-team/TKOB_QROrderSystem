/**
 * Menu Modifier Mapper
 * Pure functions to transform ModifierGroupResponseDto to view models
 */

import type { ModifierGroupResponseDto } from '@/services/generated/models';
import { logger } from '@/shared/utils/logger';
import { getTypeChanges, samplePayload } from '@/shared/utils/dataInspector';

const logDataEnabled = process.env.NEXT_PUBLIC_LOG_DATA === 'true';
const logFull =
  process.env.NEXT_PUBLIC_LOG_DATA === 'true' &&
  process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

export type ModifierGroupVM = {
  id: string;
  name: string;
  description?: string;
  type: 'single' | 'multiple';
  required: boolean;
  minChoices: number;
  maxChoices: number;
  isActive: boolean;
  displayOrder?: number;
  optionCount?: number;
};

/**
 * Maps ModifierGroupResponseDto to ModifierGroupVM view model
 * Pure function: no side effects, deterministic output
 */
export function mapModifierGroupDtoToVM(dto: any): ModifierGroupVM {
  if (logDataEnabled) {
    const dtoKeys = dto && typeof dto === 'object' ? Object.keys(dto).slice(0, 8) : [];
    logger.info('[data] MAPPER_INPUT', {
      mapper: 'mapModifierGroupDtoToVM',
      dtoKeys,
      hasId: !!dto?.id,
      hasPrice: !!dto?.price,
    });
  }

  const d = dto as Partial<ModifierGroupResponseDto> & Record<string, any>;
  
  // Normalize type: convert backend types (SINGLE_CHOICE, MULTI_CHOICE) to UI types (single, multiple)
  let type: 'single' | 'multiple' = 'single';
  if (d.type === 'MULTI_CHOICE' || d.type === 'multiple') {
    type = 'multiple';
  } else if (d.type === 'SINGLE_CHOICE' || d.type === 'single') {
    type = 'single';
  }

  const vm = {
    id: String(d.id),
    name: d.name ?? '',
    description: d.description ?? undefined,
    type,
    required: Boolean(d.required ?? false),
    minChoices: Number(d.minChoices ?? 0),
    maxChoices: Number(d.maxChoices ?? 1),
    isActive: Boolean(d.active ?? d.isActive ?? true),
    displayOrder: d.displayOrder,
    optionCount: (d as any).options?.length ?? 0,
  };

  if (logFull) {
    logger.info('[data] MAPPER_SAMPLE', {
      mapper: 'mapModifierGroupDtoToVM',
      dto: samplePayload(dto, { allowKeys: ['name', 'description', 'title', 'label', 'note'] }),
      vm: samplePayload(vm, { allowKeys: ['name', 'description', 'title', 'label', 'note'] }),
    });
  }

  if (logDataEnabled) {
    const vmKeys = Object.keys(vm).slice(0, 8);
    const typeChanges = getTypeChanges(dto ?? {}, vm, ['id', 'type', 'required', 'minChoices', 'maxChoices', 'isActive']);
    logger.info('[data] MAPPER_OUTPUT', {
      mapper: 'mapModifierGroupDtoToVM',
      vmKeys,
      typeChanges,
    });
  }

  return vm;
}

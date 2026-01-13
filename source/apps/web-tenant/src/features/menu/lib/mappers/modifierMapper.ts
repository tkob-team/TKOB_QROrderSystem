/**
 * Menu Modifier Mapper
 * Pure functions to transform ModifierGroupResponseDto to view models
 */

import type { ModifierGroupResponseDto } from '@/services/generated/models';

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
  const d = dto as Partial<ModifierGroupResponseDto> & Record<string, any>;
  
  // Normalize type: convert backend types (SINGLE_CHOICE, MULTI_CHOICE) to UI types (single, multiple)
  let type: 'single' | 'multiple' = 'single';
  if (d.type === 'MULTI_CHOICE' || d.type === 'multiple') {
    type = 'multiple';
  } else if (d.type === 'SINGLE_CHOICE' || d.type === 'single') {
    type = 'single';
  }

  return {
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
}

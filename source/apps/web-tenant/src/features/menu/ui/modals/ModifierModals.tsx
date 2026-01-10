/**
 * Modifier Modals - Wrapper components that adapt MenuModifiersPage's state to actual modal components
 */

import React from 'react';
import { ModifierGroupModal as ActualModifierGroupModal } from '../components/modifiers/ModifierGroupModal';
import { DeleteModifierGroupDialog as ActualDeleteDialog } from '../components/modifiers/DeleteModifierGroupDialog';
import type { ModifierGroupFormData, ModalMode } from '../../model/modifiers';

// ============================================================================
// MODIFIER GROUP MODAL WRAPPER
// ============================================================================

type ModifierGroupModalProps = {
  isOpen: boolean;
  mode: ModalMode;
  formData: ModifierGroupFormData;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (data: Partial<ModifierGroupFormData>) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  optionName: string;
  optionPrice: string;
  onOptionNameChange: (name: string) => void;
  onOptionPriceChange: (price: string) => void;
};

export function ModifierGroupModal({
  isOpen,
  mode,
  formData,
  onClose,
  onSave,
  onFormChange,
  onAddOption,
  onRemoveOption,
  optionName,
  optionPrice,
  onOptionNameChange,
  onOptionPriceChange,
}: ModifierGroupModalProps) {
  return (
    <ActualModifierGroupModal
      isOpen={isOpen}
      mode={mode}
      formName={formData.name}
      onNameChange={(name) => onFormChange({ name })}
      formDescription={formData.description}
      onDescriptionChange={(description) => onFormChange({ description })}
      formDisplayOrder={formData.displayOrder}
      onDisplayOrderChange={(displayOrder) => onFormChange({ displayOrder })}
      formType={formData.type}
      onTypeChange={(type) => onFormChange({ type })}
      formRequired={formData.required}
      onRequiredChange={(required) => onFormChange({ required })}
      formMinChoices={formData.minChoices}
      onMinChoicesChange={(minChoices) => onFormChange({ minChoices })}
      formMaxChoices={formData.maxChoices}
      onMaxChoicesChange={(maxChoices) => onFormChange({ maxChoices })}
      formActive={true}
      onActiveChange={undefined}
      formOptions={formData.options.map((opt) => ({
        name: opt.name,
        priceDelta: opt.priceDelta,
        displayOrder: opt.displayOrder,
        active: true,
      }))}
      optionName={optionName}
      onOptionNameChange={onOptionNameChange}
      optionPrice={optionPrice}
      onOptionPriceChange={onOptionPriceChange}
      onAddOption={onAddOption}
      onRemoveOption={onRemoveOption}
      onClose={onClose}
      onSubmit={onSave}
    />
  );
}

// ============================================================================
// DELETE MODIFIER GROUP DIALOG WRAPPER
// ============================================================================

type ModifierDeleteConfirmModalProps = {
  isOpen: boolean;
  groupName: string;
  linkedItems?: number;
  onClose: () => void;
  onConfirm: () => void;
};

export function ModifierDeleteConfirmModal({
  isOpen,
  groupName,
  linkedItems,
  onClose,
  onConfirm,
}: ModifierDeleteConfirmModalProps) {
  // Create a minimal group object for the actual dialog
  const group = isOpen
    ? {
        id: '', // Not needed for display
        name: groupName,
        description: '',
        type: 'single' as const,
        required: false,
        minChoices: 0,
        maxChoices: 1,
        displayOrder: 0,
        active: true,
        options: [],
        linkedMenuItems: linkedItems || 0,
      }
    : null;

  return (
    <ActualDeleteDialog
      isOpen={isOpen}
      group={group}
      isLoading={false}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

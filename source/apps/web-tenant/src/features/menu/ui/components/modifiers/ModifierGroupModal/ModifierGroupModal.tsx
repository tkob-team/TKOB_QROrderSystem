'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { FormOption } from '@/features/menu/domain/modifierGroupModalTypes';
import { ModifierGroupForm } from './ModifierGroupForm';
import { useModifierGroupModalState } from './useModifierGroupModalState';

type ModifierGroupModalProps = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  formName: string;
  onNameChange: (name: string) => void;
  formDescription: string;
  onDescriptionChange: (description: string) => void;
  formDisplayOrder: number;
  onDisplayOrderChange: (order: number) => void;
  formType: 'single' | 'multiple';
  onTypeChange: (type: 'single' | 'multiple') => void;
  formRequired: boolean;
  onRequiredChange: (required: boolean) => void;
  formMinChoices: number;
  onMinChoicesChange: (min: number) => void;
  formMaxChoices: number;
  onMaxChoicesChange: (max: number) => void;
  formActive?: boolean;
  onActiveChange?: (active: boolean) => void;
  formOptions: FormOption[];
  optionName: string;
  onOptionNameChange: (name: string) => void;
  optionPrice: string;
  onOptionPriceChange: (price: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function ModifierGroupModal(props: ModifierGroupModalProps) {
  const {
    isOpen,
    mode,
    formName,
    onNameChange,
    formDescription,
    onDescriptionChange,
    formDisplayOrder,
    onDisplayOrderChange,
    formType,
    onTypeChange,
    formRequired,
    onRequiredChange,
    formMinChoices,
    onMinChoicesChange,
    formMaxChoices,
    onMaxChoicesChange,
    formActive,
    onActiveChange,
    formOptions,
    optionName,
    onOptionNameChange,
    optionPrice,
    onOptionPriceChange,
    onAddOption,
    onRemoveOption,
    onClose,
    onSubmit,
  } = props;

  const { handleOptionKeyPress } = useModifierGroupModalState({ onAddOption });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] animate-scaleIn flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl shrink-0 z-10">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Create Modifier Group' : 'Edit Modifier Group'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <ModifierGroupForm
            mode={mode}
            formName={formName}
            onNameChange={onNameChange}
            formDescription={formDescription}
            onDescriptionChange={onDescriptionChange}
            formDisplayOrder={formDisplayOrder}
            onDisplayOrderChange={onDisplayOrderChange}
            formType={formType}
            onTypeChange={onTypeChange}
            formRequired={formRequired}
            onRequiredChange={onRequiredChange}
            formMinChoices={formMinChoices}
            onMinChoicesChange={onMinChoicesChange}
            formMaxChoices={formMaxChoices}
            onMaxChoicesChange={onMaxChoicesChange}
            formActive={formActive}
            onActiveChange={onActiveChange}
            formOptions={formOptions}
            optionName={optionName}
            onOptionNameChange={onOptionNameChange}
            optionPrice={optionPrice}
            onOptionPriceChange={onOptionPriceChange}
            onAddOption={onAddOption}
            onRemoveOption={onRemoveOption}
            onOptionKeyPress={handleOptionKeyPress}
          />
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200 rounded-b-2xl shrink-0 z-10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {mode === 'create' ? 'Create Group' : 'Update Group'}
          </button>
        </div>
      </div>
    </div>
  );
}

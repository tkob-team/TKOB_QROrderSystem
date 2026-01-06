'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ModifierGroup } from '../types/modifiers';

type DeleteModifierGroupDialogProps = {
  isOpen: boolean;
  group: ModifierGroup | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteModifierGroupDialog({
  isOpen,
  group,
  isLoading = false,
  onClose,
  onConfirm,
}: DeleteModifierGroupDialogProps) {
  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scaleIn">
        <div className="p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Delete Modifier Group?
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{group.name}</span>?
            This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

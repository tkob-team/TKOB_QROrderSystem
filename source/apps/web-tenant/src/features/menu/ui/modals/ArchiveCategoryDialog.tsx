'use client';

import React from 'react';
import { X } from '../icons';

type ArchiveCategoryDialogProps = {
  isOpen: boolean;
  categoryId: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
};

export function ArchiveCategoryDialog({
  isOpen,
  categoryId,
  onClose,
  onConfirm,
  isLoading = false,
}: ArchiveCategoryDialogProps) {
  if (!isOpen || !categoryId) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(16px)',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md mx-4 rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Archive category?</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            This category will be archived and hidden from the menu.
          </p>
          <p className="text-sm text-gray-500">
            Items under this category will remain in the database.
          </p>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Archiving...' : 'Archive category'}
          </button>
        </div>
      </div>
    </div>
  );
}

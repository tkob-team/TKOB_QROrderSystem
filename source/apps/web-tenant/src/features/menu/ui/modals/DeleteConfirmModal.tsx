import React from 'react';
import { Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({ isOpen, itemName, onConfirm, onCancel, isDeleting }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md mx-4 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-500 rounded-lg">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Delete {itemName}</h3>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-800">
            <p>Deleting {itemName} will remove it from the menu. This action cannot be undone.</p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const DeleteItemModal = DeleteConfirmModal;

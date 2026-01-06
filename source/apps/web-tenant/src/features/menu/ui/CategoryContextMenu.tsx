'use client';

import React from 'react';
import { Edit2, Eye, Trash2 } from './icons';

type CategoryContextMenuProps = {
  contextMenu: { categoryId: string; anchor: 'cursor' | 'button'; x: number; y: number } | null;
  contextMenuPos: { left: number; top: number } | null;
  contextMenuRef: React.RefObject<HTMLDivElement | null>;
  sortedCategories: any[];
  onEdit: (category: any) => void;
  onToggleStatus: (categoryId: string) => void;
  onDelete: (categoryId: string) => void;
};

export function CategoryContextMenu({
  contextMenu,
  contextMenuPos,
  contextMenuRef,
  sortedCategories,
  onEdit,
  onToggleStatus,
  onDelete,
}: CategoryContextMenuProps) {
  if (!contextMenu) return null;

  return (
    <div
      ref={contextMenuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl"
      style={{
        left: `${contextMenuPos?.left ?? contextMenu.x}px`,
        top: `${contextMenuPos?.top ?? contextMenu.y}px`,
        minWidth: '200px',
        maxWidth: '240px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {sortedCategories
        .filter((cat: any) => cat.id === contextMenu.categoryId)
        .map((category: any) => {
          const isActive = category.active !== false;

          return (
            <div key={category.id}>
              <button
                onClick={() => onEdit(category)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm font-medium flex items-center gap-2.5 border-b border-gray-100 transition-colors"
              >
                <Edit2 size={15} />
                Edit
              </button>
              <button
                onClick={() => onToggleStatus(category.id)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm font-medium flex items-center gap-2.5 border-b border-gray-100 transition-colors"
              >
                <Eye size={15} />
                {isActive ? 'Set Inactive' : 'Set Active'}
              </button>
              {isActive && (
                <button
                  onClick={() => onDelete(category.id)}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2.5 transition-colors"
                  title="Archive this category"
                >
                  <Trash2 size={15} />
                  Archive
                </button>
              )}
            </div>
          );
        })}
    </div>
  );
}

import React from 'react';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { MenuItemCard } from './MenuItemCard';

interface MenuItemGridProps {
  items: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onToggleAvailability?: (item: any) => void;
  onAddItem: () => void;
  isLoading?: boolean;
  searchQuery?: string;
}

export function MenuItemGrid({
  items,
  onEdit,
  onDelete,
  onToggleAvailability,
  onAddItem,
  isLoading,
  searchQuery,
}: MenuItemGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-[rgb(var(--neutral-100))] rounded-lg animate-pulse" style={{ aspectRatio: '3/4' }} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[rgb(var(--border))] p-12 text-center">
        <div className="w-20 h-20 bg-[rgb(var(--neutral-100))] rounded-full flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-10 h-10 text-[rgb(var(--neutral-400))]" />
        </div>
        <h4 className="text-lg font-bold text-[rgb(var(--neutral-900))] mb-2">
          {searchQuery ? 'No items found' : 'No items yet'}
        </h4>
        <p className="text-sm text-[rgb(var(--neutral-600))] mb-6">
          {searchQuery ? 'Try adjusting your search or filters' : 'Add your first menu item to get started'}
        </p>
        {!searchQuery && (
          <button
            onClick={onAddItem}
            className="px-6 py-3 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white rounded-lg text-sm font-semibold inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleAvailability={onToggleAvailability}
        />
      ))}
    </div>
  );
}

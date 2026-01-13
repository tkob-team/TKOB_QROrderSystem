import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit, Check } from 'lucide-react';
import { Badge } from '@/shared/components';
import type { Category } from '../../model/types';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onAddCategory: () => void;
  _onDeleteCategory: (categoryId: string) => void;
  onEditCategory: (category: Category) => void;
  onToggleActive: (category: Category) => void;
  activeOnly: boolean;
  onActiveOnlyChange: (value: boolean) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  isLoading?: boolean;
}

export function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  _onDeleteCategory,
  onEditCategory,
  onToggleActive,
  activeOnly,
  onActiveOnlyChange,
  sortBy,
  onSortChange,
  isLoading,
}: CategorySidebarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuButtonClick = (categoryId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (openMenuId === categoryId) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      setMenuPosition({ top: rect.top, left: rect.right + 8 });
      setOpenMenuId(categoryId);
    }
  };

  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        const clickedButton = Array.from(buttonRefs.current.values()).find(btn => btn.contains(target));
        if (!clickedButton) {
          setOpenMenuId(null);
          setMenuPosition(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openMenuId) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [openMenuId]);

  const getFilteredAndSortedCategories = () => {
    const filtered = categories.filter(cat => !activeOnly || cat.active);
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'displayOrder':
          return a.displayOrder - b.displayOrder;
        case 'nameAsc':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return a.displayOrder - b.displayOrder;
      }
    });
  };

  const filteredCategories = getFilteredAndSortedCategories();

  return (
    <aside className="hidden lg:flex w-64 h-full bg-gray-50 border-r border-gray-200 flex-col min-h-0 overflow-hidden">
      <div className="shrink-0 px-4 py-2 border-b border-gray-200">
        <h3 className="text-gray-900 mb-2" style={{ fontSize: '15px', fontWeight: 700 }}>Categories</h3>
        <button
          onClick={onAddCategory}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 border border-dashed border-gray-300 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
          style={{ fontSize: '13px', fontWeight: 600, borderRadius: '10px' }}
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="shrink-0 px-4 py-1.5 border-b border-gray-200 flex items-center gap-2">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="flex-1 text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
        >
          <option value="displayOrder">Display Order</option>
          <option value="nameAsc">Name A-Z</option>
          <option value="nameDesc">Name Z-A</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => onActiveOnlyChange(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 cursor-pointer"
          />
          <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Active</span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto pt-1 pb-2 px-2 min-h-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            <button
              onClick={() => onSelectCategory('all')}
              className={`relative w-full px-4 py-3 rounded-lg text-left text-sm font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-100 text-emerald-700 border-l-4 border-emerald-500'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>All Items</span>
                <span className={`text-xs ${selectedCategory === 'all' ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {categories.reduce((sum, cat) => sum + (cat.itemCount || 0), 0)}
                </span>
              </div>
            </button>

            {filteredCategories.map((category) => (
              <div key={category.id} className="relative group">
                <button
                  onClick={() => onSelectCategory(category.id)}
                  className={`relative w-full px-4 py-3 rounded-lg text-left text-sm font-semibold transition-all pr-12 ${
                    selectedCategory === category.id
                      ? 'bg-emerald-100 text-emerald-700 border-l-4 border-emerald-500'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate flex-1">#{category.displayOrder} {category.name}</span>
                    <span className={`text-xs shrink-0 ${selectedCategory === category.id ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {category.itemCount || 0}
                    </span>
                  </div>
                  {!category.active && (
                    <Badge variant="default" className="mt-1 text-xs">Archived</Badge>
                  )}
                </button>

                <div className={`absolute right-2 top-1/2 -translate-y-1/2 transition-opacity ${
                  openMenuId === category.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <button
                    ref={(el) => {
                      if (el) buttonRefs.current.set(category.id, el);
                      else buttonRefs.current.delete(category.id);
                    }}
                    onClick={(e) => handleMenuButtonClick(category.id, e)}
                    className={`p-1.5 bg-white hover:bg-gray-50 rounded-lg shadow-sm ${
                      openMenuId === category.id ? 'bg-gray-100' : ''
                    }`}
                    title="More actions"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 16 16">
                      <circle cx="8" cy="3" r="1.5"/>
                      <circle cx="8" cy="8" r="1.5"/>
                      <circle cx="8" cy="13" r="1.5"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {openMenuId && menuPosition && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] w-40 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
        >
          {filteredCategories
            .filter(cat => cat.id === openMenuId)
            .map(category => (
              <React.Fragment key={category.id}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCategory(category);
                    setOpenMenuId(null);
                    setMenuPosition(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive(category);
                    setOpenMenuId(null);
                    setMenuPosition(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  {category.active ? 'Set Inactive' : 'Set Active'}
                </button>
              </React.Fragment>
            ))}
        </div>,
        document.body
      )}
    </aside>
  );
}

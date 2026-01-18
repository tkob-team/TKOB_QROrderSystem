'use client';

import { useState } from 'react';
import type { MenuItem, MenuItemFormData, ModalMode } from '../model/types';
import { INITIAL_MENU_ITEM_FORM } from '../constants';

export function useItemModalState() {
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<ModalMode>('add');
  const [currentEditItemId, setCurrentEditItemId] = useState<string | null>(null);
  const [itemFormData, setItemFormData] = useState<MenuItemFormData>(INITIAL_MENU_ITEM_FORM);
  const [originalItem, setOriginalItem] = useState<MenuItem | null>(null);

  const openAddItem = (defaultCategoryId?: string) => {
    setItemModalMode('add');
    setItemFormData({
      ...INITIAL_MENU_ITEM_FORM,
      categoryId: defaultCategoryId ?? INITIAL_MENU_ITEM_FORM.categoryId,
    });
    setIsItemModalOpen(true);
  };

  const openEditItem = (item: MenuItem) => {
    setItemModalMode('edit');
    setCurrentEditItemId(item.id);
    setOriginalItem(item);
    setItemFormData({
      name: item.name,
      categoryId: item.categoryId,
      description: item.description || '',
      price: item.price,
      status: item.status,
      preparationTime: item.preparationTime || 0,
      available: item.isAvailable,
      allergens: item.allergens || [],
      dietary: item.dietary || [],
      chefRecommended: item.chefRecommended || false,
      displayOrder: item.displayOrder || 0,
      photos: [],
      modifierGroupIds: item.modifierGroups?.map(g => g.id) || [],
      photosToDelete: [],
    });
    setIsItemModalOpen(true);
  };

  const closeItemModal = () => {
    setIsItemModalOpen(false);
    setCurrentEditItemId(null);
    setOriginalItem(null);
    setItemFormData(INITIAL_MENU_ITEM_FORM);
  };

  return {
    // state
    isItemModalOpen,
    itemModalMode,
    currentEditItemId,
    itemFormData,
    originalItem,
    // setters
    setItemFormData,
    // actions
    openAddItem,
    openEditItem,
    closeItemModal,
  };
}

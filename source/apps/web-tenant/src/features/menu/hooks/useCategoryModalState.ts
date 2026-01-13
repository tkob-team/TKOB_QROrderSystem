'use client';

import { useState } from 'react';
import type { Category } from '../model/types';

export function useCategoryModalState() {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'add' | 'edit'>('add');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryDisplayOrder, setNewCategoryDisplayOrder] = useState('');
  const [newCategoryActive, setNewCategoryActive] = useState(true);

  const openAddCategory = () => {
    setCategoryModalMode('add');
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryDisplayOrder('');
    setNewCategoryActive(true);
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setCategoryModalMode('edit');
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
    setNewCategoryDisplayOrder(String(category.displayOrder || ''));
    setNewCategoryActive(category.active);
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryDisplayOrder('');
    setNewCategoryActive(true);
  };

  return {
    // state
    isCategoryModalOpen,
    categoryModalMode,
    editingCategory,
    newCategoryName,
    newCategoryDescription,
    newCategoryDisplayOrder,
    newCategoryActive,
    // setters
    setNewCategoryName,
    setNewCategoryDescription,
    setNewCategoryDisplayOrder,
    setNewCategoryActive,
    // actions
    openAddCategory,
    openEditCategory,
    closeCategoryModal,
  };
}

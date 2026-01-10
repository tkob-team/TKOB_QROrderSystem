"use client";

import { useCategory } from './queries/categories';

interface CategoryModalParams {
  categoryId?: string;
  isOpen: boolean;
  mode: 'add' | 'edit';
}

// Controller wrapper to keep category detail fetch internal
export function useCategoryModalController({ categoryId, isOpen, mode }: CategoryModalParams) {
  return useCategory(categoryId || '', {
    enabled: isOpen && mode === 'edit' && !!categoryId,
  });
}

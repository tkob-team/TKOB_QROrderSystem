'use client';

import { useState } from 'react';
import { usePagination } from './usePagination';

export function useMenuSelectionState(itemsPerPage = 6) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryActiveOnly, setCategoryActiveOnly] = useState(false);
  const [categorySortBy, setCategorySortBy] = useState('displayOrder');

  const { currentPage, setCurrentPage, pageSize } = usePagination(itemsPerPage);

  const goToPage = (page: number) => setCurrentPage(page);
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage((prev) => prev + 1);

  return {
    selectedCategory,
    setSelectedCategory,
    categoryActiveOnly,
    setCategoryActiveOnly,
    categorySortBy,
    setCategorySortBy,
    currentPage,
    setCurrentPage,
    pageSize,
    goToPage,
    goToPreviousPage,
    goToNextPage,
  };
}

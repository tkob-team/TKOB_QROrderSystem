'use client';

import { useEffect, useMemo } from 'react';
import { logger } from '@/shared/utils/logger';
import type { Category, MenuItem } from '../model/types';
import type { ModifierGroup } from '../model/modifiers';
import { mapMenuItemDtoToVM } from '../lib/mappers/itemMapper';
import { useMenuCategories } from './queries/categories';
import { useMenuItems } from './queries/items';
import { useModifiers } from './queries/modifiers';
import { useMenuFiltersController } from './useMenuFiltersController';
import { useMenuMutationsController } from './useMenuMutationsController';
import { useMenuSelectionState } from './useMenuSelectionState';

export function useMenuManagementController() {
  const selectionState = useMenuSelectionState();
  const filtersController = useMenuFiltersController();

  const mutationsController = useMenuMutationsController(selectionState.selectedCategory);

  const { data: categoriesData } = useMenuCategories();
  const categories = categoriesData || [];

  // Fetch filtered items for display
  const { data: itemsData, isLoading: itemsLoading } = useMenuItems({
    categoryId: filtersController.appliedFilters.categoryId,
    status: filtersController.appliedFilters.status !== 'All Status' ? filtersController.appliedFilters.status : undefined,
    availability: filtersController.appliedFilters.availability as 'available' | 'unavailable',
    chefRecommended: filtersController.appliedFilters.chefRecommended || undefined,
    searchQuery: filtersController.appliedFilters.searchQuery || undefined,
    sortBy: filtersController.appliedFilters.sortBy,
    page: selectionState.currentPage,
    pageSize: selectionState.pageSize,
  });

  // Fetch all items (no filters) for total/active counts
  const { data: allItemsData } = useMenuItems({});

  const menuItems = useMemo(() => {
    const normalizedItems = Array.isArray(itemsData)
      ? itemsData
      : ((itemsData as { data?: unknown[] } | undefined)?.data ?? []);

    const mapped = normalizedItems.map((item) => mapMenuItemDtoToVM(item)) as MenuItem[];

    if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
      logger.info('[ui] VIEWMODEL_APPLIED', {
        feature: 'menu',
        entity: 'items',
        count: mapped.length,
        sample: process.env.NEXT_PUBLIC_LOG_DATA === 'true' && mapped[0]
          ? {
              id: mapped[0].id,
              name: mapped[0].name,
              categoryId: mapped[0].categoryId,
              status: mapped[0].status,
              isAvailable: mapped[0].isAvailable,
            }
          : undefined,
      });
    }

    return mapped;
  }, [itemsData]);

  const allMenuItems = useMemo(() => {
    const normalizedItems = Array.isArray(allItemsData)
      ? allItemsData
      : ((allItemsData as { data?: unknown[] } | undefined)?.data ?? []);

    return normalizedItems.map((item) => mapMenuItemDtoToVM(item)) as MenuItem[];
  }, [allItemsData]);

  const { data: modifierGroupsData } = useModifiers({ activeOnly: false });
  const modifierGroups = (modifierGroupsData as ModifierGroup[]) || [];

  const getCategoryItemCount = (categoryId: string) => {
    return menuItems.filter((item) => item.categoryId === categoryId).length;
  };

  const getFilteredAndSortedItems = () => {
    return menuItems
      .filter((item) => {
        // Only show archived items if status filter shows "All Status"
        const isShowingAll = filtersController.appliedFilters.status === 'All Status';
        if (item.status === 'ARCHIVED' && !isShowingAll) return false;

        if (selectionState.selectedCategory !== 'all' && item.categoryId !== selectionState.selectedCategory) return false;

        if (filtersController.appliedFilters.searchQuery.trim()) {
          const query = filtersController.appliedFilters.searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(query);
          const matchDesc = item.description?.toLowerCase().includes(query);
          if (!matchName && !matchDesc) return false;
        }

        if (filtersController.appliedFilters.status !== 'All Status') {
          const statusMap: Record<string, string> = {
            Draft: 'DRAFT',
            Published: 'PUBLISHED',
            Archived: 'ARCHIVED',
          };
          const targetStatus = statusMap[filtersController.appliedFilters.status];
          if (item.status !== targetStatus) return false;
        }

        if (filtersController.appliedFilters.availability && filtersController.appliedFilters.availability !== 'all') {
          const isAvailable = item.isAvailable === true;
          const targetAvailable = filtersController.appliedFilters.availability === 'available';
          if (isAvailable !== targetAvailable) return false;
        }

        if (filtersController.appliedFilters.chefRecommended && !item.chefRecommended) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filtersController.appliedFilters.sortBy) {
          case 'Sort by: Newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'Popularity':
            return (b as unknown as { popularity?: number })?.popularity ?? 0 - ((a as unknown as { popularity?: number })?.popularity ?? 0);
          case 'Price (Low)':
            return (a.price || 0) - (b.price || 0);
          case 'Price (High)':
            return (b.price || 0) - (a.price || 0);
          default:
            return 0;
        }
      });
  };

  const allFilteredAndSortedItems = getFilteredAndSortedItems();

  if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
    logger.info('[ui] FILTER_APPLIED', {
      feature: 'menu',
      inputCount: menuItems.length,
      outputCount: allFilteredAndSortedItems.length,
      filters: process.env.NEXT_PUBLIC_LOG_DATA === 'true'
        ? {
            category: selectionState.selectedCategory,
            status: filtersController.appliedFilters.status,
            availability: filtersController.appliedFilters.availability,
            searchQuery: filtersController.appliedFilters.searchQuery,
            sortBy: filtersController.appliedFilters.sortBy,
          }
        : undefined,
    });
  }

  const filteredItemsCount = allFilteredAndSortedItems.length;
  const totalPages = Math.ceil(filteredItemsCount / selectionState.pageSize);
  const startIndex = (selectionState.currentPage - 1) * selectionState.pageSize;
  const endIndex = startIndex + selectionState.pageSize;
  const visibleMenuItems = allFilteredAndSortedItems.slice(startIndex, endIndex);

  if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
    logger.info('[ui] PAGINATION_APPLIED', {
      feature: 'menu',
      page: selectionState.currentPage,
      pageSize: selectionState.pageSize,
      totalItems: allFilteredAndSortedItems.length,
      visibleCount: visibleMenuItems.length,
    });
  }

  useEffect(() => {
    selectionState.setCurrentPage(1);
  }, [filtersController.appliedFilters]);

  const handleSelectCategory = (categoryId: string) => {
    selectionState.setSelectedCategory(categoryId);
    filtersController.setAppliedFilters({ ...filtersController.appliedFilters, categoryId });
  };

  // Calculate totals from all items (regardless of current filters)
  const totalItems = allMenuItems.filter((item) => item.status !== 'ARCHIVED').length;
  const activeItems = allMenuItems.filter((item) => item.isAvailable && item.status !== 'ARCHIVED').length;

  const categoriesWithCount = categories.map((cat: Category) => ({
    ...cat,
    // Prefer server-provided itemCount; fall back to local tally if missing
    itemCount: typeof cat.itemCount === 'number' ? cat.itemCount : getCategoryItemCount(cat.id),
  }));

  const categoriesForToolbar = categories.map((cat: Category) => ({ id: cat.id, name: cat.name }));

  return {
    categories,
    categoriesWithCount,
    categoriesForToolbar,
    selectedCategory: selectionState.selectedCategory,
    categoryActiveOnly: selectionState.categoryActiveOnly,
    categorySortBy: selectionState.categorySortBy,
    setCategoryActiveOnly: selectionState.setCategoryActiveOnly,
    setCategorySortBy: selectionState.setCategorySortBy,
    appliedFilters: filtersController.appliedFilters,
    tempFilters: filtersController.tempFilters,
    setTempFilters: filtersController.setTempFilters,
    isFilterDropdownOpen: filtersController.isFilterDropdownOpen,
    searchInputValue: filtersController.searchInputValue,
    itemsLoading,
    visibleMenuItems,
    filteredItemsCount,
    totalPages,
    currentPage: selectionState.currentPage,
    startIndex,
    endIndex,
    showSuccessToast: mutationsController.showSuccessToast,
    toastMessage: mutationsController.toastMessage,
    isItemModalOpen: mutationsController.isItemModalOpen,
    itemModalMode: mutationsController.itemModalMode,
    currentEditItemId: mutationsController.currentEditItemId,
    itemFormData: mutationsController.itemFormData,
    modifierGroups,
    isCategoryModalOpen: mutationsController.isCategoryModalOpen,
    categoryModalMode: mutationsController.categoryModalMode,
    editingCategory: mutationsController.editingCategory,
    newCategoryName: mutationsController.newCategoryName,
    newCategoryDescription: mutationsController.newCategoryDescription,
    newCategoryDisplayOrder: mutationsController.newCategoryDisplayOrder,
    newCategoryActive: mutationsController.newCategoryActive,
    isDeleteModalOpen: mutationsController.isDeleteModalOpen,
    itemToDelete: mutationsController.itemToDelete,
    totalItems,
    activeItems,
    handleSearchChange: filtersController.handleSearchChange,
    handleSearchSubmit: filtersController.handleSearchSubmit,
    handleSortChange: filtersController.handleSortChange,
    handleSelectCategory,
    handleOpenAddCategoryModal: mutationsController.handleOpenAddCategoryModal,
    handleEditCategory: mutationsController.handleEditCategory,
    handleCloseCategoryModal: mutationsController.handleCloseCategoryModal,
    handleSaveCategory: mutationsController.handleSaveCategory,
    setNewCategoryName: mutationsController.setNewCategoryName,
    setNewCategoryDescription: mutationsController.setNewCategoryDescription,
    setNewCategoryDisplayOrder: mutationsController.setNewCategoryDisplayOrder,
    setNewCategoryActive: mutationsController.setNewCategoryActive,
    handleOpenAddItemModal: mutationsController.handleOpenAddItemModal,
    handleOpenEditItemModal: mutationsController.handleOpenEditItemModal,
    handleCloseItemModal: mutationsController.handleCloseItemModal,
    handleSaveItem: mutationsController.handleSaveItem,
    handleDeleteClick: mutationsController.handleDeleteClick,
    handleConfirmDelete: mutationsController.handleConfirmDelete,
    closeDeleteModal: mutationsController.closeDeleteModal,
    handleApplyFilters: filtersController.handleApplyFilters,
    handleResetFilters: filtersController.handleResetFilters,
    handleTempFilterChange: filtersController.handleTempFilterChange,
    toggleFilterDropdown: filtersController.toggleFilterDropdown,
    closeFilterDropdown: filtersController.closeFilterDropdown,
    goToPage: selectionState.goToPage,
    goToPreviousPage: selectionState.goToPreviousPage,
    goToNextPage: selectionState.goToNextPage,
    handleToggleCategoryActive: mutationsController.handleToggleCategoryActive,
    handleDeleteCategory: mutationsController.handleDeleteCategory,
    handleToggleAvailability: mutationsController.handleToggleAvailability,
    setItemFormData: mutationsController.setItemFormData,
  };
}

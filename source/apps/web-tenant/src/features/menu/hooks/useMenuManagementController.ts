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
    categoryId: selectionState.selectedCategory !== 'all' ? selectionState.selectedCategory : undefined,
    status: filtersController.appliedFilters.status !== 'All Status' ? filtersController.appliedFilters.status : undefined,
    availability: filtersController.appliedFilters.availability as 'available' | 'unavailable',
    chefRecommended: filtersController.appliedFilters.chefRecommended || undefined,
    search: filtersController.appliedFilters.searchQuery || undefined,
    sortBy: filtersController.appliedFilters.sortBy,
    page: selectionState.currentPage,
    pageSize: selectionState.pageSize,
  });

  // Fetch all items (no filters) for total/active counts
  const { data: allItemsData } = useMenuItems({});

  // Extract pagination metadata from backend response
  const paginationMeta = useMemo(() => {
    if (!itemsData || Array.isArray(itemsData)) return null;
    return (itemsData as { meta?: { total: number; page: number; limit: number; totalPages: number } })?.meta ?? null;
  }, [itemsData]);

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
        paginationMeta,
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
  }, [itemsData, paginationMeta]);

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

  // Use backend pagination metadata instead of client-side pagination
  const filteredItemsCount = paginationMeta?.total ?? menuItems.length;
  const totalPages = paginationMeta?.totalPages ?? Math.ceil(menuItems.length / selectionState.pageSize);
  const startIndex = (selectionState.currentPage - 1) * selectionState.pageSize;
  const endIndex = startIndex + selectionState.pageSize;
  
  // Backend already filtered/sorted/paginated, use items directly
  const visibleMenuItems = menuItems;

  useEffect(() => {
    selectionState.setCurrentPage(1);
  }, [filtersController.appliedFilters]);

  const handleSelectCategory = (categoryId: string) => {
    selectionState.setSelectedCategory(categoryId);
    // No longer sync to appliedFilters.categoryId - we use selectedCategory directly
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
    showSubscriptionLimitModal: mutationsController.showSubscriptionLimitModal,
    handleCloseSubscriptionModal: mutationsController.handleCloseSubscriptionModal,
  };
}

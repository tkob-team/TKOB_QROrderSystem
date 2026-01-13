'use client';

import React from 'react';
import { UtensilsCrossed, CheckCircle } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import type { SortOption } from '../../model/types';
import { CategorySidebar, MenuToolbar, MenuItemGrid } from '../components';
import { CategoryModal, DeleteConfirmModal, MenuItemModal } from '../modals';
import { useMenuManagementController } from '../../hooks/useMenuManagementController';

export function MenuManagementPage() {
  const controller = useMenuManagementController();

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-primary">
      <CategorySidebar
        categories={controller.categoriesWithCount as any}
        selectedCategory={controller.selectedCategory}
        onSelectCategory={controller.handleSelectCategory}
        onAddCategory={controller.handleOpenAddCategoryModal}
        _onDeleteCategory={controller.handleDeleteCategory}
        onEditCategory={controller.handleEditCategory}
        onToggleActive={controller.handleToggleCategoryActive}
        activeOnly={controller.categoryActiveOnly}
        onActiveOnlyChange={controller.setCategoryActiveOnly}
        sortBy={controller.categorySortBy}
        onSortChange={controller.setCategorySortBy}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <MenuToolbar
          searchQuery={controller.searchInputValue}
          onSearchChange={controller.handleSearchChange}
          onSearchSubmit={controller.handleSearchSubmit}
          isFilterDropdownOpen={controller.isFilterDropdownOpen}
          appliedFilters={controller.appliedFilters}
          tempFilters={controller.tempFilters}
          onFilterDropdownToggle={controller.toggleFilterDropdown}
          onTempFilterChange={controller.handleTempFilterChange}
          onApplyFilters={controller.handleApplyFilters}
          onResetFilters={controller.handleResetFilters}
          onCloseFilterDropdown={controller.closeFilterDropdown}
          sortOption={controller.appliedFilters.sortBy as SortOption}
          onSortChange={controller.handleSortChange}
          onAddItem={controller.handleOpenAddItemModal}
          categories={controller.categoriesForToolbar}
          selectedCategory={controller.selectedCategory}
          onSelectCategory={controller.handleSelectCategory}
          onAddCategory={controller.handleOpenAddCategoryModal}
        />

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-tertiary mb-1">Total Items</p>
                  <p className="text-2xl font-bold text-text-primary">{controller.totalItems}</p>
                  <p className="text-xs text-text-tertiary mt-1">All menu items in your system</p>
                </div>
                <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-accent-500" />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-tertiary mb-1">Active Items</p>
                  <p className="text-2xl font-bold text-text-primary">{controller.activeItems}</p>
                  <p className="text-xs text-text-tertiary mt-1">Currently available items</p>
                </div>
                <div className="w-12 h-12 bg-success-bg rounded-lg flex items-center justify-center border border-success-border">
                  <CheckCircle className="w-6 h-6 text-success-text" />
                </div>
              </div>
            </Card>
          </div>

          <MenuItemGrid
            items={controller.visibleMenuItems}
            onEdit={controller.handleOpenEditItemModal}
            onDelete={controller.handleDeleteClick}
            onToggleAvailability={controller.handleToggleAvailability}
            onAddItem={controller.handleOpenAddItemModal}
            isLoading={controller.itemsLoading}
            searchQuery={controller.appliedFilters.searchQuery}
          />

          {controller.filteredItemsCount > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[rgb(var(--border))]">
              <div className="text-sm text-[rgb(var(--neutral-600))]">
                Showing {controller.startIndex + 1} to {Math.min(controller.endIndex, controller.filteredItemsCount)} of {controller.filteredItemsCount} items
              </div>
              <div className="flex gap-2">
                <button
                  onClick={controller.goToPreviousPage}
                  disabled={controller.currentPage === 1}
                  className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg text-sm font-medium text-[rgb(var(--neutral-700))] hover:bg-[rgb(var(--primary-100))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: controller.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => controller.goToPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        controller.currentPage === page
                          ? 'bg-emerald-500 text-white'
                          : 'border border-[rgb(var(--border))] text-[rgb(var(--neutral-700))] hover:bg-[rgb(var(--primary-100))]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={controller.goToNextPage}
                  disabled={controller.currentPage === controller.totalPages}
                  className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg text-sm font-medium text-[rgb(var(--neutral-700))] hover:bg-[rgb(var(--primary-100))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {controller.isItemModalOpen && (
        <MenuItemModal
          isOpen
          mode={controller.itemModalMode}
          itemId={controller.currentEditItemId || undefined}
          formData={controller.itemFormData}
          categories={controller.categories as any}
          modifierGroups={controller.modifierGroups}
          onClose={controller.handleCloseItemModal}
          onSave={controller.handleSaveItem}
          onFormChange={controller.setItemFormData}
        />
      )}

      {controller.isCategoryModalOpen && (
        <CategoryModal
          isOpen
          mode={controller.categoryModalMode}
          categoryId={controller.editingCategory?.id}
          name={controller.newCategoryName}
          description={controller.newCategoryDescription}
          displayOrder={controller.newCategoryDisplayOrder}
          active={controller.newCategoryActive}
          onNameChange={controller.setNewCategoryName}
          onDescriptionChange={controller.setNewCategoryDescription}
          onDisplayOrderChange={controller.setNewCategoryDisplayOrder}
          onActiveChange={controller.setNewCategoryActive}
          onClose={controller.handleCloseCategoryModal}
          onSave={controller.handleSaveCategory}
        />
      )}

      {controller.isDeleteModalOpen && controller.itemToDelete && (
        <DeleteConfirmModal
          isOpen
          itemName={controller.itemToDelete.name}
          onCancel={controller.closeDeleteModal}
          onConfirm={controller.handleConfirmDelete}
        />
      )}

      {controller.showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-success-solid to-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-slide-in-right">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{controller.toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

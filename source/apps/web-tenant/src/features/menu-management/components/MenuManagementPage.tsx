'use client';

import React from 'react';
import { Toast } from '@/shared/components/ui';
import { MenuTabs } from './MenuTabs';
import { useAppRouter } from '@/shared/hooks/useAppRouter';
import { ROUTES } from '@/lib/routes';

// Extracted components
import { CategoryPanel } from './CategoryPanel';
import { ItemsToolbar } from './ItemsToolbar';
import { MenuItemsGrid } from './MenuItemsGrid';
import { CategoryModal } from './modals/CategoryModal';
import { MenuItemModal } from './modals/MenuItemModal';
import { DeleteItemModal } from './modals/DeleteItemModal';
import { ArchiveCategoryDialog } from './modals/ArchiveCategoryDialog';
import { CategoryContextMenu } from './CategoryContextMenu';

// Hook
import { useMenuManagementPage } from '../hooks/useMenuManagementPage';

// Full featured Menu Management matching Admin-screens-v3 design
export function MenuManagementPage() {
  // React Router
  const { goTo } = useAppRouter();

  // Use the management page hook
  const vm = useMenuManagementPage();

  const {
    state,
    data,
    derived,
    handlers,
    refs,
    formMethods,
    mutations,
  } = vm;



  return (
    <>
      {/* Modals */}
      <CategoryModal
        isOpen={state.isAddCategoryModalOpen}
        isEditing={state.editingCategoryId !== null}
        onClose={handlers.handleCloseCategoryModal}
        onSubmit={handlers.onCategorySubmit}
        register={formMethods.register}
        handleSubmit={formMethods.handleSubmit}
        errors={formMethods.errors}
        isSubmitting={formMethods.isSubmitting}
        isValid={formMethods.isValid}
        watch={formMethods.watch}
      />

      <MenuItemModal
        isOpen={state.isItemModalOpen}
        mode={state.itemModalMode}
        formData={state.itemFormData}
        onFormDataChange={(updates) => {
          state.setItemFormData({ ...state.itemFormData, ...updates });
        }}
        onClose={handlers.handleCloseItemModal}
        onSave={handlers.handleSaveItem}
        categories={data.categories}
        modifierGroups={data.modifierGroups}
        onFileInputChange={handlers.handleFileInputChange}
        onRemovePhoto={handlers.removePhoto}
        onSetPhotoPrimary={handlers.setPhotoPrimary}
        toggleDietary={handlers.toggleDietary}
      />

      <DeleteItemModal
        isOpen={state.isDeleteModalOpen}
        itemToDelete={state.itemToDelete}
        onClose={() => {
          state.setIsDeleteModalOpen(false);
          state.setItemToDelete(null);
        }}
        onConfirm={handlers.handleConfirmDelete}
      />

      <ArchiveCategoryDialog
        isOpen={state.deleteConfirmDialog.open}
        categoryId={state.deleteConfirmDialog.categoryId}
        onClose={() => state.setDeleteConfirmDialog({ open: false, categoryId: null, activeItemCount: 0 })}
        onConfirm={handlers.confirmDeleteCategory}
        isLoading={mutations.deleteCategoryMutation.isPending}
      />

      {/* Main Layout */}
      <div className="flex flex-col bg-gray-50 h-full overflow-hidden">
        {/* Page Header */}
        <div className="px-6 pt-3 pb-2 border-b border-gray-200 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-gray-900" style={{ fontSize: '26px', fontWeight: 700, lineHeight: '1.2', letterSpacing: '-0.02em' }}>
                Menu Management
              </h2>
              <p className="text-gray-600" style={{ fontSize: '14px' }}>
                Manage your menu items, categories, and pricing
              </p>
            </div>

            <MenuTabs
              activeTab="menu-items"
              onTabChange={(tab) => {
                if (tab === 'modifier-groups') {
                  goTo(ROUTES.menuModifiers);
                }
              }}
            />
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT PANEL - Categories */}
          <CategoryPanel
            selectedCategory={state.selectedCategory}
            setSelectedCategory={state.setSelectedCategory}
            sortedCategories={derived.sortedCategories}
            getCategoryItemCount={derived.getCategoryItemCount}
            categorySortBy={state.categorySortBy}
            setCategorySortBy={state.setCategorySortBy}
            showActiveOnlyCategories={state.showActiveOnlyCategories}
            setShowActiveOnlyCategories={state.setShowActiveOnlyCategories}
            menuItems={data.menuItems}
            onAddCategory={handlers.handleOpenAddCategoryModal}
            onCategoryContextMenu={(e, categoryId) => {
              e.preventDefault();
              const newMenu = { categoryId, anchor: 'cursor' as const, x: e.clientX, y: e.clientY };
              state.setContextMenu(newMenu);
              state.setContextMenuPos({ left: e.clientX, top: e.clientY });
            }}
            onCategoryActionClick={(e, categoryId) => {
              e.preventDefault();
              e.stopPropagation();
              const button = e.currentTarget;
              const rect = button.getBoundingClientRect();
              const isOpen = state.contextMenu?.categoryId === categoryId;
              if (isOpen) {
                state.setContextMenu(null);
                state.setContextMenuPos(null);
              } else {
                const newMenu = {
                  categoryId,
                  anchor: 'button' as const,
                  x: rect.left,
                  y: rect.bottom + 8
                };
                state.setContextMenu(newMenu);
                state.setContextMenuPos({ left: rect.left, top: rect.bottom + 8 });
              }
            }}
            contextMenuOpenCategoryId={state.contextMenu?.categoryId || null}
          />

          {/* RIGHT PANEL - Items Grid */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <ItemsToolbar
              searchQuery={state.searchQuery}
              onSearchChange={state.setSearchQuery}
              selectedStatus={state.selectedStatus}
              onStatusChange={state.setSelectedStatus}
              tempSelectedArchiveStatus={state.tempSelectedArchiveStatus}
              onArchiveStatusChange={state.setTempSelectedArchiveStatus}
              onApplyArchiveFilter={() => state.setSelectedArchiveStatus(state.tempSelectedArchiveStatus)}
              sortOption={state.sortOption}
              onSortChange={state.setSortOption}
              onAddItem={handlers.handleOpenAddItemModal}
            />

            {/* Items Grid */}
            <MenuItemsGrid
              items={derived.visibleMenuItems}
              searchQuery={state.searchQuery}
              onEditItem={handlers.handleOpenEditItemModal}
              onDeleteItem={handlers.handleDeleteClick}
              onAddItem={handlers.handleOpenAddItemModal}
            />
          </div>
        </div>
      </div>

      {state.showSuccessToast && (
        <Toast
          message={state.toastMessage}
          type="success"
          onClose={() => state.setShowSuccessToast(false)}
        />
      )}

      {/* Floating Context Menu */}
      <CategoryContextMenu
        contextMenu={state.contextMenu}
        contextMenuPos={state.contextMenuPos}
        contextMenuRef={refs.contextMenuRef}
        sortedCategories={derived.sortedCategories}
        onEdit={handlers.handleEditCategory}
        onToggleStatus={handlers.handleToggleCategoryStatus}
        onDelete={handlers.handleDeleteCategory}
      />

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}

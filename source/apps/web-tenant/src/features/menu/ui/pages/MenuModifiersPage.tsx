'use client';

import React from 'react';

import { useMenuModifiersController } from '../../hooks';
import { ModifiersToolbar, ModifiersGrid } from '../components/modifiers';
import { ModifierGroupModal, ModifierDeleteConfirmModal } from '../modals';

interface MenuModifiersPageProps {
  showHeader?: boolean;
}

export function MenuModifiersPage({ showHeader = true }: MenuModifiersPageProps) {
  const vm = useMenuModifiersController();

  // ========== RENDER ==========
  return (
    <div className="flex flex-col bg-gray-50 h-full overflow-hidden">
      {/* Header - only show when standalone */}
      {showHeader && (
        <div className="shrink-0 px-6 pt-3 pb-2 bg-white sticky top-0 z-10 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                Modifier Groups
              </h2>
              <p className="text-sm text-gray-600">
                Manage sizes, toppings, and other options for menu items
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content area - scrollable */}
      <div className="flex-1 px-6 pt-6 overflow-y-auto bg-gray-50">
        {/* Toolbar */}
        <ModifiersToolbar
          searchQuery={vm.filters.searchInputValue}
          selectedType={vm.filters.filters.type}
          _selectedStatus={vm.filters.filters.status}
          tempSelectedType={vm.filters.tempSelectedType}
          tempSelectedStatus={vm.filters.tempSelectedStatus}
          showFilterDropdown={vm.filters.showFilterDropdown}
          totalGroups={vm.filters.counts.total}
          singleCount={vm.filters.counts.single}
          multiCount={vm.filters.counts.multi}
          activeCount={vm.filters.counts.active}
          archivedCount={vm.filters.counts.archived}
          onSearchChange={vm.actions.onSearchChange}
          onSearchSubmit={vm.actions.onSearchSubmit}
          onTypeChange={vm.actions.onTypeChange}
          onStatusChange={vm.actions.onStatusChange}
          onTempTypeChange={vm.actions.onTempTypeChange}
          onTempStatusChange={vm.actions.onTempStatusChange}
          onApplyFilters={vm.actions.onApplyFilters}
          onToggleFilterDropdown={vm.actions.onToggleFilterDropdown}
          onClearFilters={vm.actions.onClearFilters}
          onCreateGroup={vm.actions.onCreateGroup}
        />

        {/* Group Grid */}
        <ModifiersGrid
          groups={vm.data.visibleGroups}
          onEdit={vm.actions.onEditGroup}
          onDelete={vm.actions.onDeleteGroup}
          onCreateGroup={vm.actions.onCreateGroup}
          isLoading={vm.data.isLoading}
          searchQuery={vm.data.searchQuery}
        />
      </div>

      {/* Modals */}
      <ModifierGroupModal
        isOpen={vm.modals.showCreateModal || vm.modals.showEditModal}
        mode={vm.form.modalMode}
        formData={vm.form.formData}
        onClose={vm.actions.onCloseGroupModal}
        onSave={vm.actions.onSaveGroup}
        onFormChange={vm.actions.onFormChange}
        onAddOption={vm.actions.onAddOption}
        onRemoveOption={vm.actions.onRemoveOption}
        optionName={vm.form.optionName}
        optionPrice={vm.form.optionPrice}
        onOptionNameChange={vm.actions.onOptionNameChange}
        onOptionPriceChange={vm.actions.onOptionPriceChange}
      />

      <ModifierDeleteConfirmModal
        isOpen={vm.modals.showDeleteDialog}
        groupName={vm.modals.deletingGroup?.name || ''}
        linkedItems={vm.modals.deletingGroup?.linkedItems}
        onClose={vm.actions.onCloseDeleteModal}
        onConfirm={vm.actions.onConfirmDelete}
      />

      {/* Toast Notification */}
      {vm.toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${
          vm.toast.type === 'success' ? 'bg-accent-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {vm.toast.message}
        </div>
      )}
    </div>
  );
}

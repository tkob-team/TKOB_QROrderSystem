'use client';

import React from 'react';
import { Toast } from '@/shared/components/ui';
import { useAppRouter } from '@/shared/hooks/useAppRouter';
import { ROUTES } from '@/lib/routes';
import { useMenuModifiersPage } from '../hooks/useMenuModifiersPage';
import { ModifiersHeader } from './ModifiersHeader';
import { ModifiersToolbar } from './ModifiersToolbar';
import { ModifiersGrid } from './ModifiersGrid';
import { ModifierGroupModal } from './ModifierGroupModal';
import { DeleteModifierGroupDialog } from './DeleteModifierGroupDialog';

export function MenuModifiersPage() {
  const { goTo } = useAppRouter();
  const vm = useMenuModifiersPage();
  const { state, derived, handlers } = vm;

  return (
    <>
      {/* Main container */}
      <div className="flex flex-col bg-gray-50 h-full overflow-hidden">
        {/* Page Header */}
        <ModifiersHeader
          onTabChange={(tab) => {
            if (tab === 'menu-items') {
              goTo(ROUTES.menu);
            }
          }}
        />

        {/* Content area - scrollable */}
        <div className="flex-1 px-6 pt-6 overflow-y-auto bg-gray-50">
          {/* Toolbar */}
          <ModifiersToolbar
            visibleGroupsCount={derived.visibleGroups.length}
            selectedType={state.selectedType}
            searchQuery={state.searchQuery}
            onSearchChange={state.setSearchQuery}
            showFilterDropdown={state.showFilterDropdown}
            onToggleFilterDropdown={() => state.setShowFilterDropdown(!state.showFilterDropdown)}
            tempSelectedType={state.tempSelectedType}
            onTempTypeChange={state.setTempSelectedType}
            tempSelectedStatus={state.tempSelectedStatus}
            onTempStatusChange={state.setTempSelectedStatus}
            singleCount={derived.singleCount}
            multiCount={derived.multiCount}
            activeCount={derived.activeCount}
            archivedCount={derived.archivedCount}
            onApplyFilters={handlers.handleApplyFilters}
            onResetFilters={handlers.handleResetFilters}
            onClearFilter={handlers.handleClearFilter}
            onNewGroup={handlers.handleNewGroup}
          />

          {/* Groups grid */}
          <ModifiersGrid
            groups={derived.visibleGroups}
            normalizeType={derived.normalizeModifierType}
            onEditGroup={handlers.handleEditGroup}
            onDeleteGroup={handlers.handleDeleteGroup}
            onNewGroup={handlers.handleNewGroup}
            searchQuery={state.searchQuery}
            selectedType={state.selectedType}
          />
        </div>
      </div>

      {/* Create/Edit Modal */}
      <ModifierGroupModal
        isOpen={state.showCreateModal || state.showEditModal}
        mode={state.showCreateModal ? 'create' : 'edit'}
        formName={state.formName}
        onNameChange={state.setFormName}
        formDescription={state.formDescription}
        onDescriptionChange={state.setFormDescription}
        formType={state.formType}
        onTypeChange={state.setFormType}
        formRequired={state.formRequired}
        onRequiredChange={state.setFormRequired}
        formMinChoices={state.formMinChoices}
        onMinChoicesChange={state.setFormMinChoices}
        formMaxChoices={state.formMaxChoices}
        onMaxChoicesChange={state.setFormMaxChoices}
        formOptions={state.formOptions}
        optionName={state.optionName}
        onOptionNameChange={state.setOptionName}
        optionPrice={state.optionPrice}
        onOptionPriceChange={state.setOptionPrice}
        onAddOption={handlers.handleAddOption}
        onToggleOptionActive={handlers.toggleOptionActive}
        onClose={() => {
          state.setShowCreateModal(false);
          state.setShowEditModal(false);
          state.setEditingGroup(null);
          handlers.resetForm();
        }}
        onSubmit={state.showCreateModal ? handlers.handleCreateGroup : handlers.handleUpdateGroup}
      />

      {/* Delete Dialog */}
      <DeleteModifierGroupDialog
        isOpen={state.showDeleteDialog}
        group={state.deletingGroup}
        onClose={() => {
          state.setShowDeleteDialog(false);
          state.setDeletingGroup(null);
        }}
        onConfirm={handlers.confirmDeleteGroup}
      />

      {/* Toast */}
      {state.toast && (
        <Toast
          message={state.toast.message}
          type={state.toast.type}
          onClose={() => state.setToast(null)}
        />
      )}

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

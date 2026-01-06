'use client';

import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Import feature hooks
import {
  useModifiers,
  useCreateModifier,
  useUpdateModifier,
  useDeleteModifier,
} from '../hooks';
import { getModifierGroupControllerFindAllQueryKey } from '@/services/generated/menu-modifiers/menu-modifiers';

// Import extracted components
import { ModifierToolbar, ModifierGroupGrid } from './ModifierComponents';
import { ModifierGroupModal, DeleteConfirmModal } from './ModifierModals';

// Import types and constants
import type { ModifierGroupFormData, ModifierFilters, ModalMode } from '../types';
import { INITIAL_MODIFIER_FORM, BACKEND_TYPE_MAP, DEFAULT_CHOICES } from '../constants';

// Import shared components
// MenuTabs removed - handled by parent MenuHubPage

interface MenuModifiersPageProps {
  showHeader?: boolean;
}

export function MenuModifiersPage({ showHeader = true }: MenuModifiersPageProps) {
  const queryClient = useQueryClient();

  // ========== STATE ==========
  // Filters
  const [filters, setFilters] = useState<ModifierFilters>({
    type: 'all',
    status: 'all',
    searchQuery: '',
  });
  const [searchInputValue, setSearchInputValue] = useState(''); // Separate state for input display
  const [tempSelectedType, setTempSelectedType] = useState<'all' | 'single' | 'multiple'>('all');
  const [tempSelectedStatus, setTempSelectedStatus] = useState<'all' | 'archived'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [deletingGroup, setDeletingGroup] = useState<any>(null);

  // Form data
  const [formData, setFormData] = useState<ModifierGroupFormData>(INITIAL_MODIFIER_FORM);
  const [optionName, setOptionName] = useState('');
  const [optionPrice, setOptionPrice] = useState('0');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-hide toast
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ========== API QUERIES ==========
  const { data: groupsResponse, isLoading: groupsLoading } = useModifiers({ 
    activeOnly: false 
  });
  const groups = groupsResponse || [];

  // ========== MUTATIONS ==========
  const createGroupMutation = useCreateModifier({
    mutation: {
      onSuccess: async () => {
        await queryClient.refetchQueries({ 
          queryKey: getModifierGroupControllerFindAllQueryKey({ activeOnly: false }) 
        });
        setShowCreateModal(false);
        setToast({ message: 'Modifier group created successfully', type: 'success' });
        resetForm();
      },
      onError: () => {
        setToast({ message: 'Failed to create modifier group', type: 'error' });
      },
    },
  });

  const updateGroupMutation = useUpdateModifier({
    mutation: {
      onSuccess: async () => {
        await queryClient.refetchQueries({ 
          queryKey: getModifierGroupControllerFindAllQueryKey({ activeOnly: false }) 
        });
        setShowEditModal(false);
        setEditingGroup(null);
        setToast({ message: 'Modifier group updated successfully', type: 'success' });
        resetForm();
      },
      onError: () => {
        setToast({ message: 'Failed to update modifier group', type: 'error' });
      },
    },
  });

  const deleteGroupMutation = useDeleteModifier({
    mutation: {
      onSuccess: async () => {
        await queryClient.refetchQueries({ 
          queryKey: getModifierGroupControllerFindAllQueryKey({ activeOnly: false }) 
        });
        setShowDeleteDialog(false);
        setDeletingGroup(null);
        setToast({ message: 'Modifier group deleted successfully', type: 'success' });
      },
      onError: () => {
        setToast({ message: 'Failed to delete modifier group', type: 'error' });
      },
    },
  });

  // ========== HELPER FUNCTIONS ==========
  const resetForm = () => {
    setFormData(INITIAL_MODIFIER_FORM);
    setOptionName('');
    setOptionPrice('0');
  };

  const getFilteredGroups = () => {
    return groups.filter((group: any) => {
      // Type filter
      if (filters.type !== 'all') {
        const groupType = String(group.type) === 'SINGLE_CHOICE' || group.type === 'single' 
          ? 'single' 
          : 'multiple';
        if (groupType !== filters.type) return false;
      }

      // Status filter
      if (filters.status === 'archived') {
        if (group.active !== false) return false;
      } else {
        if (group.active === false) return false;
      }

      // Search filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchName = group.name.toLowerCase().includes(query);
        const matchDesc = group.description?.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }

      return true;
    });
  };

  const visibleGroups = useMemo(() => getFilteredGroups(), [groups, filters]);

  const counts = useMemo(() => ({
    total: visibleGroups.length,
    single: groups.filter((g: any) => 
      String(g.type) === 'SINGLE_CHOICE' || g.type === 'single'
    ).length,
    multi: groups.filter((g: any) => 
      String(g.type) === 'MULTI_CHOICE' || g.type === 'multiple'
    ).length,
    active: groups.filter((g: any) => g.active !== false).length,
    archived: groups.filter((g: any) => g.active === false).length,
  }), [groups, visibleGroups]);

  // ========== EVENT HANDLERS ==========
  // Toolbar handlers
  const handleSearchChange = (query: string) => {
    setSearchInputValue(query); // Only update display, don't filter yet
  };

  const handleSearchSubmit = () => {
    setFilters({ ...filters, searchQuery: searchInputValue }); // Apply filter on Enter
  };

  const handleApplyFilters = () => {
    setFilters({
      ...filters,
      type: tempSelectedType,
      status: tempSelectedStatus,
    });
  };

  const handleClearFilters = () => {
    setFilters({ type: 'all', status: 'all', searchQuery: '' });
    setSearchInputValue(''); // Also clear input display
    setTempSelectedType('all');
    setTempSelectedStatus('all');
  };

  // Modal handlers
  const handleCreateGroup = () => {
    setModalMode('create');
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditGroup = (group: any) => {
    setModalMode('edit');
    setEditingGroup(group);
    
    // Map backend type to frontend
    const displayType = String(group.type) === 'SINGLE_CHOICE' || group.type === 'single'
      ? 'single'
      : 'multiple';

    setFormData({
      name: group.name,
      description: group.description || '',
      type: displayType,
      required: group.required || false,
      minChoices: group.minChoices || DEFAULT_CHOICES[displayType].min,
      maxChoices: group.maxChoices || DEFAULT_CHOICES[displayType].max,
      options: group.options?.map((opt: any, idx: number) => ({
        name: opt.name,
        priceDelta: opt.priceDelta || 0,
        displayOrder: idx + 1,
      })) || [],
    });
    setShowEditModal(true);
  };

  const handleDeleteGroup = (group: any) => {
    setDeletingGroup(group);
    setShowDeleteDialog(true);
  };

  // Form handlers
  const handleFormChange = (data: Partial<ModifierGroupFormData>) => {
    setFormData({ ...formData, ...data });
  };

  const handleAddOption = () => {
    if (!optionName.trim()) {
      setToast({ message: 'Option name is required', type: 'error' });
      return;
    }

    const newOption = {
      name: optionName,
      priceDelta: parseFloat(optionPrice) || 0,
      displayOrder: formData.options.length + 1,
    };

    setFormData({
      ...formData,
      options: [...formData.options, newOption],
    });
    setOptionName('');
    setOptionPrice('0');
  };

  const handleRemoveOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, idx) => idx !== index),
    });
  };

  // Save handlers
  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      setToast({ message: 'Group name is required', type: 'error' });
      return;
    }

    if (formData.options.length === 0) {
      setToast({ message: 'At least one option is required', type: 'error' });
      return;
    }

    // Validate min/max choices for multiple type
    if (formData.type === 'multiple') {
      if (formData.minChoices > formData.options.length) {
        setToast({ 
          message: `Minimum choices (${formData.minChoices}) cannot exceed number of options (${formData.options.length})`, 
          type: 'error' 
        });
        return;
      }
      if (formData.maxChoices > formData.options.length) {
        setToast({ 
          message: `Maximum choices (${formData.maxChoices}) cannot exceed number of options (${formData.options.length})`, 
          type: 'error' 
        });
        return;
      }
      if (formData.minChoices > formData.maxChoices) {
        setToast({ 
          message: 'Minimum choices cannot be greater than maximum choices', 
          type: 'error' 
        });
        return;
      }
    }

    // Prepare payload with backend type mapping
    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type === 'single' ? 'SINGLE_CHOICE' : 'MULTI_CHOICE',
      required: formData.required,
      minChoices: formData.minChoices,
      maxChoices: formData.maxChoices,
      options: formData.options,
    };

    if (modalMode === 'create') {
      createGroupMutation.mutate({ data: payload as any });
    } else if (editingGroup) {
      updateGroupMutation.mutate({ 
        id: editingGroup.id, 
        data: payload as any 
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingGroup) return;
    deleteGroupMutation.mutate({ id: deletingGroup.id });
  };

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
        <ModifierToolbar
          searchQuery={searchInputValue}
          selectedType={filters.type}
          selectedStatus={filters.status}
          tempSelectedType={tempSelectedType}
          tempSelectedStatus={tempSelectedStatus}
          showFilterDropdown={showFilterDropdown}
          totalGroups={counts.total}
          singleCount={counts.single}
          multiCount={counts.multi}
          activeCount={counts.active}
          archivedCount={counts.archived}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onTypeChange={(type) => setFilters({ ...filters, type })}
          onStatusChange={(status) => setFilters({ ...filters, status })}
          onTempTypeChange={setTempSelectedType}
          onTempStatusChange={setTempSelectedStatus}
          onApplyFilters={handleApplyFilters}
          onToggleFilterDropdown={() => setShowFilterDropdown(!showFilterDropdown)}
          onClearFilters={handleClearFilters}
          onCreateGroup={handleCreateGroup}
        />

        {/* Group Grid */}
        <ModifierGroupGrid
          groups={visibleGroups}
          onEdit={handleEditGroup}
          onDelete={handleDeleteGroup}
          onCreateGroup={handleCreateGroup}
          isLoading={groupsLoading}
          searchQuery={filters.searchQuery}
        />
      </div>

      {/* Modals */}
      <ModifierGroupModal
        isOpen={showCreateModal || showEditModal}
        mode={modalMode}
        formData={formData}
        onClose={() => {
          if (showCreateModal) setShowCreateModal(false);
          if (showEditModal) {
            setShowEditModal(false);
            setEditingGroup(null);
          }
          resetForm();
        }}
        onSave={handleSave}
        onFormChange={handleFormChange}
        onAddOption={handleAddOption}
        onRemoveOption={handleRemoveOption}
        optionName={optionName}
        optionPrice={optionPrice}
        onOptionNameChange={setOptionName}
        onOptionPriceChange={setOptionPrice}
      />

      <DeleteConfirmModal
        isOpen={showDeleteDialog}
        groupName={deletingGroup?.name || ''}
        linkedItems={deletingGroup?.linkedItems}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingGroup(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${
          toast.type === 'success' ? 'bg-accent-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

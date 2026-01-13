"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/shared/utils/logger';
import { useCreateModifier, useDeleteModifier, useModifiers, useUpdateModifier } from './queries/modifiers';
import { DEFAULT_CHOICES, INITIAL_MODIFIER_FORM, type ModifierFilters, type ModifierGroupFormData, type ModalMode } from '../model/modifiers';

const MODIFIERS_QUERY_KEY = ['menu', 'modifiers'] as const;

export function useMenuModifiersController() {
  const queryClient = useQueryClient();

  // ========== DATA LAYER ==========
  const modifiersQuery = useModifiers({ activeOnly: false });
  const groups = modifiersQuery.data || [];
  logger.debug('[menu] MODIFIERS_LOADED', { count: groups.length });

  const createGroupMutation = useCreateModifier({
    mutation: {
      onSuccess: async (newGroup: any) => {
        logger.debug('[menu] CREATE_MODIFIER_SUCCESS');
        // Optimistic update: add new group to cache, deduplicate by id
        // Use setQueriesData to update ALL cache entries (base + parameterized keys)
        queryClient.setQueriesData({ queryKey: MODIFIERS_QUERY_KEY }, (old: any[] | undefined) => {
          if (!old) return [newGroup];
          const newId = String(newGroup.id);
          // Remove if already exists (dedupe), then prepend new group
          const deduped = old.filter((g: any) => String(g.id) !== newId);
          return [newGroup, ...deduped];
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
      onSuccess: async (updatedGroup: any) => {
        logger.debug('[menu] UPDATE_MODIFIER_SUCCESS');
        // Optimistic update: replace group in cache
        // Use setQueriesData to update ALL cache entries (base + parameterized keys)
        queryClient.setQueriesData({ queryKey: MODIFIERS_QUERY_KEY }, (old: any[] | undefined) => {
          if (!old) return [updatedGroup];
          return old.map((g: any) => (g.id === updatedGroup.id ? updatedGroup : g));
        });
        // Background sync
        queryClient.invalidateQueries({ queryKey: MODIFIERS_QUERY_KEY });
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
      onSuccess: async (_, groupId: string) => {
        logger.debug('[menu] DELETE_MODIFIER_SUCCESS');
        // Optimistic update: mark group as archived in cache, normalize id comparison
        // Use setQueriesData to update ALL cache entries (base + parameterized keys)
        const deleteId = String(groupId);
        queryClient.setQueriesData({ queryKey: MODIFIERS_QUERY_KEY }, (old: any[] | undefined) => {
          if (!old) return [];
          return old.map((g: any) => (String(g.id) === deleteId ? { ...g, active: false } : g));
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

  // ========== STATE ==========
  const [filters, setFilters] = useState<ModifierFilters>({
    type: 'all',
    status: 'all',
    searchQuery: '',
  });
  const [searchInputValue, setSearchInputValue] = useState('');
  const [tempSelectedType, setTempSelectedType] = useState<'all' | 'single' | 'multiple'>('all');
  const [tempSelectedStatus, setTempSelectedStatus] = useState<'all' | 'archived'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [deletingGroup, setDeletingGroup] = useState<any>(null);

  const [formData, setFormData] = useState<ModifierGroupFormData>(INITIAL_MODIFIER_FORM);
  const [optionName, setOptionName] = useState('');
  const [optionPrice, setOptionPrice] = useState('0');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast]);

  // ========== HELPERS ==========
  const resetForm = () => {
    setFormData(INITIAL_MODIFIER_FORM);
    setOptionName('');
    setOptionPrice('0');
  };

  const mapGroupType = (group: any) =>
    String(group.type) === 'SINGLE_CHOICE' || group.type === 'single' ? 'single' : 'multiple';

  const getFilteredGroups = () => {
    const filtered = groups
      .filter((group: any) => {
        if (filters.type !== 'all') {
          const groupType = mapGroupType(group);
          if (groupType !== filters.type) return false;
        }

        if (filters.status === 'archived') {
          if (group.active !== false) return false;
        } else if (group.active === false) {
          return false;
        }

        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase();
          const matchName = group.name.toLowerCase().includes(query);
          const matchDesc = group.description?.toLowerCase().includes(query);
          if (!matchName && !matchDesc) return false;
        }

        return true;
      })
      .sort((a: any, b: any) => (a.displayOrder || 999) - (b.displayOrder || 999));
    
    logger.debug('[menu] FILTER_MODIFIERS', { filtered: filtered.length, total: groups.length });
    return filtered;
  };

  const visibleGroups = useMemo(() => getFilteredGroups(), [groups, filters]);

  const counts = useMemo(
    () => ({
      total: visibleGroups.length,
      single: groups.filter((g: any) => mapGroupType(g) === 'single').length,
      multi: groups.filter((g: any) => mapGroupType(g) === 'multiple').length,
      active: groups.filter((g: any) => g.active !== false).length,
      archived: groups.filter((g: any) => g.active === false).length,
    }),
    [groups, visibleGroups]
  );

  // ========== ACTIONS ==========
  const handleSearchChange = (query: string) => setSearchInputValue(query);

  const handleSearchSubmit = () => {
    setFilters({ ...filters, searchQuery: searchInputValue });
  };

  const handleApplyFilters = () => {
    setFilters({ ...filters, type: tempSelectedType, status: tempSelectedStatus });
  };

  const handleClearFilters = () => {
    setFilters({ type: 'all', status: 'all', searchQuery: '' });
    setSearchInputValue('');
    setTempSelectedType('all');
    setTempSelectedStatus('all');
  };

  const handleCreateGroup = () => {
    setModalMode('create');
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditGroup = (group: any) => {
    setModalMode('edit');
    setEditingGroup(group);

    const displayType = mapGroupType(group);

    setFormData({
      name: group.name,
      description: group.description || '',
      type: displayType,
      required: group.required || false,
      minChoices: group.minChoices || DEFAULT_CHOICES[displayType].min,
      maxChoices: group.maxChoices || DEFAULT_CHOICES[displayType].max,
      displayOrder: group.displayOrder,
      options:
        group.options?.map((opt: any) => ({
          id: opt.id,
          name: opt.name,
          priceDelta: opt.priceDelta || 0,
          displayOrder: opt.displayOrder,
        })) || [],
    });
    setShowEditModal(true);
  };

  const handleDeleteGroup = (group: any) => {
    setDeletingGroup(group);
    setShowDeleteDialog(true);
  };

  const handleFormChange = (data: Partial<ModifierGroupFormData>) => {
    setFormData({ ...formData, ...data });
  };

  const handleAddOption = () => {
    if (!optionName.trim()) {
      setToast({ message: 'Option name is required', type: 'error' });
      return;
    }

    const newOption = {
      id: `temp-${Date.now()}-${formData.options.length}`,
      name: optionName,
      priceDelta: parseFloat(optionPrice) || 0,
      displayOrder: formData.options.length + 1,
    };

    setFormData({ ...formData, options: [...formData.options, newOption] });
    setOptionName('');
    setOptionPrice('0');
  };

  const handleRemoveOption = (index: number) => {
    setFormData({ ...formData, options: formData.options.filter((_, idx) => idx !== index) });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      setToast({ message: 'Group name is required', type: 'error' });
      return;
    }

    if (formData.options.length === 0) {
      setToast({ message: 'At least one option is required', type: 'error' });
      return;
    }

    if (formData.type === 'multiple') {
      if (formData.minChoices > formData.options.length) {
        setToast({
          message: `Minimum choices (${formData.minChoices}) cannot exceed number of options (${formData.options.length})`,
          type: 'error',
        });
        return;
      }
      if (formData.maxChoices > formData.options.length) {
        setToast({
          message: `Maximum choices (${formData.maxChoices}) cannot exceed number of options (${formData.options.length})`,
          type: 'error',
        });
        return;
      }
      if (formData.minChoices > formData.maxChoices) {
        setToast({ message: 'Minimum choices cannot be greater than maximum choices', type: 'error' });
        return;
      }
    }

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type === 'single' ? 'SINGLE_CHOICE' : 'MULTI_CHOICE',
      required: formData.required,
      minChoices: formData.minChoices,
      maxChoices: formData.maxChoices,
      displayOrder: formData.displayOrder,
      options: formData.options.map((opt: any, idx: number) => ({
        id: opt.id,
        name: opt.name,
        priceDelta: opt.priceDelta,
        displayOrder: opt.displayOrder || idx + 1,
      })),
    };

    logger.debug('[menu] SAVE_MODIFIER_ATTEMPT', { mode: modalMode });

    if (modalMode === 'create') {
      createGroupMutation.mutate(payload as any);
    } else if (editingGroup) {
      const updatePayload = { ...payload, active: editingGroup.active };
      updateGroupMutation.mutate({ id: editingGroup.id, data: updatePayload as any });
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingGroup) return;
    deleteGroupMutation.mutate(deletingGroup.id);
  };

  const handleCloseGroupModal = () => {
    setShowCreateModal(false);
    if (showEditModal) {
      setShowEditModal(false);
      setEditingGroup(null);
    }
    resetForm();
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteDialog(false);
    setDeletingGroup(null);
  };

  return {
    data: {
      groups,
      visibleGroups,
      isLoading: modifiersQuery.isLoading,
      searchQuery: filters.searchQuery,
    },
    filters: {
      filters,
      searchInputValue,
      tempSelectedType,
      tempSelectedStatus,
      showFilterDropdown,
      counts,
    },
    form: {
      formData,
      optionName,
      optionPrice,
      modalMode,
    },
    modals: {
      showCreateModal,
      showEditModal,
      showDeleteDialog,
      deletingGroup,
    },
    toast,
    actions: {
      onSearchChange: handleSearchChange,
      onSearchSubmit: handleSearchSubmit,
      onTypeChange: (type: ModifierFilters['type']) => setFilters({ ...filters, type }),
      onStatusChange: (status: ModifierFilters['status']) => setFilters({ ...filters, status }),
      onTempTypeChange: setTempSelectedType,
      onTempStatusChange: setTempSelectedStatus,
      onApplyFilters: handleApplyFilters,
      onToggleFilterDropdown: () => setShowFilterDropdown(!showFilterDropdown),
      onClearFilters: handleClearFilters,
      onCreateGroup: handleCreateGroup,
      onEditGroup: handleEditGroup,
      onDeleteGroup: handleDeleteGroup,
      onFormChange: handleFormChange,
      onAddOption: handleAddOption,
      onRemoveOption: handleRemoveOption,
      onSaveGroup: handleSave,
      onConfirmDelete: handleConfirmDelete,
      onOptionNameChange: setOptionName,
      onOptionPriceChange: setOptionPrice,
      onCloseGroupModal: handleCloseGroupModal,
      onCloseDeleteModal: handleCloseDeleteModal,
    },
  };
}

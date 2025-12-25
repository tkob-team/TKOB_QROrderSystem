'use client';

import React, { useState } from 'react';
import {
  useModifierGroups,
  useCreateModifierGroup,
  useUpdateModifierGroup,
  useDeleteModifierGroup,
} from '@/features/menu-management/hooks/useMenu';
import { ModifierGroup, FormOption } from '../types/modifiers';
import { normalizeModifierType } from '../utils/normalizeModifierType';

export function useMenuModifiersPage() {
  // Filter state - Applied filters
  const [selectedType, setSelectedType] = useState<'all' | 'single' | 'multiple'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'archived'>('all');

  // Temporary filter state (used in dropdown before Apply)
  const [tempSelectedType, setTempSelectedType] = useState<'all' | 'single' | 'multiple'>('all');
  const [tempSelectedStatus, setTempSelectedStatus] = useState<'all' | 'archived'>('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form states
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<ModifierGroup | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<'single' | 'multiple'>('single');
  const [formRequired, setFormRequired] = useState(false);
  const [formMinChoices, setFormMinChoices] = useState(1);
  const [formMaxChoices, setFormMaxChoices] = useState(1);

  // Options management
  const [formOptions, setFormOptions] = useState<FormOption[]>([]);
  const [optionName, setOptionName] = useState('');
  const [optionPrice, setOptionPrice] = useState('0');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // API queries and mutations
  const { data: groupsResponse } = useModifierGroups({ activeOnly: false });
  const groups = (Array.isArray(groupsResponse?.data) ? groupsResponse.data : []) as ModifierGroup[];

  const createGroupMutation = useCreateModifierGroup();
  const updateGroupMutation = useUpdateModifierGroup();
  const deleteGroupMutation = useDeleteModifierGroup();

  // Derived: Filter logic
  const visibleGroups = groups.filter((group) => {
    if (selectedStatus === 'archived') {
      if (group.active !== false) return false;
    } else {
      if (group.active === false) return false;
    }

    const normalizedGroupType = normalizeModifierType(group.type);
    const matchesType = selectedType === 'all' || normalizedGroupType === selectedType;
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  // Derived: Counts
  const singleCount = groups.filter(g => normalizeModifierType(g.type) === 'single').length;
  const multiCount = groups.filter(g => normalizeModifierType(g.type) === 'multiple').length;
  const activeCount = groups.filter(g => g.active !== false).length;
  const archivedCount = groups.filter(g => g.active === false).length;

  // Handlers: Form management
  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormType('single');
    setFormRequired(false);
    setFormMinChoices(1);
    setFormMaxChoices(1);
    setFormOptions([]);
    setOptionName('');
    setOptionPrice('0');
  };

  const handleNewGroup = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Handlers: Options
  const handleAddOption = () => {
    if (!optionName.trim()) {
      setToast({ message: 'Option name is required', type: 'error' });
      return;
    }

    const newOption: FormOption = {
      name: optionName,
      priceDelta: parseFloat(optionPrice) || 0,
      displayOrder: formOptions.length + 1,
      active: true,
    };

    setFormOptions([...formOptions, newOption]);
    setOptionName('');
    setOptionPrice('0');
  };

  const toggleOptionActive = (index: number) => {
    const updatedOptions = formOptions.map((option, i) =>
      i === index ? { ...option, active: !option.active } : option
    );
    setFormOptions(updatedOptions);
  };

  // Handlers: CRUD
  const handleCreateGroup = () => {
    if (!formName.trim()) {
      setToast({ message: 'Group name is required', type: 'error' });
      return;
    }

    if (formOptions.length === 0) {
      setToast({ message: 'At least one option is required', type: 'error' });
      return;
    }

    if (formType === 'multiple') {
      if (formMinChoices > formOptions.length) {
        setToast({
          message: `Minimum choices (${formMinChoices}) cannot exceed number of options (${formOptions.length})`,
          type: 'error',
        });
        return;
      }
      if (formMaxChoices > formOptions.length) {
        setToast({
          message: `Maximum choices (${formMaxChoices}) cannot exceed number of options (${formOptions.length})`,
          type: 'error',
        });
        return;
      }
      if (formMinChoices > formMaxChoices) {
        setToast({
          message: 'Minimum choices cannot be greater than maximum choices',
          type: 'error',
        });
        return;
      }
    }

    createGroupMutation.mutate({
      data: {
        name: formName,
        description: formDescription || undefined,
        type: formType === 'single' ? 'SINGLE_CHOICE' : 'MULTI_CHOICE',
        required: formRequired,
        minChoices: formMinChoices,
        maxChoices: formMaxChoices,
        options: formOptions.map(opt => ({
          name: opt.name,
          priceDelta: opt.priceDelta,
          displayOrder: opt.displayOrder,
        })),
      } as unknown as {
        name: string;
        description?: string;
        type: 'SINGLE_CHOICE' | 'MULTI_CHOICE';
        required: boolean;
        minChoices: number;
        maxChoices: number;
        options: Array<{ name: string; priceDelta: number; displayOrder: number }>;
        displayOrder?: number;
        active?: boolean;
      },
    });
  };

  const handleEditGroup = (group: ModifierGroup) => {
    setEditingGroup(group);
    setFormName(group.name);
    setFormDescription(group.description || '');
    const normalizedType = normalizeModifierType(group.type);
    setFormType(normalizedType);
    setFormRequired(group.required);
    setFormOptions(
      group.options.map((opt, idx) => ({
        name: opt.name,
        priceDelta: opt.priceDelta,
        displayOrder: idx + 1,
        active: opt.active !== false,
      }))
    );

    if (normalizedType === 'single') {
      setFormMinChoices(1);
      setFormMaxChoices(1);
    } else {
      setFormMinChoices(0);
      setFormMaxChoices(group.options.length);
    }

    setShowEditModal(true);
  };

  const handleUpdateGroup = () => {
    if (!formName.trim() || !editingGroup) {
      setToast({ message: 'Group name is required', type: 'error' });
      return;
    }

    if (formOptions.length === 0) {
      setToast({ message: 'At least one option is required', type: 'error' });
      return;
    }

    if (formType === 'multiple') {
      if (formMinChoices > formOptions.length) {
        setToast({
          message: `Minimum choices (${formMinChoices}) cannot exceed number of options (${formOptions.length})`,
          type: 'error',
        });
        return;
      }
      if (formMaxChoices > formOptions.length) {
        setToast({
          message: `Maximum choices (${formMaxChoices}) cannot exceed number of options (${formOptions.length})`,
          type: 'error',
        });
        return;
      }
      if (formMinChoices > formMaxChoices) {
        setToast({
          message: 'Minimum choices cannot be greater than maximum choices',
          type: 'error',
        });
        return;
      }
    }

    updateGroupMutation.mutate({
      id: editingGroup.id,
      data: {
        name: formName,
        description: formDescription || undefined,
        type: formType === 'single' ? 'SINGLE_CHOICE' : 'MULTI_CHOICE',
        required: formRequired,
        minChoices: formMinChoices,
        maxChoices: formMaxChoices,
        options: formOptions.map(opt => ({
          name: opt.name,
          priceDelta: opt.priceDelta,
          displayOrder: opt.displayOrder,
        })),
      } as unknown as {
        name: string;
        description?: string;
        type: 'SINGLE_CHOICE' | 'MULTI_CHOICE';
        required: boolean;
        minChoices: number;
        maxChoices: number;
        options: Array<{ name: string; priceDelta: number; displayOrder: number }>;
        displayOrder?: number;
        active?: boolean;
      },
    });
  };

  const handleDeleteGroup = (group: ModifierGroup) => {
    setDeletingGroup(group);
    setShowDeleteDialog(true);
  };

  const confirmDeleteGroup = () => {
    if (!deletingGroup) return;
    deleteGroupMutation.mutate({
      id: deletingGroup.id,
    });
  };

  // Handlers: Filters
  const handleApplyFilters = () => {
    setSelectedType(tempSelectedType);
    setSelectedStatus(tempSelectedStatus);
    setShowFilterDropdown(false);
  };

  const handleResetFilters = () => {
    setTempSelectedType('all');
    setTempSelectedStatus('all');
    setSelectedType('all');
    setSelectedStatus('all');
    setShowFilterDropdown(false);
  };

  const handleClearFilter = () => {
    setSelectedType('all');
    setSearchQuery('');
  };

  // Sync temp states when dropdown opens
  React.useEffect(() => {
    if (showFilterDropdown) {
      setTempSelectedType(selectedType);
      setTempSelectedStatus(selectedStatus);
    }
  }, [showFilterDropdown, selectedType, selectedStatus]);

  return {
    state: {
      selectedType,
      setSelectedType,
      selectedStatus,
      setSelectedStatus,
      tempSelectedType,
      setTempSelectedType,
      tempSelectedStatus,
      setTempSelectedStatus,
      searchQuery,
      setSearchQuery,
      showFilterDropdown,
      setShowFilterDropdown,
      showCreateModal,
      setShowCreateModal,
      showEditModal,
      setShowEditModal,
      showDeleteDialog,
      setShowDeleteDialog,
      editingGroup,
      setEditingGroup,
      deletingGroup,
      setDeletingGroup,
      formName,
      setFormName,
      formDescription,
      setFormDescription,
      formType,
      setFormType,
      formRequired,
      setFormRequired,
      formMinChoices,
      setFormMinChoices,
      formMaxChoices,
      setFormMaxChoices,
      formOptions,
      setFormOptions,
      optionName,
      setOptionName,
      optionPrice,
      setOptionPrice,
      toast,
      setToast,
    },
    data: {
      groups,
      groupsResponse,
    },
    derived: {
      visibleGroups,
      singleCount,
      multiCount,
      activeCount,
      archivedCount,
      normalizeModifierType,
    },
    handlers: {
      resetForm,
      handleNewGroup,
      handleAddOption,
      toggleOptionActive,
      handleCreateGroup,
      handleEditGroup,
      handleUpdateGroup,
      handleDeleteGroup,
      confirmDeleteGroup,
      handleApplyFilters,
      handleResetFilters,
      handleClearFilter,
    },
    mutations: {
      createGroupMutation,
      updateGroupMutation,
      deleteGroupMutation,
    },
  };
}

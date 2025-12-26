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
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [formType, setFormType] = useState<'single' | 'multiple'>('single');
  const [formRequired, setFormRequired] = useState(false);
  const [formMinChoices, setFormMinChoices] = useState(1);
  const [formMaxChoices, setFormMaxChoices] = useState(1);
  const [formActive, setFormActive] = useState(true);

  // Options management
  const [formOptions, setFormOptions] = useState<FormOption[]>([]);
  const [optionName, setOptionName] = useState('');
  const [optionPrice, setOptionPrice] = useState('0');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // API queries and mutations
  // Build query parameters based on selected filters
  const queryParams = {
    activeOnly: selectedStatus === 'archived' ? false : selectedStatus === 'all' ? undefined : true,
    type: selectedType === 'all' 
      ? undefined 
      : selectedType === 'single' 
      ? 'SINGLE_CHOICE' 
      : 'MULTI_CHOICE',
  };
  
  const { data: groupsResponse } = useModifierGroups(queryParams);
  const groups = (Array.isArray(groupsResponse?.data) ? groupsResponse.data : []) as ModifierGroup[];

  const createGroupMutation = useCreateModifierGroup();
  const updateGroupMutation = useUpdateModifierGroup();
  const deleteGroupMutation = useDeleteModifierGroup();

  // Derived: Filter logic - Only filter by search query since server handles type/status
  const visibleGroups = groups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Derived: Counts - Calculate from the filtered server response
  const singleCount = groups.filter(g => normalizeModifierType(g.type) === 'single').length;
  const multiCount = groups.filter(g => normalizeModifierType(g.type) === 'multiple').length;
  const activeCount = groups.filter(g => g.active !== false).length;
  const archivedCount = groups.filter(g => g.active === false).length;

  // Handlers: Form management
  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormDisplayOrder(0);
    setFormType('single');
    setFormRequired(false);
    setFormMinChoices(1);
    setFormMaxChoices(1);
    setFormActive(true);
    setFormOptions([]);
    setOptionName('');
    setOptionPrice('0');
  };

  const handleNewGroup = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Handler: Required checkbox change
  // If Required: minChoices >= 1
  // If Not Required: minChoices >= 0
  // For SingleChoice:
  //   - Required: minChoices=1, maxChoices=1
  //   - Not Required: minChoices=0, maxChoices=1
  const handleRequiredChange = (required: boolean) => {
    setFormRequired(required);
    
    if (formType === 'single') {
      if (required) {
        setFormMinChoices(1);
        setFormMaxChoices(1);
      } else {
        setFormMinChoices(0);
        setFormMaxChoices(1);
      }
    } else {
      // For multiple choice
      if (required) {
        // Min must be >= 1
        const newMin = Math.max(formMinChoices, 1);
        setFormMinChoices(newMin);
      } else {
        // Min can be >= 0
        setFormMinChoices(Math.max(formMinChoices, 0));
      }
    }
  };

  // Handler: Type change (single vs multiple)
  // Apply min/max logic based on new type and current Required state
  const handleTypeChange = (type: 'single' | 'multiple') => {
    setFormType(type);
    
    if (type === 'single') {
      if (formRequired) {
        setFormMinChoices(1);
        setFormMaxChoices(1);
      } else {
        setFormMinChoices(0);
        setFormMaxChoices(1);
      }
    } else {
      // For multiple choice
      if (formRequired) {
        const newMin = Math.max(formMinChoices, 1);
        setFormMinChoices(newMin);
        setFormMaxChoices(Math.max(formMaxChoices, newMin + 1, formOptions.length));
      } else {
        setFormMinChoices(Math.max(formMinChoices, 0));
        setFormMaxChoices(Math.max(formMaxChoices, 1, formOptions.length));
      }
    }
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

    // Map form options, filtering out inactive ones and only sending active options
    const activeOptions = formOptions
      .filter(opt => opt.active !== false)
      .map(opt => ({
        name: opt.name,
        priceDelta: opt.priceDelta,
        displayOrder: opt.displayOrder,
      }));

    createGroupMutation.mutate(
      {
        name: formName,
        description: formDescription || undefined,
        type: formType === 'single' ? 'SINGLE_CHOICE' : 'MULTI_CHOICE',
        required: formRequired,
        minChoices: formMinChoices,
        maxChoices: formMaxChoices,
        displayOrder: formDisplayOrder,
        options: activeOptions,
      } as unknown as {
        name: string;
        description?: string;
        type: 'SINGLE_CHOICE' | 'MULTI_CHOICE';
        required: boolean;
        minChoices: number;
        maxChoices: number;
        displayOrder: number;
        options: Array<{ name: string; priceDelta: number; displayOrder: number }>;
        active?: boolean;
      },
      {
        onSuccess: () => {
          setToast({
            message: `Modifier group "${formName}" created successfully`,
            type: 'success',
          });
          setShowCreateModal(false);
          resetForm();
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.errorMessage || error?.message || 'Failed to create modifier group';
          setToast({
            message: errorMessage,
            type: 'error',
          });
        },
      }
    );
  };

  const handleEditGroup = (group: ModifierGroup) => {
    setEditingGroup(group);
    setFormName(group.name);
    setFormDescription(group.description || '');
    setFormDisplayOrder(group.displayOrder || 0);
    setFormActive(group.active !== false);
    const normalizedType = normalizeModifierType(group.type);
    setFormType(normalizedType);
    setFormRequired(group.required);
    setFormOptions(
      group.options.map((opt, idx) => ({
        id: opt.id,
        name: opt.name,
        priceDelta: opt.priceDelta,
        displayOrder: idx + 1,
        active: opt.active !== false,
      }))
    );

    if (normalizedType === 'single') {
      setFormMinChoices(group.minChoices || 1);
      setFormMaxChoices(group.maxChoices || 1);
    } else {
      setFormMinChoices(group.minChoices || 0);
      setFormMaxChoices(group.maxChoices || group.options.length);
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

    // Map form options, filtering out inactive ones and only sending active options
    // Include id for existing options (for updates), exclude for new options
    const activeOptions = formOptions
      .filter(opt => opt.active !== false)
      .map(opt => ({
        ...(opt.id ? { id: opt.id } : {}),
        name: opt.name,
        priceDelta: Number(opt.priceDelta),
        displayOrder: Number(opt.displayOrder),
      }));

    updateGroupMutation.mutate(
      {
        id: editingGroup.id,
        data: {
          name: formName,
          description: formDescription || undefined,
          type: formType === 'single' ? 'SINGLE_CHOICE' : 'MULTI_CHOICE',
          required: formRequired,
          minChoices: Number(formMinChoices),
          maxChoices: Number(formMaxChoices),
          displayOrder: Number(formDisplayOrder),
          active: Boolean(formActive),
          options: activeOptions,
        } as unknown as {
          name: string;
          description?: string;
          type: 'SINGLE_CHOICE' | 'MULTI_CHOICE';
          required: boolean;
          minChoices: number;
          maxChoices: number;
          displayOrder: number;
          active: boolean;
          options: Array<{ id?: string; name: string; priceDelta: number; displayOrder: number }>;
        },
      },
      {
        onSuccess: () => {
          setToast({
            message: `Modifier group "${formName}" updated successfully`,
            type: 'success',
          });
          setShowEditModal(false);
          resetForm();
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.errorMessage || error?.message || 'Failed to update modifier group';
          setToast({
            message: errorMessage,
            type: 'error',
          });
        },
      }
    );
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
      formDisplayOrder,
      setFormDisplayOrder,
      formType,
      setFormType,
      formRequired,
      setFormRequired,
      formMinChoices,
      setFormMinChoices,
      formMaxChoices,
      setFormMaxChoices,
      formActive,
      setFormActive,
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
      handleRequiredChange,
      handleTypeChange,
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

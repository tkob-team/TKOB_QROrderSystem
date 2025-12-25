'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, Badge, Toast } from '@/shared/components/ui';
import { MenuTabs } from '@/features/menu-management/components/MenuTabs';
import { useAppRouter } from '@/shared/hooks/useAppRouter';
import { ROUTES } from '@/lib/routes';
import { Search, Plus, Edit, Trash2, Filter, XCircle, X, AlertTriangle } from 'lucide-react';

// Import generated API hooks
import {
  useModifierGroupControllerFindAll,
  useModifierGroupControllerCreate,
  useModifierGroupControllerUpdate,
  useModifierGroupControllerDelete,
  getModifierGroupControllerFindAllQueryKey,
} from '@/services/generated/menu-modifiers/menu-modifiers';


interface ModifierGroup {
  id: string;
  name: string;
  description?: string;
  options: { id: string; name: string; priceDelta: number }[];  // priceDelta not price
  linkedItems: number;
  type: 'single' | 'multiple';
  required: boolean;
  active: boolean;
}

export function MenuModifiersPage() {
  // React Router
  const { goTo } = useAppRouter();
  
  // React Query
  const queryClient = useQueryClient();

  // Filter state - Applied filters (used for actual filtering)
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
  const [formOptions, setFormOptions] = useState<{ name: string; priceDelta: number; displayOrder: number }[]>([]);
  const [optionName, setOptionName] = useState('');
  const [optionPrice, setOptionPrice] = useState('0');
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch Modifier Groups from API
  const { data: groupsResponse, isLoading: groupsLoading } = useModifierGroupControllerFindAll({ activeOnly: false });
  // axios.ts already unwraps {success, data} → groupsResponse is the array directly
  const groups = groupsResponse || [];

  // Modifier Group Mutations
  const createGroupMutation = useModifierGroupControllerCreate({
    mutation: {
      onSuccess: async () => {
        // Force immediate refetch to show changes instantly
        await queryClient.refetchQueries({ queryKey: getModifierGroupControllerFindAllQueryKey({ activeOnly: false }) });
        setShowCreateModal(false);
        setToast({ message: 'Modifier group created successfully', type: 'success' });
        resetForm();
      },
      onError: () => {
        setToast({ message: 'Failed to create modifier group', type: 'error' });
      },
    },
  });

  const updateGroupMutation = useModifierGroupControllerUpdate({
    mutation: {
      onSuccess: async () => {
        await queryClient.refetchQueries({ queryKey: getModifierGroupControllerFindAllQueryKey({ activeOnly: false }) });
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

  const deleteGroupMutation = useModifierGroupControllerDelete({
    mutation: {
      onSuccess: async () => {
        await queryClient.refetchQueries({ queryKey: getModifierGroupControllerFindAllQueryKey({ activeOnly: false }) });
        setShowDeleteDialog(false);
        setDeletingGroup(null);
        setToast({ message: 'Modifier group archived successfully', type: 'success' });
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to archive modifier group';
        setToast({ message, type: 'error' });
      },
    },
  });

  // Helper function to normalize type format (convert API format to form format)
  const normalizeType = (type: any): 'single' | 'multiple' => {
    return type === 'SINGLE_CHOICE' || type === 'single' ? 'single' : 'multiple';
  };

  // Filter logic - Both type AND status filters
  const visibleGroups = groups.filter((group) => {
    // Status filter: active vs archived
    if (selectedStatus === 'archived') {
      if (group.active) return false; // Hide active when viewing archived
    } else { // 'all' - show only active
      if (!group.active) return false; // Hide archived when viewing active
    }
    
    // Type filter: single vs multiple (normalize both sides for comparison)
    const normalizedGroupType = normalizeType(group.type);
    const matchesType = selectedType === 'all' || normalizedGroupType === selectedType;
    
    // Search filter
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Reset form
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

  // Add option
  const handleAddOption = () => {
    if (!optionName.trim()) {
      setToast({ message: 'Option name is required', type: 'error' });
      return;
    }
    
    const newOption = {
      name: optionName,
      priceDelta: parseFloat(optionPrice) || 0,
      displayOrder: formOptions.length + 1,
    };
    
    setFormOptions([...formOptions, newOption]);
    setOptionName('');
    setOptionPrice('0');
  };

  // Remove option
  const handleRemoveOption = (index: number) => {
    setFormOptions(formOptions.filter((_, i) => i !== index));
  };

  // New group
  const handleNewGroup = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Create group
  const handleCreateGroup = () => {
    if (!formName.trim()) {
      setToast({ message: 'Group name is required', type: 'error' });
      return;
    }

    if (formOptions.length === 0) {
      setToast({ message: 'At least one option is required', type: 'error' });
      return;
    }

    // Validate min/max choices for multi-choice
    if (formType === 'multiple') {
      if (formMinChoices > formOptions.length) {
        setToast({ 
          message: `Minimum choices (${formMinChoices}) cannot exceed number of options (${formOptions.length})`, 
          type: 'error' 
        });
        return;
      }
      if (formMaxChoices > formOptions.length) {
        setToast({ 
          message: `Maximum choices (${formMaxChoices}) cannot exceed number of options (${formOptions.length})`, 
          type: 'error' 
        });
        return;
      }
      if (formMinChoices > formMaxChoices) {
        setToast({ 
          message: 'Minimum choices cannot be greater than maximum choices', 
          type: 'error' 
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
        options: formOptions,
      },
    });
  };

  // Edit group
  const handleEditGroup = (group: ModifierGroup) => {
    setEditingGroup(group);
    setFormName(group.name);
    setFormDescription(group.description || '');
    // Convert API type format to form format
    const formattedType = group.type === 'SINGLE_CHOICE' || group.type === 'single' ? 'single' : 'multiple';
    setFormType(formattedType);
    setFormRequired(group.required);
    setFormOptions(group.options.map((opt, idx) => ({
      name: opt.name,
      priceDelta: opt.priceDelta,  // Use priceDelta not price
      displayOrder: idx + 1,
    })));
    
    // Set min/max based on type
    if (formattedType === 'single') {
      setFormMinChoices(1);
      setFormMaxChoices(1);
    } else {
      setFormMinChoices(0);
      setFormMaxChoices(group.options.length);
    }
    
    setShowEditModal(true);
  };

  // Update group
  const handleUpdateGroup = () => {
    if (!formName.trim() || !editingGroup) {
      setToast({ message: 'Group name is required', type: 'error' });
      return;
    }

    if (formOptions.length === 0) {
      setToast({ message: 'At least one option is required', type: 'error' });
      return;
    }

    // Validate min/max choices for multi-choice
    if (formType === 'multiple') {
      if (formMinChoices > formOptions.length) {
        setToast({ 
          message: `Minimum choices (${formMinChoices}) cannot exceed number of options (${formOptions.length})`, 
          type: 'error' 
        });
        return;
      }
      if (formMaxChoices > formOptions.length) {
        setToast({ 
          message: `Maximum choices (${formMaxChoices}) cannot exceed number of options (${formOptions.length})`, 
          type: 'error' 
        });
        return;
      }
      if (formMinChoices > formMaxChoices) {
        setToast({ 
          message: 'Minimum choices cannot be greater than maximum choices', 
          type: 'error' 
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
        options: formOptions,
      },
    });
  };

  // Delete group
  const handleDeleteGroup = (group: ModifierGroup) => {
    setDeletingGroup(group);
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDeleteGroup = () => {
    if (!deletingGroup) return;

    deleteGroupMutation.mutate({
      id: deletingGroup.id,
    });
  };

  // Filter counts
  const getSingleCount = () => groups.filter(g => g.type === 'single').length;
  const getMultiCount = () => groups.filter(g => g.type === 'multiple').length;

  // Apply filters
  const handleApplyFilters = () => {
    setSelectedType(tempSelectedType);
    setSelectedStatus(tempSelectedStatus);
    setShowFilterDropdown(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setTempSelectedType('all');
    setTempSelectedStatus('all');
    setSelectedType('all');
    setSelectedStatus('all');
    setShowFilterDropdown(false);
  };

  // useEffect to sync temp states when dropdown opens
  React.useEffect(() => {
    if (showFilterDropdown) {
      setTempSelectedType(selectedType);
      setTempSelectedStatus(selectedStatus);
    }
  }, [showFilterDropdown, selectedType, selectedStatus]);

  return (
    <>
      {/* Main container */}
      <div className="flex flex-col bg-gray-50 h-full overflow-hidden">
        {/* Page Header */}
        <div className="px-6 pt-3 pb-2 border-b border-gray-200 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-gray-900" style={{ fontSize: '26px', fontWeight: 700, lineHeight: '1.2', letterSpacing: '-0.02em' }}>
                Modifier Groups
              </h2>
              <p className="text-gray-600" style={{ fontSize: '14px' }}>
                Manage sizes, toppings, and other options for menu items
              </p>
            </div>
            
            <MenuTabs 
              activeTab="modifier-groups"
              onTabChange={(tab) => {
                if (tab === 'menu-items') {
                  goTo(ROUTES.menu);
                }
              }}
            />
          </div>
        </div>

        {/* Content area - scrollable */}
        <div className="flex-1 px-6 pt-6 overflow-y-auto bg-gray-50">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Title with count text */}
              <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 700 }}>
                All Groups
              </h3>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full" style={{ fontSize: '13px', fontWeight: 600 }}>
                {visibleGroups.length} {visibleGroups.length === 1 ? 'group' : 'groups'}
              </span>
              
              {/* Clear filter button */}
              {(selectedType !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedType('all');
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Clear filter
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Filter button */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-emerald-400 transition-all"
                  style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', height: '48px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </button>

                {/* Filter dropdown */}
                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Filter by Type</h4>
                        <button
                          onClick={() => setShowFilterDropdown(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                        <div className="space-y-2">
                          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="type-filter"
                                checked={tempSelectedType === 'all'}
                                onChange={() => setTempSelectedType('all')}
                                className="w-4 h-4 text-emerald-600"
                              />
                              <span className="text-sm text-gray-700">All Types</span>
                            </div>
                            <span className="text-xs text-gray-500">{groups.length}</span>
                          </label>

                          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="type-filter"
                                checked={tempSelectedType === 'single'}
                                onChange={() => setTempSelectedType('single')}
                                className="w-4 h-4 text-emerald-600"
                              />
                              <span className="text-sm text-gray-700">Single Choice</span>
                            </div>
                            <span className="text-xs text-gray-500">{getSingleCount()}</span>
                          </label>

                          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="type-filter"
                                checked={tempSelectedType === 'multiple'}
                                onChange={() => setTempSelectedType('multiple')}
                                className="w-4 h-4 text-emerald-600"
                              />
                              <span className="text-sm text-gray-700">Multiple Choice</span>
                            </div>
                            <span className="text-xs text-gray-500">{getMultiCount()}</span>
                          </label>
                        </div>

                      {/* Status Filter Section */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Filter by Status</h4>
                        <div className="space-y-2">
                          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="status-filter"
                                checked={tempSelectedStatus === 'all'}
                                onChange={() => setTempSelectedStatus('all')}
                                className="w-4 h-4 text-emerald-600"
                              />
                              <span className="text-sm text-gray-700">Active Groups</span>
                            </div>
                            <span className="text-xs text-gray-500">{groups.filter(g => g.active).length}</span>
                          </label>

                          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="status-filter"
                                checked={tempSelectedStatus === 'archived'}
                                onChange={() => setTempSelectedStatus('archived')}
                                className="w-4 h-4 text-emerald-600"
                              />
                              <span className="text-sm text-gray-700">Archived Groups</span>
                            </div>
                            <span className="text-xs text-gray-500">{groups.filter(g => !g.active).length}</span>
                          </label>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                        <button
                          onClick={handleResetFilters}
                          className="flex-1 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          Reset
                        </button>
                        <button
                          onClick={handleApplyFilters}
                          className="flex-1 px-3 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* New Group button */}
              <button
                onClick={handleNewGroup}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white transition-all"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', height: '48px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              >
                <Plus className="w-5 h-5" />
                New Group
              </button>
            </div>
          </div>

          {/* Groups grid */}
          {visibleGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
              {visibleGroups.map((group) => (
                <Card key={group.id} className="p-6 hover:shadow-xl transition-all border-2 border-gray-100 hover:border-emerald-300">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-1" style={{ fontSize: '17px', fontWeight: 700 }}>
                          {group.name}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge variant={normalizeType(group.type) === 'single' ? 'success' : 'neutral'}>
                            {normalizeType(group.type) === 'single' ? 'Choose 1' : 'Multi-select'}
                          </Badge>
                          {!group.active && (
                            <Badge variant="neutral">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {group.description && (
                      <p className="text-gray-600 line-clamp-2" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                        {group.description}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600" style={{ fontSize: '12px', fontWeight: 600 }}>
                        Options:
                      </span>
                      <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full" style={{ fontSize: '11px', fontWeight: 700 }}>
                        {group.options.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600" style={{ fontSize: '12px', fontWeight: 600 }}>
                        Items:
                      </span>
                      <span className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded-full" style={{ fontSize: '11px', fontWeight: 700 }}>
                        {group.linkedItems}
                      </span>
                    </div>
                  </div>

                  {/* Sample Options Preview */}
                  <div className="mb-4">
                    <div className="text-gray-700 mb-2" style={{ fontSize: '12px', fontWeight: 700 }}>
                      Options Preview
                    </div>
                    <div className="flex flex-col gap-1">
                      {group.options.slice(0, 3).map((option) => (
                        <div key={option.id} className="flex items-center justify-between text-gray-600" style={{ fontSize: '12px' }}>
                          <span>{option.name}</span>
                          <span className="text-emerald-600" style={{ fontWeight: 600 }}>
                            {option.priceDelta >= 0 ? '+' : ''}{option.priceDelta.toLocaleString()} VND
                          </span>
                        </div>
                      ))}
                      {group.options.length > 3 && (
                        <span className="text-gray-500" style={{ fontSize: '11px' }}>
                          +{group.options.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditGroup(group)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all border border-emerald-200 hover:border-emerald-300"
                      style={{ fontSize: '13px', fontWeight: 600 }}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group)}
                      className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-red-50 rounded-xl transition-all border border-gray-200 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups found</h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery || selectedType !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Get started by creating your first modifier group'}
              </p>
              {!searchQuery && selectedType === 'all' && (
                <button
                  onClick={handleNewGroup}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Group
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create Modifier Group</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Size Options, Pizza Toppings"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of this modifier group"
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selection Type <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="single"
                      checked={formType === 'single'}
                      onChange={() => setFormType('single')}
                      className="mt-0.5 w-4 h-4 text-emerald-600"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Single Choice</div>
                      <div className="text-xs text-gray-500">Customer can select only one option</div>
                    </div>
                  </label>

                  <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="multiple"
                      checked={formType === 'multiple'}
                      onChange={() => setFormType('multiple')}
                      className="mt-0.5 w-4 h-4 text-emerald-600"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Multiple Choice</div>
                      <div className="text-xs text-gray-500">Customer can select multiple options</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Required & Min/Max Choices */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formRequired}
                    onChange={(e) => setFormRequired(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Required</div>
                    <div className="text-xs text-gray-500">Customer must select from this group</div>
                  </div>
                </label>

                {formType === 'multiple' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Choices
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formMinChoices}
                        onChange={(e) => setFormMinChoices(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Choices
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formMaxChoices}
                        onChange={(e) => setFormMaxChoices(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Options Management */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Options <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    (e.g., Small, Medium, Large)
                  </span>
                </label>

                {/* Add Option Form */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    placeholder="Option name"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="number"
                    value={optionPrice}
                    onChange={(e) => setOptionPrice(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    placeholder="Price (VND)"
                    className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Options List */}
                {formOptions.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {formOptions.map((option, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{option.name}</div>
                          <div className="text-xs text-gray-500">
                            {option.priceDelta >= 0 ? '+' : ''}{option.priceDelta.toLocaleString()} VND
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-gray-200 border-dashed rounded-lg">
                    <p className="text-sm text-gray-500">No options added yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Modifier Group</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingGroup(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Size Options, Pizza Toppings"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of this modifier group"
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selection Type <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="type-edit"
                      value="single"
                      checked={formType === 'single'}
                      onChange={() => setFormType('single')}
                      className="mt-0.5 w-4 h-4 text-emerald-600"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Single Choice</div>
                      <div className="text-xs text-gray-500">Customer can select only one option</div>
                    </div>
                  </label>

                  <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="type-edit"
                      value="multiple"
                      checked={formType === 'multiple'}
                      onChange={() => setFormType('multiple')}
                      className="mt-0.5 w-4 h-4 text-emerald-600"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Multiple Choice</div>
                      <div className="text-xs text-gray-500">Customer can select multiple options</div>
                    </div>
                  </label>
                </div>
              </div>
              {/* Required & Min/Max Choices */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formRequired}
                    onChange={(e) => setFormRequired(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Required</div>
                    <div className="text-xs text-gray-500">Customer must select from this group</div>
                  </div>
                </label>

                {formType === 'multiple' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Choices
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formMinChoices}
                        onChange={(e) => setFormMinChoices(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Choices
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formMaxChoices}
                        onChange={(e) => setFormMaxChoices(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Options Management */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Options <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    (e.g., Small, Medium, Large)
                  </span>
                </label>

                {/* Add Option Form */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    placeholder="Option name"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="number"
                    value={optionPrice}
                    onChange={(e) => setOptionPrice(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    placeholder="Price (VND)"
                    className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Options List */}
                {formOptions.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {formOptions.map((option, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{option.name}</div>
                          <div className="text-xs text-gray-500">
                            {option.priceDelta >= 0 ? '+' : ''}{option.priceDelta.toLocaleString()} VND
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-gray-200 border-dashed rounded-lg">
                    <p className="text-sm text-gray-500">No options added yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingGroup(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateGroup}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Update Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && deletingGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scaleIn">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Modifier Group?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{deletingGroup.name}</span>?
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setDeletingGroup(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteGroup}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
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

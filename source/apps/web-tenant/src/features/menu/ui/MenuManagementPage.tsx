'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UtensilsCrossed, CheckCircle } from 'lucide-react';
import { Card } from '@/shared/components/Card';

// Import feature hooks
import {
  useMenuCategories,
  useCreateCategory,
  useDeleteCategory,
  useMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useUploadPhoto,
  useModifiers,
} from '../hooks';

// Import extracted components
import {
  CategorySidebar,
  MenuToolbar,
  MenuItemGrid,
} from './MenuComponents';
import {
  MenuItemModal,
  AddCategoryModal,
  DeleteConfirmModal,
} from './MenuModals';

// Import types and constants
import type {
  Category,
  MenuItem,
  MenuItemFormData,
  MenuFilters,
  ModalMode,
} from '../types';
import { INITIAL_MENU_ITEM_FORM } from '../constants';

export function MenuManagementPage() {
  const queryClient = useQueryClient();

  // ========== STATE ==========
  // Category state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  // Filter state
  const [filters, setFilters] = useState<MenuFilters>({
    categoryId: 'all',
    status: 'All Status',
    archiveStatus: 'all',
    sortBy: 'Sort by: Newest',
    searchQuery: '',
  });
  const [searchInputValue, setSearchInputValue] = useState(''); // Separate state for input display
  const [tempArchiveStatus, setTempArchiveStatus] = useState<'all' | 'archived'>('all');

  // Item modal state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<ModalMode>('add');
  const [currentEditItemId, setCurrentEditItemId] = useState<string | null>(null);
  const [itemFormData, setItemFormData] = useState<MenuItemFormData>(INITIAL_MENU_ITEM_FORM);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  // Toast notification
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Auto-hide toast
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  // ========== API QUERIES ==========
  const { data: categoriesData } = useMenuCategories();
  const categories = categoriesData || [];

  const { data: itemsData, isLoading: itemsLoading } = useMenuItems();
  const menuItems = Array.isArray(itemsData) 
    ? itemsData 
    : (itemsData as any)?.data || [];

  const { data: modifierGroupsData } = useModifiers({ activeOnly: false });
  const modifierGroups = modifierGroupsData || [];

  // ========== MUTATIONS ==========
  // Category mutations
  const createCategoryMutation = useCreateCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/categories'] });
        setIsAddCategoryModalOpen(false);
        setNewCategoryName('');
        setNewCategoryDescription('');
        setToastMessage('Danh mục đã được tạo');
        setShowSuccessToast(true);
      },
      onError: (error) => {
        console.error('Error creating category:', error);
        setToastMessage('Có lỗi khi tạo danh mục');
        setShowSuccessToast(true);
      },
    }
  });

  const deleteCategoryMutation = useDeleteCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/categories'] });
        setToastMessage('Danh mục đã được xóa');
        setShowSuccessToast(true);
      },
      onError: (error) => {
        console.error('Error deleting category:', error);
        setToastMessage('Có lỗi khi xóa danh mục');
        setShowSuccessToast(true);
      }
    }
  });

  // Item mutations
  const createItemMutation = useCreateMenuItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/item'] });
        setToastMessage('Món ăn đã được tạo');
        setShowSuccessToast(true);
      },
      onError: (error) => {
        console.error('Error creating item:', error);
        setToastMessage('Có lỗi khi tạo món ăn');
        setShowSuccessToast(true);
      }
    }
  });

  const updateItemMutation = useUpdateMenuItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/item'] });
        setToastMessage('Món ăn đã được cập nhật');
        setShowSuccessToast(true);
      },
      onError: (error) => {
        console.error('Error updating item:', error);
        setToastMessage('Có lỗi khi cập nhật món ăn');
        setShowSuccessToast(true);
      }
    }
  });

  const deleteItemMutation = useDeleteMenuItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/item'] });
        setToastMessage('Món ăn đã được xóa');
        setShowSuccessToast(true);
      },
      onError: (error) => {
        console.error('Error deleting item:', error);
        setToastMessage('Có lỗi khi xóa món ăn');
        setShowSuccessToast(true);
      }
    }
  });

  const uploadPhotoMutation = useUploadPhoto({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/v1/menu/item'] });
      },
      onError: (error: any) => {
        console.error('Error uploading photo:', error);
      }
    }
  });

  // ========== HELPER FUNCTIONS ==========
  const getCategoryItemCount = (categoryId: string) => {
    return menuItems.filter((item: any) => item.categoryId === categoryId).length;
  };

  const getFilteredAndSortedItems = () => {
    return menuItems
      .filter((item: any) => {
        // Category filter
        if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
        
        // Archive filter
        if (filters.archiveStatus === 'archived') {
          if (item.status !== 'ARCHIVED') return false;
        } else {
          if (item.status === 'ARCHIVED') return false;
        }
        
        // Search filter
        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(query);
          const matchDesc = item.description?.toLowerCase().includes(query);
          if (!matchName && !matchDesc) return false;
        }
        
        // Status filter
        if (filters.status !== 'All Status') {
          const statusMap: Record<string, string> = {
            'Available': 'available',
            'Unavailable': 'unavailable',
            'Sold Out': 'sold_out',
          };
          const targetStatus = statusMap[filters.status];
          const itemStatus = item.isAvailable 
            ? 'available' 
            : item.status === 'SOLD_OUT' 
              ? 'sold_out' 
              : 'unavailable';
          if (itemStatus !== targetStatus) return false;
        }
        
        return true;
      })
      .sort((a: any, b: any) => {
        switch (filters.sortBy) {
          case 'Sort by: Newest':
            return new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime();
          case 'Popularity':
            return ((b as any).popularity || 0) - ((a as any).popularity || 0);
          case 'Price (Low)':
            return (a as any).price - (b as any).price;
          case 'Price (High)':
            return (b as any).price - (a as any).price;
          default:
            return 0;
        }
      });
  };

  const visibleMenuItems = getFilteredAndSortedItems();

  // ========== EVENT HANDLERS ==========
  // Category handlers
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFilters({ ...filters, categoryId });
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    await createCategoryMutation.mutateAsync({
      data: {
        name: newCategoryName,
        description: newCategoryDescription || undefined,
      }
    });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategoryMutation.mutateAsync({ id: categoryId });
  };

  // Item modal handlers
  const handleOpenAddItemModal = () => {
    setItemModalMode('add');
    setCurrentEditItemId(null);
    setItemFormData({
      ...INITIAL_MENU_ITEM_FORM,
      category: selectedCategory,
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItemModal = (item: MenuItem) => {
    setItemModalMode('edit');
    setCurrentEditItemId(item.id);
    setItemFormData({
      name: item.name,
      category: item.categoryId,
      description: item.description || '',
      price: item.price.toString(),
      status: item.isAvailable ? 'available' : item.status === 'SOLD_OUT' ? 'sold_out' : 'unavailable',
      image: null,
      dietary: item.dietary || [],
      chefRecommended: item.chefRecommended || false,
      modifierGroupIds: item.modifierGroups?.map(g => g.id) || [],
    });
    setIsItemModalOpen(true);
  };

  const handleCloseItemModal = () => {
    setIsItemModalOpen(false);
    setCurrentEditItemId(null);
    setItemFormData(INITIAL_MENU_ITEM_FORM);
  };

  const handleSaveItem = async () => {
    if (!itemFormData.name.trim() || !itemFormData.price.trim()) return;

    try {
      if (itemModalMode === 'add') {
        const result = await createItemMutation.mutateAsync({
          data: {
            name: itemFormData.name,
            categoryId: itemFormData.category,
            description: itemFormData.description || undefined,
            price: parseFloat(itemFormData.price),
            modifierGroupIds: itemFormData.modifierGroupIds,
          }
        });

        // Upload photo if exists
        if (itemFormData.image && result?.id) {
          await uploadPhotoMutation.mutateAsync({
            itemId: result.id,
            data: { file: itemFormData.image }
          });
        }

        setToastMessage(`Món "${itemFormData.name}" đã được tạo`);
      } else if (currentEditItemId) {
        await updateItemMutation.mutateAsync({
          id: currentEditItemId,
          data: {
            name: itemFormData.name,
            categoryId: itemFormData.category,
            description: itemFormData.description || undefined,
            price: parseFloat(itemFormData.price),
            available: itemFormData.status === 'available',
            modifierGroupIds: itemFormData.modifierGroupIds,
          }
        });

        // Upload photo if exists
        if (itemFormData.image) {
          await uploadPhotoMutation.mutateAsync({
            itemId: currentEditItemId,
            data: { file: itemFormData.image }
          });
        }

        setToastMessage(`Món "${itemFormData.name}" đã được cập nhật`);
      }

      setShowSuccessToast(true);
      handleCloseItemModal();
    } catch (error) {
      console.error('Error in handleSaveItem:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setItemFormData({ ...itemFormData, image: e.target.files[0] });
    }
  };

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete({ id: item.id, name: item.name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItemMutation.mutateAsync({ id: itemToDelete.id });
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error in handleConfirmDelete:', error);
    }
  };

  // Filter handlers
  const handleSearchChange = (query: string) => {
    setSearchInputValue(query); // Only update display, don't filter yet
  };

  const handleSearchSubmit = () => {
    setFilters({ ...filters, searchQuery: searchInputValue }); // Apply filter on Enter
  };

  const handleStatusChange = (status: string) => {
    setFilters({ ...filters, status });
  };

  const handleSortChange = (sortBy: string) => {
    setFilters({ ...filters, sortBy: sortBy as any });
  };

  const handleArchiveStatusChange = (status: 'all' | 'archived') => {
    setTempArchiveStatus(status);
  };

  const handleApplyArchiveFilter = () => {
    setFilters({ ...filters, archiveStatus: tempArchiveStatus });
  };

  // Toggle item availability
  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const newAvailable = !item.isAvailable;
      await updateItemMutation.mutateAsync({
        id: item.id,
        data: {
          available: newAvailable,
        }
      });
      setToastMessage(`"${item.name}" is now ${newAvailable ? 'available' : 'unavailable'}`);
      setShowSuccessToast(true);
    } catch (error) {
      console.error('Error toggling availability:', error);
      setToastMessage('Failed to update availability');
      setShowSuccessToast(true);
    }
  };

  // ========== RENDER ==========
  // Calculate stats
  const totalItems = menuItems.filter((item: any) => item.status !== 'ARCHIVED').length;
  const activeItems = menuItems.filter((item: any) => item.isAvailable && item.status !== 'ARCHIVED').length;

  return (
    <div className="flex h-screen bg-primary">
      {/* Category Sidebar */}
      <CategorySidebar
        categories={categories.map((cat: any) => ({
          ...cat,
          itemCount: getCategoryItemCount(cat.id),
        })) as any}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onAddCategory={() => setIsAddCategoryModalOpen(true)}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <MenuToolbar
          searchQuery={searchInputValue}
          selectedStatus={filters.status}
          sortOption={filters.sortBy}
          archiveStatus={filters.archiveStatus}
          tempArchiveStatus={tempArchiveStatus}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onStatusChange={handleStatusChange}
          onSortChange={handleSortChange}
          onArchiveStatusChange={handleArchiveStatusChange}
          onTempArchiveStatusChange={handleArchiveStatusChange}
          onApplyArchiveFilter={handleApplyArchiveFilter}
          onAddItem={handleOpenAddItemModal}
          // Mobile category props
          categories={categories.map((cat: any) => ({ id: cat.id, name: cat.name }))}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onAddCategory={() => setIsAddCategoryModalOpen(true)}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-tertiary mb-1">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold text-text-primary">
                    {totalItems}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    All menu items in your system
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-accent-500" />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-tertiary mb-1">
                    Active Items
                  </p>
                  <p className="text-2xl font-bold text-text-primary">
                    {activeItems}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    Currently available items
                  </p>
                </div>
                <div className="w-12 h-12 bg-success-bg rounded-lg flex items-center justify-center border border-success-border">
                  <CheckCircle className="w-6 h-6 text-success-text" />
                </div>
              </div>
            </Card>
          </div>

          {/* Item Grid */}
          <MenuItemGrid
            items={visibleMenuItems}
            onEdit={handleOpenEditItemModal}
            onDelete={handleDeleteClick}
            onToggleAvailability={handleToggleAvailability}
            onAddItem={handleOpenAddItemModal}
            isLoading={itemsLoading}
            searchQuery={filters.searchQuery}
          />
        </div>
      </div>

      {/* Modals */}
      <MenuItemModal
        isOpen={isItemModalOpen}
        mode={itemModalMode}
        formData={itemFormData}
        categories={categories as any}
        modifierGroups={modifierGroups}
        onClose={handleCloseItemModal}
        onSave={handleSaveItem}
        onFormChange={setItemFormData}
        onImageUpload={handleImageUpload}
      />

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        name={newCategoryName}
        description={newCategoryDescription}
        onNameChange={setNewCategoryName}
        onDescriptionChange={setNewCategoryDescription}
        onClose={() => {
          setIsAddCategoryModalOpen(false);
          setNewCategoryName('');
          setNewCategoryDescription('');
        }}
        onSave={handleAddCategory}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        itemName={itemToDelete?.name || ''}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-success-solid to-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-slide-in-right">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

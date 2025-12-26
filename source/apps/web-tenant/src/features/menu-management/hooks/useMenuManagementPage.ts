'use client';

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

// Menu Hooks
import {
  useMenuCategories,
  useMenuItems,
  useModifierGroups,
  useCreateMenuCategory,
  useUpdateMenuCategory,
  useDeleteMenuCategory,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
} from '@/features/menu-management/hooks/useMenu';

// API Hooks
import {
  useMenuPhotoControllerUploadPhoto,
} from '@/services/generated/menu-photos/menu-photos';

// Schema and Utils
import { categorySchema, type CategoryFormData } from '../schemas/category.schema';
import { validateImageFile, MAX_FILE_SIZE_MB } from '../utils/imageUpload';
import { getImageUrl } from '../utils/getImageUrl';

// Types
export type PhotoItem = {
  id: string;
  file?: File;
  previewUrl: string;
  uploadedUrl?: string;
  isPrimary: boolean;
};

export type ItemFormData = {
  name: string;
  category: string;
  description: string;
  price: string;
  prepTimeMinutes: number | null;
  status: 'available' | 'unavailable' | 'sold_out';
  menuItemPhotos: PhotoItem[];
  dietary: string[];
  chefRecommended: boolean;
  modifierGroupIds: string[];
};

export function useMenuManagementPage() {
  const queryClient = useQueryClient();

  // ============ STATE ============
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [sortOption, setSortOption] = useState('Sort by: Newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySortBy, setCategorySortBy] = useState<'displayOrder' | 'name' | 'createdAt'>('displayOrder');
  const [showActiveOnlyCategories, setShowActiveOnlyCategories] = useState(false);
  const [_selectedArchiveStatus, setSelectedArchiveStatus] = useState<'all' | 'archived'>('all');
  const [tempSelectedArchiveStatus, setTempSelectedArchiveStatus] = useState<'all' | 'archived'>('all');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ categoryId: string; anchor: 'cursor' | 'button'; x: number; y: number } | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ left: number; top: number } | null>(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ open: boolean; categoryId: string | null; activeItemCount: number }>({
    open: false,
    categoryId: null,
    activeItemCount: 0,
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<'add' | 'edit'>('add');
  const [currentEditItemId, setCurrentEditItemId] = useState<string | null>(null);
  const [itemFormData, setItemFormData] = useState<ItemFormData>({
    name: '',
    category: '',
    description: '',
    price: '',
    prepTimeMinutes: null,
    status: 'available',
    menuItemPhotos: [],
    dietary: [],
    chefRecommended: false,
    modifierGroupIds: [],
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      displayOrder: null,
      status: 'ACTIVE',
    },
  });

  // ============ REFS ============
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // ============ DATA FETCHING ============
  const { data: categoriesResponse } = useMenuCategories({ activeOnly: showActiveOnlyCategories });
  const categories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [];

  const { data: itemsResponse } = useMenuItems();
  const menuItems = Array.isArray(itemsResponse?.data) ? itemsResponse.data : [];

  const { data: modifierGroupsResponse } = useModifierGroups({ activeOnly: false });
  const modifierGroups = Array.isArray(modifierGroupsResponse?.data) ? modifierGroupsResponse.data : [];

  // ============ MUTATIONS ============
  const createCategoryMutation = useCreateMenuCategory();
  const updateCategoryMutation = useUpdateMenuCategory();
  const deleteCategoryMutation = useDeleteMenuCategory();
  const createItemMutation = useCreateMenuItem();
  const updateItemMutation = useUpdateMenuItem();
  const deleteItemMutation = useDeleteMenuItem();
  const uploadPhotoMutation = useMenuPhotoControllerUploadPhoto();

  // ============ DERIVED COMPUTATIONS ============
  const getCategoryItemCount = (categoryId: string): number => {
    return menuItems.filter(
      (item: any) => item.categoryId === categoryId
    ).length;
  };

  const getCategoryActiveItemCount = (categoryId: string): number => {
    return menuItems.filter(
      (item: any) => item.categoryId === categoryId && item.status === 'available'
    ).length;
  };

  const getCategoryById = (categoryId: string) => {
    return categories?.find((cat: any) => cat.id === categoryId) || null;
  };

  const sortedCategories = [...categories].sort((a: any, b: any) => {
    switch (categorySortBy) {
      case 'displayOrder': {
        const aOrder = a.displayOrder ?? Infinity;
        const bOrder = b.displayOrder ?? Infinity;
        if (aOrder === bOrder) {
          return (a.name || '').localeCompare(b.name || '');
        }
        return (aOrder as number) - (bOrder as number);
      }
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'createdAt': {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      }
      default:
        return 0;
    }
  });

  const visibleMenuItems = menuItems
    .filter((item: any) => {
      if (selectedCategory === 'all') return true;
      return item.categoryId === selectedCategory;
    })
    .filter((item: any) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query)
      );
    })
    .filter((item: any) => {
      if (selectedStatus === 'All Status') return true;
      if (selectedStatus === 'Available') return item.isAvailable && item.status !== 'SOLD_OUT';
      if (selectedStatus === 'Unavailable') return !item.isAvailable;
      if (selectedStatus === 'Sold Out') return item.status === 'SOLD_OUT';
      return true;
    })
    .sort((a: any, b: any) => {
      if (sortOption === 'Sort by: Popularity') {
        return (b.popularity || 0) - (a.popularity || 0);
      }
      if (sortOption === 'Sort by: Price (Low)') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortOption === 'Sort by: Price (High)') {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortOption === 'Sort by: Name (A-Z)') {
        return (a.name || '').localeCompare((b.name || ''), 'en', { numeric: true });
      }
      if (sortOption === 'Sort by: Name (Z-A)') {
        return (b.name || '').localeCompare((a.name || ''), 'en', { numeric: true });
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  // ============ CATEGORY HANDLERS ============
  const onCategorySubmit = async (data: CategoryFormData) => {
    try {
      const payload = {
        data: {
          name: data.name,
          description: data.description || undefined,
          displayOrder: data.displayOrder !== null && data.displayOrder !== '' ? Number(data.displayOrder) : undefined,
          active: data.status === 'ACTIVE',
        }
      };

      let result;
      if (editingCategoryId) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategoryId,
          ...payload
        });
        setToastMessage(`Category "${data.name}" updated successfully`);
      } else {
        result = await createCategoryMutation.mutateAsync(payload);
        setToastMessage(`Category "${data.name}" created successfully`);
        if (result?.id) {
          setSelectedCategory(result.id);
        }
      }

      setIsAddCategoryModalOpen(false);
      setEditingCategoryId(null);
      reset();
      setShowSuccessToast(true);
    } catch (error) {
      console.error('Error in category submit:', error);
    }
  };

  const handleOpenAddCategoryModal = () => {
    setEditingCategoryId(null);
    reset({
      name: '',
      description: '',
      displayOrder: null,
      status: 'ACTIVE',
    });
    setIsAddCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsAddCategoryModalOpen(false);
    setEditingCategoryId(null);
    reset();
  };

  const handleEditCategory = (category: any) => {
    setEditingCategoryId(category.id);
    reset({
      name: category.name,
      description: category.description || '',
      displayOrder: category.displayOrder || null,
      status: category.active ? 'ACTIVE' : 'INACTIVE',
    });
    setIsAddCategoryModalOpen(true);
    setContextMenu(null);
    setContextMenuPos(null);
  };

  const handleToggleCategoryStatus = async (categoryId: string) => {
    try {
      const category = getCategoryById(categoryId);
      if (!category) return;

      const newActive = !category.active;
      const payload = {
        data: {
          name: category.name,
          description: category.description,
          displayOrder: category.displayOrder,
          active: newActive,
        }
      };

      await updateCategoryMutation.mutateAsync({
        id: categoryId,
        ...payload
      });

      setToastMessage(`Category status changed to ${newActive ? 'Active' : 'Inactive'}`);
      setShowSuccessToast(true);
      setContextMenu(null);
      setContextMenuPos(null);
    } catch (error) {
      console.error('Error toggling category status:', error);
      setToastMessage('Có lỗi khi cập nhật trạng thái danh mục');
      setShowSuccessToast(true);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const activeCount = getCategoryActiveItemCount(categoryId);
    setDeleteConfirmDialog({
      open: true,
      categoryId,
      activeItemCount: activeCount,
    });
    setContextMenu(null);
    setContextMenuPos(null);
  };

  const confirmDeleteCategory = async () => {
    const { categoryId } = deleteConfirmDialog;
    if (!categoryId) return;

    try {
      await deleteCategoryMutation.mutateAsync({ id: categoryId });

      if (selectedCategory === categoryId) {
        setSelectedCategory('all');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // ============ ITEM HANDLERS ============
  const handleOpenAddItemModal = () => {
    setItemModalMode('add');
    const defaultCategory = selectedCategory === 'all'
      ? (categories[0]?.id || '')
      : selectedCategory;

    setItemFormData({
      name: '',
      category: defaultCategory,
      description: '',
      price: '',
      prepTimeMinutes: null,
      status: 'available',
      menuItemPhotos: [],
      dietary: [],
      chefRecommended: false,
      modifierGroupIds: [],
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItemModal = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setItemModalMode('edit');
    setCurrentEditItemId(item.id);
    setItemFormData({
      name: item.name,
      category: item.categoryId || selectedCategory,
      description: item.description || '',
      price: String(item.price || ''),
      prepTimeMinutes: item.preparationTime || null,
      status: item.status === 'SOLD_OUT' ? 'sold_out' : (!item.available ? 'unavailable' : 'available'),
      menuItemPhotos: [],
      dietary: item.tags || [],
      chefRecommended: item.chefRecommended || false,
      modifierGroupIds: item.modifierGroupIds || item.modifierGroups?.map((mg: any) => mg.id) || [],
    });
    setIsItemModalOpen(true);
  };

  const handleCloseItemModal = () => {
    cleanupPhotoUrls();
    setIsItemModalOpen(false);
    setCurrentEditItemId(null);
    setItemFormData({
      name: '',
      category: selectedCategory,
      description: '',
      price: '',
      prepTimeMinutes: null,
      status: 'available',
      menuItemPhotos: [],
      dietary: [],
      chefRecommended: false,
      modifierGroupIds: [],
    });
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
            preparationTime: itemFormData.prepTimeMinutes ?? undefined,
            chefRecommended: itemFormData.chefRecommended,
            tags: itemFormData.dietary.length > 0 ? itemFormData.dietary : undefined,
            modifierGroupIds: itemFormData.modifierGroupIds.length > 0 ? itemFormData.modifierGroupIds : undefined,
          }
        });

        if (itemFormData.menuItemPhotos.length > 0 && result?.id) {
          for (const photo of itemFormData.menuItemPhotos) {
            if (photo.file) {
              await uploadPhotoMutation.mutateAsync({
                itemId: result.id,
                data: { file: photo.file }
              });
            }
          }
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
            preparationTime: itemFormData.prepTimeMinutes ?? undefined,
            available: itemFormData.status === 'available',
            chefRecommended: itemFormData.chefRecommended,
            tags: itemFormData.dietary.length > 0 ? itemFormData.dietary : undefined,
            modifierGroupIds: itemFormData.modifierGroupIds.length > 0 ? itemFormData.modifierGroupIds : undefined,
          }
        });

        if (itemFormData.menuItemPhotos.length > 0) {
          for (const photo of itemFormData.menuItemPhotos) {
            if (photo.file) {
              await uploadPhotoMutation.mutateAsync({
                itemId: currentEditItemId,
                data: { file: photo.file }
              });
            }
          }
        }

        setToastMessage(`Món "${itemFormData.name}" đã được cập nhật`);
      }

      setShowSuccessToast(true);
      handleCloseItemModal();
    } catch (error) {
      console.error('Error in handleSaveItem:', error);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, item: { id: string; name: string }) => {
    e.stopPropagation();
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItemMutation.mutateAsync({ id: itemToDelete.id });
      setToastMessage(`Món "${itemToDelete.name}" đã được xóa`);
      setShowSuccessToast(true);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error in handleConfirmDelete:', error);
    }
  };

  // ============ IMAGE UPLOAD HELPERS ============
  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPhotos: PhotoItem[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);

      if (!validation.valid) {
        errors.push(validation.error || 'Unknown error');
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const isPrimary = itemFormData.menuItemPhotos.length === 0 && newPhotos.length === 0;

      newPhotos.push({
        id: `temp_${Date.now()}_${i}`,
        file,
        previewUrl,
        isPrimary,
      });
    }

    if (itemFormData.menuItemPhotos.length === 0 && newPhotos.length > 0) {
      newPhotos[0].isPrimary = true;
    }

    if (newPhotos.length > 0) {
      setItemFormData({
        ...itemFormData,
        menuItemPhotos: [...itemFormData.menuItemPhotos, ...newPhotos],
      });
    }

    if (errors.length > 0) {
      setToastMessage(errors.join('; '));
      setShowSuccessToast(true);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e.target.files);
    e.target.value = '';
  };

  const removePhoto = (photoId: string) => {
    const photo = itemFormData.menuItemPhotos.find(p => p.id === photoId);
    if (photo && photo.previewUrl) {
      URL.revokeObjectURL(photo.previewUrl);
    }

    const updatedPhotos = itemFormData.menuItemPhotos.filter(p => p.id !== photoId);

    if (photo?.isPrimary && updatedPhotos.length > 0) {
      updatedPhotos[0].isPrimary = true;
    }

    setItemFormData({
      ...itemFormData,
      menuItemPhotos: updatedPhotos,
    });
  };

  const setPhotoPrimary = (photoId: string) => {
    const updatedPhotos = itemFormData.menuItemPhotos.map(photo => ({
      ...photo,
      isPrimary: photo.id === photoId,
    }));
    setItemFormData({
      ...itemFormData,
      menuItemPhotos: updatedPhotos,
    });
  };

  const cleanupPhotoUrls = useCallback(() => {
    itemFormData.menuItemPhotos.forEach(photo => {
      if (photo.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl);
      }
    });
  }, [itemFormData.menuItemPhotos]);

  // ============ CONTEXT MENU POSITION + CLOSE LOGIC ============
  useLayoutEffect(() => {
    if (!contextMenu || !contextMenuRef.current) return;

    const menuEl = contextMenuRef.current;
    const rect = menuEl.getBoundingClientRect();
    const menuWidth = rect.width || 200;
    const menuHeight = rect.height || 100;
    const padding = 8;

    let left = contextMenu.x;
    let top = contextMenu.y;

    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - padding;
    }
    if (left < padding) {
      left = padding;
    }

    if (top + menuHeight > window.innerHeight) {
      top = window.innerHeight - menuHeight - padding;
    }
    if (top < padding) {
      top = padding;
    }

    setContextMenuPos({ left, top });
  }, [contextMenu]);

  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
        setContextMenuPos(null);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setContextMenuPos(null);
      }
    };

    const handleScroll = () => {
      setContextMenu(null);
      setContextMenuPos(null);
    };

    const handleResize = () => {
      setContextMenu(null);
      setContextMenuPos(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [contextMenu]);

  // ============ RETURN GROUPED OBJECT ============
  return {
    state: {
      selectedCategory,
      setSelectedCategory,
      selectedStatus,
      setSelectedStatus,
      sortOption,
      setSortOption,
      searchQuery,
      setSearchQuery,
      categorySortBy,
      setCategorySortBy,
      showActiveOnlyCategories,
      setShowActiveOnlyCategories,
      tempSelectedArchiveStatus,
      setTempSelectedArchiveStatus,
      isAddCategoryModalOpen,
      setIsAddCategoryModalOpen,
      editingCategoryId,
      setEditingCategoryId,
      isDeleteModalOpen,
      setIsDeleteModalOpen,
      itemToDelete,
      setItemToDelete,
      contextMenu,
      setContextMenu,
      contextMenuPos,
      setContextMenuPos,
      deleteConfirmDialog,
      setDeleteConfirmDialog,
      showSuccessToast,
      setShowSuccessToast,
      toastMessage,
      setToastMessage,
      isItemModalOpen,
      setIsItemModalOpen,
      itemModalMode,
      setItemModalMode,
      currentEditItemId,
      setCurrentEditItemId,
      itemFormData,
      setItemFormData,
    },

    data: {
      categories,
      menuItems,
      modifierGroups,
    },

    derived: {
      sortedCategories,
      visibleMenuItems,
      getCategoryItemCount,
      getCategoryActiveItemCount,
      getCategoryById,
    },

    handlers: {
      // Category handlers
      onCategorySubmit,
      handleOpenAddCategoryModal,
      handleCloseCategoryModal,
      handleEditCategory,
      handleToggleCategoryStatus,
      handleDeleteCategory,
      confirmDeleteCategory,
      // Item handlers
      handleOpenAddItemModal,
      handleOpenEditItemModal,
      handleCloseItemModal,
      handleSaveItem,
      handleDeleteClick,
      handleConfirmDelete,
      // Image handlers
      handleImageUpload,
      handleFileInputChange,
      removePhoto,
      setPhotoPrimary,
      cleanupPhotoUrls,
      // Form utilities
      toggleDietary: (tag: string) => {
        if (itemFormData.dietary.includes(tag)) {
          setItemFormData({
            ...itemFormData,
            dietary: itemFormData.dietary.filter((t) => t !== tag),
          });
        } else {
          setItemFormData({
            ...itemFormData,
            dietary: [...itemFormData.dietary, tag],
          });
        }
      },
    },

    refs: {
      contextMenuRef,
    },

    formMethods: {
      register,
      handleSubmit,
      errors,
      isSubmitting,
      isValid,
      reset,
      watch,
    },

    mutations: {
      createCategoryMutation,
      updateCategoryMutation,
      deleteCategoryMutation,
      createItemMutation,
      updateItemMutation,
      deleteItemMutation,
      uploadPhotoMutation,
    },
  };
}

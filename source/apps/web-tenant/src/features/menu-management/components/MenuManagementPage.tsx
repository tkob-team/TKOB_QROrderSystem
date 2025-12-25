'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Image from 'next/image';
import { Card, Badge, Toast } from '@/shared/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MenuTabs } from './MenuTabs';
import { useAppRouter } from '@/shared/hooks/useAppRouter';
import { ROUTES } from '@/lib/routes';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Search,
  Leaf,
  Flame,
  Milk,
  ChevronDown,
  Star,
  MoreVertical,
  Edit2,
  Eye
} from 'lucide-react';

// React Query
import { useQueryClient } from '@tanstack/react-query';

// Menu Hooks - use custom hooks instead of generated ones for mock data support
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

// API Hooks - Photos (still using generated for photos)
import {
  useMenuPhotoControllerUploadPhoto,
} from '@/services/generated/menu-photos/menu-photos';
import { CURRENCY_CONFIG } from '@/config/currency';

// Zod schema for category validation
const categorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must not exceed 50 characters'),
  description: z.string().optional().nullable().default(null),
  displayOrder: z.union([
    z.coerce.number().int('Display order must be a whole number').nonnegative('Display order must be 0 or higher'),
    z.literal('')
  ]).optional().nullable().transform((val) => val === '' ? null : val).default(null),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
}) as any;

// Constants for image validation
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Helper to convert relative image URLs to absolute
const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl; // Already absolute
  // Convert relative path to absolute URL pointing to API
  return `http://localhost:3000${imageUrl}`;
};

type PhotoItem = {
  id: string;
  file?: File;
  previewUrl: string;
  uploadedUrl?: string;
  isPrimary: boolean;
};

type CategoryFormData = {
  name: string;
  description?: string | null;
  displayOrder?: number | string | null;
  status: 'ACTIVE' | 'INACTIVE';
};

// Full featured Menu Management matching Admin-screens-v3 design
export function MenuManagementPage() {
  // React Router
  const { goTo } = useAppRouter();
  
  // React Query
  const queryClient = useQueryClient();

  // UI State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [sortOption, setSortOption] = useState('Sort by: Newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySortBy, setCategorySortBy] = useState<'displayOrder' | 'name' | 'createdAt'>('displayOrder');
  const [_selectedArchiveStatus, setSelectedArchiveStatus] = useState<'all' | 'archived'>('all');
  const [tempSelectedArchiveStatus, setTempSelectedArchiveStatus] = useState<'all' | 'archived'>('all');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ categoryId: string; anchor: 'cursor' | 'button'; x: number; y: number } | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ left: number; top: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ open: boolean; categoryId: string | null; activeItemCount: number }>({
    open: false,
    categoryId: null,
    activeItemCount: 0,
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');


  // React Hook Form for category
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

  // Fetch Categories from custom hook (supports mock data)
  const { data: categoriesResponse } = useMenuCategories();
  const categories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [];

  // Fetch Menu Items from custom hook (supports mock data)
  const { data: itemsResponse } = useMenuItems();
  const menuItems = Array.isArray(itemsResponse?.data) ? itemsResponse.data : [];

  // Fetch Modifier Groups from custom hook (supports mock data)
  const { data: modifierGroupsResponse } = useModifierGroups({ activeOnly: false });
  const modifierGroups = Array.isArray(modifierGroupsResponse?.data) ? modifierGroupsResponse.data : [];

  // Category Mutations
  const createCategoryMutation = useCreateMenuCategory();

  const updateCategoryMutation = useUpdateMenuCategory();

  const deleteCategoryMutation = useDeleteMenuCategory();

  // Menu Item Mutations
  const createItemMutation = useCreateMenuItem();

  const updateItemMutation = useUpdateMenuItem();

  const deleteItemMutation = useDeleteMenuItem();

  // Photo Upload Mutation
  const uploadPhotoMutation = useMenuPhotoControllerUploadPhoto();
  
  // Add/Edit Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<'add' | 'edit'>('add');
  const [currentEditItemId, setCurrentEditItemId] = useState<string | null>(null);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    category: selectedCategory,
    description: '',
    price: '',
    prepTimeMinutes: null as number | null,
    status: 'available' as 'available' | 'unavailable' | 'sold_out',
    menuItemPhotos: [] as PhotoItem[],
    dietary: [] as string[],
    chefRecommended: false,
    modifierGroupIds: [] as string[], // Add modifier groups selection
  });

  // Mock data đã được thay thế bằng API calls ở trên

  const getCategoryItemCount = (categoryId: string) => {
    return menuItems.filter(
      (item: any) => item.categoryId === categoryId
    ).length;
  };

  const getCategoryActiveItemCount = (categoryId: string) => {
    return menuItems.filter(
      (item: any) => item.categoryId === categoryId && item.status === 'available'
    ).length;
  };

  const getCategoryById = (categoryId: string) => {
    return categories?.find((cat: any) => cat.id === categoryId) || null;
  };

  // Sort categories based on selected sort option
  const sortedCategories = [...categories].sort((a: any, b: any) => {
    switch (categorySortBy) {
      case 'displayOrder': {
        // Ascending, nulls last; tie-breaker by name
        const aOrder = a.displayOrder ?? Infinity;
        const bOrder = b.displayOrder ?? Infinity;
        if (aOrder === bOrder) {
          return (a.name || '').localeCompare(b.name || '');
        }
        return (aOrder as number) - (bOrder as number);
      }
      case 'name':
        // A→Z
        return (a.name || '').localeCompare(b.name || '');
      case 'createdAt': {
        // Newest first
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
      // Map backend status to frontend
      if (selectedStatus === 'Available') return item.isAvailable && item.status !== 'SOLD_OUT';
      if (selectedStatus === 'Unavailable') return !item.isAvailable;
      if (selectedStatus === 'Sold Out') return item.status === 'SOLD_OUT';
      return true;
    })
    .sort((a: any, b: any) => {
      if (sortOption === 'Sort by: Popularity') {
        return (b.popularity || 0) - (a.popularity || 0); // Higher popularity first
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
      // Default: Newest (by createdAt)
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  // Handle category form submission (both create and update)
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
        // Update mode
        await updateCategoryMutation.mutateAsync({
          id: editingCategoryId,
          ...payload
        });
        setToastMessage(`Category "${data.name}" updated successfully`);
      } else {
        // Create mode
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

  // Category action handlers
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
      
      // Clear selection if deleted category is selected
      if (selectedCategory === categoryId) {
        setSelectedCategory('all');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };
  const handleOpenAddItemModal = () => {
    setItemModalMode('add');
    // Use first available category from API, not hardcoded 'starters'
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
      dietary: item.tags || [], // Map tags from API to dietary
      chefRecommended: item.chefRecommended || false, // Load chef recommendation
      modifierGroupIds: item.modifierGroupIds || item.modifierGroups?.map((mg: any) => mg.id) || [], // Load existing modifiers
    });
    setIsItemModalOpen(true);
  };

  const _handleOpenNewItemModal = () => {
    setItemModalMode('add');
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
      modifierGroupIds: [], // Add modifierGroupIds
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
      modifierGroupIds: [], // Reset modifiers
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
            chefRecommended: itemFormData.chefRecommended, // Include chef recommendation
            tags: itemFormData.dietary.length > 0 ? itemFormData.dietary : undefined, // Map dietary to tags
            modifierGroupIds: itemFormData.modifierGroupIds.length > 0 ? itemFormData.modifierGroupIds : undefined, // Include modifier groups
            // Note: CreateMenuItemDto không có available field
            // Backend sẽ tự set available = true và status = DRAFT by default
          }
        });

        // Upload photos nếu có
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
            available: itemFormData.status === 'available',  // 'available' not 'isAvailable'
            chefRecommended: itemFormData.chefRecommended, // Include chef recommendation
            tags: itemFormData.dietary.length > 0 ? itemFormData.dietary : undefined, // Map dietary to tags
            modifierGroupIds: itemFormData.modifierGroupIds.length > 0 ? itemFormData.modifierGroupIds : undefined, // Include modifier groups
          }
        });

        // Upload photos nếu có
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
      // Error đã được xử lý trong mutation
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
      // Error đã được xử lý trong mutation
      console.error('Error in handleConfirmDelete:', error);
    }
  };

  const toggleDietary = (tag: string) => {
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
  };

  const getDietaryIcon = (tag: string) => {
    switch (tag) {
      case 'vegan':
        return <Leaf className="w-3 h-3" />;
      case 'spicy':
        return <Flame className="w-3 h-3" />;
      case 'vegetarian':
        return <Milk className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Validate image file
  const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    // Check MIME type
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return { valid: false, error: `Invalid file type: ${file.name}. Only JPG, PNG, and WebP are allowed.` };
    }

    // Check extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return { valid: false, error: `Invalid extension: ${file.name}. Only .jpg, .jpeg, .png, and .webp are allowed.` };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: `File too large: ${file.name}. Maximum size is ${MAX_FILE_SIZE_MB}MB.` };
    }

    return { valid: true };
  };

  // Handle multiple image uploads
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

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      const isPrimary = itemFormData.menuItemPhotos.length === 0 && newPhotos.length === 0;

      newPhotos.push({
        id: `temp_${Date.now()}_${i}`,
        file,
        previewUrl,
        isPrimary,
      });
    }

    // Update primary status if we're adding photos to empty array
    if (itemFormData.menuItemPhotos.length === 0 && newPhotos.length > 0) {
      newPhotos[0].isPrimary = true;
    }

    // Add valid photos to state
    if (newPhotos.length > 0) {
      setItemFormData({
        ...itemFormData,
        menuItemPhotos: [...itemFormData.menuItemPhotos, ...newPhotos],
      });
    }

    // Show errors if any
    if (errors.length > 0) {
      setToastMessage(errors.join('; '));
      setShowSuccessToast(true);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e.target.files);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Remove photo and revoke URL
  const removePhoto = (photoId: string) => {
    const photo = itemFormData.menuItemPhotos.find(p => p.id === photoId);
    if (photo && photo.previewUrl) {
      URL.revokeObjectURL(photo.previewUrl);
    }

    const updatedPhotos = itemFormData.menuItemPhotos.filter(p => p.id !== photoId);

    // If removed photo was primary, make first remaining photo primary
    if (photo?.isPrimary && updatedPhotos.length > 0) {
      updatedPhotos[0].isPrimary = true;
    }

    setItemFormData({
      ...itemFormData,
      menuItemPhotos: updatedPhotos,
    });
  };

  // Set photo as primary
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

  // Clean up object URLs on modal close
  const cleanupPhotoUrls = () => {
    itemFormData.menuItemPhotos.forEach(photo => {
      if (photo.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl);
      }
    });
  };

  // Compute viewport-clamped menu position
  useLayoutEffect(() => {
    if (!contextMenu || !contextMenuRef.current) return;

    const menuEl = contextMenuRef.current;
    const rect = menuEl.getBoundingClientRect();
    const menuWidth = rect.width || 200;
    const menuHeight = rect.height || 100;
    const padding = 8;

    let left = contextMenu.x;
    let top = contextMenu.y;

    // Clamp to viewport
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

  // Close context menu on click outside, Escape, scroll, or resize
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
    window.addEventListener('scroll', handleScroll, true); // capture phase for all scrolls
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [contextMenu]);

  return (
    <>
      {/* Modals */}
      {isAddCategoryModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div 
              className="bg-white w-full max-w-md mx-4 rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingCategoryId ? 'Edit Category' : 'Add Category'}
                </h3>
                <button
                  onClick={handleCloseCategoryModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onCategorySubmit)} className="p-6 flex flex-col gap-5">
                {/* Category name field */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Category name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Specials"
                    {...register('name')}
                    className={`px-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
                      errors.name
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20'
                        : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Description field */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Description (optional)</label>
                  <textarea
                    placeholder="Add a brief description..."
                    rows={3}
                    {...register('description')}
                    className={`px-4 py-3 border rounded-xl text-sm resize-none focus:outline-none transition-colors ${
                      errors.description
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20'
                        : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Display Order field */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Display Order (optional)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="e.g., 1"
                    {...register('displayOrder')}
                    className={`px-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
                      errors.displayOrder
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20'
                        : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20'
                    }`}
                  />
                  {errors.displayOrder && (
                    <p className="text-xs text-red-600">{errors.displayOrder.message}</p>
                  )}
                </div>

                {/* Status field */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-gray-900">Status</label>
                  <div className="space-y-2">
                    {['ACTIVE', 'INACTIVE'].map((value) => {
                      const isSelected = watch('status') === value;
                      return (
                        <label
                          key={value}
                          className={`flex items-center gap-3 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-white shadow-sm'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            value={value}
                            {...register('status')}
                            className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span
                            className={`text-sm font-medium transition-colors ${
                              isSelected ? 'text-emerald-700' : 'text-gray-600'
                            }`}
                          >
                            {value === 'ACTIVE' ? 'Active' : 'Inactive'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.status && (
                    <p className="text-xs text-red-600">{errors.status.message}</p>
                  )}
                </div>

                {/* Form buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 mt-4">
                  <button
                    type="button"
                    onClick={handleCloseCategoryModal}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : editingCategoryId ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Item Modal */}
        {isItemModalOpen && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div 
              className="bg-white w-full mx-4 rounded-xl overflow-hidden flex flex-col"
              style={{ maxWidth: '560px', maxHeight: 'calc(100vh - 80px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {itemModalMode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}
                </h3>
                <button onClick={handleCloseItemModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5 overflow-y-auto">
                {/* Image Upload - Multiple Files */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Item Photos</label>
                  
                  {itemFormData.menuItemPhotos.length > 0 ? (
                    <div className="space-y-3">
                      {itemFormData.menuItemPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="border-2 border-emerald-500 rounded-xl p-4 flex items-center gap-4 bg-emerald-50"
                        >
                          <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={photo.previewUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-emerald-700 truncate">
                              {photo.file?.name || 'Uploaded'}
                            </p>
                            <p className="text-xs text-emerald-600">
                              {photo.file ? `${(photo.file.size / 1024).toFixed(1)} KB` : 'Server image'}
                            </p>
                            {photo.isPrimary && (
                              <span className="inline-block mt-1 px-2 py-1 bg-emerald-600 text-white text-xs font-semibold rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {!photo.isPrimary && (
                              <button
                                type="button"
                                onClick={() => setPhotoPrimary(photo.id)}
                                className="px-3 py-1 text-xs font-medium text-emerald-700 bg-white border border-emerald-500 rounded hover:bg-emerald-50"
                              >
                                Set Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removePhoto(photo.id)}
                              className="text-sm font-semibold text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      {/* Add more photos button */}
                      <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-emerald-500 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <p className="text-xs font-semibold text-gray-600">Add more photos</p>
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.webp"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-emerald-500 transition-colors">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">Drop photos or click to upload</p>
                      <p className="text-xs text-gray-500">PNG, JPG or WEBP (max. 5MB per image)</p>
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Item Name *</label>
                  <input
                    type="text"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    placeholder="e.g., Caesar Salad"
                    className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Category *</label>
                  <select
                    value={itemFormData.category}
                    onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Description</label>
                  <textarea
                    value={itemFormData.description}
                    onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                    placeholder="Describe your dish..."
                    className="px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-emerald-500"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">$</span>
                    <input
                      type="number"
                      value={itemFormData.price}
                      onChange={(e) => setItemFormData({ ...itemFormData, price: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Preparation time (minutes) <span className="text-gray-500 font-normal">(optional)</span></label>
                  <input
                    type="number"
                    value={itemFormData.prepTimeMinutes ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setItemFormData({ ...itemFormData, prepTimeMinutes: null });
                      } else {
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue) && numValue >= 0 && numValue <= 240) {
                          setItemFormData({ ...itemFormData, prepTimeMinutes: numValue });
                        }
                      }
                    }}
                    placeholder="e.g., 15"
                    min="0"
                    max="240"
                    step="1"
                    className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                  {itemFormData.prepTimeMinutes !== null && itemFormData.prepTimeMinutes > 240 && (
                    <p className="text-xs text-red-600">Preparation time must not exceed 240 minutes</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Status *</label>
                  <select
                    value={itemFormData.status}
                    onChange={(e) => setItemFormData({ ...itemFormData, status: e.target.value as 'available' | 'unavailable' | 'sold_out' })}
                    className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="sold_out">Sold Out</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Dietary Tags</label>
                  <div className="flex gap-2">
                    {['vegan', 'vegetarian', 'spicy'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleDietary(tag)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium capitalize ${
                          itemFormData.dietary.includes(tag)
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-white border-gray-300 text-gray-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">Mark as Chef&apos;s recommendation</span>
                    <span className="text-xs text-gray-500">Highlight this item to customers</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemFormData.chefRecommended}
                      onChange={(e) => setItemFormData({ ...itemFormData, chefRecommended: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full relative transition-colors ${
                      itemFormData.chefRecommended ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}>
                      <div className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                        itemFormData.chefRecommended ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </label>
                </div>

                {/* Modifier Groups Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Modifier Groups (Optional)
                  </label>
                  <div className="border border-gray-300 rounded-xl p-3 max-h-48 overflow-y-auto bg-gray-50">
                    {modifierGroups.filter((g: any) => g.active).length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No active modifier groups</p>
                    ) : (
                      <div className="space-y-2">
                        {modifierGroups.filter((g: any) => g.active).map((group: any) => (
                          <label
                            key={group.id}
                            className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={(itemFormData.modifierGroupIds || []).includes(group.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setItemFormData({
                                    ...itemFormData,
                                    modifierGroupIds: [...(itemFormData.modifierGroupIds || []), group.id]
                                  });
                                } else {
                                  setItemFormData({
                                    ...itemFormData,
                                    modifierGroupIds: (itemFormData.modifierGroupIds || []).filter(id => id !== group.id)
                                  });
                                }
                              }}
                              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">{group.name}</span>
                              <span className="ml-2 text-xs text-gray-500">
                                ({group.type === 'SINGLE_CHOICE' ? 'Single Choice' : 'Multiple'})
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Select modifier groups for this item (e.g., Size, Toppings, Extras)
                  </p>
                </div>

              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCloseItemModal}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveItem}
                  disabled={!itemFormData.name.trim() || !itemFormData.price.trim()}
                  className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:bg-gray-300"
                >
                  {itemModalMode === 'add' ? 'Add Item' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && itemToDelete && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(16px)',
            }}
            onClick={() => {
              setIsDeleteModalOpen(false);
              setItemToDelete(null);
            }}
          >
            <div 
              className="bg-white w-full max-w-md mx-4 rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Delete Menu Item?</h3>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{itemToDelete.name}</span> will be removed from your menu.
                </p>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Archive Confirmation Dialog */}
        {deleteConfirmDialog.open && deleteConfirmDialog.categoryId && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(16px)',
            }}
            onClick={() => setDeleteConfirmDialog({ open: false, categoryId: null, activeItemCount: 0 })}
          >
            <div 
              className="bg-white w-full max-w-md mx-4 rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Archive category?</h3>
                <button
                  onClick={() => setDeleteConfirmDialog({ open: false, categoryId: null, activeItemCount: 0 })}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600">
                  This category will be archived and hidden from the menu.
                </p>
                <p className="text-sm text-gray-500">
                  Items under this category will remain in the database.
                </p>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setDeleteConfirmDialog({ open: false, categoryId: null, activeItemCount: 0 })}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  disabled={deleteCategoryMutation.isPending}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteCategoryMutation.isPending ? 'Archiving...' : 'Archive category'}
                </button>
              </div>
            </div>
          </div>
        )}


      {/* Main Layout */}
      <div 
        className="flex flex-col bg-gray-50 h-full overflow-hidden"
      >
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
          {/* LEFT PANEL - Categories - Full Height */}
          <div className="w-52 bg-white border-r border-gray-200 flex flex-col overflow-y-auto relative">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-gray-900 mb-3" style={{ fontSize: '16px', fontWeight: 700 }}>Categories</h3>
              <button
                onClick={handleOpenAddCategoryModal}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                style={{ fontSize: '14px', fontWeight: 600, borderRadius: '12px' }}
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            {/* Sort Control */}
            <div className="p-3 border-b border-gray-200">
              <label className="text-xs font-semibold text-gray-600 block mb-2">Sort by:</label>
              <select
                value={categorySortBy}
                onChange={(e) => setCategorySortBy(e.target.value as 'displayOrder' | 'name' | 'createdAt')}
                className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="displayOrder">Display Order</option>
                <option value="name">Name</option>
                <option value="createdAt">Creation Date</option>
              </select>
            </div>

            <div className="flex-1 p-1" onClick={() => { setContextMenu(null); setContextMenuPos(null); }}>
              <div className="flex flex-col gap-1">
                {/* All Items */}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center justify-between pl-3 pr-8 py-2.5 transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: selectedCategory === 'all' ? 700 : 500,
                    borderRadius: '12px',
                    borderLeft: selectedCategory === 'all' ? '3px solid #10B981' : '3px solid transparent'
                  }}
                >
                  <span className="truncate">All Items</span>
                  <span 
                    className={`px-1.5 py-0.5 rounded-full shrink-0 ${
                      selectedCategory === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                    style={{ fontSize: '11px', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}
                  >
                    {menuItems.length}
                  </span>
                </button>

                {/* Category List */}
                {sortedCategories.map((category: any) => {
                  const count = getCategoryItemCount(category.id);
                  const _activeCount = getCategoryActiveItemCount(category.id);
                  const displayOrder = category.displayOrder ?? null;
                  const isActive = category.active !== false;
                  const isContextMenuOpen = contextMenu?.categoryId === category.id;

                  return (
                    <div
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedCategory(category.id);
                        }
                      }}
                      className={`relative flex flex-col gap-1 px-1 py-2 transition-all group cursor-pointer ${
                        selectedCategory === category.id
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${!isActive ? 'opacity-60' : ''}`}
                      style={{ 
                        fontSize: '13px',
                        borderRadius: '12px',
                        borderLeft: selectedCategory === category.id ? '3px solid #10B981' : '3px solid transparent'
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        const newMenu = { categoryId: category.id, anchor: 'cursor' as const, x: e.clientX, y: e.clientY };
                        setContextMenu(newMenu);
                        setContextMenuPos({ left: e.clientX, top: e.clientY });
                      }}
                      title={category.name}
                    >
                      {/* Row 1: Category name and count + More button (no nesting) */}
                      <div className="flex items-center justify-between min-w-0">
                        {/* Category info - non-interactive, inherits text color from parent */}
                        <div className="flex items-center w-full min-w-0 gap-2 text-left pl-2 pr-0.5 py-1.5 rounded-lg">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-gray-400 shrink-0" style={{ fontSize: '11px', fontWeight: 500 }}>
                              {displayOrder !== null ? `#${displayOrder}` : '—'}
                            </span>
                            <span className="min-w-0 flex-1 truncate font-medium">{category.name}</span>
                          </div>
                          <span 
                            className={`px-1.5 py-0.5 rounded-full shrink-0 ml-auto ${
                              selectedCategory === category.id
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                            style={{ fontSize: '11px', fontWeight: 700, minWidth: '22px', textAlign: 'center' }}
                          >
                            {count}
                          </span>
                        </div>

                        {/* More actions button - separate sibling, prevents selection on click */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const button = e.currentTarget;
                            const rect = button.getBoundingClientRect();
                            if (isContextMenuOpen) {
                              setContextMenu(null);
                              setContextMenuPos(null);
                            } else {
                              const newMenu = {
                                categoryId: category.id,
                                anchor: 'button' as const,
                                x: rect.left,
                                y: rect.bottom + 8
                              };
                              setContextMenu(newMenu);
                              setContextMenuPos({ left: rect.left, top: rect.bottom + 8 });
                            }
                          }}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-200 rounded shrink-0 ${
                            selectedCategory === category.id ? 'opacity-100 bg-emerald-100 hover:bg-emerald-200' : ''
                          }`}
                          title="More actions"
                        >
                          <MoreVertical size={16} className="text-gray-600" />
                        </button>
                      </div>

                      {/* Row 2: Status Badge - now inside clickable container */}
                      <div className="flex items-center gap-1 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                        {!isActive && (
                          <span className="text-xs text-gray-500 ml-1">May be hidden</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Items Grid */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="px-5 py-2 bg-white border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                {/* Search */}
                <div className="relative w-full max-w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search menu items..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 rounded-xl text-sm h-10"
                      />
                    </div>

                {/* Status + Sort + Add Item */}
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white text-gray-700 cursor-pointer rounded-xl text-sm font-medium min-w-32 h-10"
                    >
                      <option>All Status</option>
                      <option>Available</option>
                      <option>Unavailable</option>
                      <option>Sold Out</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Archive Status */}
                  <div className="relative">
                    <select
                      value={tempSelectedArchiveStatus}
                      onChange={(e) => setTempSelectedArchiveStatus(e.target.value as 'all' | 'archived')}
                      className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white text-gray-700 cursor-pointer rounded-xl text-sm font-medium min-w-32 h-10"
                    >
                      <option value="all">Active Items</option>
                      <option value="archived">Archived Items</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Apply Filter Button */}
                  <button
                    onClick={() => setSelectedArchiveStatus(tempSelectedArchiveStatus)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors h-10"
                  >
                    Apply
                  </button>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white text-gray-700 cursor-pointer rounded-xl text-sm font-medium min-w-40 h-10"
                    >
                      <option>Sort by: Newest</option>
                      <option>Sort by: Popularity</option>
                      <option>Sort by: Price (Low)</option>
                      <option>Sort by: Price (High)</option>
                      <option>Sort by: Name (A-Z)</option>
                      <option>Sort by: Name (Z-A)</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Add Item Button */}
                  <button
                    onClick={handleOpenAddItemModal}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white transition-all rounded-xl text-sm font-semibold h-10"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
              </div>
            </div>

            {/* Items Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-5">
              {visibleMenuItems.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No items found' : 'No items yet'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    {searchQuery ? 'Try adjusting your search or filters' : 'Add your first menu item'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={handleOpenAddItemModal}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold"
                    >
                      <Plus className="w-5 h-5 inline-block mr-2" />
                      Add Item
                    </button>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {visibleMenuItems.map((item: any) => (
                        <Card key={item.id} className="p-0 overflow-hidden hover:shadow-lg transition-all">
                          {/* Image */}
                          <div className="w-full aspect-video bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
                            {item.imageUrl ? (
                              <Image 
                                src={getImageUrl(item.imageUrl) || ''}
                                alt={item.name}
                                fill
                                unoptimized
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <ImageIcon className="w-12 h-12 text-gray-400" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            <div className="mb-3">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h4>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant={
                                  item.available ? 'success' : 'neutral'
                                }>
                                  {item.available ? 'Available' : 'Unavailable'}
                                </Badge>
                                {item.chefRecommended && (
                                  <div className="flex items-center gap-1 px-2 py-1 border border-emerald-500 text-emerald-700 rounded-full text-xs font-medium">
                                    <Star className="w-3 h-3 fill-emerald-500" />
                                    <span>Chef&apos;s recommendation</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{item.description}</p>

                            {item.dietary && item.dietary.length > 0 && (
                              <div className="flex gap-2 mb-4">
                                {item.dietary.map((tag: string) => (
                                  <div
                                    key={tag}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                      tag === 'spicy' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}
                                  >
                                    {getDietaryIcon(tag)}
                                    <span className="capitalize">{tag}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <span className="text-xl font-bold text-emerald-600">{CURRENCY_CONFIG.format(item.price)}</span>
                              <div className="flex gap-2">
                                <button 
                                  className="w-9 h-9 bg-gray-100 hover:bg-emerald-50 rounded-lg flex items-center justify-center"
                                  onClick={(e) => handleOpenEditItemModal(e, item)}
                                >
                                  <Edit className="w-4 h-4 text-gray-600" />
                                </button>
                                <button 
                                  className="w-9 h-9 bg-gray-100 hover:bg-red-50 rounded-lg flex items-center justify-center"
                                  onClick={(e) => handleDeleteClick(e, item)}
                                >
                                  <Trash2 className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                    </Card>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccessToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowSuccessToast(false)}
        />
      )}

      {/* Floating Context Menu with viewport-clamped positioning */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl"
          style={{
            left: `${contextMenuPos?.left ?? contextMenu.x}px`,
            top: `${contextMenuPos?.top ?? contextMenu.y}px`,
            minWidth: '200px',
            maxWidth: '240px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {sortedCategories
            .filter((cat: any) => cat.id === contextMenu.categoryId)
            .map((category: any) => {
              const isActive = category.active !== false;

              return (
                <div key={category.id}>
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm font-medium flex items-center gap-2.5 border-b border-gray-100 transition-colors"
                  >
                    <Edit2 size={15} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleCategoryStatus(category.id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-sm font-medium flex items-center gap-2.5 border-b border-gray-100 transition-colors"
                  >
                    <Eye size={15} />
                    {isActive ? 'Set Inactive' : 'Set Active'}
                  </button>
                  {isActive && (
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2.5 transition-colors"
                      title="Archive this category"
                    >
                      <Trash2 size={15} />
                      Archive
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      )}

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

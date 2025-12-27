'use client';

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

// Services
import { menuService } from '@/services/menu';

// Menu Hooks
import {
  useMenuCategories,
  useMenuItems,
  useModifierGroups,
  useMenuItemById,
  useCreateMenuCategory,
  useUpdateMenuCategory,
  useDeleteMenuCategory,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  usePublishMenuItem,
} from '@/features/menu-management/hooks/useMenu';

// API Hooks
import {
  useMenuPhotoControllerUploadPhoto,
  useMenuPhotoControllerUploadPhotos,
  useMenuPhotoControllerGetPhotos,
  useMenuPhotoControllerDeletePhoto,
  useMenuPhotoControllerSetPrimary,
  useMenuPhotoControllerUpdateOrder,
  menuPhotoControllerGetPhotos,
  getMenuPhotoControllerGetPhotosQueryKey,
} from '@/services/generated/menu-photos/menu-photos';
import type { MenuItemPhotoResponseDto } from '@/services/generated/models';

// Photo Manager
import { useMenuItemPhotoManager } from './useMenuItemPhotoManager';

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
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  available: boolean;
  displayOrder: number;
  menuItemPhotos: PhotoItem[];
  dietary: string[];
  allergens: string[];
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
  const [showFilter, setShowFilter] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'available' | 'unavailable'>('all');
  const [tempSelectedStatus, setTempSelectedStatus] = useState('All Status');
  const [tempSelectedAvailability, setTempSelectedAvailability] = useState<'all' | 'available' | 'unavailable'>('all');
  const [selectedChefRecommended, setSelectedChefRecommended] = useState(false);
  const [tempSelectedChefRecommended, setTempSelectedChefRecommended] = useState(false);
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
    status: 'DRAFT',
    available: true,
    displayOrder: 0,
    menuItemPhotos: [],
    dietary: [],
    allergens: [],
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
    setError,
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

  // Build query parameters for menu items based on filters
  const itemsQueryParams = {
    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
    status: selectedStatus === 'All Status' 
      ? undefined 
      : selectedStatus === 'Draft' 
      ? 'DRAFT'
      : selectedStatus === 'Published'
      ? 'PUBLISHED'
      : selectedStatus === 'Archived'
      ? 'ARCHIVED'
      : undefined,
    available: selectedAvailability === 'all' 
      ? undefined 
      : selectedAvailability === 'available' 
      ? true 
      : false,
    search: searchQuery || undefined,
    chefRecommended: selectedChefRecommended ? true : undefined,
    sortBy: sortOption === 'Sort by: Popularity'
      ? 'popularity'
      : sortOption === 'Sort by: Price (Low)' || sortOption === 'Sort by: Price (High)'
      ? 'price'
      : sortOption?.includes('Name')
      ? 'name'
      : 'createdAt',
    sortOrder: sortOption === 'Sort by: Price (High)' || sortOption === 'Sort by: Name (Z-A)'
      ? 'desc'
      : 'asc',
  };

  const { data: itemsResponse } = useMenuItems(itemsQueryParams);
  const menuItems = Array.isArray(itemsResponse?.data) ? itemsResponse.data : [];

  const { data: modifierGroupsResponse } = useModifierGroups({ activeOnly: false });
  const modifierGroups = Array.isArray(modifierGroupsResponse) ? modifierGroupsResponse : [];

  // ============ MUTATIONS ============
  const createCategoryMutation = useCreateMenuCategory();
  const updateCategoryMutation = useUpdateMenuCategory();
  const deleteCategoryMutation = useDeleteMenuCategory();
  const createItemMutation = useCreateMenuItem();
  const updateItemMutation = useUpdateMenuItem();
  const deleteItemMutation = useDeleteMenuItem();
  const publishItemMutation = usePublishMenuItem();
  const uploadPhotoMutation = useMenuPhotoControllerUploadPhoto();
  const uploadPhotosBulkMutation = useMenuPhotoControllerUploadPhotos();
  const deletePhotoMutation = useMenuPhotoControllerDeletePhoto();
  const setPrimaryPhotoMutation = useMenuPhotoControllerSetPrimary();
  const updatePhotoOrderMutation = useMenuPhotoControllerUpdateOrder();

  // Photo Manager
  const photoManager = useMenuItemPhotoManager();

  // Submission state
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState<string>('');

  // ============ DERIVED COMPUTATIONS ============
  const getCategoryItemCount = (categoryId: string): number => {
    // Server now provides itemCount directly
    const category = categories?.find((cat: any) => cat.id === categoryId);
    return category?.itemCount ?? 0;
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

  // Derived: Filter logic moved to server - just map categories
  const visibleMenuItems = menuItems
    .map((item: any) => {
      const category = categories?.find((cat: any) => cat.id === item.categoryId);
      return {
        ...item,
        categoryName: category?.name || 'Uncategorized',
      };
    });
  const onCategorySubmit = async (data: CategoryFormData) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        displayOrder: data.displayOrder !== null && data.displayOrder !== '' ? Number(data.displayOrder) : undefined,
        active: data.status === 'ACTIVE',
      };

      let result;
      if (editingCategoryId) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategoryId,
          data: payload
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
    } catch (error: any) {
      console.error('Error in category submit:', error);
      
      // Handle 409 Conflict (duplicate category name)
      if (error?.status === 409 || error?.response?.status === 409) {
        setError('name', {
          type: 'manual',
          message: 'A category with this name already exists'
        });
      } else if (error?.response?.data?.message) {
        // Handle other server validation errors
        setToastMessage(`Error: ${error.response.data.message}`);
      } else {
        setToastMessage('An error occurred while saving the category');
      }
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
      await deleteCategoryMutation.mutateAsync(categoryId);

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
      status: 'DRAFT',
      available: true,
      displayOrder: 0,
      menuItemPhotos: [],
      dietary: [],
      allergens: [],
      chefRecommended: false,
      modifierGroupIds: [],
    });
    photoManager.reset(); // Initialize photo manager for add mode
    setIsItemModalOpen(true);
  };

  const handleOpenEditItemModal = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setItemModalMode('edit');
    setCurrentEditItemId(item.id);
    
    // Fetch full item details including all photos (Get All only returns primary photo)
    try {
      const fullItemData = await queryClient.fetchQuery({
        queryKey: ['menu', 'item', item.id],
        queryFn: () => menuService.getMenuItemById(item.id),
      });
      
      setItemFormData({
        name: fullItemData.name,
        category: fullItemData.categoryId || selectedCategory,
        description: fullItemData.description || '',
        price: String(fullItemData.price || ''),
        prepTimeMinutes: fullItemData.preparationTime || null,
        status: fullItemData.status || 'DRAFT',
        available: fullItemData.available ?? true,
        displayOrder: fullItemData.displayOrder ?? 0,
        menuItemPhotos: [],
        dietary: fullItemData.tags || [],
        allergens: fullItemData.allergens || [],
        chefRecommended: fullItemData.chefRecommended || false,
        modifierGroupIds: fullItemData.modifierGroupIds || fullItemData.modifierGroups?.map((mg: any) => mg.id) || [],
      });
      
      // Initialize photo manager with existing photos from full data
      const existingPhotos = fullItemData.photos || fullItemData.menuItemPhotos || [];
      photoManager.initializeFromExistingPhotos(existingPhotos);
      
    } catch (error) {
      console.error('Failed to fetch item details:', error);
      // Fallback to list data if fetch fails
      setItemFormData({
        name: item.name,
        category: item.categoryId || selectedCategory,
        description: item.description || '',
        price: String(item.price || ''),
        prepTimeMinutes: item.preparationTime || null,
        status: item.status || 'DRAFT',
        available: item.available ?? true,
        displayOrder: item.displayOrder ?? 0,
        menuItemPhotos: [],
        dietary: item.tags || [],
        allergens: item.allergens || [],
        chefRecommended: item.chefRecommended || false,
        modifierGroupIds: item.modifierGroupIds || item.modifierGroups?.map((mg: any) => mg.id) || [],
      });
      
      const existingPhotos = item.photos || item.menuItemPhotos || [];
      photoManager.initializeFromExistingPhotos(existingPhotos);
    }
    
    setIsItemModalOpen(true);
  };

  const handleCloseItemModal = () => {
    cleanupPhotoUrls();
    photoManager.reset(); // Cleanup photo manager state and object URLs
    setIsItemModalOpen(false);
    setCurrentEditItemId(null);
    setIsSaving(false);
    setSaveProgress('');
    setItemFormData({
      name: '',
      category: selectedCategory,
      description: '',
      price: '',
      prepTimeMinutes: null,
      status: 'DRAFT',
      available: true,
      displayOrder: 0,
      menuItemPhotos: [],
      dietary: [],
      allergens: [],
      chefRecommended: false,
      modifierGroupIds: [],
    });
  };

  /**
   * TWO-ROUNDTRIP FLOW for Menu Item + Photos
   * 
   * Why: Photos API requires itemId, but we don't have itemId until item is created.
   * 
   * Roundtrip 1: Create/Update menu item (get itemId)
   * Roundtrip 2: Handle photos:
   *   - Upload new files (bulk)
   *   - Delete removed photos
   *   - Set primary photo
   *   - Update photo order
   * 
   * All photo operations happen AFTER item is saved, using the returned itemId.
   */
  const handleSaveItem = async () => {
    if (!itemFormData.name.trim() || !itemFormData.price.trim()) return;

    setIsSaving(true);
    let itemId: string | null = null;
    let photoUploadFailed = false;

    try {
      // ============ ROUNDTRIP 1: Save Menu Item ============
      setSaveProgress('Saving item...');

      if (itemModalMode === 'add') {
        // CREATE mode
        const result = await createItemMutation.mutateAsync({
          name: itemFormData.name,
          categoryId: itemFormData.category,
          description: itemFormData.description || undefined,
          price: parseFloat(itemFormData.price),
          preparationTime: itemFormData.prepTimeMinutes ?? undefined,
          chefRecommended: itemFormData.chefRecommended,
          tags: itemFormData.dietary.length > 0 ? itemFormData.dietary : undefined,
          allergens: itemFormData.allergens.length > 0 ? itemFormData.allergens : undefined,
          modifierGroupIds: itemFormData.modifierGroupIds.length > 0 ? itemFormData.modifierGroupIds : undefined,
        });

        itemId = result?.id || null;
        
        if (!itemId) {
          throw new Error('Failed to create item: no ID returned');
        }

      } else if (currentEditItemId) {
        // EDIT mode
        itemId = currentEditItemId;

        await updateItemMutation.mutateAsync({
          id: currentEditItemId,
          data: {
            name: itemFormData.name,
            categoryId: itemFormData.category,
            description: itemFormData.description || undefined,
            price: parseFloat(itemFormData.price),
            preparationTime: itemFormData.prepTimeMinutes ?? undefined,
            available: itemFormData.available,
            displayOrder: itemFormData.displayOrder,
            chefRecommended: itemFormData.chefRecommended,
            tags: itemFormData.dietary.length > 0 ? itemFormData.dietary : undefined,
            allergens: itemFormData.allergens.length > 0 ? itemFormData.allergens : undefined,
            modifierGroupIds: itemFormData.modifierGroupIds.length > 0 ? itemFormData.modifierGroupIds : undefined,
          }
        });

        // Handle status changes separately
        if (itemFormData.status === 'DRAFT' || itemFormData.status === 'PUBLISHED') {
          await publishItemMutation.mutateAsync({
            id: currentEditItemId,
            status: itemFormData.status,
          });
        } else if (itemFormData.status === 'ARCHIVED') {
          await deleteItemMutation.mutateAsync(currentEditItemId);
        }
      }

      // ============ ROUNDTRIP 2: Handle Photos ============
      if (itemId && photoManager.hasChanges) {
        try {
          setSaveProgress('Uploading photos...');

          // Step 2a: Delete removed photos (Edit mode only)
          if (photoManager.removedPhotoIds.length > 0) {
            const deleteResults = await Promise.allSettled(
              photoManager.removedPhotoIds.map(photoId =>
                deletePhotoMutation.mutateAsync({ itemId, photoId })
              )
            );

            const failedDeletes = deleteResults.filter(r => r.status === 'rejected');
            if (failedDeletes.length > 0) {
              console.error('Some photo deletions failed:', failedDeletes);
            }
          }

          // Step 2b: Upload new files (bulk)
          let uploadedPhotos: MenuItemPhotoResponseDto[] = [];
          const newFiles = photoManager.getNewFiles();
          
          if (newFiles.length > 0) {
            try {
              uploadedPhotos = await uploadPhotosBulkMutation.mutateAsync({
                itemId,
                data: { files: newFiles }
              });
            } catch (uploadError) {
              console.error('Photo upload failed:', uploadError);
              photoUploadFailed = true;
              // Continue to show item saved but photos failed
            }
          }

          // Step 2c: Re-fetch photos to get complete list with IDs
          // Use Orval-generated function with customInstance (applies baseURL)
          let allPhotos: MenuItemPhotoResponseDto[] = [];
          try {
            if (process.env.NODE_ENV === 'development') {
              console.debug('[photos] Refetching via Orval/axios for itemId:', itemId);
            }
            allPhotos = await queryClient.fetchQuery({
              queryKey: getMenuPhotoControllerGetPhotosQueryKey(itemId),
              queryFn: () => menuPhotoControllerGetPhotos(itemId),
            });
          } catch (fetchError) {
            console.error('Failed to fetch photos after upload:', fetchError);
            // Non-blocking: use uploaded photos as fallback
            allPhotos = uploadedPhotos;
            // Show non-blocking toast
            if (!photoUploadFailed) {
              setToastMessage('Uploaded photos successfully, but failed to refresh gallery.');
              setShowSuccessToast(true);
            }
          }

          // Step 2d: Set primary photo
          if (photoManager.primaryCandidateId && allPhotos.length > 0) {
            let primaryPhotoId: string | null = null;

            if (photoManager.isPrimaryCandidateNewFile()) {
              // Primary is a newly uploaded file
              const newFileIndex = photoManager.getPrimaryCandidateNewFileIndex();
              if (newFileIndex >= 0 && newFileIndex < uploadedPhotos.length) {
                primaryPhotoId = uploadedPhotos[newFileIndex]?.id || null;
              }
              // Fallback: use first uploaded photo
              if (!primaryPhotoId && uploadedPhotos.length > 0) {
                primaryPhotoId = uploadedPhotos[0]?.id || null;
              }
            } else {
              // Primary is an existing photo
              primaryPhotoId = photoManager.getPrimaryCandidatePhotoId();
            }

            if (primaryPhotoId) {
              try {
                await setPrimaryPhotoMutation.mutateAsync({
                  itemId,
                  photoId: primaryPhotoId,
                });
              } catch (primaryError) {
                console.error('Failed to set primary photo:', primaryError);
              }
            }
          }

          // Step 2e: Update photo order (if needed)
          // Note: This is complex and may require batch API or sequential updates
          // For now, we skip order updates to avoid complexity
          // TODO: Implement order updates if backend supports batch order API

        } catch (photoError) {
          console.error('Photo operations failed:', photoError);
          photoUploadFailed = true;
        }
      }

      // ============ Success Messages ============
      if (photoUploadFailed) {
        setToastMessage(
          `Item "${itemFormData.name}" saved, but some photo operations failed. Please edit the item to retry.`
        );
      } else {
        setToastMessage(
          itemModalMode === 'add'
            ? `Món "${itemFormData.name}" đã được tạo`
            : `Món "${itemFormData.name}" đã được cập nhật`
        );
      }

      setShowSuccessToast(true);
      
      // Invalidate queries to refetch menu items list
      await queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      if (itemId) {
        await queryClient.invalidateQueries({ queryKey: ['menu', 'item', itemId] });
      }
      
      handleCloseItemModal();

    } catch (error) {
      console.error('Error in handleSaveItem:', error);
      setToastMessage('Failed to save item. Please try again.');
      setShowSuccessToast(true);
    } finally {
      setIsSaving(false);
      setSaveProgress('');
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
      await deleteItemMutation.mutateAsync(itemToDelete.id);
      setToastMessage(`Món "${itemToDelete.name}" đã được xóa`);
      setShowSuccessToast(true);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error in handleConfirmDelete:', error);
    }
  };

  // ============ IMAGE UPLOAD HELPERS ============
  /**
   * Handle file selection from dropzone
   * Validates files and adds them to photoManager
   */
  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);

      if (!validation.valid) {
        errors.push(validation.error || 'Unknown error');
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      photoManager.addNewFiles(validFiles);
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

  /**
   * Remove photo from photoManager
   * If existing photo: marks for deletion on server
   * If new file: just removes from local state and cleans up object URL
   */
  const removePhoto = (localId: string) => {
    photoManager.removePhoto(localId);
  };

  /**
   * Set photo as primary candidate
   * Actual server update happens on save
   */
  const setPhotoPrimary = (localId: string) => {
    photoManager.setPrimary(localId);
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

  // ============ FILTER PANEL HANDLERS ============
  const handleToggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const handleTempStatusChange = (status: string) => {
    setTempSelectedStatus(status);
  };

  const handleTempAvailabilityChange = (availability: 'all' | 'available' | 'unavailable') => {
    setTempSelectedAvailability(availability);
  };

  const handleResetFilters = () => {
    setTempSelectedStatus('All Status');
    setTempSelectedAvailability('all');
  };

  const handleApplyFilters = () => {
    setSelectedStatus(tempSelectedStatus);
    setSelectedAvailability(tempSelectedAvailability);
    setSelectedChefRecommended(tempSelectedChefRecommended);
    setShowFilter(false);
  };

  const handleClearFilters = () => {
    setSelectedStatus('All Status');
    setSelectedAvailability('all');
    setSelectedChefRecommended(false);
    setTempSelectedStatus('All Status');
    setTempSelectedAvailability('all');
    setTempSelectedChefRecommended(false);
  };

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
      showFilter,
      setShowFilter,
      selectedAvailability,
      setSelectedAvailability,
      tempSelectedStatus,
      setTempSelectedStatus,
      tempSelectedAvailability,
      setTempSelectedAvailability,
      selectedChefRecommended,
      setSelectedChefRecommended,
      tempSelectedChefRecommended,
      setTempSelectedChefRecommended,
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
      // Photo management (TWO-ROUNDTRIP flow)
      photoManager,
      isSaving,
      saveProgress,
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
      // Filter handlers
      handleToggleFilter,
      handleTempStatusChange,
      handleTempAvailabilityChange,
      handleResetFilters,
      handleApplyFilters,
      handleClearFilters,
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

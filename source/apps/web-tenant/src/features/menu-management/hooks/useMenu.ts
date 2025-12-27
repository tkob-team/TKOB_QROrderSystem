/**
 * Menu Management React Query Hooks
 * Uses menu service which delegates to menu adapter
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { menuService } from '@/services/menu';
import type {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  CreateModifierGroupDto,
  UpdateModifierGroupDto,
} from '@/services/generated/models';

/**
 * List menu categories query
 */
export const useMenuCategories = (params?: { activeOnly?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'categories', params],
    queryFn: async () => {
      console.log('🔍 [useMenuCategories] Fetching categories', { params });
      const result = await menuService.listCategories(params);
      console.log('📦 [useMenuCategories] Received:', result);
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
};

/**
 * List menu items query
 */
export const useMenuItems = (params?: { categoryId?: string; status?: string; available?: boolean; search?: string; chefRecommended?: boolean; sortBy?: string; sortOrder?: string }) => {
  return useQuery({
    queryKey: ['menu', 'items', params],
    queryFn: async () => {
      console.log('🔍 [useMenuItems] Fetching menu items', { params });
      const result = await menuService.listMenuItems(params);
      console.log('📦 [useMenuItems] Received:', result);
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
};

/**
 * List modifier groups query
 */
export const useModifierGroups = (params?: { activeOnly?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'modifier-groups', params],
    queryFn: async () => {
      console.log('🔍 [useModifierGroups] Fetching modifier groups', { params });
      const result = await menuService.listModifierGroups(params);
      console.log('📦 [useModifierGroups] Received:', result);
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
};

/**
 * Get category by ID query
 */
export const useMenuCategoryById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'category', id],
    queryFn: () => menuService.getCategoryById(id),
    enabled: options?.enabled ?? !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Get menu item by ID query
 */
export const useMenuItemById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'item', id],
    queryFn: () => menuService.getMenuItemById(id),
    enabled: options?.enabled ?? !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Get modifier group by ID query
 */
export const useModifierGroupById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'modifier-group', id],
    queryFn: () => menuService.getModifierGroupById(id),
    enabled: options?.enabled ?? !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Create category mutation
 */
export const useCreateMenuCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMenuCategoryDto) => menuService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
    },
  });
};

/**
 * Update category mutation
 */
export const useUpdateMenuCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuCategoryDto }) =>
      menuService.updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['menu', 'category', variables.id] });
    },
  });
};

/**
 * Delete category mutation
 */
export const useDeleteMenuCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => menuService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
    },
  });
};

/**
 * Create menu item mutation
 */
export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMenuItemDto) => menuService.createMenuItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
    },
  });
};

/**
 * Update menu item mutation
 */
export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuItemDto }) =>
      menuService.updateMenuItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['menu', 'item', variables.id] });
    },
  });
};

/**
 * Delete menu item mutation
 */
export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => menuService.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
    },
  });
};

/**
 * Publish menu item mutation
 */
export const usePublishMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'DRAFT' | 'PUBLISHED' }) =>
      menuService.publishMenuItem(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['menu', 'item', variables.id] });
    },
  });
};

/**
 * Create modifier group mutation
 */
export const useCreateModifierGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateModifierGroupDto) => menuService.createModifierGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'modifier-groups'] });
    },
  });
};

/**
 * Update modifier group mutation
 */
export const useUpdateModifierGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModifierGroupDto }) =>
      menuService.updateModifierGroup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'modifier-groups'] });
      queryClient.invalidateQueries({ queryKey: ['menu', 'modifier-group', variables.id] });
    },
  });
};

/**
 * Delete modifier group mutation
 */
export const useDeleteModifierGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => menuService.deleteModifierGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'modifier-groups'] });
    },
    onError: (error: any) => {
      console.error('Delete failed:', error);
    },
  });
};

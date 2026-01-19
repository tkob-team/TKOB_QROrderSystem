"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { menuAdapter } from '../data';
import type {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from '@/services/generated/models';

type NotifyFn = (message: string) => void;

interface UseMenuCrudMutationsOptions {
  notify: NotifyFn;
  notifyError: NotifyFn;
}

export function useMenuCrudMutations({ notify, notifyError }: UseMenuCrudMutationsOptions) {
  const qc = useQueryClient();

  // Categories
  const mCreateCategory = useMutation({
    mutationFn: (data: CreateMenuCategoryDto) => menuAdapter.categories.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu', 'categories'] });
      notify('Category created successfully');
    },
    onError: () => notifyError('Failed to create category'),
  });

  const mUpdateCategory = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuCategoryDto }) =>
      menuAdapter.categories.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu', 'categories'] });
      notify('Category updated successfully');
    },
    onError: () => notifyError('Failed to update category'),
  });

  const mDeleteCategory = useMutation({
    mutationFn: (id: string) => menuAdapter.categories.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu', 'categories'] });
      notify('Category deleted successfully');
    },
    onError: () => notifyError('Failed to delete category'),
  });

  // Items
  const mCreateItem = useMutation({
    mutationFn: (data: CreateMenuItemDto) => menuAdapter.items.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu', 'items'] });
      // Note: Success notification is handled by controller
    },
    // No onError - let the error bubble up to controller's try-catch
  });

  const mUpdateItem = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuItemDto }) =>
      menuAdapter.items.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu', 'items'] });
      // Note: Success notification is handled by controller
    },
  });

  const mDeleteItem = useMutation({
    mutationFn: (id: string) => menuAdapter.items.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu', 'items'] });
      notify('Menu item deleted successfully');
    },
    onError: () => notifyError('Failed to delete menu item'),
  });

  const mTogglePublish = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      menuAdapter.items.togglePublish(id, { publish }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['menu', 'items'] });
      notify(variables.publish ? 'Menu item published' : 'Menu item unpublished');
    },
    onError: () => notifyError('Failed to change publish status'),
  });

  // Modifiers
  const mCreateModifier = useMutation({
    mutationFn: (data: unknown) => menuAdapter.modifiers.create(data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu', 'modifiers'] });
      notify('Modifier group created');
    },
    onError: () => notifyError('Failed to create modifier group'),
  });

  const mUpdateModifier = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      menuAdapter.modifiers.update(id, data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu', 'modifiers'] });
      notify('Modifier group updated');
    },
    onError: () => notifyError('Failed to update modifier group'),
  });

  const mDeleteModifier = useMutation({
    mutationFn: (id: string) => menuAdapter.modifiers.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu', 'modifiers'] });
      notify('Modifier group deleted');
    },
    onError: () => notifyError('Failed to delete modifier group'),
  });

  const menuMutations = {
    categories: {
      create: (data: CreateMenuCategoryDto) => mCreateCategory.mutateAsync(data),
      update: (payload: { id: string; data: UpdateMenuCategoryDto }) =>
        mUpdateCategory.mutateAsync(payload),
      delete: (id: string) => mDeleteCategory.mutateAsync(id),
    },
    items: {
      create: (data: CreateMenuItemDto) => mCreateItem.mutateAsync(data),
      update: (payload: { id: string; data: UpdateMenuItemDto }) => mUpdateItem.mutateAsync(payload),
      delete: (id: string) => mDeleteItem.mutateAsync(id),
      togglePublish: (payload: { id: string; publish: boolean }) => mTogglePublish.mutateAsync(payload),
    },
    modifiers: {
      create: (data: unknown) => mCreateModifier.mutateAsync(data),
      update: (payload: { id: string; data: unknown }) => mUpdateModifier.mutateAsync(payload),
      delete: (id: string) => mDeleteModifier.mutateAsync(id),
    },
  } as const;

  return { menuMutations };
}

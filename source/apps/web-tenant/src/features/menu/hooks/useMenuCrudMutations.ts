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
      notify('Danh mục đã được tạo');
    },
    onError: () => notifyError('Có lỗi khi tạo danh mục'),
  });

  const mUpdateCategory = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuCategoryDto }) =>
      menuAdapter.categories.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu', 'categories'] });
      notify('Danh mục đã được cập nhật');
    },
    onError: () => notifyError('Có lỗi khi cập nhật danh mục'),
  });

  const mDeleteCategory = useMutation({
    mutationFn: (id: string) => menuAdapter.categories.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu', 'categories'] });
      notify('Danh mục đã được xóa');
    },
    onError: () => notifyError('Có lỗi khi xóa danh mục'),
  });

  // Items
  const mCreateItem = useMutation({
    mutationFn: (data: CreateMenuItemDto) => menuAdapter.items.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu', 'items'] });
      notify('Món ăn đã được tạo');
    },
    onError: () => notifyError('Có lỗi khi tạo món ăn'),
  });

  const mUpdateItem = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuItemDto }) =>
      menuAdapter.items.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu', 'items'] });
      notify('Món ăn đã được cập nhật');
    },
    onError: () => notifyError('Có lỗi khi cập nhật món ăn'),
  });

  const mDeleteItem = useMutation({
    mutationFn: (id: string) => menuAdapter.items.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu', 'items'] });
      notify('Món ăn đã được xóa');
    },
    onError: () => notifyError('Có lỗi khi xóa món ăn'),
  });

  const mTogglePublish = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      menuAdapter.items.togglePublish(id, { publish }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['menu', 'items'] });
      notify(variables.publish ? 'Món ăn đã được xuất bản' : 'Món ăn đã chuyển về nháp');
    },
    onError: () => notifyError('Có lỗi khi thay đổi trạng thái xuất bản'),
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

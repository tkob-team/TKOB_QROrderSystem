"use client";

import { useState } from 'react';
import type { MenuItem } from '../model/types';

export function useMenuDeleteState() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteClick = (item: Pick<MenuItem, 'id' | 'name'>) => {
    setItemToDelete({ id: item.id, name: item.name });
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return {
    isDeleteModalOpen,
    itemToDelete,
    handleDeleteClick,
    closeDeleteModal,
    setIsDeleteModalOpen,
    setItemToDelete,
  } as const;
}

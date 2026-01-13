"use client";

import { useMenuItems } from './queries/items';

// Controller wrapper for menu preview to keep queries internal
export function useMenuPreviewController() {
  return useMenuItems();
}

/**
 * Menu Modifiers Feature - Type Definitions
 * 
 * Centralized type definitions for modifier groups and options
 */

/**
 * Modifier type (backend: SINGLE_CHOICE | MULTI_CHOICE)
 */
export type ModifierType = 'single' | 'multiple' | 'SINGLE_CHOICE' | 'MULTI_CHOICE';

/**
 * Modifier group status
 */
export type ModifierStatus = 'all' | 'archived';

/**
 * Modifier option entity
 */
export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number; // Price difference from base (not absolute price)
  displayOrder: number;
}

/**
 * Modifier group entity (from API)
 */
export interface ModifierGroup {
  id: string;
  name: string;
  description?: string;
  type: ModifierType;
  required: boolean;
  minChoices: number;
  maxChoices: number;
  active: boolean;
  displayOrder?: number;
  options: ModifierOption[];
  linkedItems?: number; // Number of menu items using this group
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Form data for creating/editing modifier group
 */
export interface ModifierGroupFormData {
  name: string;
  description: string;
  type: 'single' | 'multiple';
  required: boolean;
  minChoices: number;
  maxChoices: number;
  options: { name: string; priceDelta: number; displayOrder: number }[];
}

/**
 * Filters for modifier groups list
 */
export interface ModifierFilters {
  type: 'all' | 'single' | 'multiple';
  status: ModifierStatus;
  searchQuery: string;
}

/**
 * Modal mode
 */
export type ModalMode = 'create' | 'edit';

/**
 * Modifier type config for UI display
 */
export interface ModifierTypeConfig {
  value: 'single' | 'multiple';
  label: string;
  description: string;
  badgeColor: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  icon?: string;
}

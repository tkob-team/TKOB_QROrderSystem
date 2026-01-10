/**
 * Menu Modifiers Feature - Canonical Domain Definitions
 * 
 * Centralized type definitions, constants, and configuration for modifier groups.
 * This is the single source of truth for all modifier-related types and constants.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Modifier type (backend: SINGLE_CHOICE | MULTI_CHOICE)
 */
export type ModifierType = 'single' | 'multiple' | 'SINGLE_CHOICE' | 'MULTI_CHOICE';

/**
 * Modifier group status
 */
export type ModifierStatus = 'all' | 'archived';

/**
 * Modal mode
 */
export type ModalMode = 'create' | 'edit';

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
  displayOrder?: number;
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
 * Modifier type config for UI display
 */
export interface ModifierTypeConfig {
  value: 'single' | 'multiple';
  label: string;
  description: string;
  // Align with supported Badge variants
  badgeColor:
    | 'default'
    | 'primary'
    | 'primarySolid'
    | 'success'
    | 'successSolid'
    | 'warning'
    | 'warningSolid'
    | 'error'
    | 'errorSolid'
    | 'info'
    | 'infoSolid';
  icon?: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/**
 * Initial form data for modifier group
 */
export const INITIAL_MODIFIER_FORM: ModifierGroupFormData = {
  name: '',
  description: '',
  type: 'single',
  required: false,
  minChoices: 1,
  maxChoices: 1,
  options: [],
};

/**
 * Modifier type configuration mapping
 * Maps type to UI display (pill color, label, description)
 */
export const MODIFIER_TYPE_CONFIG: Record<'single' | 'multiple', ModifierTypeConfig> = {
  single: {
    value: 'single',
    label: 'Single Choice',
    description: 'Customer can select only one option',
    badgeColor: 'info', // Blue
  },
  multiple: {
    value: 'multiple',
    label: 'Multiple Choice',
    description: 'Customer can select multiple options',
    badgeColor: 'success', // Green
  },
};

/**
 * Filter options for modifier type
 */
export const TYPE_FILTER_OPTIONS = [
  { value: 'all' as const, label: 'All Types' },
  { value: 'single' as const, label: 'Single Choice' },
  { value: 'multiple' as const, label: 'Multiple Choice' },
];

/**
 * Filter options for status
 */
export const MODIFIER_STATUS_FILTER_OPTIONS = [
  { value: 'all' as const, label: 'Active Groups' },
  { value: 'archived' as const, label: 'Archived Groups' },
];

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  MIN_OPTIONS: 1,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_OPTION_NAME_LENGTH: 50,
  MIN_PRICE_DELTA: -1000,
  MAX_PRICE_DELTA: 1000,
};

/**
 * Default min/max choices based on type
 */
export const DEFAULT_CHOICES = {
  single: { min: 1, max: 1 },
  multiple: { min: 0, max: 10 },
};

/**
 * Backend type mapping
 */
export const BACKEND_TYPE_MAP = {
  single: 'SINGLE_CHOICE',
  multiple: 'MULTI_CHOICE',
  SINGLE_CHOICE: 'single',
  MULTI_CHOICE: 'multiple',
} as const;

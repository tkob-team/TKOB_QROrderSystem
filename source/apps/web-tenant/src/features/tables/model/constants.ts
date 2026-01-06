/**
 * Tables Feature - Constants
 * 
 * Shared constants for tables management
 */

import type { TableFormData, SortOption } from './types';

/**
 * Initial form data for create/edit operations
 */
export const INITIAL_TABLE_FORM: TableFormData = {
  name: '',
  capacity: '',
  zone: 'indoor',
  tableNumber: '',
  status: 'available',
  description: '',
};

/**
 * Zone labels mapping
 */
export const ZONE_LABELS: Record<string, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  patio: 'Patio',
  vip: 'VIP Room',
};

/**
 * Sort options for dropdown
 */
export const SORT_OPTIONS: SortOption[] = [
  'Sort by: Table Number (Ascending)',
  'Sort by: Capacity (Ascending)',
  'Sort by: Capacity (Descending)',
  'Sort by: Creation Date (Newest)',
];

/**
 * Filter options
 */
export const STATUS_FILTER_OPTIONS = [
  'All',
  'Available',
  'Occupied',
  'Reserved',
  'Inactive',
];

export const ZONE_FILTER_OPTIONS = [
  'All Locations',
  'Indoor',
  'Outdoor',
  'Patio',
  'VIP Room',
];

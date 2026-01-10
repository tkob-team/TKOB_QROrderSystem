/**
 * Tables Feature - Type Definitions
 * 
 * Centralized type definitions for tables management and QR operations
 */

/**
 * Table status enum - matches backend API format
 */
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'inactive';

/**
 * Table zone/location enum (for form inputs only)
 */
export type TableZone = 'indoor' | 'outdoor' | 'patio' | 'vip';

/**
 * Table entity - main data structure
 */
export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  location: string;
  tableNumber: string;
  createdAt: Date;
  description?: string;
  hasActiveOrders?: boolean;
  qrToken?: string;
  qrCodeUrl?: string;
}

/**
 * Table filters for API queries
 */
export interface TableFilters {
  status?: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE';
  location?: string;
  sortBy?: 'tableNumber' | 'capacity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Table form data for create/edit operations
 */
export interface TableFormData {
  name: string;
  capacity: string;
  zone: TableZone;
  tableNumber: string;
  status: TableStatus;
  description: string;
  originalTableNumber?: string; // Track original table number format for editing
}

/**
 * Table summary statistics
 */
export interface TableSummary {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  inactive: number;
  totalCapacity: number;
}

/**
 * QR code download format
 */
export type QRDownloadFormat = 'png' | 'pdf';

/**
 * Sort options for UI dropdown
 */
export type SortOption =
  | 'Sort by: Table Number (Ascending)'
  | 'Sort by: Capacity (Ascending)'
  | 'Sort by: Capacity (Descending)'
  | 'Sort by: Creation Date (Newest)';

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error';

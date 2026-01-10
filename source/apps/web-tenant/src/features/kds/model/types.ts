/**
 * KDS (Kitchen Display System) - Type Definitions
 */

/**
 * Order status in KDS workflow
 */
export type KdsStatus = 'pending' | 'preparing' | 'ready' | 'served';

/**
 * Order item with modifiers and special notes
 */
export interface OrderItem {
  name: string;
  quantity: number;
  modifiers?: string[];
  notes?: string;
}

/**
 * KDS Order (Ticket)
 */
export interface KdsOrder {
  id: string;
  table: string;
  time: number; // elapsed time in minutes
  items: OrderItem[];
  isOverdue: boolean;
  status: KdsStatus;
  startedAt?: string;
  readyAt?: string;
  servedAt?: string;
  servedBy?: 'KITCHEN' | 'WAITER';
}

/**
 * Column configuration for KDS board
 */
export interface KdsColumnConfig {
  id: 'new' | 'preparing' | 'ready';
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
}

/**
 * Button config for each column
 */
export interface KdsButtonConfig {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any; // Lucide icon component (UI-facing config)
  className: string;
}

/**
 * KDS Status configuration (for status pills)
 */
export interface KdsStatusConfig {
  label: string;
  color: 'blue' | 'amber' | 'emerald' | 'red';
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
}

/**
 * KDS Board settings
 */
export interface KdsBoardSettings {
  soundEnabled: boolean;
  autoRefresh: boolean;
  showKdsProfile?: boolean;
  enableKitchenServe?: boolean;
}

/**
 * KDS summary counts
 */
export interface KdsSummaryCounts {
  pending: number;
  cooking: number;
  ready: number;
  overdue: number;
}

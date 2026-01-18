/**
 * Waiter Service Board - Type Definitions
 * Centralized types for ServiceBoardPage and related components
 */

/**
 * Order status enum
 */
export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed';

/**
 * Payment status enum
 */
export type PaymentStatus = 'paid' | 'unpaid';

/**
 * Payment method enum
 */
export type PaymentMethod = 'BILL_TO_TABLE' | 'SEPAY_QR' | 'CARD_ONLINE';

/**
 * Order item with modifiers
 */
export interface OrderItem {
  name: string;
  quantity: number;
  modifiers?: string[];
}

/**
 * Service board order
 */
export interface ServiceOrder {
  id: string;
  orderNumber: string;
  table: string;
  tableId: string; // UUID for API calls
  sessionId?: string; // Session ID for grouping
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  placedTime: string;
  minutesAgo: number;
  total: number;
}

/**
 * Tab configuration for order status navigation
 */
export interface ServiceTab {
  id: OrderStatus;
  label: string;
}

/**
 * Service board settings
 */
export interface ServiceBoardSettings {
  soundEnabled: boolean;
  autoRefresh: boolean;
  userRole?: 'admin' | 'waiter' | 'kds';
}

/**
 * Order status action configuration
 */
export interface OrderActionConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
  minHeight: string;
  handler: (order: ServiceOrder) => void;
}

/**
 * Order status tab count
 */
export interface ServiceTabCounts {
  placed: number;
  confirmed: number;
  preparing: number;
  ready: number;
  served: number;
  completed: number;
}

/**
 * Grouped orders by table (for completed tab)
 */
export interface TableOrdersGroup {
  tableId: string;
  tableNumber: string;
  sessionId: string;
  orders: ServiceOrder[];
  totalAmount: number;
}

/**
 * Data for closing table and generating bill
 */
export interface CloseTableData {
  tableId: string;
  sessionId: string;
  paymentMethod: PaymentMethod;
  discount?: number;
  tip?: number;
  notes?: string;
}

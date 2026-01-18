/**
 * Table Grid View - Types
 */

export type TableViewStatus = 'available' | 'occupied' | 'needs-service' | 'reserved' | 'inactive';

export interface TableOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  itemCount: number;
  total: number;
  minutesAgo: number;
}

export interface TableViewItem {
  id: string;
  name: string;
  zone?: string;
  capacity: number;
  status: TableViewStatus;
  sessionId?: string;
  activeOrders: TableOrderSummary[];
  guestCount?: number;
  occupiedSince?: string;
  totalSpent?: number;
}

export interface TableGridState {
  tables: TableViewItem[];
  isLoading: boolean;
  error: Error | null;
  selectedTable: TableViewItem | null;
  viewMode: 'grid' | 'list';
  filterStatus: TableViewStatus | 'all';
}

export interface TableGridActions {
  selectTable: (table: TableViewItem | null) => void;
  clearTable: (tableId: string) => void;
  changeTableStatus: (tableId: string, status: TableViewStatus) => void;
  startManualOrder: (tableId: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setFilterStatus: (status: TableViewStatus | 'all') => void;
  refresh: () => void;
}

// Status styling configuration
export const TABLE_STATUS_CONFIG: Record<TableViewStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: string;
}> = {
  available: {
    label: 'Available',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: '✓',
  },
  occupied: {
    label: 'Occupied',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: '👥',
  },
  'needs-service': {
    label: 'Needs Service',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
    icon: '🔔',
  },
  reserved: {
    label: 'Reserved',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    icon: '📅',
  },
  inactive: {
    label: 'Inactive',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-200',
    icon: '⏸',
  },
};

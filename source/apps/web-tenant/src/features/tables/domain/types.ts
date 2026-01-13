import type { Dispatch, RefObject, SetStateAction } from 'react';
import type {
  QRDownloadFormat,
  SortOption,
  Table,
  TableFormData,
  TableSummary,
  ToastType,
} from '../model/types';

export type PendingStatusChange = 'active' | 'inactive' | null;

export interface TablesFiltersState {
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  activeOnly: boolean;
  setActiveOnly: (active: boolean) => void;
  locations: string[];
}

export interface TablesModalsState {
  showAddModal: boolean;
  showEditModal: boolean;
  showQRModal: boolean;
  showDeactivateConfirm: boolean;
  isBulkRegenOpen: boolean;
  setIsBulkRegenOpen: (open: boolean) => void;
}

export interface TablesLoadingState {
  isDownloadingQR: boolean;
  isDownloadingAll: boolean;
  isPrintingQR: boolean;
  isBulkRegenLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isUpdatingStatus: boolean;
  isRegenerating: boolean;
}

export interface TablesToastState {
  show: boolean;
  message: string;
  type: ToastType;
  onClose: () => void;
}

export interface TablesHandlers {
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: () => void;
  closeEditModal: () => void;
  openQRModal: (table: Table) => void;
  closeQRModal: () => void;
  createTable: () => Promise<void> | void;
  updateTable: () => Promise<void> | void;
  activateTable: () => void;
  deactivateTable: () => void;
  confirmStatusChange: () => Promise<void> | void;
  cancelStatusChange: () => void;
  regenerateQR: () => Promise<void> | void;
  downloadQR: (format: QRDownloadFormat) => Promise<void> | void;
  downloadAll: () => Promise<void> | void;
  bulkRegenerateQR: () => Promise<void> | void;
  printQR: () => Promise<void> | void;
  editTable: (table: Table) => void;
}

export interface TablesControllerState {
  tables: Table[];
  summary: TableSummary;
  isLoading: boolean;
  error: any;
  filters: TablesFiltersState;
  modals: TablesModalsState;
  selectedTable: Table | null;
  formData: TableFormData;
  setFormData: Dispatch<SetStateAction<TableFormData>>;
  pendingStatusChange: PendingStatusChange;
  loading: TablesLoadingState;
  toast: TablesToastState;
  qrPrintRef: RefObject<HTMLDivElement>;
  handlers: TablesHandlers;
}

export interface TablesHeaderProps {
  hasTables: boolean;
  isBulkRegenLoading: boolean;
  isDownloadingAll: boolean;
  isCreating: boolean;
  onOpenBulkRegen: () => void;
  onDownloadAll: () => void;
  onAddTable: () => void;
}

export interface TablesListProps {
  summary: TableSummary;
  isLoading: boolean;
  tables: Table[];
  filters: TablesFiltersState;
  onClearFilters: () => void;
  onEdit: (table: Table) => void;
  onViewQR: (table: Table) => void;
}

export interface TablesFormModalsProps {
  formData: TableFormData;
  setFormData: Dispatch<SetStateAction<TableFormData>>;
  locations: string[];
  modals: Pick<TablesModalsState, 'showAddModal' | 'showEditModal'>;
  loading: Pick<TablesLoadingState, 'isCreating' | 'isUpdating'>;
  handlers: Pick<TablesHandlers, 'closeAddModal' | 'closeEditModal' | 'createTable' | 'updateTable'>;
}

export interface QrCodeActionsProps {
  selectedTable: Table | null;
  modals: Pick<TablesModalsState, 'showQRModal' | 'showDeactivateConfirm' | 'isBulkRegenOpen'> & {
    setIsBulkRegenOpen: TablesModalsState['setIsBulkRegenOpen'];
  };
  pendingStatusChange: PendingStatusChange;
  loading: Pick<
    TablesLoadingState,
    'isDownloadingQR' | 'isPrintingQR' | 'isRegenerating' | 'isUpdatingStatus' | 'isBulkRegenLoading'
  >;
  qrPrintRef: RefObject<HTMLDivElement>;
  tablesCount: number;
  handlers: {
    closeQRModal: TablesHandlers['closeQRModal'];
    downloadQR: TablesHandlers['downloadQR'];
    printQR: TablesHandlers['printQR'];
    regenerateQR: TablesHandlers['regenerateQR'];
    activateTable: TablesHandlers['activateTable'];
    deactivateTable: TablesHandlers['deactivateTable'];
    openEditModal: TablesHandlers['openEditModal'];
    cancelStatusChange: TablesHandlers['cancelStatusChange'];
    confirmStatusChange: TablesHandlers['confirmStatusChange'];
    bulkRegenerateQR: TablesHandlers['bulkRegenerateQR'];
  };
}

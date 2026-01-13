import type {
  QrCodeActionsProps,
  TablesControllerState,
  TablesFormModalsProps,
  TablesHeaderProps,
  TablesListProps,
} from './types';

export const selectHeaderProps = (state: TablesControllerState): TablesHeaderProps => ({
  hasTables: state.tables.length > 0,
  isBulkRegenLoading: state.loading.isBulkRegenLoading,
  isDownloadingAll: state.loading.isDownloadingAll,
  isCreating: state.loading.isCreating,
  onOpenBulkRegen: () => state.modals.setIsBulkRegenOpen(true),
  onDownloadAll: state.handlers.downloadAll,
  onAddTable: state.handlers.openAddModal,
});

export const selectTablesListProps = (state: TablesControllerState): TablesListProps => ({
  summary: state.summary,
  isLoading: state.isLoading,
  tables: state.tables,
  filters: state.filters,
  onClearFilters: () => {
    state.filters.setSelectedStatus('All');
    state.filters.setSelectedZone('All Locations');
    state.filters.setActiveOnly(false);
  },
  onEdit: state.handlers.editTable,
  onViewQR: state.handlers.openQRModal,
});

export const selectFormModalProps = (state: TablesControllerState): TablesFormModalsProps => ({
  formData: state.formData,
  setFormData: state.setFormData,
  locations: state.filters.locations,
  modals: {
    showAddModal: state.modals.showAddModal,
    showEditModal: state.modals.showEditModal,
  },
  loading: {
    isCreating: state.loading.isCreating,
    isUpdating: state.loading.isUpdating,
  },
  handlers: {
    closeAddModal: state.handlers.closeAddModal,
    closeEditModal: state.handlers.closeEditModal,
    createTable: state.handlers.createTable,
    updateTable: state.handlers.updateTable,
  },
});

export const selectQrCodeActionsProps = (state: TablesControllerState): QrCodeActionsProps => ({
  selectedTable: state.selectedTable,
  modals: {
    showQRModal: state.modals.showQRModal,
    showDeactivateConfirm: state.modals.showDeactivateConfirm,
    isBulkRegenOpen: state.modals.isBulkRegenOpen,
    setIsBulkRegenOpen: state.modals.setIsBulkRegenOpen,
  },
  pendingStatusChange: state.pendingStatusChange,
  loading: {
    isDownloadingQR: state.loading.isDownloadingQR,
    isPrintingQR: state.loading.isPrintingQR,
    isRegenerating: state.loading.isRegenerating,
    isUpdatingStatus: state.loading.isUpdatingStatus,
    isBulkRegenLoading: state.loading.isBulkRegenLoading,
  },
  qrPrintRef: state.qrPrintRef,
  tablesCount: state.tables.length,
  handlers: {
    closeQRModal: state.handlers.closeQRModal,
    downloadQR: state.handlers.downloadQR,
    printQR: state.handlers.printQR,
    regenerateQR: state.handlers.regenerateQR,
    activateTable: state.handlers.activateTable,
    deactivateTable: state.handlers.deactivateTable,
    openEditModal: state.handlers.openEditModal,
    cancelStatusChange: state.handlers.cancelStatusChange,
    confirmStatusChange: state.handlers.confirmStatusChange,
    bulkRegenerateQR: state.handlers.bulkRegenerateQR,
  },
});

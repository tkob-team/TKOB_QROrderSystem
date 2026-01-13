/**
 * Tables Controller Hook
 *
 * Centralized orchestration for Tables feature:
 * - Manages UI state, filters, and modals
 * - Delegates QR actions to useTablesQRActions
 * - Provides stable handler API for the page shell and sections
 */

import { useMemo, useState } from 'react';
import { logger } from '@/shared/utils/logger';
import {
  useTablesList,
  useCreateTable,
  useUpdateTable,
  useUpdateTableStatus,
  useLocations,
} from '../hooks/queries/useTables';
import { useTablesQRActions } from '../hooks/useTablesQRActions';
import { useTablesViewModel } from '../hooks/useTablesViewModel';
import { INITIAL_TABLE_FORM } from '../model/constants';
import type {
  Table,
  TableFormData,
  SortOption,
  TableStatus,
} from '../model/types';
import type { PendingStatusChange, TablesControllerState } from '../domain/types';

export function useTablesController(): TablesControllerState {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isBulkRegenOpen, setIsBulkRegenOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<PendingStatusChange>(null);

  // Form state
  const [formData, setFormData] = useState<TableFormData>(INITIAL_TABLE_FORM);

  // Filter & sort state
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All Locations');
  const [sortOption, setSortOption] = useState<SortOption>('Sort by: Table Number (Ascending)');
  const [activeOnly, setActiveOnly] = useState<boolean>(false);

  // Toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // ============================================================================
  // API HOOKS
  // ============================================================================

  const statusFilter = selectedStatus !== 'All'
    ? selectedStatus.toUpperCase().replace(' ', '_') as 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE'
    : undefined;

  const locationFilter = selectedZone !== 'All Locations' ? selectedZone : undefined;

  const sortParams = useMemo(() => {
    switch (sortOption) {
      case 'Sort by: Table Number (Ascending)':
        return { sortBy: 'tableNumber' as const, sortOrder: 'asc' as const };
      case 'Sort by: Capacity (Ascending)':
        return { sortBy: 'capacity' as const, sortOrder: 'asc' as const };
      case 'Sort by: Capacity (Descending)':
        return { sortBy: 'capacity' as const, sortOrder: 'desc' as const };
      case 'Sort by: Creation Date (Newest)':
        return { sortBy: 'createdAt' as const, sortOrder: 'desc' as const };
      default:
        return { sortBy: 'tableNumber' as const, sortOrder: 'asc' as const };
    }
  }, [sortOption]);

  const { data: apiResponse, isLoading, error } = useTablesList({
    status: statusFilter,
    location: locationFilter,
    sortBy: sortParams.sortBy,
    sortOrder: sortParams.sortOrder,
    activeOnly,
  });

  const { data: locationsData } = useLocations();
  const locationOptions = useMemo(() => {
    const normalizeLocation = (location: string): string => {
      if (!location) return '';

      const locationMap: Record<string, string> = {
        indoor: 'Indoor',
        Indoor: 'Indoor',
        outdoor: 'Outdoor',
        Outdoor: 'Outdoor',
        patio: 'Patio',
        Patio: 'Patio',
        vip: 'VIP Room',
        'vip room': 'VIP Room',
        'VIP Room': 'VIP Room',
      };

      return locationMap[location] || location;
    };

    const normalized = (locationsData || []).map(normalizeLocation);
    const unique = Array.from(new Set(normalized));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [locationsData]);

  const createTableMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();
  const updateStatusMutation = useUpdateTableStatus();

  // ============================================================================
  // VIEW MODEL
  // ============================================================================

  const viewModel = useTablesViewModel(apiResponse, isLoading, error);

  // ============================================================================
  // EVENT HANDLERS - Modals
  // ============================================================================

  const handleOpenAddModal = () => {
    setFormData(INITIAL_TABLE_FORM);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData(INITIAL_TABLE_FORM);
  };

  const handleOpenEditModal = () => {
    if (!selectedTable) return;

    const validStatuses: TableStatus[] = ['available', 'occupied', 'reserved', 'inactive'];
    if (!validStatuses.includes(selectedTable.status as TableStatus)) {
      logger.warn('[invariant] INVALID_TABLE_STATUS', {
        tableId: selectedTable.id,
        receivedStatus: selectedTable.status,
        validStatuses,
      });
    }

    const locationToZone: Record<string, 'indoor' | 'outdoor' | 'patio' | 'vip'> = {
      indoor: 'indoor',
      Indoor: 'indoor',
      outdoor: 'outdoor',
      Outdoor: 'outdoor',
      patio: 'patio',
      Patio: 'patio',
      vip: 'vip',
      'VIP Room': 'vip',
    };
    const zone = locationToZone[selectedTable.location] || 'indoor';
    const tableNum = selectedTable.tableNumber.replace(/[^0-9]/g, '') || '';
    setFormData({
      name: selectedTable.name,
      capacity: selectedTable.capacity.toString(),
      zone,
      tableNumber: tableNum,
      status: selectedTable.status,
      description: selectedTable.description || '',
    });
    setShowEditModal(true);
    setShowQRModal(false);
  };

  const populateFormDataFromTable = (table: Table) => {
    const locationToZone: Record<string, 'indoor' | 'outdoor' | 'patio' | 'vip'> = {
      indoor: 'indoor',
      Indoor: 'indoor',
      outdoor: 'outdoor',
      Outdoor: 'outdoor',
      patio: 'patio',
      Patio: 'patio',
      vip: 'vip',
      'VIP Room': 'vip',
    };
    const zone = locationToZone[table.location] || 'indoor';
    const tableNum = table.tableNumber.replace(/[^0-9]/g, '') || '';
    return {
      name: table.name,
      capacity: table.capacity.toString(),
      zone,
      tableNumber: tableNum,
      status: table.status,
      description: table.description || '',
      originalTableNumber: table.tableNumber,
    };
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setFormData(INITIAL_TABLE_FORM);
  };

  const handleOpenQRModal = (table: Table) => {
    setSelectedTable(table);
    setShowQRModal(true);
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setSelectedTable(null);
  };

  // ============================================================================
  // EVENT HANDLERS - CRUD Operations
  // ============================================================================

  const handleApiError = (error: any, defaultMessage: string) => {
    const errorMessage = error?.response?.data?.error?.message || error?.message || defaultMessage;
    logger.error('[tables] API_ERROR', { message: errorMessage });
    setToastMessage(errorMessage);
    setToastType('error');
    setShowSuccessToast(true);
  };

  const handleCreateTable = async () => {
    if (!formData.tableNumber || !formData.capacity) {
      setToastMessage('Please fill in all required fields');
      setToastType('error');
      setShowSuccessToast(true);
      return;
    }

    try {
      const zoneToLocation: Record<'indoor' | 'outdoor' | 'patio' | 'vip', string> = {
        indoor: 'Indoor',
        outdoor: 'Outdoor',
        patio: 'Patio',
        vip: 'VIP Room',
      };

      const payload = {
        tableNumber: `Table ${formData.tableNumber}`,
        capacity: parseInt(formData.capacity),
        location: zoneToLocation[formData.zone],
        description: formData.description.trim() || undefined,
        displayOrder: parseInt(formData.tableNumber),
      };

      logger.info('[tables] CREATE_TABLE_ATTEMPT', { capacity: payload.capacity, location: payload.location });
      const result = await createTableMutation.mutateAsync(payload);
      logger.info('[tables] CREATE_TABLE_SUCCESS', { tableId: result?.id });

      setToastMessage('Table created successfully');
      setToastType('success');
      setShowSuccessToast(true);
      handleCloseAddModal();
    } catch (error: any) {
      handleApiError(error, 'Failed to create table');
    }
  };

  const handleUpdateTable = async () => {
    if (!selectedTable) return;

    if (!selectedTable.id) {
      logger.warn('[invariant] MISSING_TABLE_ID', {
        hasSelectedTable: !!selectedTable,
        selectedTableKeys: selectedTable ? Object.keys(selectedTable) : [],
      });
      return;
    }

    try {
      const zoneToLocation: Record<'indoor' | 'outdoor' | 'patio' | 'vip', string> = {
        indoor: 'Indoor',
        outdoor: 'Outdoor',
        patio: 'Patio',
        vip: 'VIP Room',
      };

      const statusMap = {
        available: 'AVAILABLE',
        occupied: 'OCCUPIED',
        reserved: 'RESERVED',
        inactive: 'INACTIVE',
      } as const;

      const tableNumberValue = formData.originalTableNumber &&
        formData.originalTableNumber.replace(/[^0-9]/g, '') === formData.tableNumber
        ? formData.originalTableNumber
        : `Table ${formData.tableNumber}`;

      const payload = {
        id: selectedTable.id,
        data: {
          tableNumber: tableNumberValue,
          capacity: parseInt(formData.capacity),
          location: zoneToLocation[formData.zone],
          description: formData.description.trim() || undefined,
          displayOrder: parseInt(formData.tableNumber),
          status: statusMap[formData.status as keyof typeof statusMap],
        },
      };

      logger.info('[tables] UPDATE_TABLE_ATTEMPT', { tableId: selectedTable.id, capacity: payload.data.capacity });
      await updateTableMutation.mutateAsync(payload);
      logger.info('[tables] UPDATE_TABLE_SUCCESS', { tableId: selectedTable.id });

      setToastMessage('Table updated successfully');
      setToastType('success');
      setShowSuccessToast(true);
      handleCloseEditModal();
      setSelectedTable(null);
    } catch (error: any) {
      handleApiError(error, 'Failed to update table');
    }
  };

  // ============================================================================
  // EVENT HANDLERS - Status Management
  // ============================================================================

  const handleActivateTable = () => {
    setPendingStatusChange('active');
    setShowDeactivateConfirm(true);
  };

  const handleDeactivateTable = () => {
    setPendingStatusChange('inactive');
    setShowDeactivateConfirm(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedTable || !pendingStatusChange) return;

    setShowDeactivateConfirm(false);
    const statusToSet = pendingStatusChange === 'inactive' ? 'INACTIVE' : 'AVAILABLE';
    setPendingStatusChange(null);

    try {
      logger.info('[tables] UPDATE_STATUS_ATTEMPT', { tableId: selectedTable.id, newStatus: statusToSet });

      await updateStatusMutation.mutateAsync({
        id: selectedTable.id,
        status: statusToSet,
      });

      logger.info('[tables] UPDATE_STATUS_SUCCESS', { tableId: selectedTable.id, status: statusToSet });
      setToastMessage(`Table ${statusToSet === 'INACTIVE' ? 'deactivated' : 'reactivated'} successfully`);
      setToastType('success');
      setShowSuccessToast(true);
      handleCloseEditModal();
      setSelectedTable(null);
    } catch (error: any) {
      handleApiError(error, `Failed to ${statusToSet === 'INACTIVE' ? 'deactivate' : 'reactivate'} table`);
      if (selectedTable) {
        setFormData({ ...formData, status: selectedTable.status });
      }
    }
  };

  const handleCancelStatusChange = () => {
    setShowDeactivateConfirm(false);
    setPendingStatusChange(null);
    if (selectedTable) {
      setFormData({ ...formData, status: selectedTable.status });
    }
  };

  // ============================================================================
  // QR ACTIONS (delegated to useTablesQRActions)
  // ============================================================================

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowSuccessToast(true);
  };

  const qrActions = useTablesQRActions(selectedTable, showToast);

  // ============================================================================
  // RETURN CONTROLLER API
  // ============================================================================

  const controller: TablesControllerState = {
    tables: viewModel.tables,
    summary: viewModel.summary,
    isLoading: viewModel.isLoading,
    error: viewModel.error,

    filters: {
      selectedStatus,
      setSelectedStatus,
      selectedZone,
      setSelectedZone,
      sortOption,
      setSortOption,
      activeOnly,
      setActiveOnly,
      locations: locationOptions,
    },

    modals: {
      showAddModal,
      showEditModal,
      showQRModal,
      showDeactivateConfirm,
      isBulkRegenOpen,
      setIsBulkRegenOpen,
    },

    selectedTable,
    formData,
    setFormData,
    pendingStatusChange,

    loading: {
      isDownloadingQR: qrActions.loading.isDownloadingQR,
      isDownloadingAll: qrActions.loading.isDownloadingAll,
      isPrintingQR: qrActions.loading.isPrintingQR,
      isBulkRegenLoading: qrActions.loading.isBulkRegenLoading,
      isCreating: createTableMutation.isPending,
      isUpdating: updateTableMutation.isPending,
      isUpdatingStatus: updateStatusMutation.isPending,
      isRegenerating: false,
    },

    toast: {
      show: showSuccessToast,
      message: toastMessage,
      type: toastType,
      onClose: () => setShowSuccessToast(false),
    },

    qrPrintRef: qrActions.qrPrintRef,

    handlers: {
      openAddModal: handleOpenAddModal,
      closeAddModal: handleCloseAddModal,
      openEditModal: handleOpenEditModal,
      closeEditModal: handleCloseEditModal,
      openQRModal: handleOpenQRModal,
      closeQRModal: handleCloseQRModal,

      createTable: handleCreateTable,
      updateTable: handleUpdateTable,

      activateTable: handleActivateTable,
      deactivateTable: handleDeactivateTable,
      confirmStatusChange: handleConfirmStatusChange,
      cancelStatusChange: handleCancelStatusChange,

      regenerateQR: qrActions.handlers.regenerateQR,
      downloadQR: qrActions.handlers.downloadQR,
      downloadAll: qrActions.handlers.downloadAll,
      bulkRegenerateQR: qrActions.handlers.bulkRegenerateQR,
      printQR: qrActions.handlers.printQR,

      editTable: (table: Table) => {
        setSelectedTable(table);
        const newFormData = populateFormDataFromTable(table);
        setFormData(newFormData);
        setShowEditModal(true);
        setShowQRModal(false);
      },
    },
  };

  return controller;
}

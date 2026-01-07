/**
 * Tables Page Controller Hook
 * 
 * Orchestrates all state, handlers, and business logic for TablesPage.
 * Keeps the page component thin and declarative.
 * 
 * QR operations delegated to useTablesQRActions for better separation of concerns.
 */

import { useState, useMemo } from 'react';
import {
  useTablesList,
  useCreateTable,
  useUpdateTable,
  useUpdateTableStatus,
} from './queries/useTables';
import { useTablesQRActions } from './useTablesQRActions';
import { useTablesViewModel } from './useTablesViewModel';
import { INITIAL_TABLE_FORM } from '@/features/tables/model/constants';
import type { Table, TableFormData, SortOption, TableSummary } from '@/features/tables/model/types';

export function useTablesPageController() {
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
  const [pendingStatusChange, setPendingStatusChange] = useState<'active' | 'inactive' | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<TableFormData>(INITIAL_TABLE_FORM);
  
  // Filter & sort state
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All Locations');
  const [sortOption, setSortOption] = useState<SortOption>('Sort by: Table Number (Ascending)');
  
  // Toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // ============================================================================
  // API HOOKS
  // ============================================================================
  
  // Map filter params to backend format
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
  });
  
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
    setFormData({
      name: selectedTable.name,
      capacity: selectedTable.capacity.toString(),
      zone: selectedTable.zone,
      tableNumber: selectedTable.tableNumber.toString(),
      status: selectedTable.status,
      description: selectedTable.description || '',
    });
    setShowEditModal(true);
    setShowQRModal(false);
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
    console.error('❌ API Error:', error);
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
      const apiStatus = formData.status === 'available' ? 'AVAILABLE'
        : formData.status === 'occupied' ? 'OCCUPIED'
        : formData.status === 'reserved' ? 'RESERVED'
        : 'INACTIVE';
      
      const payload = {
        tableNumber: `Table ${formData.tableNumber}`,
        capacity: parseInt(formData.capacity),
        location: formData.zone.toLowerCase(),
        description: formData.description.trim() || undefined,
        displayOrder: parseInt(formData.tableNumber),
        status: apiStatus,
      };
      
      console.log('📝 [POST /tables] Request:', payload);
      const result = await createTableMutation.mutateAsync(payload);
      console.log('✅ [POST /tables] Response:', result);
      
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
    
    try {
      const apiStatus = formData.status === 'available' ? 'AVAILABLE'
        : formData.status === 'occupied' ? 'OCCUPIED'
        : formData.status === 'reserved' ? 'RESERVED'
        : 'INACTIVE';
      
      const payload = {
        id: selectedTable.id,
        data: {
          tableNumber: `Table ${formData.tableNumber}`,
          capacity: parseInt(formData.capacity),
          location: formData.zone.toLowerCase(),
          description: formData.description.trim() || undefined,
          displayOrder: parseInt(formData.tableNumber),
          status: apiStatus as 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE',
        },
      };
      
      console.log('📝 [PUT /tables/:id] Request:', payload);
      const result = await updateTableMutation.mutateAsync(payload);
      console.log('✅ [PUT /tables/:id] Response:', result);
      
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
      console.log('🔄 [PATCH /tables/:id/status] Request:', { 
        id: selectedTable.id, 
        status: statusToSet 
      });
      
      await updateStatusMutation.mutateAsync({
        id: selectedTable.id,
        status: statusToSet,
      });
      
      console.log('✅ [PATCH /tables/:id/status] Success');
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
  
  return {
    // Data (from viewModel)
    tables: viewModel.tables,
    summary: viewModel.summary,
    isLoading: viewModel.isLoading,
    error: viewModel.error,
    
    // Filter state
    filters: {
      selectedStatus,
      setSelectedStatus,
      selectedZone,
      setSelectedZone,
      sortOption,
      setSortOption,
    },
    
    // Modal state
    modals: {
      showAddModal,
      showEditModal,
      showQRModal,
      showDeactivateConfirm,
      isBulkRegenOpen,
      setIsBulkRegenOpen,
    },
    
    // Selected table & form
    selectedTable,
    formData,
    setFormData,
    pendingStatusChange,
    
    // Loading states (merged from qrActions)
    loading: {
      isDownloadingQR: qrActions.loading.isDownloadingQR,
      isDownloadingAll: qrActions.loading.isDownloadingAll,
      isPrintingQR: qrActions.loading.isPrintingQR,
      isBulkRegenLoading: qrActions.loading.isBulkRegenLoading,
      isCreating: createTableMutation.isPending,
      isUpdating: updateTableMutation.isPending,
      isUpdatingStatus: updateStatusMutation.isPending,
      isRegenerating: false, // No longer used; regeneration loading in qrActions
    },
    
    // Toast
    toast: {
      show: showSuccessToast,
      message: toastMessage,
      type: toastType,
      onClose: () => setShowSuccessToast(false),
    },
    
    // Refs (from qrActions)
    qrPrintRef: qrActions.qrPrintRef,
    
    // Handlers
    handlers: {
      // Modal handlers
      openAddModal: handleOpenAddModal,
      closeAddModal: handleCloseAddModal,
      openEditModal: handleOpenEditModal,
      closeEditModal: handleCloseEditModal,
      openQRModal: handleOpenQRModal,
      closeQRModal: handleCloseQRModal,
      
      // CRUD handlers
      createTable: handleCreateTable,
      updateTable: handleUpdateTable,
      
      // Status handlers
      activateTable: handleActivateTable,
      deactivateTable: handleDeactivateTable,
      confirmStatusChange: handleConfirmStatusChange,
      cancelStatusChange: handleCancelStatusChange,
      
      // QR handlers (merged from qrActions)
      regenerateQR: qrActions.handlers.regenerateQR,
      downloadQR: qrActions.handlers.downloadQR,
      downloadAll: qrActions.handlers.downloadAll,
      bulkRegenerateQR: qrActions.handlers.bulkRegenerateQR,
      printQR: qrActions.handlers.printQR,
      
      // Edit handlers
      editTable: (table: Table) => {
        setSelectedTable(table);
        handleOpenEditModal();
      },
    },
  };
}

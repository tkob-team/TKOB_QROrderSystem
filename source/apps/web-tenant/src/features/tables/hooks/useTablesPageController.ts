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
  useLocations,
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
  const [activeOnly, setActiveOnly] = useState<boolean>(false);
  
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
    activeOnly,
  });

  const { data: locationsData } = useLocations();
  const locationOptions = useMemo(() => {
    // Normalize location strings to display format
    const normalizeLocation = (location: string): string => {
      if (!location) return '';
      
      const locationMap: Record<string, string> = {
        'indoor': 'Indoor',
        'Indoor': 'Indoor',
        'outdoor': 'Outdoor',
        'Outdoor': 'Outdoor',
        'patio': 'Patio',
        'Patio': 'Patio',
        'vip': 'VIP Room',
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
    // Map location string back to zone enum; default to 'indoor' if not recognized
    const locationToZone: Record<string, 'indoor' | 'outdoor' | 'patio' | 'vip'> = {
      'indoor': 'indoor',
      'Indoor': 'indoor',
      'outdoor': 'outdoor',
      'Outdoor': 'outdoor',
      'patio': 'patio',
      'Patio': 'patio',
      'vip': 'vip',
      'VIP Room': 'vip',
    };
    const zone = locationToZone[selectedTable.location] || 'indoor';
    // Extract number from tableNumber string (e.g., "Table 1" -> "1")
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

  // Helper to populate form data from a table (used by editTable handler)
  const populateFormDataFromTable = (table: Table) => {
    const locationToZone: Record<string, 'indoor' | 'outdoor' | 'patio' | 'vip'> = {
      'indoor': 'indoor',
      'Indoor': 'indoor',
      'outdoor': 'outdoor',
      'Outdoor': 'outdoor',
      'patio': 'patio',
      'Patio': 'patio',
      'vip': 'vip',
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
      originalTableNumber: table.tableNumber, // Store original format (e.g., "Bar 1", "Table 1", "VIP 2")
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
      const zoneToLocation: Record<'indoor' | 'outdoor' | 'patio' | 'vip', string> = {
        'indoor': 'Indoor',
        'outdoor': 'Outdoor',
        'patio': 'Patio',
        'vip': 'VIP Room',
      };
      
      const payload = {
        tableNumber: `Table ${formData.tableNumber}`,
        capacity: parseInt(formData.capacity),
        location: zoneToLocation[formData.zone],
        description: formData.description.trim() || undefined,
        displayOrder: parseInt(formData.tableNumber),
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
      const zoneToLocation: Record<'indoor' | 'outdoor' | 'patio' | 'vip', string> = {
        'indoor': 'Indoor',
        'outdoor': 'Outdoor',
        'patio': 'Patio',
        'vip': 'VIP Room',
      };
      
      const statusMap = {
        'available': 'AVAILABLE',
        'occupied': 'OCCUPIED',
        'reserved': 'RESERVED',
        'inactive': 'INACTIVE',
      } as const;
      
      // If table number hasn't changed, use the original format; otherwise use "Table X" format
      const tableNumberValue = formData.originalTableNumber && 
        formData.originalTableNumber.replace(/[^0-9]/g, '') === formData.tableNumber
        ? formData.originalTableNumber  // Keep original format (e.g., "Bar 1", "VIP 2")
        : `Table ${formData.tableNumber}`; // New format for changed table numbers
      
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
      activeOnly,
      setActiveOnly,
      locations: locationOptions,
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
        // Populate form data synchronously, not relying on selectedTable state update
        const newFormData = populateFormDataFromTable(table);
        setFormData(newFormData);
        setShowEditModal(true);
        setShowQRModal(false);
      },
    },
  };
}

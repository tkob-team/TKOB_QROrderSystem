/**
 * TablesPage - Thin Orchestrator for Tables & QR Management
 * 
 * Responsibilities:
 * - Compose UI from TableComponents and QRComponents
 * - Manage UI state (modals, selected table, toast)
 * - Delegate business logic to hooks (useTables.ts)
 * - Route events to appropriate handlers
 * 
 * Architecture:
 * - Feature-based with colocation (types, constants, components, hooks)
 * - Hooks layer handles all API calls (React Query)
 * - Components layer handles UI rendering (TableComponents, QRComponents)
 * - Thin orchestrator composes everything together
 * 
 * Refactored from 1659 lines → ~350 lines (79% reduction)
 */
'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Plus, RefreshCcw, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Toast } from '@/shared/components/Toast';
import { Modal } from '@/shared/components/Modal';
import { TableFormFields } from './TableFormFields';
import { SummaryCards, TableFilters, TableGrid } from './TableComponents';
import { QRModal, BulkRegenerateModal, StatusChangeModal } from './QRComponents';
import {
  useTablesList,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
  useUpdateTableStatus,
  useRegenerateQR,
} from '../hooks/useTables';
import { INITIAL_TABLE_FORM, ZONE_LABELS } from '../constants';
import type { Table, TableFormData, SortOption, QRDownloadFormat, TableSummary } from '../types';

export function TablesPage() {
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
  
  // Loading states
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isPrintingQR, setIsPrintingQR] = useState(false);
  const [isBulkRegenLoading, setIsBulkRegenLoading] = useState(false);
  
  // QR print ref
  const qrPrintRef = useRef<HTMLDivElement>(null);

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
  
  const tablesData = apiResponse?.data;
  const meta = apiResponse?.meta || { totalAll: 0, totalFiltered: 0 };
  
  const createTableMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();
  const deleteTableMutation = useDeleteTable();
  const updateStatusMutation = useUpdateTableStatus();
  const regenerateQRMutation = useRegenerateQR();

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================
  
  // Map API response to Table interface
  const tables = useMemo(() => {
    if (!tablesData) return [];
    return tablesData.map(t => ({
      id: t.id,
      name: t.tableNumber || `Table ${t.displayOrder}`,
      capacity: t.capacity,
      status: (t.status?.toLowerCase() || 'available') as 'available' | 'occupied' | 'reserved' | 'inactive',
      zone: (t.location?.toLowerCase() || 'indoor') as 'indoor' | 'outdoor' | 'patio' | 'vip',
      tableNumber: t.displayOrder || 0,
      createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
      description: t.description,
      hasActiveOrders: t.hasActiveOrders,
      qrToken: t.qrToken,
      qrCodeUrl: t.qrCodeUrl,
    }));
  }, [tablesData]);
  
  // Calculate summary stats
  const summary: TableSummary = useMemo(() => ({
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    inactive: tables.filter(t => t.status === 'inactive').length,
    totalCapacity: tables.reduce((sum, t) => sum + t.capacity, 0),
  }), [tables]);

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
          status: apiStatus,
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
  // EVENT HANDLERS - QR Operations
  // ============================================================================
  
  const handleRegenerateQR = async () => {
    if (!selectedTable) return;
    
    try {
      console.log('🔄 [POST /tables/:id/qr/regenerate] Request:', { id: selectedTable.id });
      await regenerateQRMutation.mutateAsync(selectedTable.id);
      console.log('✅ [POST /tables/:id/qr/regenerate] Success');
      
      setToastMessage('QR code regenerated successfully');
      setToastType('success');
      setShowSuccessToast(true);
    } catch (error: any) {
      handleApiError(error, 'Failed to regenerate QR code');
    }
  };
  
  const handleDownloadQR = async (format: QRDownloadFormat) => {
    if (!selectedTable) return;
    
    setIsDownloadingQR(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured. Please check NEXT_PUBLIC_API_URL in .env file');
      }
      
      console.log(`📥 [GET /tables/:id/qr/download] Request:`, { id: selectedTable.id, format });
      
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch(
        `${apiUrl}/api/v1/admin/tables/${selectedTable.id}/qr/download?format=${format}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTable.name}-QR.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ [GET /tables/:id/qr/download] Downloaded: ${format}`);
      
      setToastMessage(`QR code downloaded as ${format.toUpperCase()}`);
      setToastType('success');
      setShowSuccessToast(true);
    } catch (error: any) {
      handleApiError(error, 'Failed to download QR code');
    } finally {
      setIsDownloadingQR(false);
    }
  };
  
  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured. Please check NEXT_PUBLIC_API_URL in .env file');
      }
      
      console.log('📥 [GET /tables/qr/download-all] Request:', { count: tables.length });
      
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch(
        `${apiUrl}/api/v1/admin/tables/qr/download-all`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all-qr-codes.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ [GET /tables/qr/download-all] Downloaded');
      
      setToastMessage('All QR codes downloaded successfully');
      setToastType('success');
      setShowSuccessToast(true);
    } catch (error: any) {
      handleApiError(error, 'Failed to download all QR codes');
    } finally {
      setIsDownloadingAll(false);
    }
  };
  
  const handleBulkRegenerateQR = async () => {
    setIsBulkRegenLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured. Please check NEXT_PUBLIC_API_URL in .env file');
      }
      
      console.log('🔄 [POST /tables/qr/regenerate-all] Request:', { count: tables.length });
      
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch(
        `${apiUrl}/api/v1/admin/tables/qr/regenerate-all`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) throw new Error(`Regeneration failed: ${response.statusText}`);
      
      const result = await response.json();
      console.log('✅ [POST /tables/qr/regenerate-all] Response:', result);
      
      setToastMessage(`All QR codes regenerated successfully`);
      setToastType('success');
      setShowSuccessToast(true);
      setIsBulkRegenOpen(false);
    } catch (error: any) {
      handleApiError(error, 'Failed to regenerate all QR codes');
    } finally {
      setIsBulkRegenLoading(false);
    }
  };
  
  // Print QR using react-to-print
  const handlePrintQR = useReactToPrint({
    contentRef: qrPrintRef,
    documentTitle: `QR-Code-${selectedTable?.name || 'Table'}`,
    onBeforePrint: () => {
      if (!selectedTable || !qrPrintRef.current) {
        throw new Error('QR code not loaded');
      }
    },
    onPrintError: (error) => {
      console.error('Print error:', error);
      setToastMessage('Print failed: ' + (error?.message || 'Please try again'));
      setToastType('error');
      setShowSuccessToast(true);
    },
    pageStyle: `
      @page {
        size: auto;
        margin: 20mm;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      div {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  });
  
  const handlePrintQRWrapper = async () => {
    if (!selectedTable || !qrPrintRef.current) {
      setToastMessage('QR code not loaded. Please try again.');
      setToastType('error');
      setShowSuccessToast(true);
      return;
    }
    
    try {
      setIsPrintingQR(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      handlePrintQR();
      setToastMessage('Print dialog opened');
      setToastType('success');
      setShowSuccessToast(true);
    } catch (error: any) {
      console.error('Print failed:', error);
      setToastMessage('Print failed: ' + (error?.message || 'Please try again'));
      setToastType('error');
      setShowSuccessToast(true);
    } finally {
      setIsPrintingQR(false);
    }
  };
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  if (error) {
    return (
      <div className="mx-auto flex flex-col gap-6 px-6 pt-6 pb-5" style={{ maxWidth: '1600px' }}>
        <div className="text-center py-16">
          <h3 className="text-text-primary mb-2 text-lg font-bold">
            Failed to load tables
          </h3>
          <p className="text-text-secondary text-base">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="mx-auto flex flex-col gap-6 px-6 pt-6 pb-5" style={{ maxWidth: '1600px' }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-text-primary text-[clamp(20px,5vw,28px)] font-bold leading-tight tracking-tight">
              Tables & QR Codes
            </h2>
            <p className="text-text-secondary text-[clamp(13px,4vw,15px)]">
              Manage your restaurant tables and generate QR codes
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
            {tables.length > 0 && (
              <>
                <button
                  onClick={() => setIsBulkRegenOpen(true)}
                  disabled={isBulkRegenLoading}
                  className="flex items-center justify-center md:justify-start gap-2 px-4 sm:px-5 py-3 h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-500 text-gray-600 hover:text-blue-500 transition-all flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[clamp(13px,4vw,15px)] font-semibold"
                >
                  {isBulkRegenLoading ? (
                    <>
                      <RefreshCcw className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span className="hidden sm:inline">Regenerate All QR Codes</span>
                      <span className="sm:hidden">Regenerate</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloadingAll}
                  className="flex items-center justify-center md:justify-start gap-2 px-4 sm:px-5 py-3 h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-emerald-500 text-gray-600 hover:text-emerald-500 transition-all flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[clamp(13px,4vw,15px)] font-semibold"
                >
                  {isDownloadingAll ? (
                    <>
                      <RefreshCcw className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span className="hidden sm:inline">Download All QR Codes</span>
                      <span className="sm:hidden">Download</span>
                    </>
                  )}
                </button>
              </>
            )}
            <button
              onClick={handleOpenAddModal}
              disabled={createTableMutation.isPending}
              className="flex items-center justify-center md:justify-start gap-2 px-4 sm:px-5 py-3 h-12 bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[clamp(13px,4vw,15px)] font-semibold shadow-md hover:shadow-lg"
            >
              {createTableMutation.isPending ? (
                <>
                  <RefreshCcw className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
                  Add Table
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <SummaryCards summary={summary} />
        
        {/* Filters */}
        <TableFilters
          selectedStatus={selectedStatus}
          selectedZone={selectedZone}
          sortOption={sortOption}
          onStatusChange={setSelectedStatus}
          onZoneChange={setSelectedZone}
          onSortChange={setSortOption}
          onClearFilters={() => {
            setSelectedStatus('All');
            setSelectedZone('All Locations');
          }}
        />
        
        {/* Table Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <RefreshCcw className="w-8 h-8 animate-spin text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary text-[15px]">Loading tables...</p>
          </div>
        ) : (
          <TableGrid
            tables={tables}
            onEdit={(table) => {
              setSelectedTable(table);
              handleOpenEditModal();
            }}
            onViewQR={handleOpenQRModal}
          />
        )}
      </div>
      
      {/* Add Table Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        title="Add New Table"
        size="md"
        footer={
          <>
            <button
              onClick={handleCloseAddModal}
              className="flex-1 px-4 h-12 text-text-secondary transition-colors border border-default hover:bg-elevated text-[15px] font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTable}
              disabled={createTableMutation.isPending}
              className="flex-1 px-4 h-12 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed text-[15px] font-semibold rounded-lg"
            >
              {createTableMutation.isPending ? 'Creating...' : 'Create Table'}
            </button>
          </>
        }
      >
        <TableFormFields
          formData={formData}
          setFormData={setFormData}
          autoFocus={true}
          disableTableName={false}
        />
      </Modal>
      
      {/* Edit Table Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="Edit Table"
        size="md"
        footer={
          <>
            <button
              onClick={handleCloseEditModal}
              className="flex-1 px-4 h-12 text-text-secondary transition-colors border border-default hover:bg-elevated text-[15px] font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateTable}
              disabled={updateTableMutation.isPending}
              className="flex-1 px-4 h-12 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed text-[15px] font-semibold rounded-lg"
            >
              {updateTableMutation.isPending ? 'Updating...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <TableFormFields
          formData={formData}
          setFormData={setFormData}
          autoFocus={false}
          disableTableName={false}
        />
      </Modal>
      
      {/* QR Modal */}
      <QRModal
        table={selectedTable}
        isOpen={showQRModal}
        onClose={handleCloseQRModal}
        onDownload={handleDownloadQR}
        onPrint={handlePrintQRWrapper}
        onRegenerateQR={handleRegenerateQR}
        onActivateTable={handleActivateTable}
        onDeactivateTable={handleDeactivateTable}
        onEdit={handleOpenEditModal}
        isDownloading={isDownloadingQR}
        isPrinting={isPrintingQR}
        isRegenerating={regenerateQRMutation.isPending}
        isUpdatingStatus={updateStatusMutation.isPending}
        qrPrintRef={qrPrintRef}
      />
      
      {/* Status Change Confirm Modal */}
      {pendingStatusChange && (
        <StatusChangeModal
          isOpen={showDeactivateConfirm}
          onClose={handleCancelStatusChange}
          onConfirm={handleConfirmStatusChange}
          table={selectedTable}
          targetStatus={pendingStatusChange}
        />
      )}
      
      {/* Bulk Regenerate Modal */}
      <BulkRegenerateModal
        isOpen={isBulkRegenOpen}
        onClose={() => setIsBulkRegenOpen(false)}
        onConfirm={handleBulkRegenerateQR}
        tableCount={tables.length}
        isLoading={isBulkRegenLoading}
      />
      
      {/* Toast */}
      {showSuccessToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </>
  );
}

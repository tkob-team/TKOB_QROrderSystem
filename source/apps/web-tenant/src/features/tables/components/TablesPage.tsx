'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger';
import './TablesPage.css';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'react-qr-code';
import { saveAs } from 'file-saver';
import { Card, Badge, Toast, Modal } from '@/shared/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@packages/ui';
import { Table as ShadcnTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@packages/ui';
import { TableFormFields } from './TableFormFields';
import { Plus, X, QrCode, Users, Download, Printer, Edit, RefreshCcw } from 'lucide-react';
import {
  useTablesList,
  useTableById,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
  useUpdateTableStatus,
  useRegenerateQR,
} from '@/features/tables/hooks/useTables';

interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'inactive';
  zone: 'indoor' | 'outdoor' | 'patio' | 'vip';
  tableNumber: number;
  createdAt: Date;
  description?: string;
  hasActiveOrders?: boolean;
  qrToken?: string;
  qrCodeUrl?: string;
}

export function TablesPage() {
  const queryClient = useQueryClient();
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  
  // Toast states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [pendingStatusChange, setPendingStatusChange] = useState<'available' | 'occupied' | 'reserved' | 'inactive' | null>(null);
  
  // Loading states
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isFetchingTableDetails, setIsFetchingTableDetails] = useState(false);
  const [isPrintingQR, setIsPrintingQR] = useState(false);
  const [isBulkRegenOpen, setIsBulkRegenOpen] = useState(false);
  const [isBulkRegenLoading, setIsBulkRegenLoading] = useState(false);
  
  // QR Code printing ref
  const qrPrintRef = useRef<HTMLDivElement>(null);
  
  // QR Code printing with error handling
  const handlePrintQR = useReactToPrint({
    contentRef: qrPrintRef,
    documentTitle: `QR-Code-${selectedTable?.name || 'Table'}`,
    onBeforePrint: () => {
      // Validate that content exists before printing
      if (!qrPrintRef.current) {
        throw new Error('QR code content not found. Please try again.');
      }
      const svg = qrPrintRef.current.querySelector('svg');
      if (!svg) {
        throw new Error('QR code SVG not found. Please try again.');
      }
    },
    onPrintError: (error: any) => {
      console.error('Print error details:', error);
      setToastMessage('Print failed: ' + (error?.message || 'Unknown error. Please try again.'));
      setToastType('error');
      setShowSuccessToast(true);
    },
    pageStyle: `
      @page {
        margin: 0;
        size: A4;
      }
      body {
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }
      div {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  });

  // QR Code download as image (optimized for quality & size balance)
  const handleDownloadQRImage = async () => {
    if (!selectedTable || !qrPrintRef.current) return;
    
    try {
      setIsDownloadingQR(true);
      // Find SVG in the QR code ref
      const svg = qrPrintRef.current.querySelector('svg');
      if (!svg) throw new Error('QR code SVG not found');
      
      // Get actual SVG dimensions
      const viewBox = svg.getAttribute('viewBox');
      const [, , vbWidth, vbHeight] = viewBox?.split(' ').map(Number) || [0, 0, 256, 256];
      
      // 6x scale for high-quality 300x300 output (256 * 6 = 1536px internally, compressed to ~300px visible)
      const scale = 6;
      const canvas = document.createElement('canvas');
      canvas.width = vbWidth * scale;
      canvas.height = vbHeight * scale;
      
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('Failed to get canvas context');
      
      // Set background to white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create image from SVG
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        
        // Convert to PNG with optimal compression
        // PNG uses lossless compression, so quality is preserved
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`📦 QR Code Image: ${(blob.size / 1024).toFixed(1)}KB`);
              saveAs(blob, `table-${selectedTable.tableNumber}.png`);
            }
            setIsDownloadingQR(false);
          },
          'image/png'
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        throw new Error('Failed to load SVG image');
      };
      img.src = url;
    } catch (error) {
      console.error('Failed to download QR code:', error);
      setIsDownloadingQR(false);
    }
  };

  // Print wrapper with state management
  const handlePrintQRWrapper = async () => {
    if (!selectedTable || !qrPrintRef.current) {
      setToastMessage('QR code not loaded. Please try again.');
      setToastType('error');
      setShowSuccessToast(true);
      return;
    }

    try {
      setIsPrintingQR(true);
      // Wait a moment to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Trigger the print (useReactToPrint returns a sync callback, not a Promise)
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
  
  // Filter and sort state
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All Locations');
  const [sortOption, setSortOption] = useState('Sort by: Table Number (Ascending)');
  
  // Clear all filters handler
  const clearFilters = () => {
    setSelectedStatus('All');
    setSelectedZone('All Locations');
    // Filters will auto-refetch via React Query when state changes
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    zone: 'indoor',
    tableNumber: '',
    status: 'available' as 'available' | 'occupied' | 'reserved' | 'inactive',
    description: '',
  });

  // React Query hooks - Backend-Driven filtering & sorting
  const statusFilter = selectedStatus !== 'All' 
    ? selectedStatus.toUpperCase().replace(' ', '_') as 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE'
    : undefined;
  
  const locationFilter = selectedZone !== 'All Locations' ? selectedZone : undefined;
  
  // Map frontend sortOption to backend sortBy/sortOrder - memoized to avoid unnecessary re-renders
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
  
  // Call API with all backend-driven filtering and sorting params
  const { data: apiResponse, isLoading, error } = useTablesList({
    status: statusFilter,
    location: locationFilter,
    sortBy: sortParams.sortBy,
    sortOrder: sortParams.sortOrder,
  });
  
  // Extract data and metadata from response
  const tablesData = apiResponse?.data;
  const meta = apiResponse?.meta || { totalAll: 0, totalFiltered: 0 };
  
  // Debug logging
  React.useEffect(() => {
    console.log('📊 [TablesPage] Backend-Driven Query:', {
      statusFilter,
      locationFilter,
      sortBy: sortParams.sortBy,
      sortOrder: sortParams.sortOrder,
      isLoading,
      hasError: !!error,
      receivedTablesCount: tablesData?.length || 0,
      tableLocations: tablesData?.map(t => ({ id: t.id, location: t.location })) || [],
      errorDetails: error,
      tablesDataType: typeof tablesData,
      tablesDataIsArray: Array.isArray(tablesData),
      dataCount: tablesData?.length || 0,
      meta,
    });
    if (error) {
      console.error('❌ [TablesPage] API Error:', error);
    }
    if (tablesData) {
      console.log('✅ [TablesPage] Backend returned filtered & sorted data:', tablesData);
    }
  }, [tablesData, isLoading, error, statusFilter, locationFilter, sortParams, meta]);
  
  const createTableMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();
  const deleteTableMutation = useDeleteTable();
  const updateStatusMutation = useUpdateTableStatus();
  const regenerateQRMutation = useRegenerateQR();

  // Standardized error handler
  const handleApiError = (error: any, defaultMessage: string) => {
    const errorMessage = error?.response?.data?.error?.message || error?.message || defaultMessage;
    console.error('❌ API Error:', error);
    setToastMessage(errorMessage);
    setToastType('error');
    setShowSuccessToast(true);
  };

  // Map API response to component's Table interface
  // Backend returns already filtered & sorted data - no additional processing needed
  const tables = useMemo(() => {
    if (!tablesData) return [];
    return tablesData.map(t => ({
      id: t.id || 'unknown',
      name: t.tableNumber || 'Unnamed',
      capacity: t.capacity || 0,
      status: (t.status === 'AVAILABLE' ? 'available' 
        : t.status === 'OCCUPIED' ? 'occupied' 
        : t.status === 'RESERVED' ? 'reserved' 
        : 'inactive') as 'available' | 'occupied' | 'reserved' | 'inactive',
      zone: ((t.location || 'indoor').toLowerCase()) as 'indoor' | 'outdoor' | 'patio' | 'vip',
      tableNumber: parseInt((t.tableNumber || '0').replace(/\D/g, '')) || 0,
      createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
      description: t.description || '',
      hasActiveOrders: t.status === 'OCCUPIED',
      qrToken: t.qrToken, // Map qrToken from API response
      qrCodeUrl: t.qrCodeUrl, // Map qrCodeUrl from API response
    }));
  }, [tablesData]);

  const handleAddTable = async () => {
    // Validate required fields
    if (!formData.tableNumber || !formData.capacity) {
      setToastMessage('Please fill in all required fields');
      setToastType('error');
      setShowSuccessToast(true);
      return;
    }

    // Check if table number already exists
    const tableNumberExists = tables.some(
      table => table.tableNumber === parseInt(formData.tableNumber)
    );

    if (tableNumberExists) {
      setToastMessage('Table number already exists');
      setToastType('error');
      setShowSuccessToast(true);
      return;
    }

    // Use mutation to create table
    try {
      const payload = {
        tableNumber: `Table ${formData.tableNumber}`,
        capacity: parseInt(formData.capacity),
        location: formData.zone.toLowerCase(), // Send lowercase - backend will normalize
        description: formData.description,
        displayOrder: parseInt(formData.tableNumber),
      };
      
      console.log('🆕 Creating Table - Request:', payload);
      
      const result = await createTableMutation.mutateAsync(payload);
      
      console.log('✅ Table Created - Response:', result);
      
      setToastMessage('Table created successfully');
      setToastType('success');
      setShowSuccessToast(true);
      handleCloseAddModal();
    } catch (error: any) {
      console.error('❌ Create Table Error:', error);
      setToastMessage(error?.message || 'Failed to create table');
      setToastType('error');
      setShowSuccessToast(true);
    }
  };

  const handleOpenQRModal = (table: Table) => {
    setSelectedTable(table);
    setShowQRModal(true);
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setSelectedTable(null);
  };

  const handleOpenAddModal = () => {
    setFormData({ name: '', capacity: '', zone: 'indoor', tableNumber: '', status: 'available', description: '' });
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({ name: '', capacity: '', zone: 'indoor', tableNumber: '', status: 'available', description: '' });
  };

  const handleOpenEditModal = async () => {
    if (!selectedTable) return;
    
    setIsFetchingTableDetails(true);
    try {
      console.log('🔍 [GET /tables/:id] Request:', { id: selectedTable.id });
      
      // Fetch fresh data from server
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/tables/${selectedTable.id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      
      if (!response.ok) throw new Error(`Failed to fetch table: ${response.statusText}`);
      
      const result = await response.json();
      const freshTable = result.data;
      
      console.log('✅ [GET /tables/:id] Response:', freshTable);
      
      // Map fresh data to component format
      const mappedTable = {
        id: freshTable.id,
        name: freshTable.tableNumber,
        capacity: freshTable.capacity,
        status: (freshTable.status === 'AVAILABLE' ? 'available' 
          : freshTable.status === 'OCCUPIED' ? 'occupied'
          : freshTable.status === 'RESERVED' ? 'reserved'
          : 'inactive') as 'available' | 'occupied' | 'reserved' | 'inactive',
        zone: freshTable.location?.toLowerCase() || 'indoor',
        tableNumber: parseInt(freshTable.tableNumber?.replace('Table ', '') || '0'),
        description: freshTable.description || '',
      };
      
      // Update selectedTable with fresh data
      setSelectedTable(mappedTable);
      
      // Set form data
      setFormData({
        name: mappedTable.name,
        capacity: mappedTable.capacity.toString(),
        zone: mappedTable.zone,
        tableNumber: mappedTable.tableNumber.toString(),
        status: mappedTable.status,
        description: mappedTable.description || '',
      });
      
      setShowEditModal(true);
      setShowQRModal(false);
    } catch (error: any) {
      handleApiError(error, 'Failed to fetch table details');
    } finally {
      setIsFetchingTableDetails(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setFormData({ name: '', capacity: '', zone: 'indoor', tableNumber: '', status: 'available', description: '' });
  };

  const handleEditTable = async () => {
    if (!selectedTable) return;

    // Validate required fields
    if (!formData.tableNumber || !formData.capacity) {
      setToastMessage('Please fill in all required fields');
      setToastType('error');
      setShowSuccessToast(true);
      return;
    }

    // Validate capacity is positive
    if (parseInt(formData.capacity) <= 0) {
      setToastMessage('Capacity must be a positive number');
      setToastType('error');
      setShowSuccessToast(true);
      return;
    }

    // Check if table number already exists (excluding current table)
    const tableNumberExists = tables.some(
      table => table.id !== selectedTable.id && table.tableNumber === parseInt(formData.tableNumber)
    );

    if (tableNumberExists) {
      setToastMessage('Table number already exists');
      setToastType('error');
      setShowSuccessToast(true);
      return;
    }

    // Check if status is changing to/from inactive
    const isStatusChanging = selectedTable.status !== formData.status;
    const isDeactivating = selectedTable.status !== 'inactive' && formData.status === 'inactive';
    const isReactivating = selectedTable.status === 'inactive' && formData.status !== 'inactive';

    if (isStatusChanging && (isDeactivating || isReactivating)) {
      setPendingStatusChange(formData.status);
      setShowDeactivateConfirm(true);
      return;
    }

    await performTableUpdate();
  };

  const performTableUpdate = async () => {
    if (!selectedTable) return;

    try {
      // Map status to API format
      const apiStatus = formData.status === 'available' ? 'AVAILABLE'
        : formData.status === 'occupied' ? 'OCCUPIED'
        : formData.status === 'reserved' ? 'RESERVED'
        : 'INACTIVE';

      const payload = {
        id: selectedTable.id,
        data: {
          tableNumber: `Table ${formData.tableNumber}`,
          capacity: parseInt(formData.capacity),
          location: formData.zone.toLowerCase(), // Send lowercase - backend will normalize
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

  const handleConfirmStatusChange = async () => {
    if (!selectedTable || !pendingStatusChange) return;
    
    setShowDeactivateConfirm(false);
    const statusToSet = pendingStatusChange.toUpperCase() as 'INACTIVE' | 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
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
      // Revert form status on error
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

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      console.log('📥 [GET /tables/qr/download-all] Request:', { count: tables.length });
      
      // Call API endpoint for ZIP download
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/tables/qr/download-all`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      
      if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-qr-codes-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ [GET /tables/qr/download-all] Downloaded ${tables.length} QR codes`);
      
      setToastMessage(`Downloaded ${tables.length} QR codes`);
      setToastType('success');
      setShowSuccessToast(true);
    } catch (error: any) {
      handleApiError(error, 'Failed to download QR codes');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleRegenerateQR = async () => {
    if (!selectedTable) return;
    
    try {
      console.log('🔄 [POST /tables/:id/qr/generate] Request:', { id: selectedTable.id });
      const result = await regenerateQRMutation.mutateAsync(selectedTable.id);
      console.log('✅ [POST /tables/:id/qr/generate] Response:', result);
      
      // Update qrToken from response to display new QR code
      setSelectedTable(prev => prev ? {
        ...prev,
        qrToken: result.qrToken, // Update with new token
      } : null);
      console.log('✅ QR Token regenerated:', result.qrToken);
      
      setToastMessage(`QR code regenerated for ${selectedTable.name}`);
      setToastType('success');
      setShowSuccessToast(true);
    } catch (error: any) {
      handleApiError(error, 'Failed to regenerate QR code');
    }
  };

  const handleBulkRegenerateQR = async () => {
    setIsBulkRegenLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const endpoint = `${apiUrl}/api/v1/admin/tables/qr/regenerate-all`;
      
      logger.log('🔄 [Bulk Regenerate QR] Starting...');
      logger.log('📍 Endpoint:', endpoint);
      logger.log('🔐 Token length:', token.length);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      logger.log('📡 Response status:', response.status, response.statusText);
      logger.log('📡 Response headers:', {
        'content-type': response.headers.get('content-type'),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData: any = {};
        
        try {
          if (contentType?.includes('application/json')) {
            errorData = await response.json();
          } else {
            const text = await response.text();
            logger.log('📡 Response body (non-JSON):', text.substring(0, 500));
            errorData = { message: `Server error ${response.status}: ${response.statusText}` };
          }
        } catch (parseErr) {
          logger.error('Failed to parse error response:', parseErr);
          errorData = { message: `Server error ${response.status}` };
        }
        
        logger.error('❌ API Error Response:', errorData);
        throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Handle both direct response and wrapped response
      const successCount = result.data?.successCount || result.successCount || result.data?.totalProcessed || result.totalProcessed || 0;
      
      setToastMessage(`✅ Bulk QR regeneration completed for ${successCount} table(s)`);
      setToastType('success');
      setShowSuccessToast(true);
      setIsBulkRegenOpen(false);
      
      // Refresh tables list to get updated QR tokens
      await queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
    } catch (error: any) {
      logger.error('❌ Bulk regenerate error:', {
        message: error?.message,
        stack: error?.stack,
        error,
      });
      const errorMessage = error?.message || 'Failed to regenerate all QR codes';
      setToastMessage(`❌ ${errorMessage}`);
      setToastType('error');
      setShowSuccessToast(true);
    } finally {
      setIsBulkRegenLoading(false);
    }
  };

  const handleActivateTable = async () => {
    if (!selectedTable) return;
    
    // Optimistic update
    const previousStatus = selectedTable.status;
    setSelectedTable({ ...selectedTable, status: 'available' });
    
    try {
      const payload = { id: selectedTable.id, status: 'AVAILABLE' as const };
      console.log('🔄 [PATCH /tables/:id/status] Activate Request:', payload);
      
      const result = await updateStatusMutation.mutateAsync(payload);
      console.log('✅ [PATCH /tables/:id/status] Activate Response:', result);
      
      setToastMessage(`${selectedTable.name} activated successfully`);
      setToastType('success');
      setShowSuccessToast(true);
    } catch (error: any) {
      // Rollback optimistic update on error
      setSelectedTable({ ...selectedTable, status: previousStatus });
      handleApiError(error, 'Failed to activate table');
    }
  };

  const handleDeactivateTable = async () => {
    if (!selectedTable) return;

    // Show confirmation dialog (allow deactivation for all statuses)
    setPendingStatusChange('inactive');
    setShowDeactivateConfirm(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedTable) return;
    
    setShowDeactivateConfirm(false);
    
    // Optimistic update
    const previousStatus = selectedTable.status;
    setSelectedTable({ ...selectedTable, status: 'inactive' });
    
    try {
      const payload = { id: selectedTable.id, status: 'INACTIVE' as const };
      console.log('🔄 [handleConfirmDeactivate] Full payload:', JSON.stringify(payload, null, 2));
      console.log('🔄 [handleConfirmDeactivate] Payload id:', payload.id);
      console.log('🔄 [handleConfirmDeactivate] Payload status:', payload.status);
      console.log('🔄 [handleConfirmDeactivate] Selected table:', selectedTable);
      
      const result = await updateStatusMutation.mutateAsync(payload);
      console.log('✅ [handleConfirmDeactivate] Success response:', result);
      
      setToastMessage(`${selectedTable.name} deactivated successfully`);
      setToastType('success');
      setShowSuccessToast(true);
    } catch (error: any) {
      // Rollback optimistic update on error
      console.error('❌ [handleConfirmDeactivate] Error caught:', error);
      console.error('❌ [handleConfirmDeactivate] Error response:', error.response);
      console.error('❌ [handleConfirmDeactivate] Error data:', error.response?.data);
      console.error('❌ [handleConfirmDeactivate] Error status:', error.response?.status);
      setSelectedTable({ ...selectedTable, status: previousStatus });
      handleApiError(error, 'Failed to deactivate table');
    }
    
    setPendingStatusChange(null);
  };

  const handleDownloadQR = async (format: 'png' | 'pdf') => {
    if (!selectedTable) return;
    
    setIsDownloadingQR(true);
    try {
      console.log(`📥 [GET /tables/:id/qr/download] Request:`, { id: selectedTable.id, format });
      
      // Call API endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/tables/${selectedTable.id}/qr/download?format=${format}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
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

  const handleDownloadPNG = () => {
    if (selectedTable) {
      setToastMessage(`QR code (PNG) for ${selectedTable.name} downloaded`);
      setToastType('success');
      setShowSuccessToast(true);
    }
  };

  const handleDownloadPDF = () => {
    if (selectedTable) {
      setToastMessage(`QR code (PDF) for ${selectedTable.name} downloaded`);
      setToastType('success');
      setShowSuccessToast(true);
    }
  };

  // Helper functions
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return { variant: 'success' as const, label: 'Available', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' };
      case 'occupied':
        return { variant: 'warning' as const, label: 'Occupied', color: 'bg-amber-100 text-amber-700 border-amber-300' };
      case 'reserved':
        return { variant: 'info' as const, label: 'Reserved', color: 'bg-blue-100 text-blue-700 border-blue-300' };
      case 'inactive':
        return { variant: 'neutral' as const, label: 'Inactive', color: 'bg-gray-100 text-gray-700 border-gray-300' };
      default:
        return { variant: 'neutral' as const, label: 'Unknown', color: 'bg-gray-100 text-gray-700 border-gray-300' };
    }
  };

  const getZoneLabel = (zone: string) => {
    switch (zone) {
      case 'indoor':
        return 'Indoor';
      case 'outdoor':
        return 'Outdoor';
      case 'patio':
        return 'Patio';
      case 'vip':
        return 'VIP Room';
      default:
        return zone;
    }
  };

  // Backend-Driven: No need for client-side filtering/sorting
  // Backend returns already filtered & sorted data based on params

  return (
    <>
      <div className="mx-auto flex flex-col gap-6 px-6 pt-6 pb-5" style={{ maxWidth: '1600px' }}>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-gray-900" style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 700, lineHeight: '1.2', letterSpacing: '-0.02em' }}>
                Tables & QR Codes
              </h2>
              <p className="text-gray-600" style={{ fontSize: 'clamp(13px, 4vw, 15px)' }}>
                Manage your restaurant tables and generate QR codes
              </p>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
              {tables.length > 0 && (
                <>
                  <button
                    onClick={() => setIsBulkRegenOpen(true)}
                    disabled={isBulkRegenLoading}
                    className="flex items-center justify-center md:justify-start gap-2 px-4 sm:px-5 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-700 transition-all flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      fontSize: 'clamp(13px, 4vw, 15px)', 
                      fontWeight: 600, 
                      height: '48px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
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
                    className="flex items-center justify-center md:justify-start gap-2 px-4 sm:px-5 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-emerald-500 text-gray-700 hover:text-emerald-700 transition-all flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      fontSize: 'clamp(13px, 4vw, 15px)', 
                      fontWeight: 600, 
                      height: '48px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
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
                className="flex items-center justify-center md:justify-start gap-2 px-4 sm:px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white transition-all flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  fontSize: 'clamp(13px, 4vw, 15px)', 
                  fontWeight: 600, 
                  height: '48px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
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

          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 sm:p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p className="text-gray-500 mb-1" style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 500 }}>Total Tables</p>
              <p className="text-gray-900" style={{ fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: 700 }}>{tables.length}</p>
            </Card>
            <Card className="p-4 sm:p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p className="text-gray-500 mb-1" style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 500 }}>Available</p>
              <p className="text-emerald-600" style={{ fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: 700 }}>
                {tables.filter(t => t.status === 'available').length}
              </p>
            </Card>
            <Card className="p-4 sm:p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p className="text-gray-500 mb-1" style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 500 }}>Occupied</p>
              <p className="text-amber-600" style={{ fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: 700 }}>
                {tables.filter(t => t.status === 'occupied').length}
              </p>
            </Card>
            <Card className="p-4 sm:p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p className="text-gray-500 mb-1" style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 500 }}>Total Capacity</p>
              <p className="text-gray-900" style={{ fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: 700 }}>
                {tables.reduce((sum, t) => sum + t.capacity, 0)}
              </p>
            </Card>
          </div>

          {/* Filter and Sort */}
          <div className="flex flex-col md:flex-row lg:flex-nowrap md:items-center gap-3 md:gap-4 mb-4">
            <div className="relative flex-1 md:flex-none md:min-w-40 sm:min-w-45 lg:flex-none lg:min-w-fit">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 md:px-4 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
                style={{ fontSize: 'clamp(13px, 4vw, 15px)', borderRadius: '4px', height: '48px' }}
              >
                <option value="All">All Statuses</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="relative flex-1 md:flex-none md:min-w-40 sm:min-w-45 lg:flex-none lg:min-w-fit">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-3 md:px-4 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
                style={{ fontSize: 'clamp(13px, 4vw, 15px)', borderRadius: '4px', height: '48px' }}
              >
                <option value="All Locations">All Locations</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="patio">Patio</option>
                <option value="vip">VIP</option>
              </select>
            </div>

            <div className="relative flex-1 md:flex-none md:min-w-40 sm:min-w-45 lg:flex-none lg:min-w-fit">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-3 md:px-4 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
                style={{ fontSize: 'clamp(13px, 4vw, 15px)', borderRadius: '4px', height: '48px' }}
              >
                <option value="Sort by: Table Number (Ascending)">Sort by: Table Number (Ascending)</option>
                <option value="Sort by: Capacity (Ascending)">Sort by: Capacity (Ascending)</option>
                <option value="Sort by: Capacity (Descending)">Sort by: Capacity (Descending)</option>
                <option value="Sort by: Creation Date (Newest)">Sort by: Creation Date (Newest)</option>
              </select>
            </div>
          </div>

          {/* Tables Grid */}
          {isLoading ? (
            <Card className="p-8 sm:p-12 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded-md flex items-center justify-center mb-4 animate-pulse">
                  <QrCode className="w-8 sm:w-10 h-8 sm:h-10 text-gray-400" />
                </div>
                <p className="text-gray-600" style={{ fontSize: 'clamp(13px, 4vw, 15px)' }}>
                  Loading tables...
                </p>
              </div>
            </Card>
          ) : error ? (
            <Card className="p-8 sm:p-12 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-red-100 rounded-md flex items-center justify-center mb-4">
                  <X className="w-8 sm:w-10 h-8 sm:h-10 text-red-400" />
                </div>
                <h4 className="text-gray-900 mb-2" style={{ fontSize: 'clamp(16px, 5vw, 18px)', fontWeight: 600 }}>
                  Failed to load tables
                </h4>
                <p className="text-gray-600 mb-6" style={{ fontSize: 'clamp(13px, 4vw, 15px)' }}>
                  {error?.message || 'An error occurred while loading tables'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                  style={{ fontSize: 'clamp(13px, 4vw, 15px)', fontWeight: 600, borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                  <RefreshCcw className="w-4 sm:w-5 h-4 sm:h-5 inline-block mr-2" />
                  Retry
                </button>
              </div>
            </Card>
          ) : meta.totalAll === 0 ? (
            <Card className="p-8 sm:p-12 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded-md flex items-center justify-center mb-4">
                  <QrCode className="w-8 sm:w-10 h-8 sm:h-10 text-gray-400" />
                </div>
                <h4 className="text-gray-900 mb-2" style={{ fontSize: 'clamp(16px, 5vw, 18px)', fontWeight: 600 }}>
                  No tables yet
                </h4>
                <p className="text-gray-600 mb-6" style={{ fontSize: 'clamp(13px, 4vw, 15px)' }}>
                  Add your first table to get started with QR code ordering
                </p>
                <button
                  onClick={handleOpenAddModal}
                  disabled={createTableMutation.isPending}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: 'clamp(13px, 4vw, 15px)', fontWeight: 600, borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                  {createTableMutation.isPending ? (
                    <>
                      <RefreshCcw className="w-4 sm:w-5 h-4 sm:h-5 inline-block mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 sm:w-5 h-4 sm:h-5 inline-block mr-2" />
                      Add Table
                    </>
                  )}
                </button>
              </div>
            </Card>
          ) : meta.totalFiltered === 0 ? (
            <Card className="p-8 sm:p-12 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-amber-100 rounded-md flex items-center justify-center mb-4">
                  <QrCode className="w-8 sm:w-10 h-8 sm:h-10 text-amber-500" />
                </div>
                <h4 className="text-gray-900 mb-2" style={{ fontSize: 'clamp(16px, 5vw, 18px)', fontWeight: 600 }}>
                  No tables match your filters
                </h4>
                <p className="text-gray-600 mb-6" style={{ fontSize: 'clamp(13px, 4vw, 15px)' }}>
                  Try changing or clearing filters to see your tables.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                    style={{ fontSize: 'clamp(13px, 4vw, 15px)', fontWeight: 600, borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                  >
                    <RefreshCcw className="w-4 sm:w-5 h-4 sm:h-5 inline-block mr-2" />
                    Clear filters
                  </button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {tables.map((table) => {
                const statusConfig = getStatusConfig(table.status);
                
                return (
                  <Card
                    key={table.id}
                    className="p-6 hover:shadow-lg transition-all group cursor-pointer"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                    onClick={() => handleOpenQRModal(table)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenQRModal(table);
                      }
                    }}
                    aria-label={`View QR code for ${table.name}`}
                  >
                    <div className="flex flex-col gap-3 sm:gap-4">
                      {/* Table Number - Large */}
                      <div className="flex items-start sm:items-center justify-between gap-3">
                        <h3 className="text-gray-900" style={{ fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 700 }}>
                          {table.name}
                        </h3>
                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-emerald-50 rounded-sm flex items-center justify-center group-hover:bg-emerald-100 transition-colors shrink-0">
                          <QrCode className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600" />
                        </div>
                      </div>

                      {/* Capacity */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 sm:w-5 h-4 sm:h-5 shrink-0" />
                        <span style={{ fontSize: 'clamp(13px, 4vw, 15px)', fontWeight: 500 }}>
                          {table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}
                        </span>
                      </div>

                      {/* Status and Location */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.label}
                        </Badge>
                        <span className="text-gray-400" style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 400 }}>
                          •
                        </span>
                        <span className="text-gray-600" style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 500 }}>
                          {getZoneLabel(table.zone)}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      {/* QR Code Modal */}
      {showQRModal && selectedTable && (
        <Modal
          isOpen={showQRModal}
          title={`QR Code - ${selectedTable.name}`}
          onClose={handleCloseQRModal}
          size="2xl"
          closeButton={false}
        >
          {/* Custom Header Actions */}
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex flex-col md:flex-row md:items-center gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (selectedTable.status === 'inactive') {
                  handleActivateTable();
                } else {
                  handleDeactivateTable();
                }
              }}
              disabled={updateStatusMutation.isPending}
              className={`flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 border text-gray-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedTable.status === 'inactive'
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700 hover:text-emerald-800'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-700 hover:text-amber-800'
              }`}
              style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 600, borderRadius: '4px' }}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <RefreshCcw className="w-4 h-4 shrink-0 animate-spin" />
                  <span className="hidden md:inline">Processing...</span>
                  <span className="md:hidden">...</span>
                </>
              ) : selectedTable.status === 'inactive' ? (
                <>
                  <span className="hidden md:inline">Activate</span>
                  <span className="md:hidden">Activate</span>
                </>
              ) : (
                <>
                  <span className="hidden md:inline">Deactivate</span>
                  <span className="md:hidden">Deactivate</span>
                </>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditModal();
              }}
              className="flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 transition-colors whitespace-nowrap"
              style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 600, borderRadius: '4px' }}
            >
              <Edit className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Edit Table</span>
              <span className="md:hidden">Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRegenerateQR();
              }}
              disabled={selectedTable.status === 'inactive' || regenerateQRMutation.isPending}
              className="flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white whitespace-nowrap"
              style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 600, borderRadius: '4px' }}
            >
              <RefreshCcw className={`w-4 h-4 shrink-0 ${regenerateQRMutation.isPending ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{regenerateQRMutation.isPending ? 'Regenerating...' : 'Regenerate QR'}</span>
              <span className="md:hidden">{regenerateQRMutation.isPending ? 'Regen...' : 'Regen'}</span>
            </button>
            <button
              onClick={handleCloseQRModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors self-end md:self-auto"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Inactive Table Warning */}
          {selectedTable.status === 'inactive' && (
            <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-gray-600" style={{ fontSize: '12px', fontWeight: 700 }}>!</span>
                </div>
                <div>
                  <p className="text-gray-900 mb-2" style={{ fontSize: '15px', fontWeight: 600 }}>
                    This table is currently inactive
                  </p>
                  <ul className="text-gray-700 space-y-1.5" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <li>• QR code URL remains valid but shows unavailable message to customers</li>
                    <li>• New orders cannot be placed from this table</li>
                    <li>• Download and regenerate actions are disabled</li>
                    <li>• Reactivate the table to restore full functionality</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Preview */}
          <div className="flex flex-col items-center gap-4">
            <div 
              className={`w-80 h-80 bg-white border-4 rounded-lg flex items-center justify-center relative ${
                selectedTable.status === 'inactive' ? 'border-gray-300 opacity-60' : 'border-gray-200'
              }`}
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
              {/* Real QR Code Component */}
              <div 
                ref={qrPrintRef}
                data-qr-print
                className="flex items-center justify-center bg-white rounded"
                style={{ padding: '8px' }}
              >
                <QRCode 
                  // Use same URL as backend: http://localhost:3000/t/{token}
                  // For production, this will use CUSTOMER_APP_URL from backend config
                  value={(() => {
                    const url = selectedTable.qrToken ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/t/${selectedTable.qrToken}` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/qr/${selectedTable.id}`;
                    console.log('🔍 Frontend QR URL:', url);
                    return url;
                  })()}
                  size={284}
                  level="H"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
              
              {/* Inactive Overlay */}
              {selectedTable.status === 'inactive' && (
                <div className="absolute inset-0 bg-white bg-opacity-80 rounded-xl flex items-center justify-center">
                  <div className="text-center px-4">
                    <p className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
                      Table Inactive
                    </p>
                    <p className="text-gray-600 mt-1" style={{ fontSize: '13px' }}>
                      QR unavailable for scanning
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Table Info Card */}
            <div className="w-full p-5 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                    Table Name
                  </p>
                  <p className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
                    {selectedTable.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                    Capacity
                  </p>
                  <p className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
                    {selectedTable.capacity} seats
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                    Status
                  </p>
                  <Badge variant={getStatusConfig(selectedTable.status).variant}>
                    {getStatusConfig(selectedTable.status).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-500 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                    Location
                  </p>
                  <p className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
                    {getZoneLabel(selectedTable.zone)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                    QR Code URL
                  </p>
                  <p 
                    className="text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200 break-all"
                    style={{ fontSize: '13px', fontFamily: 'monospace' }}
                  >
                    {selectedTable.qrToken ? `${process.env.NEXT_PUBLIC_CUSTOMER_APP_URL || 'http://localhost:3001'}/t/${selectedTable.qrToken}` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/qr/${selectedTable.id}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Backend Download Options - Uses backend API */}
            {/* QR Code will use: http://localhost:3000/t/{token} (from CUSTOMER_APP_URL) */}
            {/* Size: 300px, Format: PNG/PDF */}
            <div className="flex gap-3">
              <button
                onClick={() => handleDownloadQR('png')}
                disabled={selectedTable.status === 'inactive' || isDownloadingQR}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              >
                <Download className="w-5 h-5" />
                {isDownloadingQR ? 'Downloading...' : 'Download PNG'}
              </button>
              <button
                onClick={() => handleDownloadQR('pdf')}
                disabled={selectedTable.status === 'inactive' || isDownloadingQR}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              >
                <Download className="w-5 h-5" />
                {isDownloadingQR ? 'Downloading...' : 'Download PDF'}
              </button>
            </div>
            
            {/* Local QR Code Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDownloadQRImage}
                disabled={selectedTable.status === 'inactive' || isDownloadingQR}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              >
                <Download className="w-5 h-5" />
                {isDownloadingQR ? 'Downloading...' : 'Save Image'}
              </button>
              <button
                onClick={handlePrintQRWrapper}
                disabled={selectedTable.status === 'inactive' || isPrintingQR}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px' }}
              >
                <Printer className="w-5 h-5" />
                {isPrintingQR ? 'Loading...' : 'Print'}
              </button>
            </div>
          </div>

          {/* Info Text */}
          {selectedTable.status !== 'inactive' ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-blue-900" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                <strong>Tip:</strong> Place this QR code on the table so customers can scan it to view your menu and place orders directly from their phone.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-xl">
              <p className="text-gray-800" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                <strong>Customer Experience:</strong> When customers scan this QR code, they will see: <em>&quot;This table is currently unavailable. Please contact staff.&quot;</em>
              </p>
            </div>
          )}
        </Modal>
      )}

      {/* Add Table Modal */}
      <Modal
        isOpen={showAddModal}
        title="Add New Table"
        onClose={handleCloseAddModal}
        size="md"
        footer={
          <>
            <button
              onClick={handleCloseAddModal}
              disabled={createTableMutation.isPending}
              className="flex-1 px-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', height: '48px' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddTable}
              disabled={!formData.capacity || !formData.tableNumber || createTableMutation.isPending}
              className="flex-1 px-4 bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', height: '48px' }}
            >
              {createTableMutation.isPending ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add Table'
              )}
            </button>
          </>
        }
      >
        <TableFormFields formData={formData} setFormData={setFormData} autoFocus={true} />
      </Modal>

      {/* Edit Table Modal */}
      {showEditModal && selectedTable && (
        <Modal
          isOpen={showEditModal}
          title="Edit Table"
          onClose={handleCloseEditModal}
          size="md"
          footer={
            <>
              <button
                onClick={handleCloseEditModal}
                disabled={updateTableMutation.isPending}
                className="flex-1 px-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', height: '48px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditTable}
                disabled={!formData.capacity || !formData.tableNumber || updateTableMutation.isPending}
                className="flex-1 px-4 bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', height: '48px' }}
              >
                {updateTableMutation.isPending ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </>
          }
        >
          <TableFormFields formData={formData} setFormData={setFormData} autoFocus={true} />
        </Modal>
      )}

      {/* Deactivate/Reactivate Confirmation Modal */}
      {showDeactivateConfirm && selectedTable && (
        <Modal
          isOpen={showDeactivateConfirm}
          title={pendingStatusChange === 'inactive' ? 'Deactivate Table' : 'Reactivate Table'}
          onClose={handleCancelStatusChange}
          size="md"
          footer={
            <>
              <button
                onClick={handleCancelStatusChange}
                className="flex-1 px-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', height: '48px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className={`flex-1 px-4 text-white transition-colors ${
                  pendingStatusChange === 'inactive' 
                    ? 'bg-amber-500 hover:bg-amber-600' 
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', height: '48px' }}
              >
                {pendingStatusChange === 'inactive' ? 'Deactivate Table' : 'Reactivate Table'}
              </button>
            </>
          }
        >
          <p className="text-gray-900" style={{ fontSize: '16px', fontWeight: 500, lineHeight: '1.5' }}>
            {pendingStatusChange === 'inactive' 
              ? `Are you sure you want to deactivate ${selectedTable.name}?`
              : `Are you sure you want to reactivate ${selectedTable.name}?`
            }
          </p>
          
          {pendingStatusChange === 'inactive' ? (
            <>
              <p className="text-gray-700" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                Deactivating this table will:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-2" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                <li>Prevent new orders from being placed</li>
                <li>Keep the table visible in the admin UI</li>
                <li>Preserve all order history</li>
              </ul>
              
              {selectedTable.status === 'occupied' || selectedTable.status === 'reserved' ? (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                  <p className="text-red-900" style={{ fontSize: '14px', lineHeight: '1.6', fontWeight: 600 }}>
                    <strong>⚠️ Critical Warning:</strong> This table currently has active orders ({selectedTable.status === 'occupied' ? 'Occupied' : 'Reserved'}). 
                  </p>
                  <p className="text-red-800 mt-2" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    Deactivating will prevent new orders but <strong>will not cancel existing orders</strong>. Customers may continue to receive orders on this table.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-900" style={{ fontSize: '14px', lineHeight: '1.6', fontWeight: 500 }}>
                    <strong>Note:</strong> This table is available and has no active orders.
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-700" style={{ fontSize: '15px', lineHeight: '1.6' }}>
              This will restore the table to <strong>Available</strong> status and allow customers to place new orders.
            </p>
          )}
        </Modal>
      )}

      {isBulkRegenOpen && (
        <Modal
          isOpen={isBulkRegenOpen}
          title="Regenerate all QR codes?"
          onClose={() => setIsBulkRegenOpen(false)}
          size="md"
          footer={
            <>
              <button
                onClick={() => setIsBulkRegenOpen(false)}
                className="flex-1 px-4 text-gray-700 transition-colors border border-gray-300 hover:bg-gray-50"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', height: '48px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkRegenerateQR}
                disabled={isBulkRegenLoading}
                className={`flex-1 px-4 text-white transition-colors flex items-center justify-center gap-2 ${
                  isBulkRegenLoading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                }`}
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', height: '48px' }}
              >
                {isBulkRegenLoading && <RefreshCcw className="w-4 h-4 animate-spin" />}
                <span>{isBulkRegenLoading ? 'Regenerating...' : 'Regenerate'}</span>
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 500, lineHeight: '1.5' }}>
              This will regenerate QR codes for all <strong>{tables.length} tables</strong>.
            </p>

            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-900" style={{ fontSize: '14px', lineHeight: '1.6', fontWeight: 500 }}>
                <strong>⚠️ Warning:</strong> All existing QR codes will stop working immediately. Customers using old QR codes will not be able to access the menu.
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-900" style={{ fontSize: '14px', lineHeight: '1.6', fontWeight: 500 }}>
                <strong>Note:</strong> This action cannot be undone. Make sure all staff are notified before proceeding.
              </p>
            </div>
          </div>
        </Modal>
      )}

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

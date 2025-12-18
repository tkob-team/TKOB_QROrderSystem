'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Toast } from '@/shared/components/ui/Toast';
import { Modal } from '@/shared/components/ui/Modal';
import { TableFormFields } from './TableFormFields';
import { Plus, X, QrCode, Users, Download, Printer, Edit, ChevronDown, RefreshCcw } from 'lucide-react';

interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'free' | 'occupied' | 'reserved' | 'inactive';
  zone: 'indoor' | 'outdoor' | 'patio' | 'vip';
  tableNumber: number;
  createdAt: Date;
  description?: string;
  hasActiveOrders?: boolean;
}

export function TablesPage() {
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
  const [pendingStatusChange, setPendingStatusChange] = useState<'free' | 'occupied' | 'reserved' | 'inactive' | null>(null);
  
  // Filter and sort state
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All Locations');
  const [sortOption, setSortOption] = useState('Sort by: Table Number (Ascending)');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    zone: 'indoor',
    tableNumber: '',
    status: 'free' as 'free' | 'occupied' | 'reserved' | 'inactive',
    description: '',
  });

  // Mock data
  const initialTables: Table[] = [
    { id: '1', name: 'Table 1', capacity: 4, status: 'free', zone: 'indoor', tableNumber: 1, createdAt: new Date('2023-10-01') },
    { id: '2', name: 'Table 2', capacity: 2, status: 'occupied', zone: 'indoor', tableNumber: 2, createdAt: new Date('2023-10-02') },
    { id: '3', name: 'Table 3', capacity: 6, status: 'free', zone: 'outdoor', tableNumber: 3, createdAt: new Date('2023-10-03') },
    { id: '4', name: 'Table 4', capacity: 4, status: 'reserved', zone: 'outdoor', tableNumber: 4, createdAt: new Date('2023-10-04') },
    { id: '5', name: 'Table 5', capacity: 4, status: 'free', zone: 'patio', tableNumber: 5, createdAt: new Date('2023-10-05') },
    { id: '6', name: 'Table 6', capacity: 2, status: 'occupied', zone: 'patio', tableNumber: 6, createdAt: new Date('2023-10-06') },
    { id: '7', name: 'Table 7', capacity: 2, status: 'free', zone: 'indoor', tableNumber: 7, createdAt: new Date('2023-10-07') },
    { id: '8', name: 'Table 8', capacity: 4, status: 'free', zone: 'indoor', tableNumber: 8, createdAt: new Date('2023-10-08') },
    { id: '9', name: 'Table 9', capacity: 8, status: 'free', zone: 'vip', tableNumber: 9, createdAt: new Date('2023-10-09') },
    { id: '10', name: 'Table 10', capacity: 6, status: 'free', zone: 'vip', tableNumber: 10, createdAt: new Date('2023-10-10') },
    { id: '11', name: 'Table 11', capacity: 4, status: 'free', zone: 'outdoor', tableNumber: 11, createdAt: new Date('2023-10-11') },
    { id: '12', name: 'Table 12', capacity: 2, status: 'reserved', zone: 'patio', tableNumber: 12, createdAt: new Date('2023-10-12') },
    { id: '13', name: 'Table 13', capacity: 4, status: 'inactive', zone: 'indoor', tableNumber: 13, createdAt: new Date('2023-10-13'), hasActiveOrders: true, description: 'Under maintenance' },
  ];

  const [tables, setTables] = useState<Table[]>(initialTables);

  // Modal handlers
  const handleOpenAddModal = () => {
    setFormData({ name: '', capacity: '', zone: 'indoor', tableNumber: '', status: 'free', description: '' });
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({ name: '', capacity: '', zone: 'indoor', tableNumber: '', status: 'free', description: '' });
  };

  const handleAddTable = () => {
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

    const tableName = formData.name.trim() || `Table ${formData.tableNumber}`;

    const newTable: Table = {
      id: `new-${Date.now()}`,
      name: tableName,
      capacity: parseInt(formData.capacity),
      status: formData.status,
      zone: formData.zone as 'indoor' | 'outdoor' | 'patio' | 'vip',
      tableNumber: parseInt(formData.tableNumber),
      createdAt: new Date(),
      description: formData.description.trim() || undefined,
    };

    setTables([...tables, newTable]);
    setToastMessage(`Table "${tableName}" added successfully`);
    setToastType('success');
    setShowSuccessToast(true);
    handleCloseAddModal();
  };

  const handleOpenQRModal = (table: Table) => {
    setSelectedTable(table);
    setShowQRModal(true);
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setSelectedTable(null);
  };

  const handleOpenEditModal = () => {
    if (selectedTable) {
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
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setFormData({ name: '', capacity: '', zone: 'indoor', tableNumber: '', status: 'free', description: '' });
  };

  const handleEditTable = () => {
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

    performTableUpdate();
  };

  const performTableUpdate = () => {
    if (!selectedTable) return;

    const updatedTables = tables.map(table => {
      if (table.id === selectedTable.id) {
        return {
          ...table,
          name: formData.name.trim() || `Table ${formData.tableNumber}`,
          capacity: parseInt(formData.capacity),
          zone: formData.zone as 'indoor' | 'outdoor' | 'patio' | 'vip',
          tableNumber: parseInt(formData.tableNumber),
          status: formData.status,
          description: formData.description.trim() || undefined,
        };
      }
      return table;
    });

    setTables(updatedTables);
    setToastMessage('Table updated successfully');
    setToastType('success');
    setShowSuccessToast(true);
    handleCloseEditModal();
    setSelectedTable(null);
  };

  const handleConfirmStatusChange = () => {
    setShowDeactivateConfirm(false);
    setPendingStatusChange(null);
    performTableUpdate();
  };

  const handleCancelStatusChange = () => {
    setShowDeactivateConfirm(false);
    setPendingStatusChange(null);
    if (selectedTable) {
      setFormData({ ...formData, status: selectedTable.status });
    }
  };

  const handleDownloadAll = () => {
    setToastMessage(`Downloading ${tables.length} QR codes...`);
    setToastType('success');
    setShowSuccessToast(true);
  };

  const handleRegenerateQR = () => {
    if (selectedTable) {
      setToastMessage(`QR code regenerated for ${selectedTable.name}`);
      setToastType('success');
      setShowSuccessToast(true);
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

  const handlePrintQR = () => {
    if (selectedTable) {
      setToastMessage(`Printing QR code for ${selectedTable.name}...`);
      setToastType('success');
      setShowSuccessToast(true);
    }
  };

  // Helper functions
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'free':
        return { variant: 'success' as const, label: 'Free', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' };
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

  const filterAndSortTables = (tables: Table[]) => {
    let filteredTables = tables;

    // Filter by status
    if (selectedStatus !== 'All') {
      filteredTables = filteredTables.filter(table => table.status === selectedStatus);
    }

    // Filter by zone
    if (selectedZone !== 'All Locations') {
      filteredTables = filteredTables.filter(table => table.zone === selectedZone);
    }

    // Sort by option
    switch (sortOption) {
      case 'Sort by: Table Number (Ascending)':
        filteredTables = filteredTables.sort((a, b) => a.tableNumber - b.tableNumber);
        break;
      case 'Sort by: Capacity (Ascending)':
        filteredTables = filteredTables.sort((a, b) => a.capacity - b.capacity);
        break;
      case 'Sort by: Capacity (Descending)':
        filteredTables = filteredTables.sort((a, b) => b.capacity - a.capacity);
        break;
      case 'Sort by: Creation Date (Newest)':
        filteredTables = filteredTables.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      default:
        break;
    }

    return filteredTables;
  };

  return (
    <>
      <div className="mx-auto flex flex-col gap-6" style={{ maxWidth: '1600px' }}>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-gray-900" style={{ fontSize: '28px', fontWeight: 700, lineHeight: '1.2', letterSpacing: '-0.02em' }}>
                Tables & QR Codes
              </h2>
              <p className="text-gray-600" style={{ fontSize: '15px' }}>
                Manage your restaurant tables and generate QR codes
              </p>
            </div>
            <div className="flex items-center gap-3">
              {tables.length > 0 && (
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-emerald-500 text-gray-700 hover:text-emerald-700 transition-all"
                  style={{ 
                    fontSize: '15px', 
                    fontWeight: 600, 
                    borderRadius: '12px', 
                    height: '48px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <Download className="w-5 h-5" />
                  Download All QR Codes
                </button>
              )}
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white transition-all"
                style={{ 
                  fontSize: '15px', 
                  fontWeight: 600, 
                  borderRadius: '12px', 
                  height: '48px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <Plus className="w-5 h-5" />
                Add Table
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p className="text-gray-500 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>Total Tables</p>
              <p className="text-gray-900" style={{ fontSize: '28px', fontWeight: 700 }}>{tables.length}</p>
            </Card>
            <Card className="p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p className="text-gray-500 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>Free</p>
              <p className="text-emerald-600" style={{ fontSize: '28px', fontWeight: 700 }}>
                {tables.filter(t => t.status === 'free').length}
              </p>
            </Card>
            <Card className="p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p className="text-gray-500 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>Occupied</p>
              <p className="text-amber-600" style={{ fontSize: '28px', fontWeight: 700 }}>
                {tables.filter(t => t.status === 'occupied').length}
              </p>
            </Card>
            <Card className="p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p className="text-gray-500 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>Total Capacity</p>
              <p className="text-gray-900" style={{ fontSize: '28px', fontWeight: 700 }}>
                {tables.reduce((sum, t) => sum + t.capacity, 0)}
              </p>
            </Card>
          </div>

          {/* Filter and Sort */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
                style={{ fontSize: '15px', borderRadius: '12px', height: '48px' }}
              >
                <option value="All">All Statuses</option>
                <option value="free">Free</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-4 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
                style={{ fontSize: '15px', borderRadius: '12px', height: '48px' }}
              >
                <option value="All Locations">All Locations</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="patio">Patio</option>
                <option value="vip">VIP</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-4 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
                style={{ fontSize: '15px', borderRadius: '12px', height: '48px' }}
              >
                <option value="Sort by: Table Number (Ascending)">Sort by: Table Number (Ascending)</option>
                <option value="Sort by: Capacity (Ascending)">Sort by: Capacity (Ascending)</option>
                <option value="Sort by: Capacity (Descending)">Sort by: Capacity (Descending)</option>
                <option value="Sort by: Creation Date (Newest)">Sort by: Creation Date (Newest)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Tables Grid */}
          {filterAndSortTables(tables).length === 0 ? (
            <Card className="p-12 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <QrCode className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="text-gray-900 mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
                  No tables yet
                </h4>
                <p className="text-gray-600 mb-6" style={{ fontSize: '15px' }}>
                  Add your first table to get started with QR code ordering
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                  style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                  <Plus className="w-5 h-5 inline-block mr-2" />
                  Add Table
                </button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filterAndSortTables(tables).map((table) => {
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
                    <div className="flex flex-col gap-4">
                      {/* Table Number - Large */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-gray-900" style={{ fontSize: '24px', fontWeight: 700 }}>
                          {table.name}
                        </h3>
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                          <QrCode className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>

                      {/* Capacity */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-5 h-5" />
                        <span style={{ fontSize: '15px', fontWeight: 500 }}>
                          {table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}
                        </span>
                      </div>

                      {/* Status and Location */}
                      <div className="flex items-center gap-2">
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.label}
                        </Badge>
                        <span className="text-gray-400" style={{ fontSize: '14px', fontWeight: 400 }}>
                          •
                        </span>
                        <span className="text-gray-600" style={{ fontSize: '14px', fontWeight: 500 }}>
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
          <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditModal();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 transition-colors"
              style={{ fontSize: '14px', fontWeight: 600, borderRadius: '8px' }}
            >
              <Edit className="w-4 h-4" />
              Edit Table
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRegenerateQR();
              }}
              disabled={selectedTable.status === 'inactive'}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              style={{ fontSize: '14px', fontWeight: 600, borderRadius: '8px' }}
            >
              <RefreshCcw className="w-4 h-4" />
              Regenerate QR
            </button>
            <button
              onClick={handleCloseQRModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
              className={`w-64 h-64 bg-white border-4 rounded-xl flex items-center justify-center relative ${
                selectedTable.status === 'inactive' ? 'border-gray-300 opacity-60' : 'border-gray-200'
              }`}
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
              {/* QR Code Placeholder */}
              <div className="w-56 h-56 rounded-lg p-4" style={{ background: 'linear-gradient(to right bottom, #111827, #1f2937, #111827)' }}>
                <div className="w-full h-full bg-white rounded grid grid-cols-8 grid-rows-8 gap-0.5 p-2">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${
                        Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'
                      } rounded-sm`}
                    />
                  ))}
                </div>
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
            <div className="w-full p-5 bg-gray-50 border border-gray-200 rounded-xl">
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
                    https://qrdine.app/t/{selectedTable.id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPNG}
              disabled={selectedTable.status === 'inactive'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
              style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              <Download className="w-5 h-5" />
              Download PNG
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={selectedTable.status === 'inactive'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
              style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={handlePrintQR}
              disabled={selectedTable.status === 'inactive'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px' }}
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
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
              className="flex-1 px-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', height: '48px' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddTable}
              disabled={!formData.capacity || !formData.tableNumber}
              className="flex-1 px-4 bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', height: '48px' }}
            >
              Add Table
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
                className="flex-1 px-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', height: '48px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditTable}
                disabled={!formData.capacity || !formData.tableNumber}
                className="flex-1 px-4 bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', height: '48px' }}
              >
                Save Changes
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
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', height: '48px' }}
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
                style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px', height: '48px' }}
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
              
              {selectedTable.hasActiveOrders && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-900" style={{ fontSize: '14px', lineHeight: '1.6', fontWeight: 500 }}>
                    <strong>Warning:</strong> This table currently has active orders. Deactivating it will prevent new orders but will not affect existing ones.
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-700" style={{ fontSize: '15px', lineHeight: '1.6' }}>
              This will restore the table to <strong>Free</strong> status and allow customers to place new orders.
            </p>
          )}
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

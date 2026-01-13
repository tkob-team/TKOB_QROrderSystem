/**
 * TablesPage - Thin Orchestrator for Tables & QR Management
 * 
 * Responsibilities:
 * - Compose UI from components and modals
 * - Wire controller outputs to UI components
 * - Maintain pure presentational logic
 * 
 * All state, handlers, and business logic delegated to useTablesPageController
 */
'use client';

import React from 'react';
import { Plus, RefreshCcw, Download } from 'lucide-react';
import { Toast } from '@/shared/components/Toast';
import { Modal } from '@/shared/components/Modal';
import { SummaryCards, TableFilters, TableGrid, TableFormFields } from '../components';
import { QRModal, BulkRegenerateModal, StatusChangeModal } from '../modals';
import { useTablesPageController } from '../../hooks/useTablesPageController';

export function TablesPage() {
  const controller = useTablesPageController();
  
  // Destructure for cleaner JSX
  const { tables, summary, isLoading, error } = controller;
  const { filters, modals, selectedTable, formData, setFormData, pendingStatusChange, loading, toast, qrPrintRef, handlers } = controller;

  // ============================================================================
  // ERROR STATE
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
  
  // ============================================================================
  // MAIN LAYOUT
  // ============================================================================
  
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
                  onClick={() => modals.setIsBulkRegenOpen(true)}
                  disabled={loading.isBulkRegenLoading}
                  className="flex items-center justify-center md:justify-start gap-2 px-4 sm:px-5 py-3 h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-500 text-gray-600 hover:text-blue-500 transition-all flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-lg text-[clamp(13px,4vw,15px)] font-semibold"
                >
                  {loading.isBulkRegenLoading ? (
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
                  onClick={handlers.downloadAll}
                  disabled={loading.isDownloadingAll}
                  className="flex items-center justify-center md:justify-start gap-2 px-4 sm:px-5 py-3 h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-emerald-500 text-gray-600 hover:text-emerald-500 transition-all flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-lg text-[clamp(13px,4vw,15px)] font-semibold"
                >
                  {loading.isDownloadingAll ? (
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
              onClick={handlers.openAddModal}
              disabled={loading.isCreating}
              className="flex items-center justify-center md:justify-start gap-2 px-4 sm:px-5 py-3 h-12 bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-lg text-[clamp(13px,4vw,15px)] font-semibold shadow-md hover:shadow-lg"
            >
              {loading.isCreating ? (
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
          selectedStatus={filters.selectedStatus}
          selectedZone={filters.selectedZone}
          sortOption={filters.sortOption}
          onStatusChange={filters.setSelectedStatus}
          onZoneChange={filters.setSelectedZone}
          onSortChange={filters.setSortOption}
          activeOnly={filters.activeOnly}
          onActiveOnlyChange={filters.setActiveOnly}
          locations={filters.locations}
          onClearFilters={() => {
            filters.setSelectedStatus('All');
            filters.setSelectedZone('All Locations');
            filters.setActiveOnly(false);
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
            onEdit={handlers.editTable}
            onViewQR={handlers.openQRModal}
          />
        )}
      </div>
      
      {/* Add Table Modal */}
      <Modal
        isOpen={modals.showAddModal}
        onClose={handlers.closeAddModal}
        title="Add New Table"
        size="md"
        disableBackdropClose={true}
        footer={
          <>
            <button
              onClick={handlers.closeAddModal}
              className="flex-1 px-4 h-12 text-text-secondary transition-colors border border-default hover:bg-elevated cursor-pointer text-[15px] font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handlers.createTable}
              disabled={loading.isCreating}
              className="flex-1 px-4 h-12 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed cursor-pointer text-[15px] font-semibold rounded-lg"
            >
              {loading.isCreating ? 'Creating...' : 'Create Table'}
            </button>
          </>
        }
      >
        <TableFormFields
          formData={formData}
          setFormData={setFormData}
          autoFocus={true}
          disableTableName={false}
          locations={filters.locations}
        />
      </Modal>
      
      {/* Edit Table Modal */}
      <Modal
        isOpen={modals.showEditModal}
        onClose={handlers.closeEditModal}
        title="Edit Table"
        size="md"
        disableBackdropClose={true}
        footer={
          <>
            <button
              onClick={handlers.closeEditModal}
              className="flex-1 px-4 h-12 text-text-secondary transition-colors border border-default hover:bg-elevated cursor-pointer text-[15px] font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handlers.updateTable}
              disabled={loading.isUpdating}
              className="flex-1 px-4 h-12 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed cursor-pointer text-[15px] font-semibold rounded-lg"
            >
              {loading.isUpdating ? 'Updating...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <TableFormFields
          formData={formData}
          setFormData={setFormData}
          autoFocus={false}
          disableTableName={false}
          locations={filters.locations}
        />
      </Modal>
      
      {/* QR Modal */}
      <QRModal
        table={selectedTable}
        isOpen={modals.showQRModal}
        onClose={handlers.closeQRModal}
        onDownload={handlers.downloadQR}
        onPrint={handlers.printQR}
        onRegenerateQR={handlers.regenerateQR}
        onActivateTable={handlers.activateTable}
        onDeactivateTable={handlers.deactivateTable}
        onEdit={handlers.openEditModal}
        isDownloading={loading.isDownloadingQR}
        isPrinting={loading.isPrintingQR}
        isRegenerating={loading.isRegenerating}
        isUpdatingStatus={loading.isUpdatingStatus}
        qrPrintRef={qrPrintRef}
      />
      
      {/* Status Change Confirm Modal */}
      {pendingStatusChange && (
        <StatusChangeModal
          isOpen={modals.showDeactivateConfirm}
          onClose={handlers.cancelStatusChange}
          onConfirm={handlers.confirmStatusChange}
          table={selectedTable}
          targetStatus={pendingStatusChange}
        />
      )}
      
      {/* Bulk Regenerate Modal */}
      <BulkRegenerateModal
        isOpen={modals.isBulkRegenOpen}
        onClose={() => modals.setIsBulkRegenOpen(false)}
        onConfirm={handlers.bulkRegenerateQR}
        tableCount={tables.length}
        isLoading={loading.isBulkRegenLoading}
      />
      
      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={toast.onClose}
        />
      )}
    </>
  );
}

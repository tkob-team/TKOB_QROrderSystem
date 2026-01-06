/**
 * Tables Feature - QR Components
 * 
 * Colocated components for QR code operations
 * Handles QR preview, download, print, and bulk operations
 */

import React, { useRef } from 'react';
import { X, Download, Printer, RefreshCcw } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useReactToPrint } from 'react-to-print';
import { Modal } from '@/shared/components/Modal';
import { StatusPill, TABLE_STATUS_CONFIG } from '@/shared/patterns';
import { ZONE_LABELS } from '../constants';
import type { Table, QRDownloadFormat } from '../types';

// ============================================================================
// QR PREVIEW MODAL
// ============================================================================

interface QRModalProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (format: QRDownloadFormat) => void;
  onPrint: () => void;
  onRegenerateQR: () => void;
  onActivateTable: () => void;
  onDeactivateTable: () => void;
  onEdit: () => void;
  isDownloading: boolean;
  isPrinting: boolean;
  isRegenerating: boolean;
  isUpdatingStatus: boolean;
  qrPrintRef: React.RefObject<HTMLDivElement>;
}

export function QRModal({
  table,
  isOpen,
  onClose,
  onDownload,
  onPrint,
  onRegenerateQR,
  onActivateTable,
  onDeactivateTable,
  onEdit,
  isDownloading,
  isPrinting,
  isRegenerating,
  isUpdatingStatus,
  qrPrintRef,
}: QRModalProps) {
  if (!table) return null;

  const qrUrl = table.qrToken
    ? `${process.env.NEXT_PUBLIC_CUSTOMER_APP_URL}/t/${table.qrToken}`
    : `${process.env.NEXT_PUBLIC_API_URL}/qr/${table.id}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="QR Code Preview"
      size="lg"
      className="relative"
    >
      {/* Header Actions */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex flex-col md:flex-row md:items-center gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (table.status === 'inactive') {
              onActivateTable();
            } else {
              onDeactivateTable();
            }
          }}
          disabled={isUpdatingStatus}
          className={`flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 border text-text-secondary transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
            table.status === 'inactive'
              ? 'bg-accent-50 hover:bg-accent-100 border-accent-300 text-accent-700 hover:text-accent-800'
              : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-700 hover:text-amber-800'
          }`}
          style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 600, borderRadius: '4px' }}
        >
          {isUpdatingStatus ? (
            <>
              <RefreshCcw className="w-4 h-4 shrink-0 animate-spin" />
              <span className="hidden md:inline">Processing...</span>
              <span className="md:hidden">...</span>
            </>
          ) : table.status === 'inactive' ? (
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
            onEdit();
          }}
          className="flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 bg-primary hover:bg-elevated border border-default text-text-secondary transition-colors whitespace-nowrap"
          style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 600, borderRadius: '4px' }}
        >
          <span className="hidden md:inline">Edit Table</span>
          <span className="md:hidden">Edit</span>
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRegenerateQR();
          }}
          disabled={table.status === 'inactive' || isRegenerating}
          className="flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 bg-primary hover:bg-elevated border border-default text-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary whitespace-nowrap"
          style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 600, borderRadius: '4px' }}
        >
          <RefreshCcw className={`w-4 h-4 shrink-0 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">{isRegenerating ? 'Regenerating...' : 'Regenerate QR'}</span>
          <span className="md:hidden">{isRegenerating ? 'Regen...' : 'Regen'}</span>
        </button>
        
        <button
          onClick={onClose}
          className="p-2 hover:bg-elevated rounded-lg transition-colors self-end md:self-auto"
        >
          <X className="w-5 h-5 text-text-tertiary" />
        </button>
      </div>

      {/* Inactive Warning */}
      {table.status === 'inactive' && (
        <div className="p-4 bg-elevated border-2 border-default rounded-lg mb-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-text-secondary" style={{ fontSize: '12px', fontWeight: 700 }}>!</span>
            </div>
            <div>
              <p className="text-text-primary mb-2" style={{ fontSize: '15px', fontWeight: 600 }}>
                This table is currently inactive
              </p>
              <ul className="text-text-secondary space-y-1.5" style={{ fontSize: '14px', lineHeight: '1.6' }}>
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
            table.status === 'inactive' ? 'border-default opacity-60' : 'border-default'
          }`}
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          {/* Hidden print container */}
          <div
            ref={qrPrintRef}
            data-qr-print
            className="flex items-center justify-center bg-white rounded"
            style={{ padding: '8px' }}
          >
            <QRCode
              value={qrUrl}
              size={284}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </div>

          {/* Inactive Overlay */}
          {table.status === 'inactive' && (
            <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg flex items-center justify-center">
              <div className="text-center px-4">
                <p className="text-text-primary" style={{ fontSize: '16px', fontWeight: 700 }}>
                  Table Inactive
                </p>
                <p className="text-text-secondary mt-1" style={{ fontSize: '13px' }}>
                  QR unavailable for scanning
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Table Info Card */}
        <div className="w-full p-5 bg-elevated border border-default rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-text-tertiary mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                Table Name
              </p>
              <p className="text-text-primary" style={{ fontSize: '16px', fontWeight: 700 }}>
                {table.name}
              </p>
            </div>
            <div>
              <p className="text-text-tertiary mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                Capacity
              </p>
              <p className="text-text-primary" style={{ fontSize: '16px', fontWeight: 700 }}>
                {table.capacity} seats
              </p>
            </div>
            <div>
              <p className="text-text-tertiary mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                Status
              </p>
              <StatusPill {...TABLE_STATUS_CONFIG[table.status]} size="sm" />
            </div>
            <div>
              <p className="text-text-tertiary mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                Location
              </p>
              <p className="text-text-primary" style={{ fontSize: '16px', fontWeight: 700 }}>
                {ZONE_LABELS[table.zone]}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-text-tertiary mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                QR Code URL
              </p>
              <p
                className="text-text-secondary bg-primary px-3 py-2 rounded-lg border border-default break-all"
                style={{ fontSize: '13px', fontFamily: 'monospace' }}
              >
                {qrUrl}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-4">
        <div className="flex gap-3">
          <button
            onClick={() => onDownload('png')}
            disabled={table.status === 'inactive' || isDownloading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent-500 hover:bg-accent-600 text-white transition-all disabled:bg-secondary disabled:cursor-not-allowed disabled:hover:bg-secondary"
            style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            <Download className="w-5 h-5" />
            {isDownloading ? 'Downloading...' : 'Download PNG'}
          </button>
          <button
            onClick={() => onDownload('pdf')}
            disabled={table.status === 'inactive' || isDownloading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white transition-all disabled:bg-secondary disabled:cursor-not-allowed disabled:hover:bg-secondary"
            style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            <Download className="w-5 h-5" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
        <button
          onClick={onPrint}
          disabled={table.status === 'inactive' || isPrinting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-text-primary hover:bg-text-primary/90 text-white transition-all disabled:bg-secondary disabled:cursor-not-allowed disabled:hover:bg-secondary"
          style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <Printer className="w-5 h-5" />
          {isPrinting ? 'Opening Print Dialog...' : 'Print QR Code'}
        </button>
      </div>
    </Modal>
  );
}

// ============================================================================
// BULK REGENERATE MODAL
// ============================================================================

interface BulkRegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tableCount: number;
  isLoading: boolean;
}

export function BulkRegenerateModal({
  isOpen,
  onClose,
  onConfirm,
  tableCount,
  isLoading,
}: BulkRegenerateModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title="Regenerate all QR codes?"
      onClose={onClose}
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 px-4 text-text-secondary transition-colors border border-default hover:bg-elevated"
            style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', height: '48px' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 text-white transition-colors flex items-center justify-center gap-2 ${
              isLoading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
            }`}
            style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', height: '48px' }}
          >
            {isLoading && <RefreshCcw className="w-4 h-4 animate-spin" />}
            <span>{isLoading ? 'Regenerating...' : 'Regenerate'}</span>
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-text-primary" style={{ fontSize: '15px', fontWeight: 500, lineHeight: '1.5' }}>
          This will regenerate QR codes for all <strong>{tableCount} tables</strong>.
        </p>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-900" style={{ fontSize: '14px', lineHeight: '1.6', fontWeight: 500 }}>
            <strong>⚠️ Warning:</strong> All existing QR codes will stop working immediately. Customers using old QR codes will not be able to access the menu.
          </p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-900" style={{ fontSize: '14px', lineHeight: '1.6', fontWeight: 500 }}>
            <strong>Note:</strong> This action cannot be undone. Make sure all staff are notified before proceeding.
          </p>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// STATUS CHANGE CONFIRM MODAL
// ============================================================================

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  table: Table | null;
  targetStatus: 'active' | 'inactive';
}

export function StatusChangeModal({
  isOpen,
  onClose,
  onConfirm,
  table,
  targetStatus,
}: StatusChangeModalProps) {
  if (!table) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={targetStatus === 'inactive' ? 'Deactivate Table?' : 'Reactivate Table?'}
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 px-4 text-text-secondary transition-colors border border-default hover:bg-elevated"
            style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', height: '48px' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 text-white transition-colors ${
              targetStatus === 'inactive'
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-accent-500 hover:bg-accent-600'
            }`}
            style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', height: '48px' }}
          >
            {targetStatus === 'inactive' ? 'Deactivate Table' : 'Reactivate Table'}
          </button>
        </>
      }
    >
      <p className="text-text-primary" style={{ fontSize: '16px', fontWeight: 500, lineHeight: '1.5' }}>
        {targetStatus === 'inactive'
          ? `Are you sure you want to deactivate ${table.name}?`
          : `Are you sure you want to reactivate ${table.name}?`}
      </p>

      {targetStatus === 'inactive' ? (
        <>
          <p className="text-text-secondary mt-3" style={{ fontSize: '15px', lineHeight: '1.6' }}>
            Deactivating this table will:
          </p>
          <ul className="list-disc pl-5 text-text-secondary space-y-2 mt-2" style={{ fontSize: '15px', lineHeight: '1.6' }}>
            <li>Prevent new orders from being placed</li>
            <li>Keep the table visible in the admin UI</li>
            <li>Preserve all order history</li>
          </ul>

          {(table.status === 'occupied' || table.status === 'reserved') && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg mt-4">
              <p className="text-red-900" style={{ fontSize: '14px', lineHeight: '1.6', fontWeight: 600 }}>
                <strong>⚠️ Critical Warning:</strong> This table currently has active orders ({table.status === 'occupied' ? 'Occupied' : 'Reserved'}).
              </p>
              <p className="text-red-800 mt-2" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Deactivating will prevent new orders but <strong>will not cancel existing orders</strong>. Customers may continue to receive orders on this table.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-text-secondary mt-3" style={{ fontSize: '15px', lineHeight: '1.6' }}>
          This will restore the table to <strong>Available</strong> status and allow customers to place new orders.
        </p>
      )}
    </Modal>
  );
}

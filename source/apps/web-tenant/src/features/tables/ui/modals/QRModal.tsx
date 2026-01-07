/**
 * QRModal - QR Code Preview and Management
 * 
 * Displays QR code with table information and actions
 * Handles download (PNG/PDF), print, regenerate, and status changes
 */

import React from 'react';
import { X, Download, Printer, RefreshCcw } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Modal } from '@/shared/components/Modal';
import { StatusPill, TABLE_STATUS_CONFIG } from '@/shared/patterns';
import { ZONE_LABELS } from '@/features/tables/model/constants';
import type { Table, QRDownloadFormat } from '@/features/tables/model/types';

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

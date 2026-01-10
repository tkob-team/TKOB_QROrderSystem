/**
 * BulkRegenerateModal - Confirm Bulk QR Regeneration
 * 
 * Displays warning and confirmation for regenerating all QR codes
 * Shows table count and consequences of the action
 */

import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { Modal } from '@/shared/components/Modal';

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
      disableBackdropClose={true}
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 px-4 text-text-secondary transition-colors border border-default hover:bg-elevated cursor-pointer"
            style={{ fontSize: '15px', fontWeight: 600, borderRadius: '4px', height: '48px' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer ${
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

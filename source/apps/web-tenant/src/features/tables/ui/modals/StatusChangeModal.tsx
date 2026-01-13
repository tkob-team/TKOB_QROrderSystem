/**
 * StatusChangeModal - Confirm Table Status Change
 * 
 * Displays confirmation dialog for activating/deactivating tables
 * Shows warnings for tables with active orders
 */

import React from 'react';
import { Modal } from '@/shared/components/Modal';
import type { Table } from '@/features/tables/model/types';

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
            className={`flex-1 px-4 text-white transition-colors cursor-pointer ${
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

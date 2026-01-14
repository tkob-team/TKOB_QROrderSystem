'use client';

import React from 'react';
import { Modal } from '@/shared/components/Modal';
import { TableFormFields } from '../components';
import type { TablesFormModalsProps } from '../../domain/types';

export function TableFormModals({
  formData,
  setFormData,
  locations,
  modals,
  loading,
  handlers,
}: TablesFormModalsProps) {
  return (
    <>
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
          locations={locations}
        />
      </Modal>

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
          locations={locations}
        />
      </Modal>
    </>
  );
}

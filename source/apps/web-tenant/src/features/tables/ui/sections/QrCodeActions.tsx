'use client';

import React from 'react';
import { QRModal, BulkRegenerateModal, StatusChangeModal } from '../modals';
import type { QrCodeActionsProps } from '../../domain/types';

export function QrCodeActions({
  selectedTable,
  modals,
  pendingStatusChange,
  loading,
  qrPrintRef,
  tablesCount,
  handlers,
}: QrCodeActionsProps) {
  return (
    <>
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

      {pendingStatusChange && (
        <StatusChangeModal
          isOpen={modals.showDeactivateConfirm}
          onClose={handlers.cancelStatusChange}
          onConfirm={handlers.confirmStatusChange}
          table={selectedTable}
          targetStatus={pendingStatusChange}
        />
      )}

      <BulkRegenerateModal
        isOpen={modals.isBulkRegenOpen}
        onClose={() => modals.setIsBulkRegenOpen(false)}
        onConfirm={handlers.bulkRegenerateQR}
        tableCount={tablesCount}
        isLoading={loading.isBulkRegenLoading}
      />
    </>
  );
}

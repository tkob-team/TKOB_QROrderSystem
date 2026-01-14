/**
 * QR Actions Hook
 *
 * Encapsulates all QR-related operations:
 * - Regenerate QR codes (single, bulk)
 * - Download QR codes (png/pdf, individual, all as zip)
 * - Print QR codes
 *
 * Extracted from useTablesPageController for better separation of concerns.
 */

import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useRegenerateAllQR, useRegenerateQR } from './queries/useTables';
import { tablesAdapter } from '@/features/tables/data';
import { logger } from '@/shared/utils/logger';
import type { Table, QRDownloadFormat } from '@/features/tables/model/types';

interface ShowToastFn {
  (message: string, type: 'success' | 'error'): void;
}

export function useTablesQRActions(
  selectedTable: Table | null,
  showToast: ShowToastFn
) {
  // ============================================================================
  // STATE & REFS
  // ============================================================================

  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isPrintingQR, setIsPrintingQR] = useState(false);
  const [isBulkRegenLoading, setIsBulkRegenLoading] = useState(false);

  const qrPrintRef = useRef<HTMLDivElement>(null);
  const regenerateQRMutation = useRegenerateQR();
  const regenerateAllQRMutation = useRegenerateAllQR();

  // ============================================================================
  // EVENT HANDLERS - QR Operations
  // ============================================================================

  const handleRegenerateQR = async () => {
    if (!selectedTable) return;

    try {
      logger.debug('[tables] REGENERATE_QR_ATTEMPT', { tableId: selectedTable.id });
      await regenerateQRMutation.mutateAsync(selectedTable.id);
      logger.info('[tables] REGENERATE_QR_SUCCESS', { tableId: selectedTable.id });

      showToast('QR code regenerated successfully', 'success');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to regenerate QR code';
      logger.error('[tables] REGENERATE_QR_ERROR', { message: errorMessage });
      showToast(errorMessage, 'error');
    }
  };

  const handleDownloadQR = async (format: QRDownloadFormat) => {
    if (!selectedTable) return;

    setIsDownloadingQR(true);
    try {
      const blob = await tablesAdapter.downloadQR(selectedTable.id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTable.name}-QR.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      logger.debug('[tables] DOWNLOAD_QR_SUCCESS', { tableId: selectedTable.id, format });

      showToast(`QR code downloaded as ${format.toUpperCase()}`, 'success');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to download QR code';
      logger.error('[tables] DOWNLOAD_QR_ERROR', { message: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      setIsDownloadingQR(false);
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      const blob = await tablesAdapter.downloadAllQR();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all-qr-codes.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      logger.debug('[tables] DOWNLOAD_ALL_QR_SUCCESS');

      showToast('All QR codes downloaded successfully', 'success');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to download all QR codes';
      logger.error('[tables] DOWNLOAD_ALL_QR_ERROR', { message: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleBulkRegenerateQR = async () => {
    setIsBulkRegenLoading(true);
    try {
      await regenerateAllQRMutation.mutateAsync();

      showToast('All QR codes regenerated successfully', 'success');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to regenerate all QR codes';
      logger.error('[tables] BULK_REGENERATE_QR_ERROR', { message: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      setIsBulkRegenLoading(false);
    }
  };

  // Print QR using react-to-print
  const handlePrintQR = useReactToPrint({
    contentRef: qrPrintRef,
    documentTitle: `QR-Code-${selectedTable?.name || 'Table'}`,
    onBeforePrint: async () => {
      if (!selectedTable || !qrPrintRef.current) {
        throw new Error('QR code not loaded');
      }
    },
    onPrintError: (error: any) => {
      logger.error('[tables] PRINT_QR_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
      const errorMsg =
        error && typeof error === 'object' && 'message' in (error as any)
          ? String((error as any).message)
          : 'Please try again';
      showToast('Print failed: ' + errorMsg, 'error');
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
      showToast('QR code not loaded. Please try again.', 'error');
      return;
    }

    try {
      setIsPrintingQR(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
      handlePrintQR();
      showToast('Print dialog opened', 'success');
    } catch (error: any) {
      logger.error('[tables] PRINT_QR_WRAPPER_ERROR', { message: error?.message || 'Unknown error' });
      showToast(
        'Print failed: ' + (error?.message || 'Please try again'),
        'error'
      );
    } finally {
      setIsPrintingQR(false);
    }
  };

  // ============================================================================
  // RETURN API
  // ============================================================================

  return {
    // Ref
    qrPrintRef,

    // Loading states
    loading: {
      isDownloadingQR,
      isDownloadingAll,
      isPrintingQR,
      isBulkRegenLoading,
    },

    // Handlers
    handlers: {
      regenerateQR: handleRegenerateQR,
      downloadQR: handleDownloadQR,
      downloadAll: handleDownloadAll,
      bulkRegenerateQR: handleBulkRegenerateQR,
      printQR: handlePrintQRWrapper,
    },
  };
}

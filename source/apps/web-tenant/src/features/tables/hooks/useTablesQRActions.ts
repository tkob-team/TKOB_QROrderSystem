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
import { useRegenerateQR } from './queries/useTables';
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

  // ============================================================================
  // EVENT HANDLERS - QR Operations
  // ============================================================================

  const handleRegenerateQR = async () => {
    if (!selectedTable) return;

    try {
      console.log('🔄 [POST /tables/:id/qr/regenerate] Request:', {
        id: selectedTable.id,
      });
      await regenerateQRMutation.mutateAsync(selectedTable.id);
      console.log('✅ [POST /tables/:id/qr/regenerate] Success');

      showToast('QR code regenerated successfully', 'success');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to regenerate QR code';
      console.error('❌ API Error:', error);
      showToast(errorMessage, 'error');
    }
  };

  const handleDownloadQR = async (format: QRDownloadFormat) => {
    if (!selectedTable) return;

    setIsDownloadingQR(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error(
          'API URL not configured. Please check NEXT_PUBLIC_API_URL in .env file'
        );
      }

      console.log(`📥 [GET /tables/:id/qr/download] Request:`, {
        id: selectedTable.id,
        format,
      });

      const token =
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken');
      const response = await fetch(
        `${apiUrl}/api/v1/admin/tables/${selectedTable.id}/qr/download?format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok)
        throw new Error(`Download failed: ${response.statusText}`);

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

      showToast(`QR code downloaded as ${format.toUpperCase()}`, 'success');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to download QR code';
      console.error('❌ API Error:', error);
      showToast(errorMessage, 'error');
    } finally {
      setIsDownloadingQR(false);
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error(
          'API URL not configured. Please check NEXT_PUBLIC_API_URL in .env file'
        );
      }

      console.log('📥 [GET /tables/qr/download-all] Request');

      const token =
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken');
      const response = await fetch(
        `${apiUrl}/api/v1/admin/tables/qr/download-all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok)
        throw new Error(`Download failed: ${response.statusText}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all-qr-codes.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log('✅ [GET /tables/qr/download-all] Downloaded');

      showToast('All QR codes downloaded successfully', 'success');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to download all QR codes';
      console.error('❌ API Error:', error);
      showToast(errorMessage, 'error');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleBulkRegenerateQR = async () => {
    setIsBulkRegenLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error(
          'API URL not configured. Please check NEXT_PUBLIC_API_URL in .env file'
        );
      }

      console.log('🔄 [POST /tables/qr/regenerate-all] Request');

      const token =
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken');
      const response = await fetch(
        `${apiUrl}/api/v1/admin/tables/qr/regenerate-all`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok)
        throw new Error(`Regeneration failed: ${response.statusText}`);

      const result = await response.json();
      console.log('✅ [POST /tables/qr/regenerate-all] Response:', result);

      showToast('All QR codes regenerated successfully', 'success');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to regenerate all QR codes';
      console.error('❌ API Error:', error);
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
    onPrintError: (error) => {
      console.error('Print error:', error);
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
      console.error('Print failed:', error);
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

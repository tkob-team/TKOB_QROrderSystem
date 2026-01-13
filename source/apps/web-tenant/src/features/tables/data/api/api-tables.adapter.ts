/**
 * Tables API Adapter
 * Real API implementation using Orval generated functions
 */

import type { ITablesAdapter } from '../adapter.interface';
import type {
  CreateTableDto,
  UpdateTableDto,
  TableResponseDto,
  TableControllerFindAllParams,
} from '@/services/generated/models';
import type { QRDownloadFormat } from '@/features/tables/model/types';
import { env } from '@/shared/config/env';
import { logger } from '@/shared/utils/logger';
import {
  tableControllerCreate,
  tableControllerFindAll,
  tableControllerFindOne,
  tableControllerUpdate,
  tableControllerDelete,
  tableControllerUpdateStatus as apiUpdateTableStatus,
  tableControllerGetLocations,
  tableControllerRegenerateQr,
  tableControllerBulkRegenerateAllQr,
} from '@/services/generated/tables/tables';

const logDataEnabled = process.env.NEXT_PUBLIC_LOG_DATA === 'true';

export class TablesApiAdapter implements ITablesAdapter {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  async listTables(params?: TableControllerFindAllParams): Promise<TableResponseDto[]> {
    logger.debug('[tables] LIST_TABLES_ATTEMPT', { hasParams: !!params });
    try {
      const result = await tableControllerFindAll(params);
      logger.debug('[tables] LIST_TABLES_SUCCESS', { count: result.data?.length || 0 });
      return result.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; statusText?: string; data?: unknown };
        message?: string;
      };
      logger.error('[tables] LIST_TABLES_ERROR', {
        status: err?.response?.status,
        message: err?.message,
      });
      throw error;
    }
  }

  async getTableById(id: string): Promise<TableResponseDto> {
    return tableControllerFindOne(id);
  }

  async createTable(data: CreateTableDto): Promise<TableResponseDto> {
    return tableControllerCreate(data);
  }

  async updateTable(id: string, data: UpdateTableDto): Promise<TableResponseDto> {
    return tableControllerUpdate(id, data);
  }

  async deleteTable(id: string): Promise<void> {
    await tableControllerDelete(id);
  }

  async updateTableStatus(
    id: string,
    status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE'
  ): Promise<TableResponseDto> {
    logger.debug('[tables] UPDATE_STATUS_ATTEMPT', { tableId: id, status });
    try {
      const result = await apiUpdateTableStatus(id, { status });
      logger.info('[tables] UPDATE_STATUS_SUCCESS', { tableId: id, status });
      return result;
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      logger.error('[tables] UPDATE_STATUS_ERROR', {
        tableId: id,
        status,
        httpStatus: err?.response?.status,
        message: err?.message,
      });
      throw error;
    }
  }

  async regenerateQR(id: string): Promise<{
    tableId: string;
    qrToken: string;
    qrCodeUrl: string;
    generatedAt: string;
  }> {
    return tableControllerRegenerateQr(id);
  }

  async regenerateAllQR(): Promise<{
    successCount: number;
    totalProcessed: number;
    generatedAt: string;
  }> {
    const result = await tableControllerBulkRegenerateAllQr();
    return {
      successCount: result.successCount,
      totalProcessed: result.totalProcessed,
      generatedAt: result.regeneratedAt,
    };
  }

  async downloadQR(id: string, format: QRDownloadFormat): Promise<Blob> {
    const apiUrl = env.apiUrl;
    if (!apiUrl) {
      throw new Error('API URL not configured. Please check NEXT_PUBLIC_API_URL in .env');
    }

    const token = this.getAuthToken();
    const response = await fetch(
      `${apiUrl}/api/v1/admin/tables/${id}/qr/download?format=${format}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    if (logDataEnabled) {
      const safeUrl = `${apiUrl}/api/v1/admin/tables/${id}/qr/download`;
      logger.info('[data] FETCH_QR_DOWNLOAD', {
        method: 'GET',
        url: safeUrl,
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
      });
    }

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  }

  async downloadAllQR(): Promise<Blob> {
    const apiUrl = env.apiUrl;
    if (!apiUrl) {
      throw new Error('API URL not configured. Please check NEXT_PUBLIC_API_URL in .env');
    }

    const token = this.getAuthToken();
    const response = await fetch(`${apiUrl}/api/v1/admin/tables/qr/download-all`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (logDataEnabled) {
      const safeUrl = `${apiUrl}/api/v1/admin/tables/qr/download-all`;
      logger.info('[data] FETCH_QR_DOWNLOAD', {
        method: 'GET',
        url: safeUrl,
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
      });
    }

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  }

  async getLocations(): Promise<string[]> {
    return tableControllerGetLocations();
  }
}

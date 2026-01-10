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

export class TablesApiAdapter implements ITablesAdapter {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  async listTables(params?: TableControllerFindAllParams): Promise<TableResponseDto[]> {
    console.log('🌐 [API Adapter] Calling tableControllerFindAll with params:', params);
    try {
      const result = await tableControllerFindAll(params);
      console.log('🌐 [API Adapter] tableControllerFindAll response:', result);
      return result.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; statusText?: string; data?: unknown };
        message?: string;
      };
      console.error('🌐 [API Adapter] Error calling tableControllerFindAll:', {
        params,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        message: err?.message,
        errorData: err?.response?.data,
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
    console.log('🌐 [API Adapter] updateTableStatus called with:', { id, status });
    console.log('🌐 [API Adapter] Calling apiUpdateTableStatus with body:', { status });
    try {
      const result = await apiUpdateTableStatus(id, { status });
      console.log('🌐 [API Adapter] updateTableStatus success:', result);
      return result;
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      console.error('🌐 [API Adapter] updateTableStatus error:', {
        id,
        status,
        errorStatus: err?.response?.status,
        errorData: err?.response?.data,
        errorMessage: err?.message,
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

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  }

  async getLocations(): Promise<string[]> {
    return tableControllerGetLocations();
  }
}

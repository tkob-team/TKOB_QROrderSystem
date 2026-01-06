/**
 * Tables API Adapter
 * Real API implementation using Orval generated functions
 */

import type { ITablesAdapter } from './tables-adapter.interface';
import type {
  CreateTableDto,
  UpdateTableDto,
  TableResponseDto,
  TableControllerFindAllParams,
} from '@/services/generated/models';
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

  async getLocations(): Promise<string[]> {
    return tableControllerGetLocations();
  }
}

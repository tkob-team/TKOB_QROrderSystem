/**
 * Tables Adapter Interface
 * Contract for both Mock and Real API implementations
 */

import type {
  CreateTableDto,
  UpdateTableDto,
  TableResponseDto,
  TableControllerFindAllParams,
} from '@/services/generated/models';

export interface ITablesAdapter {
  /**
   * Get all tables with optional filters
   */
  listTables(params?: TableControllerFindAllParams): Promise<TableResponseDto[]>;

  /**
   * Get table by ID
   */
  getTableById(id: string): Promise<TableResponseDto>;

  /**
   * Create new table
   */
  createTable(data: CreateTableDto): Promise<TableResponseDto>;

  /**
   * Update table
   */
  updateTable(id: string, data: UpdateTableDto): Promise<TableResponseDto>;

  /**
   * Delete table (soft delete)
   */
  deleteTable(id: string): Promise<void>;

  /**
   * Update table status only
   */
  updateTableStatus(
    id: string,
    status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE'
  ): Promise<TableResponseDto>;

  /**
   * Regenerate QR code for table
   */
  regenerateQR(id: string): Promise<{
    tableId: string;
    qrToken: string;
    qrCodeUrl: string;
    generatedAt: string;
  }>;

  /**
   * Regenerate QR codes for all tables
   */
  regenerateAllQR(): Promise<{
    successCount: number;
    totalProcessed: number;
    generatedAt: string;
  }>;

  /**
   * Get distinct locations for filter dropdown
   */
  getLocations(): Promise<string[]>;
}

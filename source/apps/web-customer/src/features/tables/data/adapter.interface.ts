// Tables feature adapter interface

import { ApiResponse, Table, Restaurant } from '@/types';
import type { SessionInfo } from './types';

/**
 * Tables adapter interface
 * Defines the contract for table data access implementations
 */
export interface ITablesAdapter {
  validateQRToken(token: string): Promise<ApiResponse<{
    table: Table;
    restaurant: Restaurant;
  }>>;
  
  getCurrentSession(): Promise<SessionInfo>;
  
  getTableInfo(tableId: string): Promise<ApiResponse<Table>>;
}

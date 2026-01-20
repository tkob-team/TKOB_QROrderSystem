// Table strategy interface

import { ApiResponse, Table, Restaurant } from '@/types';

export interface SessionInfo {
  sessionId: string;
  tableId: string;
  tableNumber: string;
  restaurantName: string;
  tenantId: string;
  active: boolean;
  createdAt: string;
  /** Timestamp when customer requested bill, null if not requested */
  billRequestedAt?: string | null;
}

export interface ITableStrategy {
  validateQRToken(token: string): Promise<ApiResponse<{
    table: Table;
    restaurant: Restaurant;
  }>>;
  
  getCurrentSession(): Promise<SessionInfo>;
  
  getTableInfo(tableId: string): Promise<ApiResponse<Table>>;
}

// Mock Table Strategy - returns mock data

import { tableHandlers } from '@/api/mocks';
import { ApiResponse, Table, Restaurant } from '@/types';
import { ITableStrategy, SessionInfo } from '../interfaces';

export class MockTableStrategy implements ITableStrategy {
  async validateQRToken(token: string): Promise<ApiResponse<{ table: Table; restaurant: Restaurant }>> {
    return tableHandlers.validateQRToken(token);
  }
  
  async getCurrentSession(): Promise<SessionInfo> {
    return {
      sessionId: 'mock-session-123',
      tableId: 'mock-table-123',
      tableNumber: '5',
      restaurantName: 'The Golden Spoon',
      tenantId: 'mock-tenant',
      active: true,
      createdAt: new Date().toISOString(),
    };
  }
  
  async getTableInfo(tableId: string): Promise<ApiResponse<Table>> {
    return tableHandlers.getTableInfo(tableId);
  }
}

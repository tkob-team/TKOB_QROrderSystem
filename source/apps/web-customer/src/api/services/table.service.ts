// Table service - handles table session and QR validation
// Refactored to use Strategy Pattern

import { StrategyFactory, SessionInfo } from '@/api/strategies';
import { ApiResponse, Table, Restaurant } from '@/types';

// Create strategy instance (mock or real based on API_MODE)
const tableStrategy = StrategyFactory.createTableStrategy();

export type { SessionInfo };

export const TableService = {
  /**
   * Validate QR token and get table session
   */
  async validateQRToken(token: string): Promise<ApiResponse<{
    table: Table;
    restaurant: Restaurant;
  }>> {
    return tableStrategy.validateQRToken(token);
  },
  
  /**
   * Get current session information (session-based)
   * Cookie automatically sent by axios
   */
  async getCurrentSession(): Promise<SessionInfo> {
    return tableStrategy.getCurrentSession();
  },
  
  /**
   * Get table information
   */
  async getTableInfo(tableId: string): Promise<ApiResponse<Table>> {
    return tableStrategy.getTableInfo(tableId);
  },
};

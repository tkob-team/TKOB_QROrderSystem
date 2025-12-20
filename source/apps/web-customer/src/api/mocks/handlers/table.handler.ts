// Mock handlers for table-related API calls

import { ApiResponse, Table, Restaurant } from '@/types';
import { mockTable, mockRestaurant } from '../data';
import { delay, createSuccessResponse, createErrorResponse } from '../utils';

export const tableHandlers = {
  /**
   * Validate QR token and get table session
   */
  async validateQRToken(token: string): Promise<ApiResponse<{
    table: Table;
    restaurant: Restaurant;
  }>> {
    await delay(400);
    
    // Validate token format
    if (!token || token !== 'mock-token-123') {
      return createErrorResponse('Invalid or expired QR code');
    }
    
    return createSuccessResponse({
      table: mockTable,
      restaurant: mockRestaurant,
    });
  },
  
  /**
   * Get table info
   */
  async getTableInfo(tableId: string): Promise<ApiResponse<Table>> {
    await delay(300);
    
    if (tableId !== mockTable.id) {
      return createErrorResponse('Table not found');
    }
    
    return createSuccessResponse(mockTable);
  },
};

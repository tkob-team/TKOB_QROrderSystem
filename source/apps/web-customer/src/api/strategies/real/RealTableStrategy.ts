// Real Table Strategy - calls actual backend API

import apiClient from '@/api/client';
import { ApiResponse, Table, Restaurant } from '@/types';
import { ITableStrategy, SessionInfo } from '../interfaces';

export class RealTableStrategy implements ITableStrategy {
  async validateQRToken(token: string): Promise<ApiResponse<{ table: Table; restaurant: Restaurant }>> {
    const response = await apiClient.post<{ success: boolean; data: ApiResponse<{ table: Table; restaurant: Restaurant }> }>('/table/validate-qr', { token });
    return response.data.data;
  }
  
  async getCurrentSession(): Promise<SessionInfo> {
    // Remove /api/v1 prefix - apiClient already has baseURL with /api/v1
    const response = await apiClient.get<{ success: boolean; data: SessionInfo }>('/session');
    return response.data.data;
  }
  
  async getTableInfo(tableId: string): Promise<ApiResponse<Table>> {
    const response = await apiClient.get<{ success: boolean; data: ApiResponse<Table> }>(`/table/${tableId}`);
    return response.data.data;
  }
}

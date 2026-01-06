/**
 * Tables Mock Adapter
 * Simulates API responses with fake delay and error scenarios
 */

import type { ITablesAdapter } from './tables-adapter.interface';
import type {
  CreateTableDto,
  UpdateTableDto,
  TableResponseDto,
  TableControllerFindAllParams,
} from '@/services/generated/models';

/**
 * Simulate network delay (200-500ms)
 */
const fakeDelay = () => new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

/**
 * Mock tables in-memory storage
 */
const mockTables: TableResponseDto[] = [
  {
    id: 'table-1',
    tenantId: 'tenant-001',
    tableNumber: 'Table 1',
    capacity: 4,
    location: 'Main Hall',
    description: 'Near window',
    status: 'AVAILABLE',
    active: true,
    displayOrder: 1,
    qrCodeUrl: '/api/v1/admin/tables/table-1/qr/download',
    qrGeneratedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'table-2',
    tenantId: 'tenant-001',
    tableNumber: 'Table 2',
    capacity: 2,
    location: 'Main Hall',
    description: '',
    status: 'OCCUPIED',
    active: true,
    displayOrder: 2,
    qrCodeUrl: '/api/v1/admin/tables/table-2/qr/download',
    qrGeneratedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'table-3',
    tenantId: 'tenant-001',
    tableNumber: 'VIP 1',
    capacity: 8,
    location: 'VIP Room',
    description: 'Private room',
    status: 'RESERVED',
    active: true,
    displayOrder: 3,
    qrCodeUrl: '/api/v1/admin/tables/table-3/qr/download',
    qrGeneratedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class TablesMockAdapter implements ITablesAdapter {
  async listTables(params?: TableControllerFindAllParams): Promise<TableResponseDto[]> {
    await fakeDelay();

    let filtered = [...mockTables];

    // Apply filters
    if (params?.activeOnly) {
      filtered = filtered.filter((t) => t.active);
    }
    if (params?.status) {
      filtered = filtered.filter((t) => t.status === params.status);
    }
    if (params?.location) {
      filtered = filtered.filter((t) => t.location === params.location);
    }

    return filtered;
  }

  async getTableById(id: string): Promise<TableResponseDto> {
    await fakeDelay();

    // Simulate not found error
    if (id === 'nonexistent') {
      throw new Error('Table not found');
    }

    const table = mockTables.find((t) => t.id === id);
    if (!table) {
      throw new Error('Table not found');
    }

    return table;
  }

  async createTable(data: CreateTableDto): Promise<TableResponseDto> {
    await fakeDelay();

    // Simulate duplicate table number error
    if (mockTables.some((t) => t.tableNumber === data.tableNumber)) {
      throw new Error('Table number already exists');
    }

    const newTable: TableResponseDto = {
      id: `table-${Date.now()}`,
      tenantId: 'tenant-001',
      tableNumber: data.tableNumber,
      capacity: data.capacity,
      location: data.location || 'Main Hall',
      description: data.description || '',
      status: 'AVAILABLE',
      active: true,
      displayOrder: data.displayOrder || mockTables.length + 1,
      qrCodeUrl: `/api/v1/admin/tables/table-${Date.now()}/qr/download`,
      qrGeneratedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockTables.push(newTable);
    return newTable;
  }

  async updateTable(id: string, data: UpdateTableDto): Promise<TableResponseDto> {
    await fakeDelay();

    const index = mockTables.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Table not found');
    }

    // Simulate duplicate table number error
    if (
      data.tableNumber &&
      mockTables.some((t) => t.tableNumber === data.tableNumber && t.id !== id)
    ) {
      throw new Error('Table number already exists');
    }

    const updated: TableResponseDto = {
      ...mockTables[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    mockTables[index] = updated;
    return updated;
  }

  async deleteTable(id: string): Promise<void> {
    await fakeDelay();

    const index = mockTables.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Table not found');
    }

    // Simulate "cannot delete with active orders" error
    if (mockTables[index].status === 'OCCUPIED') {
      throw new Error('Cannot delete table with active orders');
    }

    // Soft delete
    mockTables[index].active = false;
    mockTables[index].updatedAt = new Date().toISOString();
  }

  async updateTableStatus(
    id: string,
    status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE'
  ): Promise<TableResponseDto> {
    await fakeDelay();

    const index = mockTables.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Table not found');
    }

    mockTables[index].status = status;
    mockTables[index].updatedAt = new Date().toISOString();

    return mockTables[index];
  }

  async regenerateQR(id: string): Promise<{
    tableId: string;
    qrToken: string;
    qrCodeUrl: string;
    generatedAt: string;
  }> {
    await fakeDelay();

    const table = mockTables.find((t) => t.id === id);
    if (!table) {
      throw new Error('Table not found');
    }

    const generatedAt = new Date().toISOString();
    table.qrGeneratedAt = generatedAt;
    table.updatedAt = generatedAt;

    return {
      tableId: id,
      qrToken: `qr_token_${Date.now()}`,
      qrCodeUrl: table.qrCodeUrl,
      generatedAt,
    };
  }

  async getLocations(): Promise<string[]> {
    await fakeDelay();

    const locations = [...new Set(mockTables.map((t) => t.location))];
    return locations;
  }
}

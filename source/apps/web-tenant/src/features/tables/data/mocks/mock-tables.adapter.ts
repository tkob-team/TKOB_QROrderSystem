/**
 * Tables Mock Adapter
 * Simulates API responses with fake delay and error scenarios
 */

import type { ITablesAdapter } from '../adapter.interface';
import type {
  CreateTableDto,
  UpdateTableDto,
  TableResponseDto,
  TableControllerFindAllParams,
} from '@/services/generated/models';
import type { QRDownloadFormat } from '../../model/types';
import { logger } from '@/shared/utils/logger';
import { samplePayload } from '@/shared/utils/dataInspector';

const logFullDataEnabled =
  process.env.NEXT_PUBLIC_LOG_DATA === 'true' &&
  process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

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
    location: 'Indoor',
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
    location: 'Indoor',
    description: 'Cozy corner',
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
    tableNumber: 'Table 3',
    capacity: 4,
    location: 'Indoor',
    description: 'Center table',
    status: 'AVAILABLE',
    active: true,
    displayOrder: 3,
    qrCodeUrl: '/api/v1/admin/tables/table-3/qr/download',
    qrGeneratedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'table-4',
    tenantId: 'tenant-001',
    tableNumber: 'Table 4',
    capacity: 6,
    location: 'Indoor',
    description: 'Large family table',
    status: 'RESERVED',
    active: true,
    displayOrder: 4,
    qrCodeUrl: '/api/v1/admin/tables/table-4/qr/download',
    qrGeneratedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'table-5',
    tenantId: 'tenant-001',
    tableNumber: 'Table 5',
    capacity: 2,
    location: 'Outdoor',
    description: 'Outdoor seating',
    status: 'AVAILABLE',
    active: true,
    displayOrder: 5,
    qrCodeUrl: '/api/v1/admin/tables/table-5/qr/download',
    qrGeneratedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'table-6',
    tenantId: 'tenant-001',
    tableNumber: 'Table 6',
    capacity: 4,
    location: 'Outdoor',
    description: 'Garden view',
    status: 'OCCUPIED',
    active: true,
    displayOrder: 6,
    qrCodeUrl: '/api/v1/admin/tables/table-6/qr/download',
    qrGeneratedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'table-7',
    tenantId: 'tenant-001',
    tableNumber: 'Table 7',
    capacity: 2,
    location: 'VIP Room',
    description: 'High table',
    status: 'AVAILABLE',
    active: true,
    displayOrder: 7,
    qrCodeUrl: '/api/v1/admin/tables/table-7/qr/download',
    qrGeneratedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'table-8',
    tenantId: 'tenant-001',
    tableNumber: 'Table 8',
    capacity: 2,
    location: 'Outdoor',
    description: 'High table',
    status: 'OCCUPIED',
    active: true,
    displayOrder: 8,
    qrCodeUrl: '/api/v1/admin/tables/table-8/qr/download',
    qrGeneratedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'table-9',
    tenantId: 'tenant-001',
    tableNumber: 'Table 9',
    capacity: 8,
    location: 'Patio',
    description: 'Private room with projector',
    status: 'RESERVED',
    active: true,
    displayOrder: 9,
    qrCodeUrl: '/api/v1/admin/tables/table-9/qr/download',
    qrGeneratedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'table-10',
    tenantId: 'tenant-001',
    tableNumber: 'Table 10',
    capacity: 6,
    location: 'VIP Room',
    description: 'Private room',
    status: 'AVAILABLE',
    active: true,
    displayOrder: 10,
    qrCodeUrl: '/api/v1/admin/tables/table-10/qr/download',
    qrGeneratedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'table-11',
    tenantId: 'tenant-001',
    tableNumber: 'Table 11',
    capacity: 4,
    location: 'Indoor',
    description: '',
    status: 'INACTIVE',
    active: true,
    displayOrder: 11,
    qrCodeUrl: '/api/v1/admin/tables/table-11/qr/download',
    qrGeneratedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'table-12',
    tenantId: 'tenant-001',
    tableNumber: 'Table 12',
    capacity: 2,
    location: 'Outdoor',
    description: 'Near entrance',
    status: 'AVAILABLE',
    active: false,
    displayOrder: 12,
    qrCodeUrl: '/api/v1/admin/tables/table-12/qr/download',
    qrGeneratedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'table-13',
    tenantId: 'tenant-001',
    tableNumber: 'Table 13',
    capacity: 4,
    location: 'Indoor',
    description: 'private corner',
    status: 'INACTIVE',
    active: true,
    displayOrder: 13,
    qrCodeUrl: '/api/v1/admin/tables/table-13/qr/download',
    qrGeneratedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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

    // Apply sorting
    if (params?.sortBy) {
      const order = params.sortOrder === 'desc' ? -1 : 1;
      filtered.sort((a, b) => {
        switch (params!.sortBy) {
          case 'tableNumber': {
            // Use displayOrder for proper numeric sorting (already correctly ordered in mock data)
            const av = Number(a.displayOrder ?? 0);
            const bv = Number(b.displayOrder ?? 0);
            return (av - bv) * order;
          }
          case 'capacity': {
            const av = Number(a.capacity ?? 0);
            const bv = Number(b.capacity ?? 0);
            return (av - bv) * order;
          }
          case 'createdAt': {
            const av = Date.parse(a.createdAt || '');
            const bv = Date.parse(b.createdAt || '');
            return (av - bv) * order;
          }
          default:
            return 0;
        }
      });
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

    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'tables',
        op: 'create',
        payload: samplePayload(data),
      });
    }

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
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'tables',
        op: 'create',
        data: samplePayload(newTable),
      });
    }
    return newTable;
  }

  async updateTable(id: string, data: UpdateTableDto): Promise<TableResponseDto> {
    await fakeDelay();

    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'tables',
        op: 'update',
        payload: samplePayload({ id, ...data }),
      });
    }

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
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'tables',
        op: 'update',
        data: samplePayload(updated),
      });
    }
    return updated;
  }

  async deleteTable(id: string): Promise<void> {
    await fakeDelay();

    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'tables',
        op: 'delete',
        payload: samplePayload({ id }),
      });
    }

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

    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'tables',
        op: 'delete',
        data: samplePayload({ success: true }),
      });
    }
  }

  async updateTableStatus(
    id: string,
    status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE'
  ): Promise<TableResponseDto> {
    await fakeDelay();

    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'tables',
        op: 'status.update',
        payload: samplePayload({ id, status }),
      });
    }

    const index = mockTables.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Table not found');
    }

    mockTables[index].status = status;
    mockTables[index].updatedAt = new Date().toISOString();

    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'tables',
        op: 'status.update',
        data: samplePayload(mockTables[index]),
      });
    }
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

  async regenerateAllQR(): Promise<{
    successCount: number;
    totalProcessed: number;
    generatedAt: string;
  }> {
    await fakeDelay();
    const generatedAt = new Date().toISOString();
    
    // Update all tables with new QR data
    mockTables.forEach((table) => {
      table.qrGeneratedAt = generatedAt;
    });

    return {
      successCount: mockTables.length,
      totalProcessed: mockTables.length,
      generatedAt,
    };
  }

  async downloadQR(id: string, format: QRDownloadFormat): Promise<Blob> {
    await fakeDelay();

    const table = mockTables.find((t) => t.id === id);
    if (!table) {
      throw new Error('Table not found');
    }

    const mimeType = format === 'pdf' ? 'application/pdf' : 'image/png';
    const content = `Mock QR for ${table.tableNumber} (${format})`;
    return new Blob([content], { type: mimeType });
  }

  async downloadAllQR(): Promise<Blob> {
    await fakeDelay();
    const content = `Mock ZIP for ${mockTables.length} tables`;
    return new Blob([content], { type: 'application/zip' });
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { TableService } from './table.service';
import { TableRepository } from '../repositories/table.repository';
import { QrService } from './qr.service';
import { PdfService } from './pdf.service';
import { NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TableStatus } from '@prisma/client';

describe('TableService', () => {
  let service: TableService;
  let tableRepo: jest.Mocked<TableRepository>;
  let qrService: jest.Mocked<QrService>;
  let pdfService: jest.Mocked<PdfService>;

  const mockTable = {
    id: 'table-123',
    tenantId: 'tenant-1',
    tableNumber: 'A1',
    capacity: 4,
    location: 'indoor',
    status: 'AVAILABLE' as TableStatus,
    active: true,
    qrToken: 'token-123',
    qrTokenHash: 'hash-123',
  };

  beforeEach(async () => {
    const tableRepoMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findByTenantId: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateQrToken: jest.fn(),
      invalidateQrToken: jest.fn(),
      hasActiveOrders: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      getDistinctLocations: jest.fn(),
    };

    const qrServiceMock = {
      generateToken: jest.fn().mockReturnValue({ token: 'new-token', tokenHash: 'new-hash' }),
      generateQrCodeImage: jest.fn().mockResolvedValue(Buffer.from('qr-image')),
    };

    const pdfServiceMock = {
      generateSingleQrPdf: jest.fn().mockResolvedValue(Buffer.from('pdf-data')),
      generateMultiPageQrPdf: jest.fn().mockResolvedValue(Buffer.from('multi-pdf')),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableService,
        { provide: TableRepository, useValue: tableRepoMock },
        { provide: QrService, useValue: qrServiceMock },
        { provide: PdfService, useValue: pdfServiceMock },
      ],
    }).compile();

    service = module.get<TableService>(TableService);
    tableRepo = module.get<TableRepository>(TableRepository) as jest.Mocked<TableRepository>;
    qrService = module.get<QrService>(QrService) as jest.Mocked<QrService>;
    pdfService = module.get<PdfService>(PdfService) as jest.Mocked<PdfService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create table with QR code', async () => {
      tableRepo.create.mockResolvedValue(mockTable as any);
      tableRepo.updateQrToken.mockResolvedValue(mockTable as any);

      const result = await service.create('tenant-1', {
        tableNumber: 'A1',
        capacity: 4,
        location: 'indoor',
      });

      expect(tableRepo.create).toHaveBeenCalled();
      expect(qrService.generateToken).toHaveBeenCalled();
      expect(tableRepo.updateQrToken).toHaveBeenCalled();
      expect(result.tableNumber).toBe('A1');
    });
  });

  describe('findAll', () => {
    it('should return tables with metadata', async () => {
      tableRepo.findByTenantId.mockResolvedValue({
        tables: [mockTable],
        totalAll: 1,
        totalFiltered: 1,
      } as any);

      const result = await service.findAll('tenant-1');

      expect(result.tables).toHaveLength(1);
      expect(result.meta.totalAll).toBe(1);
    });

    it('should apply filters', async () => {
      tableRepo.findByTenantId.mockResolvedValue({
        tables: [],
        totalAll: 5,
        totalFiltered: 0,
      } as any);

      await service.findAll('tenant-1', {
        activeOnly: true,
        status: 'AVAILABLE' as TableStatus,
        location: 'outdoor',
      });

      expect(tableRepo.findByTenantId).toHaveBeenCalledWith('tenant-1', expect.any(Object));
    });
  });

  describe('findById', () => {
    it('should return table by ID', async () => {
      tableRepo.findById.mockResolvedValue(mockTable as any);

      const result = await service.findById('table-123');

      expect(result.id).toBe('table-123');
    });

    it('should throw NotFoundException if table not found', async () => {
      tableRepo.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update table', async () => {
      tableRepo.findById.mockResolvedValue(mockTable as any);
      tableRepo.update.mockResolvedValue({ ...mockTable, capacity: 6 } as any);

      const result = await service.update('table-123', 'tenant-1', { capacity: 6 });

      expect(result.capacity).toBe(6);
    });

    it('should throw ForbiddenException if table belongs to another tenant', async () => {
      tableRepo.findById.mockResolvedValue({ ...mockTable, tenantId: 'other-tenant' } as any);

      await expect(
        service.update('table-123', 'tenant-1', { capacity: 6 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should soft delete table', async () => {
      tableRepo.findById.mockResolvedValue(mockTable as any);
      tableRepo.hasActiveOrders.mockResolvedValue(false);

      await service.delete('table-123', 'tenant-1');

      expect(tableRepo.update).toHaveBeenCalledWith('table-123', { active: false });
    });

    it('should throw ConflictException if table has active orders', async () => {
      tableRepo.findById.mockResolvedValue(mockTable as any);
      tableRepo.hasActiveOrders.mockResolvedValue(true);

      await expect(service.delete('table-123', 'tenant-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('regenerateQr', () => {
    it('should regenerate QR code for table', async () => {
      tableRepo.findById.mockResolvedValue(mockTable as any);

      const result = await service.regenerateQr('table-123', 'tenant-1');

      expect(tableRepo.invalidateQrToken).toHaveBeenCalledWith('table-123');
      expect(qrService.generateToken).toHaveBeenCalled();
      expect(result.qrToken).toBe('new-token');
    });
  });

  describe('getQrCodeImage', () => {
    it('should return QR code image', async () => {
      tableRepo.findById.mockResolvedValue(mockTable as any);
      qrService.generateQrCodeImage.mockResolvedValue(Buffer.from('image'));

      const result = await service.getQrCodeImage('table-123', 'tenant-1', 'png');

      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should throw BadRequestException if table has no QR token', async () => {
      tableRepo.findById.mockResolvedValue({ ...mockTable, qrToken: null } as any);

      await expect(
        service.getQrCodeImage('table-123', 'tenant-1', 'png'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getQrCodePdf', () => {
    it('should return QR code PDF', async () => {
      tableRepo.findById.mockResolvedValue(mockTable as any);

      const result = await service.getQrCodePdf('table-123', 'tenant-1');

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(pdfService.generateSingleQrPdf).toHaveBeenCalled();
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should bulk update table status', async () => {
      tableRepo.findAll.mockResolvedValue([mockTable] as any);
      tableRepo.bulkUpdateStatus.mockResolvedValue(1);

      const result = await service.bulkUpdateStatus('tenant-1', ['table-123'], 'OCCUPIED');

      expect(result.updated).toBe(1);
    });

    it('should throw BadRequestException if some tables not found', async () => {
      tableRepo.findAll.mockResolvedValue([]);

      await expect(
        service.bulkUpdateStatus('tenant-1', ['table-123'], 'OCCUPIED'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDistinctLocations', () => {
    it('should return distinct locations', async () => {
      tableRepo.getDistinctLocations.mockResolvedValue(['indoor', 'outdoor', 'terrace']);

      const result = await service.getDistinctLocations('tenant-1');

      expect(result).toHaveLength(3);
      expect(result).toContain('indoor');
    });
  });
});

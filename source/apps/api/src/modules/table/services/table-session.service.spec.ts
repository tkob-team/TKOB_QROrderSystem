import { Test, TestingModule } from '@nestjs/testing';
import { TableSessionService, SessionData } from './table-session.service';
import { TableSessionRepository } from '../repositories/table-session.repository';
import { TableRepository } from '../repositories/table.repository';
import { QrService } from './qr.service';
import { PrismaService } from '@database/prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { TableStatus } from '@prisma/client';

describe('TableSessionService', () => {
  let service: TableSessionService;
  let sessionRepo: jest.Mocked<TableSessionRepository>;
  let tableRepo: jest.Mocked<TableRepository>;
  let qrService: jest.Mocked<QrService>;
  let prismaService: jest.Mocked<PrismaService>;

  const mockTable = {
    id: 'table-123',
    tenantId: 'tenant-1',
    tableNumber: 'A1',
    status: 'AVAILABLE' as TableStatus,
    capacity: 4,
  };

  const mockSession = {
    id: 'session-123',
    tableId: 'table-123',
    tenantId: 'tenant-1',
    active: true,
    scannedAt: new Date(),
    billRequestedAt: null,
  };

  beforeEach(async () => {
    const sessionRepoMock = {
      findActiveByTableId: jest.fn(),
      findSessionById: jest.fn(),
      createSession: jest.fn(),
      clearSession: jest.fn(),
      findActiveSessions: jest.fn(),
    };

    const tableRepoMock = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const qrServiceMock = {
      validateToken: jest.fn(),
    };

    const prismaMock = {
      tenant: {
        findUnique: jest.fn(),
      },
      order: {
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableSessionService,
        { provide: TableSessionRepository, useValue: sessionRepoMock },
        { provide: TableRepository, useValue: tableRepoMock },
        { provide: QrService, useValue: qrServiceMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TableSessionService>(TableSessionService);
    sessionRepo = module.get<TableSessionRepository>(TableSessionRepository) as jest.Mocked<TableSessionRepository>;
    tableRepo = module.get<TableRepository>(TableRepository) as jest.Mocked<TableRepository>;
    qrService = module.get<QrService>(QrService) as jest.Mocked<QrService>;
    prismaService = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scanQr', () => {
    it('should create new session for available table', async () => {
      qrService.validateToken.mockResolvedValue({
        tableId: 'table-123',
        tenantId: 'tenant-1',
        timestamp: Date.now(),
      });
      tableRepo.findById.mockResolvedValue(mockTable);
      sessionRepo.findActiveByTableId.mockResolvedValue(null);
      sessionRepo.createSession.mockResolvedValue(mockSession);

      const result = await service.scanQr('valid-qr-token');

      expect(qrService.validateToken).toHaveBeenCalledWith('valid-qr-token');
      expect(sessionRepo.createSession).toHaveBeenCalled();
      expect(tableRepo.update).toHaveBeenCalledWith('table-123', {
        status: TableStatus.OCCUPIED,
        currentSessionId: 'session-123',
      });
      expect(result.sessionId).toBe('session-123');
    });

    it('should reuse existing session for occupied table', async () => {
      qrService.validateToken.mockResolvedValue({
        tableId: 'table-123',
        tenantId: 'tenant-1',
        timestamp: Date.now(),
      });
      tableRepo.findById.mockResolvedValue({ ...mockTable, status: TableStatus.OCCUPIED });
      sessionRepo.findActiveByTableId.mockResolvedValue(mockSession);

      const result = await service.scanQr('valid-qr-token');

      expect(sessionRepo.createSession).not.toHaveBeenCalled();
      expect(result.sessionId).toBe('session-123');
    });

    it('should throw NotFoundException if table not found', async () => {
      qrService.validateToken.mockResolvedValue({
        tableId: 'table-123',
        tenantId: 'tenant-1',
        timestamp: Date.now(),
      });
      tableRepo.findById.mockResolvedValue(null);

      await expect(service.scanQr('valid-qr-token')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateSession', () => {
    it('should return session data for valid session', async () => {
      sessionRepo.findSessionById.mockResolvedValue(mockSession);
      tableRepo.findById.mockResolvedValue(mockTable);
      (prismaService.tenant.findUnique as jest.Mock).mockResolvedValue({
        name: 'Test Restaurant',
      });

      const result = await service.validateSession('session-123');

      expect(result.sessionId).toBe('session-123');
      expect(result.tableNumber).toBe('A1');
      expect(result.restaurantName).toBe('Test Restaurant');
    });

    it('should throw UnauthorizedException if session not found', async () => {
      sessionRepo.findSessionById.mockResolvedValue(null);

      await expect(service.validateSession('invalid-session')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if session is inactive', async () => {
      sessionRepo.findSessionById.mockResolvedValue({ ...mockSession, active: false });

      await expect(service.validateSession('session-123')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('clearTable', () => {
    it('should clear table session and mark orders as paid', async () => {
      sessionRepo.findActiveByTableId.mockResolvedValue(mockSession);
      (prismaService.order.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

      await service.clearTable('table-123', 'staff-1');

      expect(prismaService.order.updateMany).toHaveBeenCalled();
      expect(sessionRepo.clearSession).toHaveBeenCalledWith('session-123', 'staff-1');
      expect(tableRepo.update).toHaveBeenCalledWith('table-123', {
        status: TableStatus.AVAILABLE,
        currentSessionId: null,
      });
    });

    it('should throw NotFoundException if no active session', async () => {
      sessionRepo.findActiveByTableId.mockResolvedValue(null);

      await expect(service.clearTable('table-123', 'staff-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('isTableAvailable', () => {
    it('should return true if no active session', async () => {
      sessionRepo.findActiveByTableId.mockResolvedValue(null);

      const result = await service.isTableAvailable('table-123');

      expect(result).toBe(true);
    });

    it('should return false if active session exists', async () => {
      sessionRepo.findActiveByTableId.mockResolvedValue(mockSession);

      const result = await service.isTableAvailable('table-123');

      expect(result).toBe(false);
    });
  });

  describe('findActiveSession', () => {
    it('should return active session for table', async () => {
      sessionRepo.findActiveByTableId.mockResolvedValue(mockSession);

      const result = await service.findActiveSession('table-123');

      expect(result).toEqual(mockSession);
    });
  });

  describe('getActiveSessions', () => {
    it('should return all active sessions for tenant', async () => {
      sessionRepo.findActiveSessions.mockResolvedValue([mockSession]);

      const result = await service.getActiveSessions('tenant-1');

      expect(sessionRepo.findActiveSessions).toHaveBeenCalledWith('tenant-1');
      expect(result).toHaveLength(1);
    });
  });
});

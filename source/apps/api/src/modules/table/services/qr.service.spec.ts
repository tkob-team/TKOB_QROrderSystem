import { Test, TestingModule } from '@nestjs/testing';
import { QrService } from './qr.service';
import { ConfigService } from '@nestjs/config';
import { TableRepository } from '../repositories/table.repository';

describe('QrService', () => {
  let service: QrService;
  let tableRepo: jest.Mocked<TableRepository>;

  beforeEach(async () => {
    const configMock: Partial<jest.Mocked<ConfigService>> = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret-key';
        if (key === 'CUSTOMER_APP_URL') return 'https://order.example.com';
        return null;
      }),
    };

    const tableRepoMock = {
      findByQrToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrService,
        { provide: ConfigService, useValue: configMock },
        { provide: TableRepository, useValue: tableRepoMock },
      ],
    }).compile();

    service = module.get<QrService>(QrService);
    tableRepo = module.get<TableRepository>(TableRepository) as jest.Mocked<TableRepository>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate token and tokenHash', () => {
      const result = service.generateToken('table-123', 'tenant-456');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('tokenHash');
      expect(result.token).toContain('.'); // payload.signature format
      expect(result.tokenHash).toHaveLength(64); // SHA256 hex = 64 chars
    });

    it('should generate different tokens for different tables', () => {
      const result1 = service.generateToken('table-1', 'tenant-1');
      const result2 = service.generateToken('table-2', 'tenant-1');

      expect(result1.token).not.toBe(result2.token);
      expect(result1.tokenHash).not.toBe(result2.tokenHash);
    });
  });

  describe('buildQrUrl', () => {
    it('should build correct QR URL', () => {
      const token = 'test-token';
      const url = service.buildQrUrl(token);

      expect(url).toBe('https://order.example.com/t/test-token');
    });
  });

  describe('validateToken', () => {
    it('should throw error for invalid token format', async () => {
      await expect(service.validateToken('invalid-token-without-dot')).rejects.toThrow(
        'Invalid QR token format',
      );
    });

    it('should throw error if table not found in database', async () => {
      // Generate a valid token
      const { token } = service.generateToken('table-123', 'tenant-456');
      tableRepo.findByQrToken.mockResolvedValue(null);

      await expect(service.validateToken(token)).rejects.toThrow(
        'Mã QR không tồn tại trong hệ thống',
      );
    });

    it('should validate token successfully', async () => {
      const { token } = service.generateToken('table-123', 'tenant-456');
      tableRepo.findByQrToken.mockResolvedValue({
        id: 'table-123',
        qrInvalidatedAt: null,
      });

      const payload = await service.validateToken(token);

      expect(payload.tableId).toBe('table-123');
      expect(payload.tenantId).toBe('tenant-456');
    });

    it('should throw error if QR is invalidated', async () => {
      const { token } = service.generateToken('table-123', 'tenant-456');
      tableRepo.findByQrToken.mockResolvedValue({
        id: 'table-123',
        qrInvalidatedAt: new Date(),
      });

      await expect(service.validateToken(token)).rejects.toThrow(
        'Mã QR đã bị vô hiệu hóa',
      );
    });
  });

  describe('generateQrCodeImage', () => {
    it('should generate PNG image buffer', async () => {
      const result = await service.generateQrCodeImage('test-token', 'png');

      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should generate SVG string', async () => {
      const result = await service.generateQrCodeImage('test-token', 'svg');

      expect(typeof result).toBe('string');
      expect(result).toContain('<svg');
    });
  });

  describe('generateQrDataUrl', () => {
    it('should generate data URL for QR code', async () => {
      const result = await service.generateQrDataUrl('test-token');

      expect(result).toContain('data:image/png;base64,');
    });
  });
});

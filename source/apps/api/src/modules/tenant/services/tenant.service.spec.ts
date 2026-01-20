import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service';
import { PrismaService } from 'src/database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { TenantStatus } from '@prisma/client';

describe('TenantService', () => {
  let service: TenantService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockTenant = {
    id: 'tenant-123',
    name: 'Test Restaurant',
    slug: 'test-restaurant',
    status: 'ACTIVE' as TenantStatus,
    settings: {
      currency: 'VND',
      tax: { enabled: true, rate: 10, label: 'VAT', includedInPrice: false },
    },
    openingHours: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const prismaMock = {
      tenant: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    prismaService = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTenant', () => {
    it('should return tenant by ID', async () => {
      (prismaService.tenant.findUnique as jest.Mock).mockResolvedValue(mockTenant);

      const result = await service.getTenant('tenant-123');

      expect(prismaService.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: 'tenant-123' },
        include: {},
      });
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      (prismaService.tenant.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getTenant('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTenantBySlug', () => {
    it('should return tenant by slug', async () => {
      (prismaService.tenant.findUnique as jest.Mock).mockResolvedValue(mockTenant);

      const result = await service.getTenantBySlug('test-restaurant');

      expect(prismaService.tenant.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-restaurant' },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          settings: true,
          openingHours: true,
        },
      });
      expect(result.slug).toBe('test-restaurant');
    });

    it('should throw NotFoundException if slug not found', async () => {
      (prismaService.tenant.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getTenantBySlug('invalid-slug')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPricingSettings', () => {
    it('should return pricing settings with defaults', async () => {
      (prismaService.tenant.findUnique as jest.Mock).mockResolvedValue({
        settings: { currency: 'VND' },
      });

      const result = await service.getPricingSettings('tenant-123');

      expect(result.currency).toBe('VND');
      expect(result.tax.enabled).toBe(true);
      expect(result.tax.rate).toBe(8); // default
    });

    it('should merge custom settings with defaults', async () => {
      (prismaService.tenant.findUnique as jest.Mock).mockResolvedValue({
        settings: {
          currency: 'VND',
          tax: { enabled: true, rate: 10 },
        },
      });

      const result = await service.getPricingSettings('tenant-123');

      expect(result.tax.rate).toBe(10);
      expect(result.tax.label).toBe('VAT'); // default
    });
  });

  describe('isSlugAvailable', () => {
    it('should return true if slug is not taken', async () => {
      (prismaService.tenant.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.isSlugAvailable('new-slug');

      expect(result).toBe(true);
    });

    it('should return false if slug is taken', async () => {
      (prismaService.tenant.findUnique as jest.Mock).mockResolvedValue(mockTenant);

      const result = await service.isSlugAvailable('test-restaurant');

      expect(result).toBe(false);
    });

    it('should return true if slug belongs to excluded tenant', async () => {
      (prismaService.tenant.findUnique as jest.Mock).mockResolvedValue(mockTenant);

      const result = await service.isSlugAvailable('test-restaurant', 'tenant-123');

      expect(result).toBe(true);
    });
  });

  describe('updateStatus', () => {
    it('should update tenant status', async () => {
      (prismaService.tenant.update as jest.Mock).mockResolvedValue({
        ...mockTenant,
        status: 'SUSPENDED',
      });

      const result = await service.updateStatus('tenant-123', 'SUSPENDED' as TenantStatus);

      expect(prismaService.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-123' },
        data: { status: 'SUSPENDED' },
      });
      expect(result.status).toBe('SUSPENDED');
    });
  });
});

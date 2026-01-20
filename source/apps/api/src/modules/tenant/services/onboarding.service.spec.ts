import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingService } from './onboarding.service';
import { PrismaService } from 'src/database/prisma.service';
import { TenantService } from './tenant.service';
import { PaymentConfigService } from '../../payment-config/payment-config.service';
import { ConflictException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let prismaService: jest.Mocked<PrismaService>;
  let tenantService: jest.Mocked<TenantService>;
  let paymentConfigService: jest.Mocked<PaymentConfigService>;

  const mockTenant = {
    id: 'tenant-123',
    name: 'Test Restaurant',
    slug: 'test-restaurant',
    onboardingStep: 1,
    settings: {},
    openingHours: {},
    status: 'PENDING',
  };

  beforeEach(async () => {
    const prismaMock = {
      tenant: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const tenantServiceMock = {
      getTenant: jest.fn(),
      isSlugAvailable: jest.fn(),
    };

    const paymentConfigServiceMock = {
      updateConfig: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: TenantService, useValue: tenantServiceMock },
        { provide: PaymentConfigService, useValue: paymentConfigServiceMock },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
    prismaService = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
    tenantService = module.get<TenantService>(TenantService) as jest.Mocked<TenantService>;
    paymentConfigService = module.get<PaymentConfigService>(PaymentConfigService) as jest.Mocked<PaymentConfigService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should update profile and advance to step 2', async () => {
      tenantService.isSlugAvailable.mockResolvedValue(true);
      tenantService.getTenant.mockResolvedValue(mockTenant as any);
      (prismaService.tenant.update as jest.Mock).mockResolvedValue({
        ...mockTenant,
        name: 'New Name',
        onboardingStep: 2,
      });

      const result = await service.updateProfile('tenant-123', {
        name: 'New Name',
        slug: 'new-slug',
      });

      expect(result.onboardingStep).toBe(2);
    });

    it('should throw ConflictException if slug is taken', async () => {
      tenantService.isSlugAvailable.mockResolvedValue(false);

      await expect(
        service.updateProfile('tenant-123', { slug: 'taken-slug' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateOpeningHours', () => {
    it('should update opening hours and advance to step 3', async () => {
      (prismaService.tenant.findUnique as jest.Mock).mockResolvedValue(mockTenant);
      (prismaService.tenant.update as jest.Mock).mockResolvedValue({
        ...mockTenant,
        onboardingStep: 3,
      });

      const result = await service.updateOpeningHours('tenant-123', {
        monday: { open: '09:00', close: '22:00' },
      });

      expect(result.onboardingStep).toBe(3);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      (prismaService.tenant.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateOpeningHours('non-existent', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSettings', () => {
    it('should update settings and advance to step 4', async () => {
      tenantService.getTenant.mockResolvedValue({ ...mockTenant, onboardingStep: 3 } as any);
      (prismaService.tenant.update as jest.Mock).mockResolvedValue({
        ...mockTenant,
        onboardingStep: 4,
      });

      const result = await service.updateSettings('tenant-123', {
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        currency: 'VND',
      });

      expect(result.onboardingStep).toBe(4);
    });

    it('should merge tax settings with existing', async () => {
      tenantService.getTenant.mockResolvedValue({
        ...mockTenant,
        settings: { tax: { enabled: true, rate: 8 } },
      } as any);
      (prismaService.tenant.update as jest.Mock).mockResolvedValue(mockTenant);

      await service.updateSettings('tenant-123', {
        tax: { rate: 10 },
      });

      expect(prismaService.tenant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            settings: expect.objectContaining({
              tax: expect.objectContaining({ rate: 10 }),
            }),
          }),
        }),
      );
    });
  });

  describe('updatePaymentConfig', () => {
    it('should update payment config', async () => {
      (prismaService.tenant.findUnique as jest.Mock).mockResolvedValue(mockTenant);
      paymentConfigService.updateConfig.mockResolvedValue({} as any);
      (prismaService.tenant.update as jest.Mock).mockResolvedValue(mockTenant);

      await service.updatePaymentConfig('tenant-123', {
        sepayEnabled: true,
        sepayAccountNumber: '1234567890',
      });

      expect(paymentConfigService.updateConfig).toHaveBeenCalledWith('tenant-123', {
        sepayEnabled: true,
        sepayAccountNumber: '1234567890',
      });
    });

    it('should throw NotFoundException if tenant not found', async () => {
      (prismaService.tenant.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updatePaymentConfig('non-existent', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('completeOnboarding', () => {
    it('should complete onboarding if step >= 2', async () => {
      tenantService.getTenant.mockResolvedValue({ ...mockTenant, onboardingStep: 3 } as any);
      (prismaService.tenant.update as jest.Mock).mockResolvedValue({
        ...mockTenant,
        onboardingStep: 5,
        status: 'ACTIVE',
        updatedAt: new Date(),
      });

      const result = await service.completeOnboarding('tenant-123');

      expect(result.message).toBe('Onboarding completed successfully');
      expect(result.onboardingStep).toBe(5);
    });

    it('should throw ForbiddenException if step < 2', async () => {
      tenantService.getTenant.mockResolvedValue({ ...mockTenant, onboardingStep: 1 } as any);

      await expect(service.completeOnboarding('tenant-123')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getProgress', () => {
    it('should return onboarding progress', async () => {
      tenantService.getTenant.mockResolvedValue({ ...mockTenant, onboardingStep: 3 } as any);

      const result = await service.getProgress('tenant-123');

      expect(result.currentStep).toBe(3);
      expect(result.totalSteps).toBe(4);
      expect(result.steps).toHaveLength(4);
      expect(result.steps[0].completed).toBe(true); // Step 1
      expect(result.steps[1].completed).toBe(true); // Step 2
      expect(result.steps[2].completed).toBe(false); // Step 3
    });
  });
});

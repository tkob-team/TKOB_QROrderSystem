import { Test, TestingModule } from '@nestjs/testing';
import { BillService } from './bill.service';
import { PrismaService } from '@/database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BillService', () => {
  let service: BillService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockBill = {
    id: 'bill-123',
    billNumber: 'BILL-20260120-0001',
    tenantId: 'tenant-1',
    tableId: 'table-1',
    sessionId: 'session-1',
    subtotal: 100,
    discount: 10,
    tip: 5,
    serviceCharge: 5,
    tax: 8,
    total: 108,
    paymentMethod: 'BILL_TO_TABLE',
    paymentStatus: 'COMPLETED',
    paidAt: new Date(),
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    orders: [],
    table: { id: 'table-1', tableNumber: 'A1' },
  };

  const mockOrder = {
    id: 'order-1',
    tenantId: 'tenant-1',
    tableId: 'table-1',
    sessionId: 'session-1',
    status: 'COMPLETED',
    paymentStatus: 'COMPLETED',
    total: 100,
    serviceCharge: 5,
    tax: 8,
    items: [],
  };

  beforeEach(async () => {
    const prismaMock = {
      order: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
      bill: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<BillService>(BillService);
    prismaService = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBillById', () => {
    it('should return bill by ID', async () => {
      (prismaService.bill.findUnique as jest.Mock).mockResolvedValue(mockBill);

      const result = await service.getBillById('bill-123');

      expect(prismaService.bill.findUnique).toHaveBeenCalledWith({
        where: { id: 'bill-123' },
        include: expect.any(Object),
      });
      expect(result.id).toBe('bill-123');
      expect(result.total).toBe(108);
    });

    it('should throw NotFoundException if bill not found', async () => {
      (prismaService.bill.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getBillById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBills', () => {
    it('should return bills for tenant', async () => {
      (prismaService.bill.findMany as jest.Mock).mockResolvedValue([mockBill]);

      const result = await service.getBills('tenant-1');

      expect(prismaService.bill.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].tenantId).toBe('tenant-1');
    });

    it('should filter by tableId', async () => {
      (prismaService.bill.findMany as jest.Mock).mockResolvedValue([mockBill]);

      await service.getBills('tenant-1', { tableId: 'table-1' });

      expect(prismaService.bill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tableId: 'table-1' }),
        }),
      );
    });

    it('should filter by paymentStatus', async () => {
      (prismaService.bill.findMany as jest.Mock).mockResolvedValue([mockBill]);

      await service.getBills('tenant-1', { paymentStatus: 'COMPLETED' as any });

      expect(prismaService.bill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ paymentStatus: 'COMPLETED' }),
        }),
      );
    });

    it('should filter by date range', async () => {
      (prismaService.bill.findMany as jest.Mock).mockResolvedValue([mockBill]);
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      await service.getBills('tenant-1', { startDate, endDate });

      expect(prismaService.bill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: { gte: startDate, lte: endDate },
          }),
        }),
      );
    });
  });

  describe('closeTableAndGenerateBill', () => {
    it('should throw if no completed orders found', async () => {
      (prismaService.order.findMany as jest.Mock).mockResolvedValue([]);

      await expect(
        service.closeTableAndGenerateBill('tenant-1', 'table-1', 'session-1', {
          paymentMethod: 'BILL_TO_TABLE',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create bill from completed orders', async () => {
      (prismaService.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
      (prismaService.bill.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.$transaction as jest.Mock).mockResolvedValue(mockBill);

      const result = await service.closeTableAndGenerateBill(
        'tenant-1',
        'table-1',
        'session-1',
        { paymentMethod: 'BILL_TO_TABLE' },
      );

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(result.total).toBe(108);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '@/database/prisma.service';
import { TenantService } from '@/modules/tenant/services/tenant.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;
  let prismaService: jest.Mocked<PrismaService>;
  let tenantService: jest.Mocked<TenantService>;

  const mockPricingSettings = {
    currency: 'USD',
    tax: { enabled: true, rate: 8, label: 'VAT', includedInPrice: false },
    serviceCharge: { enabled: false, rate: 5, label: 'Service Charge' },
    tip: { enabled: true, suggestions: [10, 15, 20], allowCustom: true },
  };

  beforeEach(async () => {
    const prismaMock = {
      cart: {
        upsert: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      cartItem: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      menuItem: {
        findUnique: jest.fn(),
      },
      tableSession: {
        findUnique: jest.fn(),
      },
      menuItemPhoto: {
        findMany: jest.fn(),
      },
    };

    const tenantServiceMock = {
      getPricingSettings: jest.fn().mockResolvedValue(mockPricingSettings),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: TenantService, useValue: tenantServiceMock },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prismaService = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
    tenantService = module.get<TenantService>(TenantService) as jest.Mocked<TenantService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrCreateCart', () => {
    it('should create new cart if not exists', async () => {
      const mockCart = { id: 'cart-123' };
      (prismaService.cart.upsert as jest.Mock).mockResolvedValue(mockCart);

      const result = await service.getOrCreateCart('tenant-1', 'table-1', 'session-1');

      expect(result).toBe('cart-123');
      expect(prismaService.cart.upsert).toHaveBeenCalled();
    });
  });

  describe('getCartByTable', () => {
    it('should return empty cart if no cart exists', async () => {
      (prismaService.cart.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.getCartByTable('tenant-1', 'table-1', 'session-1');

      expect(result.items).toEqual([]);
      expect(result.subtotal).toBe(0);
      expect(result.total).toBe(0);
      expect(result.itemCount).toBe(0);
    });

    it('should return cart with items and calculated totals', async () => {
      const mockCart = {
        id: 'cart-123',
        tenantId: 'tenant-1',
        items: [
          {
            id: 'item-1',
            menuItemId: 'menu-1',
            quantity: 2,
            unitPrice: 10.0,
            notes: null,
            modifiers: [],
            menuItem: {
              id: 'menu-1',
              name: 'Burger',
              price: 10.0,
              imageUrl: null,
            },
          },
        ],
      };
      (prismaService.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);
      (prismaService.menuItemPhoto.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.cart.findFirst as jest.Mock).mockResolvedValue(mockCart);

      const result = await service.getCartByTable('tenant-1', 'table-1', 'session-1');

      expect(result.items).toHaveLength(1);
      expect(result.subtotal).toBe(20); // 10 * 2
      expect(result.tax).toBe(1.6); // 20 * 8%
      expect(result.total).toBe(21.6); // 20 + 1.6
      expect(result.itemCount).toBe(2);
    });
  });

  describe('updateCartItem', () => {
    it('should throw NotFoundException if item not found', async () => {
      (prismaService.cartItem.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateCartItem('cart-1', 'item-1', { quantity: 2 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete item if quantity is 0', async () => {
      (prismaService.cartItem.findFirst as jest.Mock).mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        quantity: 1,
      });
      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue({
        id: 'cart-1',
        tenantId: 'tenant-1',
        items: [],
      });
      (prismaService.menuItemPhoto.findMany as jest.Mock).mockResolvedValue([]);

      await service.updateCartItem('cart-1', 'item-1', { quantity: 0 });

      expect(prismaService.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      });
    });
  });

  describe('removeCartItem', () => {
    it('should throw NotFoundException if item not found', async () => {
      (prismaService.cartItem.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.removeCartItem('cart-1', 'item-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete cart item', async () => {
      (prismaService.cartItem.findFirst as jest.Mock).mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
      });
      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue({
        id: 'cart-1',
        tenantId: 'tenant-1',
        items: [],
      });
      (prismaService.menuItemPhoto.findMany as jest.Mock).mockResolvedValue([]);

      await service.removeCartItem('cart-1', 'item-1');

      expect(prismaService.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      });
    });
  });

  describe('clearCart', () => {
    it('should delete all items from cart', async () => {
      await service.clearCart('cart-1');

      expect(prismaService.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-1' },
      });
    });
  });

  describe('getCartTotal', () => {
    it('should throw NotFoundException if cart not found', async () => {
      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getCartTotal('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should calculate subtotal and total', async () => {
      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue({
        id: 'cart-1',
        items: [
          { unitPrice: 10, quantity: 2 },
          { unitPrice: 5, quantity: 3 },
        ],
      });

      const result = await service.getCartTotal('cart-1');

      expect(result.subtotal).toBe(35); // (10*2) + (5*3)
      expect(result.total).toBe(35);
    });
  });
});

import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  AddToCartDto,
  CartModifierDto,
  CartResponseDto,
  UpdateCartItemDto,
} from '../dtos/cart.dto';
import { PrismaService } from '@/database/prisma.service';
import { $Enums } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  TenantService,
  TenantPricingSettings,
} from '@/modules/tenant/services/tenant.service';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly CART_EXPIRY_HOURS = 24;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  /**
   * Get or create cart for a table session
   */
  async getOrCreateCart(
    tenantId: string,
    tableId: string,
    sessionId?: string,
  ): Promise<string> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.CART_EXPIRY_HOURS);

    // Use upsert to avoid race condition
    const cart = await this.prisma.cart.upsert({
      where: {
        tableId_sessionId: {
          tableId,
          sessionId: sessionId ?? '',
        },
      },
      update: {
        // Extend expiration time if cart already exists
        expiresAt,
      },
      create: {
        tenantId,
        tableId,
        sessionId,
        expiresAt,
      },
    });

    return cart.id;
  }

  /**
   * Add item to cart or update quantity if exists with same modifiers
   */
  async addToCart(
    sessionId: string,
    tenantId: string,
    tableId: string,
    dto: AddToCartDto,
  ): Promise<CartResponseDto> {
    // 0. Check if bill has been requested (locked session)
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
      select: { billRequestedAt: true },
    });
    if (session?.billRequestedAt) {
      throw new BadRequestException(
        'Bill has been requested. Please cancel the bill request first to add more items.',
      );
    }

    // 1. Fetch menu item detail
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: dto.menuItemId, tenantId },
      include: {
        modifierGroups: {
          include: {
            modifierGroup: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    if (!menuItem.available) {
      throw new BadRequestException('Menu item is currently unavailable');
    }

    // 2. Validate modifiers
    const validatedModifiers = this.validateAndEnrichModifiers(menuItem, dto.modifiers || []);

    // 3. Calculate unit price (all in USD cents)
    // Note: Both menuItem.price and priceDelta MUST be in USD cents
    // Use currency.util.ts convertUsdToVnd() when displaying VND
    const modifiersTotal = validatedModifiers.reduce((sum, m) => sum + m.priceDelta, 0);
    const unitPrice = Number(menuItem.price) + modifiersTotal;

    // 4. Get or create cart
    const cartId = await this.getOrCreateCart(tenantId, tableId, sessionId);

    // 5. Check if same item with same modifiers exists
    const existingItems = await this.prisma.cartItem.findMany({
      where: { cartId },
    });

    const normalizedModifiers = this.normalizeModifiers(validatedModifiers);
    const existingItem = existingItems.find((item) => {
      if (item.menuItemId !== dto.menuItemId) return false;
      if (item.notes !== dto.notes) return false;

      const itemModifiers = this.normalizeModifiers((item.modifiers as any) || []);
      return this.areModifiersEqual(itemModifiers, normalizedModifiers);
    });

    if (existingItem) {
      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + dto.quantity,
          unitPrice,
        },
      });
    } else {
      // Add new item
      await this.prisma.cartItem.create({
        data: {
          cartId,
          menuItemId: dto.menuItemId,
          quantity: dto.quantity,
          unitPrice,
          notes: dto.notes,
          modifiers: validatedModifiers as any,
        },
      });
    }

    // 6. Return updated cart
    return this.getCartResponse(cartId);
  }

  /**
   * Get cart by table and session
   */
  async getCartByTable(
    tenantId: string,
    tableId: string,
    sessionId?: string,
  ): Promise<CartResponseDto> {
    // Lấy pricing settings từ tenant
    const pricingSettings = await this.tenantService.getPricingSettings(tenantId);

    const cart = await this.prisma.cart.findFirst({
      where: {
        tenantId,
        tableId,
        sessionId,
        expiresAt: { gte: new Date() },
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return {
        items: [],
        subtotal: 0,
        tax: 0,
        taxRate: pricingSettings.tax.enabled ? pricingSettings.tax.rate : 0,
        serviceCharge: 0,
        serviceChargeRate: pricingSettings.serviceCharge.enabled
          ? pricingSettings.serviceCharge.rate
          : 0,
        total: 0,
        itemCount: 0,
      };
    }

    // Lấy primary photos cho các menu items
    const menuItemIds = cart.items.map(item => item.menuItemId);
    const photos = await this.prisma.menuItemPhoto.findMany({
      where: {
        menuItemId: { in: menuItemIds },
        isPrimary: true,
      },
      select: {
        id: true,
        menuItemId: true,
        url: true,
        filename: true,
        mimeType: true,
        size: true,
        displayOrder: true,
        isPrimary: true,
        createdAt: true,
      },
    });

    const photosByMenuItemId = new Map(photos.map(p => [p.menuItemId, p]));

    return this.buildCartResponse(cart, pricingSettings, photosByMenuItemId);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    cartId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity === 0) {
      // Remove item
      await this.prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      // Update quantity and/or notes
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: {
          quantity: dto.quantity,
          notes: dto.notes ?? item.notes,
        },
      });
    }

    return this.getCartResponse(cartId);
  }

  /**
   * Remove item from cart
   */
  async removeCartItem(cartId: string, itemId: string): Promise<CartResponseDto> {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCartResponse(cartId);
  }

  /**
   * Clear all items from cart
   */
  async clearCart(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }

  /**
   * Get cart total
   */
  async getCartTotal(cartId: string): Promise<{ subtotal: number; total: number }> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: true,
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );

    return {
      subtotal,
      total: subtotal,
    };
  }

  // ==================== PRIVATE HELPERS ====================

  /**
   * Get cart response by cart ID
   */
  private async getCartResponse(cartId: string): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Lấy primary photos cho các menu items
    const menuItemIds = cart.items.map(item => item.menuItemId);
    const photos = await this.prisma.menuItemPhoto.findMany({
      where: {
        menuItemId: { in: menuItemIds },
        isPrimary: true,
      },
      select: {
        id: true,
        menuItemId: true,
        url: true,
        filename: true,
        mimeType: true,
        size: true,
        displayOrder: true,
        isPrimary: true,
        createdAt: true,
      },
    });

    const photosByMenuItemId = new Map(photos.map(p => [p.menuItemId, p]));

    // Lấy pricing settings từ tenant
    const pricingSettings = await this.tenantService.getPricingSettings(cart.tenantId);

    return this.buildCartResponse(cart, pricingSettings, photosByMenuItemId);
  }

  /**
   * Build cart response DTO from cart data
   */
  private buildCartResponse(
    cart: any, 
    pricingSettings: TenantPricingSettings,
    photosByMenuItemId?: Map<string, any>,
  ): CartResponseDto {
    const items = cart.items.map((item: any) => {
      const itemTotal = Number(item.unitPrice) * item.quantity;
      const photo = photosByMenuItemId?.get(item.menuItemId);
      return {
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        price: Number(item.menuItem.price),
        quantity: item.quantity,
        modifiers: (item.modifiers as any) || [],
        notes: item.notes,
        itemTotal,
        ...(photo && {
          primaryPhoto: {
            id: photo.id,
            url: photo.url,
            filename: photo.filename,
            mimeType: photo.mimeType,
            size: photo.size,
            displayOrder: photo.displayOrder,
            isPrimary: photo.isPrimary,
            createdAt: photo.createdAt,
          },
        }),
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);

    // Calculate tax from tenant settings
    const taxRate = pricingSettings.tax.enabled ? pricingSettings.tax.rate : 0;
    const tax = pricingSettings.tax.enabled ? subtotal * (taxRate / 100) : 0;

    // Calculate service charge from tenant settings
    const serviceChargeRate = pricingSettings.serviceCharge.enabled
      ? pricingSettings.serviceCharge.rate
      : 0;
    const serviceCharge = pricingSettings.serviceCharge.enabled
      ? subtotal * (serviceChargeRate / 100)
      : 0;

    const total = subtotal + tax + serviceCharge;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      taxRate,
      serviceCharge: Number(serviceCharge.toFixed(2)),
      serviceChargeRate,
      total: Number(total.toFixed(2)),
      itemCount,
    };
  }

  /**
   * Normalize modifiers for comparison
   */
  private normalizeModifiers(modifiers: CartModifierDto[]): CartModifierDto[] {
    return modifiers
      .slice()
      .sort((a, b) => {
        const groupCompare = a.groupId.localeCompare(b.groupId);
        if (groupCompare !== 0) return groupCompare;
        return a.optionId.localeCompare(b.optionId);
      });
  }

  /**
   * Check if two modifier arrays are equal
   */
  private areModifiersEqual(modifiers1: CartModifierDto[], modifiers2: CartModifierDto[]): boolean {
    if (modifiers1.length !== modifiers2.length) return false;

    return modifiers1.every(
      (m1, index) =>
        m1.groupId === modifiers2[index].groupId && m1.optionId === modifiers2[index].optionId,
    );
  }

  /**
   * Validate modifiers against menu item's modifier groups
   */
  private validateAndEnrichModifiers(
    menuItem: {
      modifierGroups: ({
        modifierGroup: {
          options: {
            id: string;
            name: string;
            priceDelta: Decimal;
          }[];
        } & {
          id: string;
          name: string;
          type: $Enums.ModifierType;
          required: boolean;
          minChoices: number;
          maxChoices: number | null;
        };
      } & { menuItemId: string; modifierGroupId: string })[];
    } & {
      id: string;
      name: string;
      price: Decimal;
    },
    modifiers: { groupId: string; optionId: string }[],
  ): CartModifierDto[] {
    const validated: CartModifierDto[] = [];
    const modifierGroups = menuItem.modifierGroups || [];

    for (const group of modifierGroups) {
      const mg = group.modifierGroup;
      const selectedModifiers = modifiers.filter((m) => m.groupId === mg.id);

      // Check required
      if (mg.required && selectedModifiers.length === 0) {
        throw new BadRequestException(`Modifier group "${mg.name}" is required`);
      }

      // Check min/max choices
      if (selectedModifiers.length < mg.minChoices) {
        throw new BadRequestException(
          `Must select at least ${mg.minChoices} option(s) for "${mg.name}"`,
        );
      }

      if (mg.maxChoices && selectedModifiers.length > mg.maxChoices) {
        throw new BadRequestException(
          `Cannot select more than ${mg.maxChoices} option(s) for "${mg.name}"`,
        );
      }

      // Validate each option exists and enrich with DB data
      for (const modifier of selectedModifiers) {
        const option = mg.options.find((o) => o.id === modifier.optionId);
        if (!option) {
          throw new BadRequestException(`Invalid modifier option ID: ${modifier.optionId}`);
        }

        validated.push({
          groupId: mg.id,
          groupName: mg.name,
          optionId: option.id,
          optionName: option.name,
          priceDelta: Number(option.priceDelta),
        });
      }
    }

    return validated;
  }
}

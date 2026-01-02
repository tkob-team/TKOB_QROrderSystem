import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  AddToCartDto,
  CartModifierDto,
  CartResponseDto,
  UpdateCartItemDto,
} from '../dtos/cart.dto';
import { RedisService } from '@/modules/redis/redis.service';
import { PrismaService } from '@/database/prisma.service';
import { $Enums } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: CartModifierDto[];
  notes?: string;
  itemTotal: number;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  // private readonly TAX_RATE = 0.08;
  private readonly CART_TTL = 86400; // 24 hours

  constructor(
    private readonly redis: RedisService,
    private readonly prima: PrismaService,
  ) {}

  async addToCard(
    sessionId: string,
    tenantId: string,
    dto: AddToCartDto,
  ): Promise<CartResponseDto> {
    // 1. Fetch menu item detail
    const menuItem = await this.prima.x.menuItem.findUnique({
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

    // 2. Validate modifiers and fetch full data from DB
    const validatedModifiers = this.validateAndEnrichModifiers(menuItem, dto.modifiers || []);

    // 3. Calculate item price
    const modifiersTotal = validatedModifiers.reduce((sum, m) => sum + m.priceDelta, 0);
    const itemTotal = (Number(menuItem.price) + modifiersTotal) * dto.quantity;

    // 4. Get existing cart
    const cart = await this.getCart(sessionId);

    // 5. Check if same item with same modifiers exists
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.menuItemId === dto.menuItemId &&
        this.areModifiersEqual(item.modifiers, validatedModifiers) &&
        item.notes === dto.notes,
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += dto.quantity;
      cart.items[existingItemIndex].itemTotal =
        (Number(menuItem.price) + modifiersTotal) * cart.items[existingItemIndex].quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: uuidv4(),
        menuItemId: dto.menuItemId,
        name: menuItem.name,
        price: Number(menuItem.price),
        quantity: dto.quantity,
        modifiers: validatedModifiers,
        notes: dto.notes,
        itemTotal,
      };
      cart.items.push(newItem);
    }

    // 6. Recalculate totals
    this.recalculateCart(cart);

    // 7. Save to Redis
    await this.saveCart(sessionId, cart);

    return this.toResponseDto(cart);
  }

  async getCart(sessionId: string): Promise<Cart> {
    const cartKey = `cart:${sessionId}`;
    const cartData = await this.redis.get(cartKey);

    if (!cartData) {
      return {
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
      };
    }

    return JSON.parse(cartData) as Cart;
  }

  async updateCartItem(
    sessionId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.getCart(sessionId);

    const itemIndex = cart.items.findIndex((item) => item.id === itemId);
    if (itemIndex < 0) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      const item = cart.items[itemIndex];
      const pricePerUnit = item.itemTotal / item.quantity;
      item.quantity = dto.quantity;
      item.itemTotal = pricePerUnit * dto.quantity;
    }

    if (dto.notes) {
      cart.items[itemIndex].notes = dto.notes;
    }

    this.recalculateCart(cart);
    await this.saveCart(sessionId, cart);

    return this.toResponseDto(cart);
  }

  async removeCartItem(sessionId: string, itemId: string): Promise<CartResponseDto> {
    return this.updateCartItem(sessionId, itemId, { quantity: 0 });
  }

  async clearCart(sessionId: string): Promise<void> {
    const cartKey = `cart:${sessionId}`;
    await this.redis.del(cartKey);
  }

  // ==================== PRIVATE HELPERS ====================

  private async saveCart(sessionId: string, cart: Cart): Promise<void> {
    const cartKey = `cart:${sessionId}`;
    await this.redis.set(cartKey, JSON.stringify(cart), this.CART_TTL);
  }

  private recalculateCart(cart: Cart): void {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);
    // cart.tax = cart.subtotal * this.TAX_RATE;
    cart.total = cart.subtotal + cart.tax;
  }

  private areModifiersEqual(modifiers1: CartModifierDto[], modifiers2: CartModifierDto[]): boolean {
    if (modifiers1.length !== modifiers2.length) return false;

    const sorted1 = modifiers1.slice().sort((a, b) => a.optionId.localeCompare(b.optionId));
    const sorted2 = modifiers2.slice().sort((a, b) => a.optionId.localeCompare(b.optionId));

    return sorted1.every(
      (m1, index) =>
        m1.groupId === sorted2[index].groupId && m1.optionId === sorted2[index].optionId,
    );
  }

  private validateAndEnrichModifiers(
    menuItem: {
      modifierGroups: ({
        modifierGroup: {
          options: {
            id: string;
            name: string;
            priceDelta: Decimal;
            // ...other fields
          }[];
        } & {
          id: string;
          name: string;
          type: $Enums.ModifierType;
          required: boolean;
          minChoices: number;
          maxChoices: number | null;
          // ...other fields
        };
      } & { menuItemId: string; modifierGroupId: string })[];
    } & {
      id: string;
      name: string;
      price: Decimal;
      // ...other fields
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

  private toResponseDto(cart: Cart): CartResponseDto {
    return {
      items: cart.items.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        modifiers: item.modifiers,
        notes: item.notes,
        itemTotal: item.itemTotal,
      })),
      subtotal: Math.round(cart.subtotal),
      tax: Math.round(cart.tax),
      total: Math.round(cart.total),
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }
}

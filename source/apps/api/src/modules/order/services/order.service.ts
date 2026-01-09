import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CheckoutDto } from '../dtos/checkout.dto';
import { PrismaService } from '@/database/prisma.service';
import { CartService } from './cart.service';
import { MenuItemsService } from '@/modules/menu/services/menu-item.service';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { OrderStatus, PaymentMethod } from '@prisma/client';

// Import PaymentStatus type and enum directly from Prisma client
import type { PaymentStatus, Prisma } from '@prisma/client';
import { OrderFiltersDto } from '../dtos/order-filters.dto';
import { PaginatedResponseDto } from '@/common/dto/pagination.dto';
import { UpdateOrderStatusDto } from '../dtos/update-order-status.dto';
const PaymentStatusEnum = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly menuItemsService: MenuItemsService,
  ) {}

  async checkout(
    sessionId: string,
    tenantId: string,
    tableId: string,
    dto: CheckoutDto,
  ): Promise<OrderResponseDto> {
    // 1. Get cart
    const cart = await this.cartService.getCart(sessionId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. Generate order number
    const orderNumber = await this.generateOrderNumber(tenantId);

    // 3. Determine initial status based on payment method
    const initialStatus =
      dto.paymentMethod === 'BILL_TO_TABLE' ? OrderStatus.RECEIVED : OrderStatus.PENDING;

    const initialPaymentStatus: PaymentStatus = PaymentStatusEnum.PENDING;

    // 4. Create order with items in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          tenantId,
          tableId,
          sessionId,
          customerName: dto.customerName,
          customerNotes: dto.customerNotes,
          status: initialStatus,
          subtotal: cart.subtotal,
          tax: cart.tax,
          total: cart.total,
          paymentMethod: dto.paymentMethod as PaymentMethod,
          paymentStatus: initialPaymentStatus,
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: cart.items.map((item) => ({
          orderId: newOrder.id,
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          modifiers: item.modifiers ? JSON.stringify(item.modifiers) : undefined,
          notes: item.notes,
          itemTotal: item.itemTotal,
        })),
      });

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: initialStatus,
          notes: 'Order created',
        },
      });

      // Update menu items popularity
      for (const item of cart.items) {
        await this.menuItemsService.incrementPopularity(item.menuItemId);
      }

      return newOrder;
    });

    // 5. Clear cart
    await this.cartService.clearCart(sessionId);

    // 6. If online payment, create Stripe PaymentIntent
    // let stripeClientSecret: string | undefined;
    // if (dto.paymentMethod === 'CARD_ONLINE') {
    //   // TODO: Implement Stripe integration (Epic 5)
    //   // stripeClientSecret = await this.stripeService.createPaymentIntent(order);
    //   throw new BadRequestException('Online payment not yet implemented');
    // }

    this.logger.log(`Order created: ${orderNumber} for table ${tableId}`);

    // 7. Return order details
    return this.getOrderById(order.id);
  }

  /**
   * Get order by ID with details
   */
  async getOrderById(orderId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        table: {
          select: {
            tableNumber: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.toResponseDto(order);
  }

  async getTableOrders(tableId: string): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        tableId,
        status: {
          in: [OrderStatus.RECEIVED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.SERVED],
        },
      },
      include: {
        items: true,
        table: {
          select: {
            tableNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.toResponseDto(order));
  }

  async getOrders(
    tenantId: string,
    filters: OrderFiltersDto,
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    const where: Prisma.OrderWhereInput = {
      tenantId,
      ...(filters.status && { status: filters.status as OrderStatus }),
      ...(filters.tableId && { tableId: filters.tableId }),
      ...(filters.search && {
        OR: [
          { orderNumber: { contains: filters.search, mode: 'insensitive' } },
          { customerName: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          table: {
            select: {
              tableNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page! - 1) * filters.limit!,
        take: filters.limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return new PaginatedResponseDto<OrderResponseDto>(
      orders.map((order) => this.toResponseDto(order)),
      total,
      filters.page!,
      filters.limit!,
    );
  }

  /**
   * Update order status (staff action)
   */
  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    staffId: string,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transition
    this.validateStatusTransition(order.status, dto.status as OrderStatus);

    // Update order
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: dto.status as OrderStatus,
          ...(dto.status === 'SERVED' && { servedAt: new Date() }),
          ...(dto.status === 'COMPLETED' && { completedAt: new Date() }),
        },
      });

      // Add status history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: dto.status as OrderStatus,
          notes: dto.notes,
          changedBy: staffId,
        },
      });
    });

    this.logger.log(`Order ${order.orderNumber} status updated to ${dto.status} by ${staffId}`);

    return this.getOrderById(orderId);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason: string, staffId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      ([OrderStatus.COMPLETED, OrderStatus.PAID, OrderStatus.CANCELLED] as OrderStatus[]).includes(
        order.status,
      )
    ) {
      throw new ConflictException('Cannot cancel order in current status');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.CANCELLED,
          notes: reason,
          changedBy: staffId,
        },
      });
    });

    this.logger.log(`Order ${order.orderNumber} cancelled by ${staffId}`);

    return this.getOrderById(orderId);
  }

  /**
   * Mark order item as prepared (for KDS)
   */
  async markItemPrepared(orderId: string, itemId: string): Promise<void> {
    // Kiểm tra order tồn tại
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Kiểm tra order item tồn tại
    const orderItem = await this.prisma.orderItem.findUnique({ where: { id: itemId } });
    if (!orderItem || orderItem.orderId !== orderId) {
      throw new NotFoundException('Order item not found');
    }

    await this.prisma.orderItem.update({
      where: { id: itemId },
      data: {
        prepared: true,
        preparedAt: new Date(),
      },
    });

    // Check if all items are prepared
    const allPrepared = await this.areAllItemsPrepared(orderId);
    if (allPrepared) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.READY },
      });

      await this.prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.READY,
          notes: 'All items prepared',
        },
      });
    }
  }

  // ==================== PRIVATE HELPERS ====================

  /**
   * Generate unique order number
   * Format: ORD-YYYYMMDD-XXXX
   */
  private async generateOrderNumber(tenantId: string): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    const count = await this.prisma.order.count({
      where: {
        tenantId,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `ORD-${dateStr}-${sequence}`;
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.RECEIVED, OrderStatus.CANCELLED],
      RECEIVED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
      READY: [OrderStatus.SERVED, OrderStatus.CANCELLED],
      SERVED: [OrderStatus.COMPLETED],
      COMPLETED: [OrderStatus.PAID],
      PAID: [],
      CANCELLED: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from ${currentStatus} to ${newStatus}`);
    }
  }

  /**
   * Check if all items are prepared
   */
  private async areAllItemsPrepared(orderId: string): Promise<boolean> {
    const unpreparedCount = await this.prisma.orderItem.count({
      where: {
        orderId,
        prepared: false,
      },
    });

    return unpreparedCount === 0;
  }

  /**
   * Transform to response DTO
   */
  private toResponseDto(order: any): OrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      tableId: order.tableId,
      tableNumber: order.table.tableNumber,
      customerName: order.customerName,
      customerNotes: order.customerNotes,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      total: Number(order.total),
      items: order.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        modifiers: item.modifiers,
        notes: item.notes,
        itemTotal: Number(item.itemTotal),
        prepared: item.prepared,
      })),
      createdAt: order.createdAt,
      // stripePaymentIntentId: order.stripePaymentIntentId,
    };
  }
}

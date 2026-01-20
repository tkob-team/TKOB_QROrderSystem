import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import { TenantService } from '@/modules/tenant/services/tenant.service';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { Decimal } from '@prisma/client/runtime/library';

// Import PaymentStatus as value (not type) to use in comparisons
import type { Prisma } from '@prisma/client';
import { PaymentStatus } from '@prisma/client';
import { OrderFiltersDto } from '../dtos/order-filters.dto';
import { PaginatedResponseDto } from '@/common/dto/pagination.dto';
import { UpdateOrderStatusDto } from '../dtos/update-order-status.dto';
import { OrderGateway } from '@/modules/websocket/gateways/order.gateway';
import { PaymentConfigService } from '@/modules/payment-config/payment-config.service';
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
    private readonly orderGateway: OrderGateway,
    private readonly tenantService: TenantService,
    private readonly subscriptionService: SubscriptionService,
    private readonly paymentConfigService: PaymentConfigService,
  ) {}

  async checkout(
    sessionId: string,
    tenantId: string,
    tableId: string,
    dto: CheckoutDto,
    customerId?: string | null,
  ): Promise<OrderResponseDto> {
    // 0. Check if bill has been requested (locked session)
    const billRequested = await this.isSessionBillRequested(sessionId);
    if (billRequested) {
      throw new BadRequestException(
        'Bill has been requested. Please cancel the bill request first to add more orders.',
      );
    }

    // 1. Check subscription limits before creating order
    const canCreateOrder = await this.subscriptionService.canPerformAction(tenantId, 'createOrder');
    if (!canCreateOrder.allowed) {
      throw new ForbiddenException({
        message: canCreateOrder.reason,
        code: 'SUBSCRIPTION_LIMIT_EXCEEDED',
        currentUsage: canCreateOrder.currentUsage,
        limit: canCreateOrder.limit,
        upgradeRequired: true,
      });
    }

    // 2. Default payment method to BILL_TO_TABLE if not specified
    // New flow: Customer places order without selecting payment method
    // Payment happens later via Request Bill → Pay at once
    const paymentMethod = dto.paymentMethod || PaymentMethod.BILL_TO_TABLE;

    // 3. Validate SEPAY_QR if explicitly selected
    if (paymentMethod === 'SEPAY_QR') {
      const hasValidConfig = await this.paymentConfigService.hasValidConfig(tenantId);
      if (!hasValidConfig) {
        throw new BadRequestException(
          'SePay payment is not available. Please choose another payment method or contact restaurant staff.',
        );
      }
    }

    // 4. Get cart by table
    const cart = await this.cartService.getCartByTable(tenantId, tableId, sessionId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 3. Get tenant pricing settings
    const pricingSettings = await this.tenantService.getPricingSettings(tenantId);

    // 4. Generate order number
    const orderNumber = await this.generateOrderNumber(tenantId);

    // 5. Calculate service charge based on tenant settings
    let serviceChargeAmount = new Decimal(0);
    if (pricingSettings.serviceCharge.enabled) {
      serviceChargeAmount = new Decimal(cart.subtotal)
        .mul(pricingSettings.serviceCharge.rate)
        .div(100);
    }

    // 6. Handle tip from checkout DTO
    const tipAmount = new Decimal(dto.tip || 0);

    // 7. Recalculate total with service charge and tip
    const subtotal = new Decimal(cart.subtotal);
    const taxAmount = new Decimal(cart.tax);
    const total = subtotal.add(taxAmount).add(serviceChargeAmount).add(tipAmount);

    // 8. Determine initial status based on payment method
    // ALL orders start as PENDING and require waiter/staff confirmation to move to RECEIVED
    // This ensures orders go to "Placed" tab first for verification before going to KDS
    // - SEPAY_QR: PENDING → payment webhook → RECEIVED (after payment confirmed)
    // - BILL_TO_TABLE/CASH: PENDING → waiter confirms → RECEIVED (manual confirmation)
    const initialStatus = OrderStatus.PENDING;

    const initialPaymentStatus: PaymentStatus = PaymentStatusEnum.PENDING;

    // 9. Create order with items in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          tenantId,
          tableId,
          sessionId,
          customerId: customerId || undefined, // Link order to customer if logged in
          customerName: dto.customerName,
          customerNotes: dto.customerNotes,
          status: initialStatus,
          subtotal: subtotal,
          tax: taxAmount,
          serviceCharge: serviceChargeAmount,
          tip: tipAmount,
          total: total,
          paymentMethod: paymentMethod,
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

    // 5. Clear cart - get cartId first
    const cartId = await this.cartService.getOrCreateCart(tenantId, tableId, sessionId);
    await this.cartService.clearCart(cartId);

    // 6. Increment order count for subscription usage tracking
    await this.subscriptionService.incrementOrderCount(tenantId);

    this.logger.log(`Order created: ${orderNumber} for table ${tableId}`);

    // 7. Emit WebSocket event for new order
    // All new orders (PENDING) should notify waiters/staff
    // Waiters will see the order in "Placed" tab and confirm to move to RECEIVED (KDS)
    const orderResponse = await this.getOrderById(order.id);
    this.orderGateway.emitNewOrder(tenantId, orderResponse);

    return orderResponse;
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
    // Get current active session for this table
    const activeSession = await this.prisma.tableSession.findFirst({
      where: {
        tableId,
        active: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
      },
    });

    // If no active session, return empty (table cleared)
    const activeSessionId = activeSession?.id;
    if (!activeSessionId) {
      return [];
    }

    const orders = await this.prisma.order.findMany({
      where: {
        tableId,
        sessionId: activeSessionId, // Only orders from current session
        // Include ALL statuses (don't filter out COMPLETED/PAID)
        // Orders should persist in current session until table is closed
        status: {
          notIn: [OrderStatus.CANCELLED], // Only exclude cancelled orders
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
    this.logger.log(`[getOrders] Fetching orders for tenant ${tenantId} with filters: ${JSON.stringify(filters)}`);
    
    const where: Prisma.OrderWhereInput = {
      tenantId,
      ...(filters.status && filters.status.length > 0 && {
        status: { in: filters.status as OrderStatus[] },
      }),
      ...(filters.tableId && { tableId: filters.tableId }),
      ...(filters.search && {
        OR: [
          { orderNumber: { contains: filters.search, mode: 'insensitive' } },
          { customerName: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    // Build orderBy based on sortBy and sortOrder
    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    const sortField = filters.sortBy || 'createdAt';
    const sortDirection = (filters.sortOrder || 'DESC').toLowerCase() as 'asc' | 'desc';
    orderBy[sortField as keyof Prisma.OrderOrderByWithRelationInput] = sortDirection;

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
        orderBy,
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
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                preparationTime: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Calculate estimated prep time when moving to PREPARING
    let estimatedPrepTime: number | undefined;
    if (dto.status === 'PREPARING') {
      estimatedPrepTime = this.calculateEstimatedPrepTime(order.items);
    }

    // Calculate actual prep time when moving to READY
    let actualPrepTime: number | undefined;
    if (dto.status === 'READY' && order.preparingAt) {
      const prepTimeMs = new Date().getTime() - order.preparingAt.getTime();
      actualPrepTime = Math.round(prepTimeMs / 1000 / 60); // Convert to minutes
    }

    // Update order with timestamps for KDS timer
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: dto.status as OrderStatus,
          ...(dto.status === 'RECEIVED' && { receivedAt: new Date() }),
          ...(dto.status === 'PREPARING' && {
            preparingAt: new Date(),
            estimatedPrepTime,
          }),
          ...(dto.status === 'READY' && {
            readyAt: new Date(),
            actualPrepTime,
          }),
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

    // Emit WebSocket event for real-time updates
    const updatedOrder = await this.getOrderById(orderId);
    this.orderGateway.emitOrderStatusChanged(order.tenantId, updatedOrder);

    return updatedOrder;
  }

  /**
   * Calculate estimated preparation time from menu items
   * Returns the maximum preparation time among all items
   */
  private calculateEstimatedPrepTime(items: any[]): number {
    if (!items || items.length === 0) {
      return 15; // Default 15 minutes
    }

    const prepTimes = items
      .map((item) => {
        // Get prep time from menuItem relation or default
        if (item.menuItem?.preparationTime) {
          return item.menuItem.preparationTime;
        }
        return 15; // Default if not specified
      })
      .filter((time) => time > 0);

    // Return max prep time (items prepared in parallel)
    return prepTimes.length > 0 ? Math.max(...prepTimes) : 15;
  }

  /**
   * Get orders with timer warnings (for KDS priority)
   * Returns RECEIVED (confirmed by waiter), PREPARING (cooking), and READY (waiting for serve) orders
   * PENDING orders stay in Waiter's "Placed" tab until confirmed
   * READY orders stay in KDS until waiter marks them as SERVED
   */
  async getOrdersWithTimerWarnings(tenantId: string): Promise<{
    normal: OrderResponseDto[];
    high: OrderResponseDto[];
    urgent: OrderResponseDto[];
  }> {
    // Get RECEIVED (waiter confirmed, ready for kitchen), PREPARING (cooking), and READY (cooked, waiting for serve)
    // NOTE: PENDING orders should NOT appear here - they stay in Waiter's "Placed" tab until confirmed
    const activeOrders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: {
          in: [OrderStatus.RECEIVED, OrderStatus.PREPARING, OrderStatus.READY],
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
      orderBy: { createdAt: 'asc' },
    });

    const now = new Date();
    const categorized = {
      normal: [] as OrderResponseDto[],
      high: [] as OrderResponseDto[],
      urgent: [] as OrderResponseDto[],
    };

    for (const order of activeOrders) {
      const orderDto = this.toResponseDto(order);

      // RECEIVED orders (confirmed by waiter, ready for kitchen to start) always go to normal priority
      // These appear in "New" column for kitchen to accept and start preparing
      if (order.status === OrderStatus.RECEIVED) {
        categorized.normal.push(orderDto);
        continue;
      }

      // READY orders (cooked, waiting for waiter to serve) always go to normal priority
      // These appear in "Ready" column until waiter marks as SERVED
      if (order.status === OrderStatus.READY) {
        categorized.normal.push(orderDto);
        continue;
      }

      // PREPARING orders - categorize by elapsed time vs estimated time
      if (!order.preparingAt) {
        categorized.normal.push(orderDto);
        continue;
      }

      const elapsedMinutes = Math.floor((now.getTime() - order.preparingAt.getTime()) / 1000 / 60);

      const estimatedTime = order.estimatedPrepTime || 15;

      // Priority logic:
      // URGENT: > 150% của estimated time
      // HIGH: > 100% của estimated time
      // NORMAL: <= 100% của estimated time

      if (elapsedMinutes > estimatedTime * 1.5) {
        categorized.urgent.push(orderDto);
      } else if (elapsedMinutes > estimatedTime) {
        categorized.high.push(orderDto);
      } else {
        categorized.normal.push(orderDto);
      }
    }

    return categorized;
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
   * Mark order as paid (for CASH or BILL_TO_TABLE payment methods)
   * Only updates payment status, does not change order status
   * @param orderId - Order ID to mark as paid
   * @returns Updated order response
   */
  async markAsPaid(orderId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, paymentStatus: true, paymentMethod: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      this.logger.warn(`Order ${orderId} is already marked as paid`);
      return this.getOrderById(orderId);
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    this.logger.log(`Order ${orderId} marked as paid (method: ${order.paymentMethod})`);

    return this.getOrderById(orderId);
  }

  /**
   * Customer self-service order cancellation
   * Business rules:
   * 1. Must be within 5 minutes of order creation
   * 2. Order must not have started preparing (status = PENDING or RECEIVED)
   * 3. Must be the same table that placed the order
   */
  async customerCancelOrder(
    orderId: string,
    tableId: string,
    reason: string,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify table ownership
    if (order.tableId !== tableId) {
      throw new BadRequestException('You can only cancel orders from your table');
    }

    // Check cancellation time window (5 minutes)
    const CANCELLATION_WINDOW_MINUTES = 5;
    const orderAge = Date.now() - order.createdAt.getTime();
    const maxAgeMs = CANCELLATION_WINDOW_MINUTES * 60 * 1000;

    if (orderAge > maxAgeMs) {
      throw new BadRequestException(
        `Cancellation window expired. Orders can only be cancelled within ${CANCELLATION_WINDOW_MINUTES} minutes.`,
      );
    }

    // Check order status - can only cancel if not yet preparing
    const cancellableStatuses: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.RECEIVED];
    if (!cancellableStatuses.includes(order.status as OrderStatus)) {
      throw new BadRequestException(
        'Order cannot be cancelled as kitchen has already started preparing it. Please ask staff for assistance.',
      );
    }

    // Cancel the order
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
          notes: `Customer cancelled: ${reason}`,
          changedBy: 'CUSTOMER',
        },
      });
    });

    this.logger.log(`Order ${order.orderNumber} cancelled by customer (table: ${tableId})`);

    // Emit WebSocket event for cancelled order
    const orderResponse = await this.getOrderById(orderId);
    this.orderGateway.emitOrderStatusChanged(order.tenantId, orderResponse);

    return orderResponse;
  }

  /**
   * Request bill for order (customer)
   * Customer can request bill at ANY time - even while orders are still being prepared
   * This notifies staff and locks the session from adding new orders
   */
  async requestBill(orderId: string, tableId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify table ownership
    if (order.tableId !== tableId) {
      throw new BadRequestException('You can only request bill for orders from your table');
    }

    // Allow bill request for ANY active order status
    // Customer might want to leave early or pay before all items are served
    const invalidStatuses: OrderStatus[] = [
      OrderStatus.CANCELLED,
    ];
    if (invalidStatuses.includes(order.status as OrderStatus)) {
      throw new BadRequestException('Cannot request bill for cancelled orders');
    }

    // Check if already paid
    if (order.paymentStatus === 'COMPLETED') {
      throw new BadRequestException('This order has already been paid');
    }

    // Emit WebSocket event to notify staff
    this.orderGateway.emitBillRequested(order.tenantId, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableId: order.tableId,
      tableNumber: order.table.tableNumber,
      totalAmount: Number(order.total),
      requestedAt: new Date(),
    });

    this.logger.log(`Bill requested for order ${order.orderNumber} at table ${order.table.tableNumber}`);

    return {
      success: true,
      message: 'Bill request sent. A waiter will assist you shortly.',
      orderId: order.id,
      tableNumber: order.table.tableNumber,
      requestedAt: new Date(),
    };
  }

  /**
   * Get consolidated bill preview for current session
   * Returns all orders grouped by order number with totals
   */
  async getSessionBillPreview(sessionId: string, tableId: string, tenantId: string) {
    // Get table info
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
      select: { tableNumber: true },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Get session to check bill request status
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
      select: { billRequestedAt: true },
    });

    // Get all orders in current session (excluding cancelled)
    const orders = await this.prisma.order.findMany({
      where: {
        sessionId,
        tenantId,
        status: {
          notIn: [OrderStatus.CANCELLED],
        },
      },
      include: {
        items: true,
        table: {
          select: { tableNumber: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate totals
    const summary = orders.reduce(
      (acc, order) => {
        acc.subtotal += Number(order.subtotal);
        acc.tax += Number(order.tax);
        acc.serviceCharge += Number(order.serviceCharge);
        acc.tip += Number(order.tip);
        acc.total += Number(order.total);
        acc.itemCount += order.items.length;
        return acc;
      },
      { subtotal: 0, tax: 0, serviceCharge: 0, tip: 0, total: 0, itemCount: 0 },
    );

    return {
      sessionId,
      tableNumber: table.tableNumber,
      orders: orders.map((order) => this.toResponseDto(order)),
      summary: {
        ...summary,
        orderCount: orders.length,
      },
      billRequestedAt: session?.billRequestedAt || null,
    };
  }

  /**
   * Get bill preview for entire session
   * Does NOT lock session - just returns bill info for customer to review
   */
  async requestSessionBill(sessionId: string, tableId: string, tenantId: string) {
    // Get table info
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
      select: { tableNumber: true },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Get session
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Get all orders in session to calculate total
    const orders = await this.prisma.order.findMany({
      where: {
        sessionId,
        tenantId,
        status: { notIn: [OrderStatus.CANCELLED] },
      },
      select: { total: true },
    });

    if (orders.length === 0) {
      throw new BadRequestException('No orders to request bill for');
    }

    const totalAmount = orders.reduce((sum, order) => sum + Number(order.total), 0);

    // NOTE: Do NOT lock session or notify staff here
    // This is just a bill preview - lock + notify happens when customer confirms payment

    this.logger.log(`Bill preview requested for table ${table.tableNumber} (${orders.length} orders, $${totalAmount.toFixed(2)})`);

    return {
      success: true,
      message: 'Bill preview ready. Select a payment method to proceed.',
      sessionId,
      tableNumber: table.tableNumber,
      totalAmount,
      orderCount: orders.length,
      billRequestedAt: session.billRequestedAt, // Return existing lock status if any
    };
  }

  /**
   * Confirm payment for session - locks session and notifies staff
   * Called when customer selects payment method and confirms
   */
  async confirmSessionPayment(
    sessionId: string, 
    tableId: string, 
    tenantId: string, 
    paymentMethod: string,
    tip?: number,
    discount?: number,
    voucherCode?: string,
  ) {
    // Get table info
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
      select: { tableNumber: true },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Get session
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Already locked? Just return success (idempotent)
    if (session.billRequestedAt) {
      this.logger.log(`Session ${sessionId} already locked for payment`);
      return {
        success: true,
        message: 'Payment already in progress.',
        sessionId,
        tableNumber: table.tableNumber,
        alreadyLocked: true,
      };
    }

    // Get all orders in session to calculate total
    const orders = await this.prisma.order.findMany({
      where: {
        sessionId,
        tenantId,
        status: { notIn: [OrderStatus.CANCELLED] },
      },
      select: { id: true, total: true },
    });

    if (orders.length === 0) {
      throw new BadRequestException('No orders to pay for');
    }

    const baseTotal = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const tipAmount = tip || 0;
    const discountAmount = discount || 0;
    const finalTotal = Math.max(0, baseTotal + tipAmount - discountAmount);

    // Distribute tip and discount proportionally across all orders
    // This ensures each order reflects its share of tip/discount
    const orderUpdates = orders.map((order, index) => {
      const orderTotal = Number(order.total);
      const ratio = orderTotal / baseTotal;
      
      // For the last order, use remaining amounts to avoid rounding errors
      const isLastOrder = index === orders.length - 1;
      const orderTip = isLastOrder 
        ? tipAmount - orders.slice(0, -1).reduce((sum, o, i) => sum + Math.round(Number(o.total) / baseTotal * tipAmount * 100) / 100, 0)
        : Math.round(ratio * tipAmount * 100) / 100;
      
      const orderDiscount = isLastOrder
        ? discountAmount - orders.slice(0, -1).reduce((sum, o, i) => sum + Math.round(Number(o.total) / baseTotal * discountAmount * 100) / 100, 0)
        : Math.round(ratio * discountAmount * 100) / 100;
      
      const newTotal = Math.max(0, orderTotal + orderTip - orderDiscount);
      
      return {
        orderId: (order as any).id,
        tip: orderTip,
        discount: orderDiscount,
        total: newTotal,
      };
    });

    // Update all orders with tip and discount in a transaction
    await this.prisma.$transaction([
      // Lock the session
      this.prisma.tableSession.update({
        where: { id: sessionId },
        data: { 
          billRequestedAt: new Date(),
        },
      }),
      // Update each order with its share of tip/discount
      ...orderUpdates.map(update => 
        this.prisma.order.update({
          where: { id: update.orderId },
          data: {
            tip: update.tip,
            // Note: discount field doesn't exist in schema yet, will be reflected in total
            total: update.total,
          },
        })
      ),
    ]);

    // Notify staff with final total including tip and discount
    this.orderGateway.emitBillRequested(tenantId, {
      orderId: sessionId,
      orderNumber: `SESSION-${sessionId.slice(-6)}`,
      tableId,
      tableNumber: table.tableNumber,
      totalAmount: finalTotal,
      orderCount: orders.length,
      paymentMethod,
      requestedAt: new Date(),
    });

    this.logger.log(`Payment confirmed for table ${table.tableNumber} via ${paymentMethod} (${orders.length} orders, base: $${baseTotal.toFixed(2)}, tip: $${tipAmount.toFixed(2)}, discount: $${discountAmount.toFixed(2)}, final: $${finalTotal.toFixed(2)})`);

    return {
      success: true,
      message: paymentMethod === 'SEPAY_QR' 
        ? 'Payment initiated. Please complete the QR payment.'
        : 'A waiter will assist you with payment shortly.',
      sessionId,
      tableNumber: table.tableNumber,
      totalAmount: finalTotal,
      tip: tipAmount,
      discount: discountAmount,
      orderCount: orders.length,
      lockedAt: new Date(),
    };
  }

  /**
   * Cancel bill request for session
   * Allows customer to add more orders
   */
  async cancelSessionBillRequest(sessionId: string, tenantId: string) {
    // Get session
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (!session.billRequestedAt) {
      throw new BadRequestException('No bill request to cancel');
    }

    // Check if any order in session is already paid
    const paidOrders = await this.prisma.order.count({
      where: {
        sessionId,
        tenantId,
        paymentStatus: PaymentStatus.COMPLETED,
      },
    });

    if (paidOrders > 0) {
      throw new BadRequestException('Cannot cancel bill request after payment has been made');
    }

    // Clear bill request
    await this.prisma.tableSession.update({
      where: { id: sessionId },
      data: { billRequestedAt: null },
    });

    this.logger.log(`Bill request cancelled for session ${sessionId}`);

    return {
      success: true,
      message: 'Bill request cancelled. You can now add more orders.',
    };
  }

  /**
   * Check if session has bill requested (for checkout blocking)
   */
  async isSessionBillRequested(sessionId: string): Promise<boolean> {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
      select: { billRequestedAt: true },
    });
    return !!session?.billRequestedAt;
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

  /**
   * Get KDS statistics for today
   */
  async getKdsStatistics(tenantId: string): Promise<{
    avgPrepTime: number;
    todayCompleted: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get orders completed today
    const completedOrders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: OrderStatus.COMPLETED,
        completedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        preparingAt: true,
        readyAt: true,
      },
    });

    // Calculate average preparation time
    let totalPrepTime = 0;
    let validPrepTimeCount = 0;

    for (const order of completedOrders) {
      if (order.preparingAt && order.readyAt) {
        const prepTimeMs = order.readyAt.getTime() - order.preparingAt.getTime();
        const prepTimeMinutes = prepTimeMs / 1000 / 60;
        totalPrepTime += prepTimeMinutes;
        validPrepTimeCount++;
      }
    }

    const avgPrepTime = validPrepTimeCount > 0 ? Math.round(totalPrepTime / validPrepTimeCount) : 0;
    const todayCompleted = completedOrders.length;

    return {
      avgPrepTime,
      todayCompleted,
    };
  }

  /**
   * Get order tracking info for customer
   */
  async getOrderTracking(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
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

    // Calculate elapsed time
    const now = new Date();
    const elapsedMs = now.getTime() - order.createdAt.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 1000 / 60);

    // Calculate estimated time remaining
    let estimatedTimeRemaining: number | undefined;
    if (order.status === 'PREPARING' && order.preparingAt && order.estimatedPrepTime) {
      const prepElapsedMs = now.getTime() - order.preparingAt.getTime();
      const prepElapsedMinutes = Math.floor(prepElapsedMs / 1000 / 60);
      estimatedTimeRemaining = Math.max(0, order.estimatedPrepTime - prepElapsedMinutes);
    }

    // Backward-fill missing timestamps for completed orders
    // This handles orders that were created via seed/test data without going through normal flow
    let receivedAt = order.receivedAt;
    let preparingAt = order.preparingAt;
    let readyAt = order.readyAt;
    let servedAt = order.servedAt;

    // If order is COMPLETED/SERVED but missing timestamps, use createdAt as fallback
    if (['COMPLETED', 'SERVED'].includes(order.status)) {
      if (!receivedAt) receivedAt = order.createdAt;
      if (!preparingAt) preparingAt = order.createdAt;
      if (!readyAt) readyAt = order.createdAt;
      if (!servedAt) servedAt = order.createdAt;
    } else if (['READY'].includes(order.status)) {
      if (!receivedAt) receivedAt = order.createdAt;
      if (!preparingAt) preparingAt = order.createdAt;
      if (!readyAt) readyAt = order.createdAt;
    } else if (['PREPARING'].includes(order.status)) {
      if (!receivedAt) receivedAt = order.createdAt;
      if (!preparingAt) preparingAt = order.createdAt;
    } else if (['RECEIVED'].includes(order.status)) {
      if (!receivedAt) receivedAt = order.createdAt;
    }

    // Build timeline with fallback timestamps
    const timeline = [
      {
        status: 'PENDING',
        label: 'Pending',
        description: 'Your order is waiting for confirmation',
        timestamp: order.createdAt, // Order is created at PENDING
        completed: true, // Always completed since order exists
      },
      {
        status: 'RECEIVED',
        label: 'Accepted',
        description: 'Your order has been accepted by the restaurant',
        timestamp: receivedAt,
        completed: !!receivedAt,
      },
      {
        status: 'PREPARING',
        label: 'Preparing',
        description: 'Your order is being prepared by our kitchen',
        timestamp: preparingAt,
        completed: !!preparingAt,
      },
      {
        status: 'READY',
        label: 'Ready',
        description: 'Your order is ready to be served',
        timestamp: readyAt,
        completed: !!readyAt,
      },
      {
        status: 'SERVED',
        label: 'Served',
        description: 'Your order has been served. Enjoy your meal!',
        timestamp: servedAt,
        completed: !!servedAt,
      },
      {
        status: 'COMPLETED',
        label: 'Completed',
        description: 'Your order is complete. Thank you!',
        timestamp: order.completedAt,
        completed: !!order.completedAt,
      },
    ];

    // Current status message
    const statusMessages: Record<string, string> = {
      PENDING: 'Waiting for confirmation',
      RECEIVED: 'Order confirmed',
      PREPARING: 'Being prepared',
      READY: 'Ready to serve',
      SERVED: 'Served - Enjoy!',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    };

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableNumber: order.table.tableNumber,
      currentStatus: order.status,
      currentStatusMessage: statusMessages[order.status] || order.status,
      paymentStatus: order.paymentStatus,
      timeline,
      estimatedTimeRemaining,
      elapsedMinutes,
      createdAt: order.createdAt,
    };
  }

  // ==================== PRIVATE HELPERS ====================

  /**
   * Find an existing unpaid BILL_TO_TABLE (cash) order for a table
   * Used to determine if new items should be appended to existing order
   * @param tenantId - Tenant ID
   * @param tableId - Table ID
   * @param sessionId - Current session ID
   * @returns Mergeable order info or null
   */
  async findMergeableOrder(tenantId: string, tableId: string, sessionId: string): Promise<{
    hasMergeableOrder: boolean;
    existingOrder?: {
      id: string;
      orderNumber: string;
      total: number;
      itemCount: number;
      createdAt: Date;
    };
    message: string;
  }> {
    // Find orders that are:
    // 1. Same table and session
    // 2. Payment method = BILL_TO_TABLE (cash)
    // 3. Payment status = PENDING (not paid yet)
    // 4. Order status is active (not COMPLETED, CANCELLED, or PAID)
    const existingOrder = await this.prisma.order.findFirst({
      where: {
        tenantId,
        tableId,
        sessionId,
        paymentMethod: PaymentMethod.BILL_TO_TABLE,
        paymentStatus: PaymentStatus.PENDING,
        status: {
          in: [
            OrderStatus.PENDING,
            OrderStatus.RECEIVED,
            OrderStatus.PREPARING,
            OrderStatus.READY,
            OrderStatus.SERVED,
          ],
        },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' }, // Get the most recent one
    });

    if (!existingOrder) {
      return {
        hasMergeableOrder: false,
        message: 'No existing cash order found. A new order will be created.',
      };
    }

    return {
      hasMergeableOrder: true,
      existingOrder: {
        id: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        total: Number(existingOrder.total),
        itemCount: existingOrder.items.length,
        createdAt: existingOrder.createdAt,
      },
      message: `Found existing cash order ${existingOrder.orderNumber}. Items will be added to this order.`,
    };
  }

  /**
   * Append items to an existing order
   * Used for merging new items into unpaid BILL_TO_TABLE orders
   * @param orderId - Existing order ID
   * @param sessionId - Current session ID (for validation)
   * @param tableId - Table ID (for validation)
   * @param tenantId - Tenant ID
   * @returns Updated order response
   */
  async appendItemsToOrder(
    orderId: string,
    sessionId: string,
    tableId: string,
    tenantId: string,
  ): Promise<OrderResponseDto> {
    // 1. Validate the order exists and is appendable
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // 2. Security checks
    if (order.tableId !== tableId) {
      throw new BadRequestException('Order does not belong to this table');
    }

    if (order.sessionId !== sessionId) {
      throw new BadRequestException('Order does not belong to this session');
    }

    if (order.tenantId !== tenantId) {
      throw new BadRequestException('Order does not belong to this tenant');
    }

    // 3. Check payment method - only BILL_TO_TABLE can be appended
    if (order.paymentMethod !== PaymentMethod.BILL_TO_TABLE) {
      throw new BadRequestException('Can only append items to cash/bill-to-table orders');
    }

    // 4. Check payment status - cannot append to paid orders
    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Cannot append items to a paid order');
    }

    // 5. Check order status - cannot append to completed/cancelled orders
    const appendableStatuses: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.RECEIVED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.SERVED,
    ];

    if (!appendableStatuses.includes(order.status)) {
      throw new BadRequestException(`Cannot append items to order with status: ${order.status}`);
    }

    // 6. Get current cart items
    const cart = await this.cartService.getCartByTable(tenantId, tableId, sessionId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 7. Get tenant pricing settings for recalculation
    const pricingSettings = await this.tenantService.getPricingSettings(tenantId);

    // 8. Calculate new items totals
    const newItemsSubtotal = new Decimal(cart.subtotal);
    const newItemsTax = new Decimal(cart.tax);

    // 9. Update order in transaction
    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      // Add new items to order
      await tx.orderItem.createMany({
        data: cart.items.map((item) => ({
          orderId: order.id,
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          modifiers: item.modifiers ? JSON.stringify(item.modifiers) : undefined,
          notes: item.notes,
          itemTotal: item.itemTotal,
          prepared: false, // New items need to be prepared
        })),
      });

      // Recalculate totals
      const oldSubtotal = new Decimal(order.subtotal);
      const oldTax = new Decimal(order.tax);
      const newSubtotal = oldSubtotal.add(newItemsSubtotal);
      const newTax = oldTax.add(newItemsTax);

      // Recalculate service charge based on new subtotal
      let newServiceCharge = new Decimal(0);
      if (pricingSettings.serviceCharge.enabled) {
        newServiceCharge = newSubtotal.mul(pricingSettings.serviceCharge.rate).div(100);
      }

      // Keep existing tip
      const existingTip = new Decimal(order.tip || 0);

      // Calculate new total
      const newTotal = newSubtotal.add(newTax).add(newServiceCharge).add(existingTip);

      // Update order totals
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          subtotal: newSubtotal,
          tax: newTax,
          serviceCharge: newServiceCharge,
          total: newTotal,
          // If order was in SERVED or READY status, move back to PREPARING
          // so kitchen knows there are new items
          ...((order.status === OrderStatus.SERVED || order.status === OrderStatus.READY) && {
            status: OrderStatus.PREPARING,
            preparingAt: new Date(),
          }),
        },
        include: {
          items: true,
          table: {
            select: {
              tableNumber: true,
            },
          },
        },
      });

      // Add status history for appended items
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: updated.status,
          notes: `${cart.items.length} new item(s) appended to order`,
        },
      });

      // Update menu items popularity for new items
      for (const item of cart.items) {
        await this.menuItemsService.incrementPopularity(item.menuItemId);
      }

      return updated;
    });

    // 10. Clear cart
    const cartId = await this.cartService.getOrCreateCart(tenantId, tableId, sessionId);
    await this.cartService.clearCart(cartId);

    this.logger.log(
      `Appended ${cart.items.length} items to order ${order.orderNumber} for table ${tableId}`,
    );

    // 11. Emit WebSocket event for updated order
    const orderResponse = this.toResponseDto(updatedOrder);
    this.orderGateway.emitOrderStatusChanged(tenantId, orderResponse);

    // Also emit new order event if status changed to notify KDS
    if (
      (order.status === OrderStatus.SERVED || order.status === OrderStatus.READY) &&
      updatedOrder.status === OrderStatus.PREPARING
    ) {
      this.orderGateway.emitNewOrder(tenantId, orderResponse);
    }

    return orderResponse;
  }

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
   * Transform to response DTO with calculated fields
   */
  private toResponseDto(order: any): OrderResponseDto {
    // Calculate elapsed prep time if order is PREPARING
    let elapsedPrepTime: number | undefined;
    if (order.status === 'PREPARING' && order.preparingAt) {
      const now = new Date();
      const elapsedMs = now.getTime() - order.preparingAt.getTime();
      elapsedPrepTime = Math.floor(elapsedMs / 1000 / 60); // Convert to minutes
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      tableId: order.tableId,
      sessionId: order.sessionId || undefined,
      tableNumber: order.table?.tableNumber || 'N/A',
      customerName: order.customerName,
      customerNotes: order.customerNotes,
      status: order.status,
      priority: order.priority || 'NORMAL',
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      serviceCharge: order.serviceCharge ? Number(order.serviceCharge) : 0,
      tip: order.tip ? Number(order.tip) : 0,
      total: Number(order.total),
      items: (order.items || []).map((item: any) => {
        // Parse modifiers if it's a JSON string, otherwise use as-is
        let modifiers = [];
        if (item.modifiers) {
          if (typeof item.modifiers === 'string') {
            try {
              modifiers = JSON.parse(item.modifiers);
            } catch {
              modifiers = [];
            }
          } else if (Array.isArray(item.modifiers)) {
            modifiers = item.modifiers;
          }
        }
        
        return {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
          modifiers,
          notes: item.notes,
          itemTotal: Number(item.itemTotal),
          prepared: item.prepared || false,
          preparedAt: item.preparedAt,
        };
      }),
      estimatedPrepTime: order.estimatedPrepTime,
      actualPrepTime: order.actualPrepTime,
      elapsedPrepTime,
      createdAt: order.createdAt,
      receivedAt: order.receivedAt,
      preparingAt: order.preparingAt,
      readyAt: order.readyAt,
      servedAt: order.servedAt,
      completedAt: order.completedAt,
    };
  }

  /**
   * Get all orders for a specific session (used by waiter for bill printing)
   */
  async getOrdersBySession(
    tenantId: string,
    tableId: string,
    sessionId: string,
  ): Promise<OrderResponseDto[]> {
    // Validate table belongs to tenant
    const table = await this.prisma.table.findFirst({
      where: { id: tableId, tenantId },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Get all non-cancelled orders for this session
    const orders = await this.prisma.order.findMany({
      where: {
        sessionId,
        tenantId,
        tableId,
        status: {
          notIn: [OrderStatus.CANCELLED],
        },
      },
      include: {
        items: true,
        table: {
          select: { tableNumber: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return orders.map((order) => this.toResponseDto(order));
  }

  /**
   * Get order history for a logged-in customer
   * Fetches ALL orders linked to this customer across all tenants/restaurants
   * Also matches orders by customerName (email or fullName) for legacy orders
   */
  async getCustomerOrderHistory(
    customerId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ orders: OrderResponseDto[]; total: number }> {
    this.logger.log(`[getCustomerOrderHistory] Fetching order history for customer ${customerId}`);
    
    // First, get customer info to match legacy orders by name/email
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { email: true, fullName: true },
    });

    if (!customer) {
      this.logger.warn(`[getCustomerOrderHistory] Customer ${customerId} not found`);
      return { orders: [], total: 0 };
    }

    // Build OR conditions to find orders:
    // 1. Orders with customerId set (new orders)
    // 2. Orders where customerName matches customer's email or fullName (legacy orders)
    const whereCondition = {
      OR: [
        { customerId },
        { customerName: customer.email },
        { customerName: customer.fullName },
      ],
      status: {
        notIn: [OrderStatus.CANCELLED],
      },
    };

    // Query orders
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: whereCondition,
        include: {
          items: true,
          table: {
            select: { tableNumber: true },
          },
          tenant: {
            select: { name: true },
          },
          bill: {
            select: { billNumber: true, paymentStatus: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.order.count({
        where: whereCondition,
      }),
    ]);

    this.logger.log(`[getCustomerOrderHistory] Found ${orders.length} orders for customer ${customerId} (email: ${customer.email}, total: ${total})`);

    return {
      orders: orders.map((order) => this.toResponseDto(order)),
      total,
    };
  }
}

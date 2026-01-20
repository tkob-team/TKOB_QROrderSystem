import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { OrderService } from '../services/order.service';
import { BillPdfService } from '../services/bill-pdf.service';
import { Session } from '@/common/decorators/session.decorator';
import { SessionData } from '@/modules/table/services/table-session.service';
import { CheckoutDto } from '../dtos/checkout.dto';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { MergeableOrderResponseDto } from '../dtos/append-order-items.dto';
import { SessionGuard } from '@/modules/table/guards/session.guard';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { TenantOwnershipGuard } from '@/modules/tenant/guards/tenant-ownership.guard';
import { CustomerAuthGuard } from '@/modules/auth/guards/customer-auth.guard';
import { OptionalCustomerAuthGuard } from '@/modules/auth/guards/optional-customer-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { OrderFiltersDto } from '../dtos/order-filters.dto';
import { AuthenticatedUser } from '@/common/interfaces/auth.interface';
import { PaginatedResponseDto } from '@/common/dto/pagination.dto';
import { UpdateOrderStatusDto } from '../dtos/update-order-status.dto';
import { SkipTransform } from '@/common/interceptors/transform.interceptor';

@ApiTags('Orders')
@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly billPdfService: BillPdfService,
  ) {}

  // ==================== CUSTOMER ENDPOINTS ====================

  @Post('checkout')
  @UseGuards(SessionGuard, OptionalCustomerAuthGuard)
  @Public()
  @ApiCookieAuth('table_session_id')
  @ApiOperation({ summary: 'Checkout and create order from cart' })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  async checkout(
    @Session() session: SessionData,
    @Body() dto: CheckoutDto,
    @Req() req: any,
  ): Promise<OrderResponseDto> {
    // Extract customerId from request if customer is logged in
    // Customer auth token is optional - anonymous checkout is allowed
    const customerId = req.customer?.id || null;
    return this.orderService.checkout(session.sessionId, session.tenantId, session.tableId, dto, customerId);
  }

  @Get('orders/mergeable')
  @UseGuards(SessionGuard)
  @Public()
  @ApiCookieAuth('table_session_id')
  @ApiOperation({
    summary: 'Check if there is an existing unpaid cash order to merge into',
    description: 'Returns info about existing BILL_TO_TABLE order that can accept new items',
  })
  @ApiResponse({ status: 200, type: MergeableOrderResponseDto })
  async checkMergeableOrder(
    @Session() session: SessionData,
  ): Promise<MergeableOrderResponseDto> {
    return this.orderService.findMergeableOrder(
      session.tenantId,
      session.tableId,
      session.sessionId,
    );
  }

  @Post('orders/:orderId/append-items')
  @UseGuards(SessionGuard)
  @Public()
  @ApiCookieAuth('table_session_id')
  @ApiOperation({
    summary: 'Append cart items to an existing order',
    description:
      'Add items from current cart to an existing unpaid BILL_TO_TABLE order. ' +
      'Use this when customer wants to order more items but keep everything on one bill.',
  })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Cart empty, order not appendable, or validation failed' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async appendItemsToOrder(
    @Session() session: SessionData,
    @Param('orderId') orderId: string,
  ): Promise<OrderResponseDto> {
    return this.orderService.appendItemsToOrder(
      orderId,
      session.sessionId,
      session.tableId,
      session.tenantId,
    );
  }

  @Get('orders/table/:tableId')
  @UseGuards(SessionGuard)
  @Public()
  @ApiCookieAuth('table_session_id')
  @ApiOperation({ summary: 'Get orders for current table (customer view)' })
  @ApiResponse({ status: 200, type: [OrderResponseDto] })
  async getTableOrders(@Param('tableId') tableId: string): Promise<OrderResponseDto[]> {
    return this.orderService.getTableOrders(tableId);
  }

  @Get('orders/history')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get order history for logged-in customer',
    description: 'Returns past completed/paid orders for the authenticated customer',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        orders: { type: 'array', items: { $ref: '#/components/schemas/OrderResponseDto' } },
        total: { type: 'number' },
      },
    },
  })
  async getOrderHistory(
    @Req() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.orderService.getCustomerOrderHistory(
      req.customer.id,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    );
  }

  @Get('orders/:orderId')
  @UseGuards(SessionGuard)
  @Public()
  @ApiCookieAuth('table_session_id')
  @ApiOperation({ summary: 'Get order by ID (customer view)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async getOrder(
    @Session() session: SessionData,
    @Param('orderId') orderId: string,
  ): Promise<OrderResponseDto> {
    return this.orderService.getOrderById(orderId);
  }

  @Get('orders/tracking/:orderId')
  @UseGuards(SessionGuard)
  @Public()
  @ApiCookieAuth('table_session_id')
  @ApiOperation({
    summary: 'Get order tracking info (customer view)',
    description: 'Real-time order status tracking for customers with timeline and ETA',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        orderNumber: { type: 'string' },
        tableNumber: { type: 'string' },
        currentStatus: { type: 'string' },
        currentStatusMessage: { type: 'string' },
        timeline: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              label: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              completed: { type: 'boolean' },
              description: { type: 'string' },
            },
          },
        },
        estimatedTimeRemaining: { type: 'number' },
        elapsedMinutes: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getOrderTracking(@Param('orderId') orderId: string) {
    return this.orderService.getOrderTracking(orderId);
  }

  @Get('orders/session/bill-preview')
  @UseGuards(SessionGuard)
  @Public()
  @ApiCookieAuth('table_session_id')
  @ApiOperation({
    summary: 'Get consolidated bill preview for current session',
    description: 'Returns all orders in current session grouped for payment. Used for Request Bill flow.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        tableNumber: { type: 'string' },
        orders: {
          type: 'array',
          items: { $ref: '#/components/schemas/OrderResponseDto' },
        },
        summary: {
          type: 'object',
          properties: {
            subtotal: { type: 'number' },
            tax: { type: 'number' },
            serviceCharge: { type: 'number' },
            tip: { type: 'number' },
            total: { type: 'number' },
            orderCount: { type: 'number' },
            itemCount: { type: 'number' },
          },
        },
        billRequestedAt: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  })
  async getSessionBillPreview(@Session() session: SessionData) {
    return this.orderService.getSessionBillPreview(session.sessionId, session.tableId, session.tenantId);
  }

  @Post('orders/session/request-bill')
  @UseGuards(SessionGuard)
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('table_session_id')
  @ApiOperation({
    summary: 'Request bill for entire session',
    description: 'Request bill for ALL orders in current session. Notifies staff and locks session from new orders.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        sessionId: { type: 'string' },
        tableNumber: { type: 'string' },
        totalAmount: { type: 'number' },
        orderCount: { type: 'number' },
        requestedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async requestSessionBill(@Session() session: SessionData) {
    return this.orderService.requestSessionBill(session.sessionId, session.tableId, session.tenantId);
  }

  @Post('orders/session/cancel-bill-request')
  @UseGuards(SessionGuard)
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('table_session_id')
  @ApiOperation({
    summary: 'Cancel bill request for session',
    description: 'Cancel pending bill request to allow adding more orders. Only works if not yet paid.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async cancelSessionBillRequest(@Session() session: SessionData) {
    return this.orderService.cancelSessionBillRequest(session.sessionId, session.tenantId);
  }

  @Post('orders/session/confirm-payment')
  @UseGuards(SessionGuard)
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('table_session_id')
  @ApiOperation({
    summary: 'Confirm payment for session',
    description: 'Lock session and notify staff when customer confirms payment. Called after selecting payment method.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        sessionId: { type: 'string' },
        tableNumber: { type: 'string' },
        totalAmount: { type: 'number' },
        orderCount: { type: 'number' },
        lockedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async confirmSessionPayment(
    @Session() session: SessionData,
    @Body() body: { paymentMethod: string; tip?: number; discount?: number; voucherCode?: string },
  ) {
    return this.orderService.confirmSessionPayment(
      session.sessionId,
      session.tableId,
      session.tenantId,
      body.paymentMethod,
      body.tip,
      body.discount,
      body.voucherCode,
    );
  }

  @Post('orders/:orderId/cancel')
  @UseGuards(SessionGuard)
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('table_session_id')
  @ApiOperation({
    summary: 'Cancel order (customer self-service)',
    description: 'Customers can cancel their own order within 5 minutes if kitchen has not started',
  })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Cancellation window expired or order already preparing' })
  async customerCancelOrder(
    @Session() session: SessionData,
    @Param('orderId') orderId: string,
    @Body() body: { reason?: string },
  ): Promise<OrderResponseDto> {
    return this.orderService.customerCancelOrder(
      orderId,
      session.tableId,
      body.reason || 'Customer requested cancellation',
    );
  }

  @Post('orders/:orderId/request-bill')
  @UseGuards(SessionGuard)
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('table_session_id')
  @ApiOperation({
    summary: 'Request bill for order (customer)',
    description: 'Customer requests bill/check. Notifies staff to bring bill to table.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        orderId: { type: 'string' },
        tableNumber: { type: 'string' },
        requestedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Order not found or not eligible for bill request' })
  async requestBill(
    @Session() session: SessionData,
    @Param('orderId') orderId: string,
  ) {
    return this.orderService.requestBill(orderId, session.tableId);
  }

  // ==================== STAFF ENDPOINTS ====================
  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF, UserRole.KITCHEN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders with filters (staff/admin)' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto<OrderResponseDto> })
  async getOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: OrderFiltersDto,
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    return this.orderService.getOrders(user.tenantId, filters);
  }

  @Get('admin/orders/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF, UserRole.KITCHEN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID (staff/admin)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async getOrderById(@Param('orderId') orderId: string): Promise<OrderResponseDto> {
    return this.orderService.getOrderById(orderId);
  }

  @Patch('admin/orders/:orderId/status')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF, UserRole.KITCHEN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (staff action)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async updateOrderStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.updateOrderStatus(orderId, dto, user.userId);
  }

  @Post('admin/orders/:orderId/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel order (staff action)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async cancelOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Body() body: { reason: string },
  ): Promise<OrderResponseDto> {
    return this.orderService.cancelOrder(orderId, body.reason, user.userId);
  }

  @Patch('admin/orders/:orderId/mark-paid')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark order as paid (waiter action for CASH/BILL_TO_TABLE)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async markOrderAsPaid(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
  ): Promise<OrderResponseDto> {
    return this.orderService.markAsPaid(orderId);
  }

  // ==================== WAITER/STAFF ENDPOINTS ====================

  @Get('admin/orders/:orderId/bill')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
  @Roles(UserRole.STAFF, UserRole.OWNER)
  @ApiBearerAuth()
  @Header('Content-Type', 'application/pdf')
  @SkipTransform()
  @ApiOperation({
    summary: 'Generate bill PDF for order (Waiter)',
    description: 'Generate and download bill PDF for customer. Used by waiters after customer requests bill.',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF bill generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async generateBill(
    @Param('orderId') orderId: string,
    @Res() res: Response,
  ): Promise<void> {
    const pdfBuffer = await this.billPdfService.generateBillPdf(orderId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bill-${orderId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  }

  /**
   * Get all orders for a specific table session (waiter use)
   * Used by waiter dashboard for printing bills
   */
  @Get('admin/tables/:tableId/session-orders')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
  @Roles(UserRole.STAFF, UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get orders for a table session (Waiter)',
    description: 'Returns all orders for the specified session. Used for bill printing in waiter dashboard.',
  })
  @ApiResponse({ status: 200, type: [OrderResponseDto] })
  async getSessionOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tableId') tableId: string,
    @Query('sessionId') sessionId: string,
  ): Promise<OrderResponseDto[]> {
    return this.orderService.getOrdersBySession(user.tenantId, tableId, sessionId);
  }

  // ==================== KITCHEN ENDPOINTS ====================

  @Patch('admin/orders/:orderId/items/:itemId/prepared')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
  @Roles(UserRole.KITCHEN, UserRole.STAFF, UserRole.OWNER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @SkipTransform()
  @ApiOperation({ summary: 'Mark order item as prepared (KDS)' })
  @ApiResponse({ status: 204 })
  async markItemPrepared(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
  ): Promise<void> {
    await this.orderService.markItemPrepared(orderId, itemId);
  }
}

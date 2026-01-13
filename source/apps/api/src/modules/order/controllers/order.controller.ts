import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { Session } from '@/common/decorators/session.decorator';
import { SessionData } from '@/modules/table/services/table-session.service';
import { CheckoutDto } from '../dtos/checkout.dto';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { SessionGuard } from '@/modules/table/guards/session.guard';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { TenantOwnershipGuard } from '@/modules/tenant/guards/tenant-ownership.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { OrderFiltersDto } from '../dtos/order-filters.dto';
import { AuthenticatedUser } from '@/common/interfaces/auth.interface';
import { PaginatedResponseDto } from '@/common/dto/pagination.dto';
import { UpdateOrderStatusDto } from '../dtos/update-order-status.dto';

@ApiTags('Orders')
@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ==================== CUSTOMER ENDPOINTS ====================

  @Post('checkout')
  @UseGuards(SessionGuard)
  @Public()
  @ApiCookieAuth('table_session_id')
  @ApiOperation({ summary: 'Checkout and create order from cart' })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  async checkout(
    @Session() session: SessionData,
    @Body() dto: CheckoutDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.checkout(session.sessionId, session.tenantId, session.tableId, dto);
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

  @Get('tracking/:orderId')
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

  // ==================== KITCHEN ENDPOINTS ====================

  @Patch('admin/orders/:orderId/items/:itemId/prepared')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
  @Roles(UserRole.KITCHEN, UserRole.STAFF, UserRole.OWNER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark order item as prepared (KDS)' })
  @ApiResponse({ status: 204 })
  async markItemPrepared(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
  ): Promise<void> {
    await this.orderService.markItemPrepared(orderId, itemId);
  }
}

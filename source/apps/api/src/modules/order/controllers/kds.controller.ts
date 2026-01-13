import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { TenantOwnershipGuard } from '@/modules/tenant/guards/tenant-ownership.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@/common/interfaces/auth.interface';
import { OrderService } from '../services/order.service';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { KdsOrdersResponseDto, KdsStatsResponseDto } from '../dtos/kds-response.dto';

/**
 * KDS (Kitchen Display System) Controller
 *
 * Provides endpoints for kitchen staff to view and manage orders:
 * - View orders by priority (urgent/high/normal)
 * - Real-time updates via WebSocket
 * - Order timer tracking
 */
@ApiTags('KDS - Kitchen Display')
@Controller('admin/kds')
@UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
@ApiBearerAuth()
export class KdsController {
  constructor(private readonly orderService: OrderService) {}

  @Get('orders/active')
  @Roles(UserRole.KITCHEN, UserRole.STAFF, UserRole.OWNER)
  @ApiOperation({
    summary: 'Get active orders for KDS (categorized by priority)',
    description: 'Returns orders in PREPARING status, sorted by elapsed time and priority',
  })
  @ApiResponse({
    status: 200,
    type: KdsOrdersResponseDto,
    description: 'Orders grouped by priority level',
  })
  async getActiveOrders(@CurrentUser() user: AuthenticatedUser): Promise<KdsOrdersResponseDto> {
    return this.orderService.getOrdersWithTimerWarnings(user.tenantId);
  }

  @Get('stats')
  @Roles(UserRole.KITCHEN, UserRole.STAFF, UserRole.OWNER)
  @ApiOperation({
    summary: 'Get KDS statistics',
    description: 'Real-time statistics for kitchen performance',
  })
  @ApiResponse({
    status: 200,
    type: KdsStatsResponseDto,
    description: 'Kitchen performance statistics',
  })
  async getKdsStats(@CurrentUser() user: AuthenticatedUser): Promise<KdsStatsResponseDto> {
    const [orders, stats] = await Promise.all([
      this.orderService.getOrdersWithTimerWarnings(user.tenantId),
      this.orderService.getKdsStatistics(user.tenantId),
    ]);

    const totalActive = orders.normal.length + orders.high.length + orders.urgent.length;

    return {
      totalActive,
      urgent: orders.urgent.length,
      high: orders.high.length,
      normal: orders.normal.length,
      avgPrepTime: stats.avgPrepTime,
      todayCompleted: stats.todayCompleted,
    };
  }
}

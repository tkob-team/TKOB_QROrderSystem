import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { OrderGateway } from '../gateways/order.gateway';
import { OrderStatus } from '@prisma/client';

/**
 * Order Timer Service
 * Periodically emits timer updates for active orders to KDS
 */
@Injectable()
export class OrderTimerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrderTimerService.name);
  private timerInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly orderGateway: OrderGateway,
  ) {}

  /**
   * Start timer update loop on module init
   */
  onModuleInit() {
    this.startTimerUpdates();
  }

  /**
   * Stop timer update loop on module destroy
   */
  onModuleDestroy() {
    this.stopTimerUpdates();
  }

  /**
   * Start emitting timer updates every 10 seconds
   */
  private startTimerUpdates() {
    this.timerInterval = setInterval(async () => {
      try {
        await this.broadcastTimerUpdates();
      } catch (error) {
        this.logger.error('Error broadcasting timer updates:', error);
      }
    }, 10000); // Update every 10 seconds

    this.logger.log('Order timer updates started (every 10 seconds)');
  }

  /**
   * Stop timer update loop
   */
  private stopTimerUpdates() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.logger.log('Order timer updates stopped');
    }
  }

  /**
   * Get active orders and broadcast their current elapsed time
   */
  private async broadcastTimerUpdates() {
    try {
      // Get all active orders across all tenants
      const activeOrders = await this.prismaService.order.findMany({
        where: {
          status: {
            in: [OrderStatus.RECEIVED, OrderStatus.PREPARING, OrderStatus.READY],
          },
        },
        select: {
          id: true,
          tenantId: true,
          status: true,
          createdAt: true,
          preparingAt: true,
          estimatedPrepTime: true,
        },
      });

      const now = new Date();

      // Group by tenant and emit updates
      const tenantUpdates = new Map<string, any[]>();

      for (const order of activeOrders) {
        const elapsedMinutes = Math.floor((now.getTime() - order.createdAt.getTime()) / 1000 / 60);
        const estimatedTime = order.estimatedPrepTime || 15;

        // Determine priority
        let priority: 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL';
        if (elapsedMinutes > estimatedTime * 1.5) {
          priority = 'URGENT';
        } else if (elapsedMinutes > estimatedTime) {
          priority = 'HIGH';
        }

        if (!tenantUpdates.has(order.tenantId)) {
          tenantUpdates.set(order.tenantId, []);
        }

        tenantUpdates.get(order.tenantId)!.push({
          orderId: order.id,
          elapsedMinutes,
          priority,
        });
      }

      // Emit updates to each tenant
      for (const [tenantId, updates] of tenantUpdates) {
        for (const update of updates) {
          this.orderGateway.emitOrderTimerUpdate(
            tenantId,
            update.orderId,
            update.elapsedMinutes,
            update.priority,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in broadcastTimerUpdates:', error);
    }
  }
}

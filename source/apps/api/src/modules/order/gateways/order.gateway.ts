import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { OrderEvents } from '../constants/events.constant';

/**
 * Order WebSocket Gateway
 *
 * Provides real-time updates for:
 * - New orders (notify staff/kitchen)
 * - Order status changes (notify customers & staff)
 * - Order preparation timer updates
 *
 * Rooms:
 * - `tenant:{tenantId}:staff` - Staff/Kitchen dashboard
 * - `tenant:{tenantId}:customer:{tableId}` - Customer order tracking
 */
@WebSocketGateway({
  namespace: '/orders',
  cors: {
    origin: process.env.CUSTOMER_APP_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrderGateway.name);

  // Track Connection clients
  private clients = new Map<
    string,
    { tenantId: string; role: 'staff' | 'customer'; tableId?: string }
  >();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // const { tenantId, role, tableId } = client.handshake.query;
    const tenantId = client.handshake.query.tenantId as string;
    const role = client.handshake.query.role as 'staff' | 'customer';
    const tableId = client.handshake.query.tableId as string;

    if (!tenantId || !role) {
      this.logger.warn(`Client ${client.id} missing auth info, disconnecting`);
      client.disconnect();
      return;
    }

    // Store client info
    this.clients.set(client.id, {
      tenantId: tenantId,
      role: role,
      tableId: tableId as string | undefined,
    });

    // Join appropriate room
    if (role === 'staff') {
      const staffRoom = `tenant:${tenantId}:staff`;
      void client.join(staffRoom);
      this.logger.log(`Staff client ${client.id} joined room: ${staffRoom}`);
    } else if (role === 'customer' && tableId) {
      const customerRoom = `tenant:${tenantId}:customer:${tableId}`;
      void client.join(customerRoom);
      this.logger.log(`Customer client ${client.id} joined room: ${customerRoom}`);
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id);
  }

  @SubscribeMessage('subscribe:staff')
  handleStaffSubcribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tenantId: string },
  ) {
    const room = `tenant:${data.tenantId}:staff`;
    void client.join(room);
    this.logger.log(`Client ${client.id} subscribed to staff room: ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('subscribe:customer')
  handleCustomerSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tenantId: string; tableId: string },
  ) {
    const room = `tenant:${data.tenantId}:customer:${data.tableId}`;
    void client.join(room);
    this.logger.log(`Client ${client.id} subscribed to customer room: ${room}`);
    return { success: true, room };
  }

  // ==================== SERVER-SIDE EMITTERS ====================

  /**
   * Emit new order notification to staff/kitchen
   * Triggered when customer checks out
   */
  emitNewOrder(tenantId: string, order: OrderResponseDto) {
    const room = `tenant:${tenantId}:staff`;
    this.server.to(room).emit(OrderEvents.NEW_ORDER, {
      order,
      timestamp: new Date(),
    });
    this.logger.log(`New order notification sent to room: ${room} - Order #${order.orderNumber}`);
  }

  /**
   * Emit order status change to staff & customers
   * Triggered when staff updates order status
   */
  emitOrderStatusChanged(tenantId: string, order: OrderResponseDto) {
    // Notify staff
    const staffRoom = `tenant:${tenantId}:staff`;
    this.server.to(staffRoom).emit(OrderEvents.STATUS_CHANGED, {
      order,
      timestamp: new Date(),
    });

    // Notify customer at table
    const customerRoom = `tenant:${tenantId}:customer:${order.tableId}`;
    this.server.to(customerRoom).emit(OrderEvents.STATUS_CHANGED, {
      order,
      timestamp: new Date(),
    });

    this.logger.log(`Order status change emitted - Order #${order.orderNumber} → ${order.status}`);
  }

  /**
   * Emit order timer update (for KDS)
   * Called periodically for orders in PREPARING status
   */
  emitOrderTimerUpdate(
    tenantId: string,
    orderId: string,
    elapsedMinutes: number,
    priority: 'NORMAL' | 'HIGH' | 'URGENT',
  ) {
    const staffRoom = `tenant:${tenantId}:staff`;
    this.server.to(staffRoom).emit('order:timer_update', {
      orderId,
      elapsedMinutes,
      priority,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast order list update to staff (for dashboard refresh)
   */
  emitOrderListUpdate(tenantId: string, orders: OrderResponseDto[]) {
    const staffRoom = `tenant:${tenantId}:staff`;
    this.server.to(staffRoom).emit('order:list_update', {
      orders,
      timestamp: new Date(),
    });
  }

  /**
   * Get connected clients count for monitoring
   */
  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Get clients in a specific room
   */
  async getClientsInRoom(room: string): Promise<string[]> {
    const sockets = await this.server.in(room).fetchSockets();
    return sockets.map((s) => s.id);
  }
}

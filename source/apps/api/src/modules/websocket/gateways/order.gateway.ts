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
import { JwtService } from '@nestjs/jwt';
import { OrderResponseDto } from '@/modules/order/dtos/order-response.dto';
import { OrderEvents } from '@/modules/order/constants/events.constant';

interface ClientInfo {
  tenantId: string;
  role: 'staff' | 'customer';
  userId?: string;
  tableId?: string;
  connectedAt: Date;
}

/**
 * Unified Order WebSocket Gateway
 *
 * Provides real-time updates for:
 * - New orders (notify staff/kitchen)
 * - Order status changes (notify customers & staff)
 * - Order preparation timer updates
 * - Payment completion notifications
 *
 * Authentication Methods:
 * - JWT token (for authenticated staff via handshake.auth.token)
 * - Query params (for customers via tenantId, role, tableId)
 *
 * Rooms:
 * - `tenant:{tenantId}:staff` - Staff/Kitchen dashboard (authenticated)
 * - `tenant:{tenantId}:customer:{tableId}` - Customer order tracking
 */
@WebSocketGateway({
  namespace: '/orders',
  cors: {
    origin: [
      process.env.CUSTOMER_APP_URL || 'http://localhost:3001',
      process.env.TENANT_APP_URL || 'http://localhost:3000',
    ],
    credentials: true,
  },
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrderGateway.name);

  // Track connected clients with extended info
  private clients = new Map<string, ClientInfo>();

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Handle client connection
   *
   * Supports two authentication methods:
   * 1. JWT token in handshake.auth.token (for staff dashboard)
   * 2. Query params: tenantId, role, tableId (for customer app)
   */
  async handleConnection(client: Socket) {
    try {
      // Try JWT authentication first (for staff)
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (token) {
        await this.handleJwtConnection(client, token);
        return;
      }

      // Fall back to query params (for customers)
      await this.handleQueryParamsConnection(client);
    } catch (error) {
      this.logger.error(`Connection error for ${client.id}: ${error.message}`);
      client.emit('error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  /**
   * Handle JWT-based connection (staff)
   */
  private async handleJwtConnection(client: Socket, token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const { tenantId, sub: userId } = payload;

      if (!tenantId || !userId) {
        throw new Error('Invalid token payload - missing tenantId or userId');
      }

      // Store client info
      this.clients.set(client.id, {
        tenantId,
        role: 'staff',
        userId,
        connectedAt: new Date(),
      });

      // Join staff room
      const staffRoom = `tenant:${tenantId}:staff`;
      await client.join(staffRoom);

      this.logger.log(
        `Staff connected via JWT: ${client.id} (User: ${userId}, Tenant: ${tenantId})`,
      );

      client.emit('connected', {
        message: 'Connected to order updates',
        tenantId,
        userId,
        role: 'staff',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.warn(`JWT auth failed for ${client.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle query params connection (customers)
   */
  private async handleQueryParamsConnection(client: Socket) {
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
      tenantId,
      role,
      tableId,
      connectedAt: new Date(),
    });

    // Join appropriate room
    if (role === 'staff') {
      const staffRoom = `tenant:${tenantId}:staff`;
      await client.join(staffRoom);
      this.logger.log(`Staff client ${client.id} joined room: ${staffRoom}`);
    } else if (role === 'customer' && tableId) {
      const customerRoom = `tenant:${tenantId}:customer:${tableId}`;
      await client.join(customerRoom);
      this.logger.log(
        `Customer client ${client.id} joined room: ${customerRoom}`,
      );
    }

    client.emit('connected', {
      message: 'Connected to order updates',
      tenantId,
      role,
      tableId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    const clientInfo = this.clients.get(client.id);

    if (clientInfo) {
      const sessionDuration = Date.now() - clientInfo.connectedAt.getTime();
      this.logger.log(
        `Client disconnected: ${client.id} (Tenant: ${clientInfo.tenantId}, Role: ${clientInfo.role}) - Session: ${Math.round(sessionDuration / 1000)}s`,
      );
      this.clients.delete(client.id);
    } else {
      this.logger.warn(`Unknown client disconnected: ${client.id}`);
    }
  }

  // ==================== SUBSCRIPTION HANDLERS ====================

  @SubscribeMessage('subscribe:staff')
  handleStaffSubscribe(
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
    this.logger.log(
      `Client ${client.id} subscribed to customer room: ${room}`,
    );
    return { success: true, room };
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): string {
    const clientInfo = this.clients.get(client.id);
    if (clientInfo) {
      this.logger.debug(
        `Heartbeat from ${client.id} (Tenant: ${clientInfo.tenantId})`,
      );
    }
    return 'pong';
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
    this.logger.log(
      `New order notification sent to room: ${room} - Order #${order.orderNumber}`,
    );
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
    if (order.tableId) {
      const customerRoom = `tenant:${tenantId}:customer:${order.tableId}`;
      this.server.to(customerRoom).emit(OrderEvents.STATUS_CHANGED, {
        order,
        timestamp: new Date(),
      });
    }

    this.logger.log(
      `Order status change emitted - Order #${order.orderNumber} → ${order.status}`,
    );
  }

  /**
   * Emit payment completed event
   * Triggered when payment is confirmed (via webhook or polling)
   *
   * @param tenantId - Tenant identifier
   * @param orderId - Order identifier
   * @param payment - Payment data
   */
  emitPaymentCompleted(tenantId: string, orderId: string, payment: any) {
    // Notify staff room
    const staffRoom = `tenant:${tenantId}:staff`;
    this.server.to(staffRoom).emit('order:payment_completed', {
      event: 'order:payment_completed',
      data: { orderId, payment },
      timestamp: new Date().toISOString(),
    });

    this.logger.debug(
      `Emitted order:payment_completed to tenant:${tenantId} - Order: ${orderId}`,
    );
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
   * Emit bill request notification to staff
   * Triggered when customer confirms payment
   */
  emitBillRequested(
    tenantId: string,
    data: {
      orderId: string;
      orderNumber: string;
      tableId: string;
      tableNumber: string;
      totalAmount: number;
      orderCount?: number;
      paymentMethod?: string;
      requestedAt: Date;
    },
  ) {
    const staffRoom = `tenant:${tenantId}:staff`;
    this.server.to(staffRoom).emit('order:bill_requested', {
      ...data,
      timestamp: new Date(),
    });
    this.logger.log(
      `Bill request notification sent to ${staffRoom} - Order #${data.orderNumber} at Table ${data.tableNumber}${data.paymentMethod ? ` (${data.paymentMethod})` : ''}`,
    );
  }
  // ==================== UTILITY METHODS ====================

  /**
   * Get connected clients count for monitoring
   */
  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Get connected clients by tenant
   */
  getConnectedClientsByTenant(tenantId: string): number {
    return Array.from(this.clients.values()).filter(
      (client) => client.tenantId === tenantId,
    ).length;
  }

  /**
   * Get clients in a specific room
   */
  async getClientsInRoom(room: string): Promise<string[]> {
    const sockets = await this.server.in(room).fetchSockets();
    return sockets.map((s) => s.id);
  }

  /**
   * Disconnect all clients for a specific tenant (admin feature)
   */
  async disconnectTenant(tenantId: string) {
    const staffRoom = `tenant:${tenantId}:staff`;
    const socketsInRoom = await this.server.in(staffRoom).fetchSockets();

    socketsInRoom.forEach((socket) => {
      socket.emit('disconnected', {
        message: 'Server initiated disconnect',
        reason: 'admin_action',
      });
      socket.disconnect(true);
    });

    this.logger.log(`Disconnected all clients for tenant: ${tenantId}`);
  }
}

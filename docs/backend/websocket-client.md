# WebSocket Integration Guide - Epic 5

## Overview

Epic 5 implements real-time order updates using Socket.IO WebSocket. This guide shows how to integrate WebSocket in your frontend applications.

## Installation

```bash
npm install socket.io-client
```

## 1. Staff/Kitchen Dashboard Integration

### Connect to WebSocket

```typescript
// lib/socket.ts
import { io, Socket } from 'socket.io-client';

export const connectToOrders = (tenantId: string): Socket => {
  const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
    query: {
      tenantId,
      role: 'staff',
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Connected to order updates');
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected:', reason);
  });

  return socket;
};
```

### Subscribe to Events

```typescript
// components/KitchenDisplay.tsx
import { useEffect, useState } from 'react';
import { connectToOrders } from '@/lib/socket';

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { tenantId } = useAuth();

  useEffect(() => {
    const socket = connectToOrders(tenantId);

    // Listen for new orders
    socket.on('order:new', ({ order }) => {
      console.log('🔔 New order:', order.orderNumber);
      setOrders(prev => [order, ...prev]);
      
      // Play notification sound
      new Audio('/notification.mp3').play();
      
      // Show browser notification
      new Notification('New Order', {
        body: `Order #${order.orderNumber} - Table ${order.tableNumber}`,
        icon: '/icon.png',
      });
    });

    // Listen for status changes
    socket.on('order:status_changed', ({ order }) => {
      console.log('📝 Order updated:', order.orderNumber, order.status);
      setOrders(prev => 
        prev.map(o => o.id === order.id ? order : o)
      );
    });

    // Listen for timer updates (for priority highlighting)
    socket.on('order:timer_update', ({ orderId, elapsedMinutes, priority }) => {
      setOrders(prev =>
        prev.map(o => 
          o.id === orderId 
            ? { ...o, elapsedMinutes, priority } 
            : o
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [tenantId]);

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Normal priority orders */}
      <OrderColumn title="Normal" orders={orders.filter(o => o.priority === 'NORMAL')} />
      
      {/* High priority orders */}
      <OrderColumn title="High Priority" orders={orders.filter(o => o.priority === 'HIGH')} />
      
      {/* Urgent orders */}
      <OrderColumn title="URGENT" orders={orders.filter(o => o.priority === 'URGENT')} />
    </div>
  );
}
```

## 2. Customer Order Tracking Integration

### Connect with Table Context

```typescript
// app/tracking/[orderId]/page.tsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function OrderTracking({ orderId, tableId, tenantId }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
      query: {
        tenantId,
        role: 'customer',
        tableId,
      },
    });

    // Subscribe to status changes for this table
    socket.on('order:status_changed', ({ order: updatedOrder }) => {
      if (updatedOrder.id === orderId) {
        setOrder(updatedOrder);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, tableId, tenantId]);

  return (
    <div>
      <h1>Order #{order?.orderNumber}</h1>
      <OrderTimeline status={order?.status} />
      {order?.estimatedTimeRemaining && (
        <p>Estimated time: {order.estimatedTimeRemaining} minutes</p>
      )}
    </div>
  );
}
```

### Order Timeline Component

```typescript
// components/OrderTimeline.tsx
export function OrderTimeline({ status }: { status: string }) {
  const steps = [
    { key: 'RECEIVED', label: 'Received', icon: '✓' },
    { key: 'PREPARING', label: 'Preparing', icon: '🍳' },
    { key: 'READY', label: 'Ready', icon: '✓' },
    { key: 'SERVED', label: 'Served', icon: '🍽️' },
  ];

  const currentIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.key} className="flex flex-col items-center">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${index <= currentIndex 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-500'
            }
          `}>
            {step.icon}
          </div>
          <span className="mt-2 text-sm">{step.label}</span>
        </div>
      ))}
    </div>
  );
}
```

## 3. API Endpoints Reference

### REST Endpoints

```typescript
// Get active orders for KDS (with priority)
GET /api/v1/admin/kds/orders/active
Authorization: Bearer {token}

Response:
{
  "normal": [Order],
  "high": [Order],
  "urgent": [Order]
}

// Update order status
PATCH /api/v1/admin/orders/:orderId/status
Authorization: Bearer {token}
Body: { "status": "PREPARING", "notes": "Started cooking" }

// Get customer order tracking
GET /api/v1/tracking/:orderId
Cookie: table_session_id={sessionId}

Response:
{
  "orderId": "...",
  "orderNumber": "ORD-20250110-0001",
  "currentStatus": "PREPARING",
  "timeline": [...],
  "estimatedTimeRemaining": 10,
  "elapsedMinutes": 5
}
```

### WebSocket Events

**Server → Client:**

```typescript
// New order notification (staff only)
socket.on('order:new', (data: { order: Order, timestamp: Date }) => {});

// Order status changed (staff & customer)
socket.on('order:status_changed', (data: { order: Order, timestamp: Date }) => {});

// Timer update (staff only, for priority highlighting)
socket.on('order:timer_update', (data: { 
  orderId: string, 
  elapsedMinutes: number,
  priority: 'NORMAL' | 'HIGH' | 'URGENT',
  timestamp: Date 
}) => {});

// Order list update (bulk update for dashboard)
socket.on('order:list_update', (data: { orders: Order[], timestamp: Date }) => {});
```

**Client → Server:**

```typescript
// Subscribe to staff room
socket.emit('subscribe:staff', { tenantId: '...' });

// Subscribe to customer room
socket.emit('subscribe:customer', { tenantId: '...', tableId: '...' });
```

## 4. Best Practices

### Error Handling

```typescript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Show user-friendly error message
  toast.error('Unable to connect to real-time updates');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

### Reconnection Strategy

```typescript
socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  // Refresh data after reconnection
  fetchOrders();
});

socket.on('reconnect_failed', () => {
  console.error('Failed to reconnect');
  toast.error('Lost connection. Please refresh the page.');
});
```

### Memory Management

```typescript
useEffect(() => {
  const socket = connectToOrders(tenantId);
  
  // Always cleanup on unmount
  return () => {
    socket.off('order:new');
    socket.off('order:status_changed');
    socket.disconnect();
  };
}, [tenantId]);
```

## 5. Testing

### Test WebSocket Connection

```bash
# Install wscat for testing
npm install -g wscat

# Connect to WebSocket
wscat -c "ws://localhost:3000/orders?tenantId=abc123&role=staff"

# Send subscribe message
{"event":"subscribe:staff","data":{"tenantId":"abc123"}}
```

### Simulate Order Events (for testing)

```typescript
// In your test file or development tools
const testSocket = io('http://localhost:3000/orders');

testSocket.emit('test:new_order', {
  tenantId: 'abc123',
  order: { /* mock order data */ }
});
```

## 6. Performance Considerations

- **Throttle timer updates**: Don't send timer updates every second. Update every 30-60 seconds for PREPARING orders.
- **Room-based broadcasting**: Use Socket.IO rooms to send updates only to relevant clients.
- **Cleanup**: Always disconnect sockets when components unmount.
- **Fallback**: Implement polling fallback if WebSocket connection fails.

---

## Summary

Epic 5 provides comprehensive real-time order management:
- ✅ WebSocket for instant updates
- ✅ KDS with priority-based ordering
- ✅ Customer order tracking
- ✅ Timer-based priority system
- ✅ Scalable room-based architecture
# Hướng dẫn Tích hợp WebSocket - Epic 5

## Tổng quan

Epic 5 thực hiện cập nhật đơn hàng real-time bằng Socket.IO WebSocket. Hướng dẫn này cho thấy cách tích hợp WebSocket trong ứng dụng frontend của bạn.

## Cài đặt

```bash
npm install socket.io-client
```

## 1. Tích hợp Bảng điều khiển Nhân viên/Bếp

### Kết nối đến WebSocket

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

### Đăng ký sự kiện

```typescript
// components/KitchenDisplay.tsx
import { useEffect, useState } from 'react';
import { connectToOrders } from '@/lib/socket';

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { tenantId } = useAuth();

  useEffect(() => {
    const socket = connectToOrders(tenantId);

    // Lắng nghe đơn hàng mới
    socket.on('order:new', ({ order }) => {
      console.log('🔔 New order:', order.orderNumber);
      setOrders(prev => [order, ...prev]);
      
      // Phát âm thanh thông báo
      new Audio('/notification.mp3').play();
      
      // Hiển thị thông báo trình duyệt
      new Notification('New Order', {
        body: `Order #${order.orderNumber} - Table ${order.tableNumber}`,
        icon: '/icon.png',
      });
    });

    // Lắng nghe thay đổi trạng thái
    socket.on('order:status_changed', ({ order }) => {
      console.log('📝 Order updated:', order.orderNumber, order.status);
      setOrders(prev => 
        prev.map(o => o.id === order.id ? order : o)
      );
    });

    // Lắng nghe cập nhật bộ đếm (để tô sáng ưu tiên)
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

## 2. Tích hợp Theo dõi Đơn hàng Khách hàng

### Kết nối với Bối cảnh Bàn

```typescript
// app/tracking/[orderId]/page.tsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function OrderTracking({ orderId, tableId, tenantId }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Kết nối đến WebSocket
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
      query: {
        tenantId,
        role: 'customer',
        tableId,
      },
    });

    // Đăng ký thay đổi trạng thái cho bàn này
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

### Thành phần Dòng thời gian Đơn hàng

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

## 3. Tham khảo Điểm cuối API

### Điểm cuối REST

```typescript
// Lấy các đơn hàng hoạt động cho KDS (có ưu tiên)
GET /api/v1/admin/kds/orders/active
Authorization: Bearer {token}

Response:
{
  "normal": [Order],
  "high": [Order],
  "urgent": [Order]
}

// Cập nhật trạng thái đơn hàng
PATCH /api/v1/admin/orders/:orderId/status
Authorization: Bearer {token}
Body: { "status": "PREPARING", "notes": "Started cooking" }

// Lấy theo dõi đơn hàng khách hàng
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

### Sự kiện WebSocket

**Server → Client:**

```typescript
// Thông báo đơn hàng mới (chỉ nhân viên)
socket.on('order:new', (data: { order: Order, timestamp: Date }) => {});

// Trạng thái đơn hàng đã thay đổi (nhân viên & khách hàng)
socket.on('order:status_changed', (data: { order: Order, timestamp: Date }) => {});

// Cập nhật bộ đếm (chỉ nhân viên, để tô sáng ưu tiên)
socket.on('order:timer_update', (data: { 
  orderId: string, 
  elapsedMinutes: number,
  priority: 'NORMAL' | 'HIGH' | 'URGENT',
  timestamp: Date 
}) => {});

// Cập nhật danh sách đơn hàng (cập nhật hàng loạt cho bảng điều khiển)
socket.on('order:list_update', (data: { orders: Order[], timestamp: Date }) => {});
```

**Client → Server:**

```typescript
// Đăng ký phòng nhân viên
socket.emit('subscribe:staff', { tenantId: '...' });

// Đăng ký phòng khách hàng
socket.emit('subscribe:customer', { tenantId: '...', tableId: '...' });
```

## 4. Các Thực tiễn Tốt nhất

### Xử lý Lỗi

```typescript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Hiển thị thông báo lỗi thân thiện với người dùng
  toast.error('Unable to connect to real-time updates');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

### Chiến lược Kết nối lại

```typescript
socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  // Làm mới dữ liệu sau khi kết nối lại
  fetchOrders();
});

socket.on('reconnect_failed', () => {
  console.error('Failed to reconnect');
  toast.error('Lost connection. Please refresh the page.');
});
```

### Quản lý Bộ nhớ

```typescript
useEffect(() => {
  const socket = connectToOrders(tenantId);
  
  // Luôn dọn dẹp khi unmount
  return () => {
    socket.off('order:new');
    socket.off('order:status_changed');
    socket.disconnect();
  };
}, [tenantId]);
```

## 5. Kiểm thử

### Kiểm tra Kết nối WebSocket

```bash
# Cài đặt wscat để kiểm thử
npm install -g wscat

# Kết nối đến WebSocket
wscat -c "ws://localhost:3000/orders?tenantId=abc123&role=staff"

# Gửi thông báo đăng ký
{"event":"subscribe:staff","data":{"tenantId":"abc123"}}
```

### Mô phỏng Sự kiện Đơn hàng (để kiểm thử)

```typescript
// Trong tệp kiểm thử hoặc công cụ phát triển
const testSocket = io('http://localhost:3000/orders');

testSocket.emit('test:new_order', {
  tenantId: 'abc123',
  order: { /* mock order data */ }
});
```

## 6. Cân nhắc về Hiệu năng

- **Giới hạn tốc độ cập nhật bộ đếm**: Không gửi cập nhật bộ đếm mỗi giây. Cập nhật cứ 30-60 giây cho các đơn hàng PREPARING.
- **Phát sóng dựa trên phòng**: Sử dụng phòng Socket.IO để gửi cập nhật chỉ cho các client có liên quan.
- **Dọn dẹp**: Luôn ngắt kết nối sockets khi các thành phần unmount.
- **Fallback**: Thực hiện fallback polling nếu kết nối WebSocket không thành công.

---

## Tóm tắt

Epic 5 cung cấp quản lý đơn hàng real-time toàn diện:
- ✅ WebSocket để cập nhật tức thời
- ✅ KDS với sắp xếp dựa trên ưu tiên
- ✅ Theo dõi đơn hàng khách hàng
- ✅ Hệ thống ưu tiên dựa trên bộ đếm
- ✅ Kiến trúc dựa trên phòng có thể mở rộng
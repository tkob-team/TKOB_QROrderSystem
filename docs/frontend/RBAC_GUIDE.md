# Role-Based Access Control (RBAC) System

**Last Updated:** 2026-01-20

---

## Overview
Web-tenant app sử dụng 3 roles chính cho nhân viên nhà hàng. Hệ thống sử dụng **backend role enums** từ Prisma schema nhưng có thể hiển thị tên khác trên frontend cho UX tốt hơn.

---

## Role Mapping Table

| Frontend Display | Backend Enum (Prisma) | Typical Use | Note |
|------------------|-----------------------|-------------|------|
| **Admin** | `OWNER` | Chủ nhà hàng | Full quyền quản lý |
| **Waiter/Staff** | `STAFF` | Nhân viên phục vụ | Quản lý orders, tables |
| **KDS/Kitchen** | `KITCHEN` | Đầu bếp | Kitchen display system |

> **⚠️ Important:** 
> - Backend API expects: `OWNER`, `STAFF`, `KITCHEN` (uppercase enums)
> - Frontend may display: "Admin", "Waiter", "KDS" (user-friendly names)
> - Always use **backend enums** when making API calls

**Evidence:** Backend roles defined in `source/apps/api/prisma/schema.prisma` lines 18-22:
```prisma
enum UserRole {
  OWNER
  STAFF
  KITCHEN
}
```

---

## Roles

### 1. **OWNER** (Backend) / "Admin" (Frontend Display)
- **Mô tả**: Chủ nhà hàng, có quyền truy cập đầy đủ
- **Backend Role:** `UserRole.OWNER`
- **Frontend Display:** May show as "Admin" in UI
- **Quyền truy cập**:
  - ✅ Dashboard (`/admin/dashboard`)
  - ✅ Menu Management (`/admin/menu`)
  - ✅ Table Management (`/admin/tables`)
  - ✅ Order Management (`/admin/orders`) - Full access
  - ✅ Analytics
  - ✅ Staff Management (invite, remove staff)
  - ✅ Tenant Settings
  - ✅ Subscription Management
  - ✅ Payment Configuration

### 2. **KITCHEN** (Backend) / "KDS" (Frontend Display)
- **Mô tả**: Kitchen Display System - Nhân viên bếp
- **Backend Role:** `UserRole.KITCHEN`
- **Frontend Display:** May show as "KDS" or "Kitchen" in UI
- **Quyền truy cập**:
  - ✅ Kitchen Display System (`/admin/kds`)
  - ✅ View orders assigned to kitchen
  - ✅ Update order status: `PREPARING` → `READY`
  - ❌ Dashboard, Menu, Tables, Analytics (không có quyền truy cập)

### 3. **STAFF** (Backend) / "Waiter" (Frontend Display)
- **Mô tả**: Nhân viên phục vụ
- **Backend Role:** `UserRole.STAFF`
- **Frontend Display:** May show as "Waiter" or "Staff" in UI
- **Quyền truy cập**:
  - ✅ Service Board (`/admin/service-board`)
  - ✅ Order Management (`/admin/orders`) - View & update status
  - ✅ View menu (read-only)
  - ✅ Manage table orders
  - ❌ Menu Management, Table Management, Settings (không có quyền truy cập)

## Dev Mode Login

> **⚠️ Note:** Dev mode may use frontend display names. When integrating with real backend, ensure you send the correct backend enum values (`OWNER`, `STAFF`, `KITCHEN`).

Trong môi trường development, bạn có thể login nhanh với các role khác nhau:

1. Mở trang Login (`/login`)
2. Tại phần "Dev mode shortcuts", click vào button tương ứng:
   - 🔐 **Login as Admin** → Đăng nhập với quyền OWNER
   - 👨‍🍳 **Login as KDS** → Đăng nhập với quyền KITCHEN
   - 🧑‍💼 **Login as Waiter** → Đăng nhập với quyền STAFF

### Dev Login Code
```typescript
// In Login.tsx
// Note: Frontend may use display names, but send backend enums to API
const handleDevLogin = (displayRole: 'admin' | 'kds' | 'waiter') => {
  // Map frontend display to backend enum
  const backendRoleMap = {
    'admin': 'OWNER',
    'kds': 'KITCHEN',
    'waiter': 'STAFF'
  };
  
  devLogin(backendRoleMap[displayRole]);
  
  // Auto navigate to appropriate dashboard
  if (displayRole === 'admin') {
    onNavigate?.('/admin/dashboard');
  } else if (displayRole === 'kds') {
    onNavigate?.('/admin/kds');
  } else if (displayRole === 'waiter') {
    onNavigate?.('/admin/service-board');
  }
};
```

---

## API Integration

When making API calls, always use the **backend enum values**:

```typescript
// ✅ CORRECT - Using backend enums
const inviteStaff = async (email: string, role: 'STAFF' | 'KITCHEN') => {
  await api.post('/api/v1/admin/staff/invite', {
    email,
    role // Send 'STAFF' or 'KITCHEN', NOT 'waiter' or 'kds'
  });
};

// ❌ WRONG - Using frontend display names
const inviteStaffWrong = async (email: string, role: 'waiter' | 'kds') => {
  await api.post('/api/v1/admin/staff/invite', {
    email,
    role // Backend won't recognize 'waiter' or 'kds'
  });
};
```

---

## Implementation Details

### AuthContext
File: `src/shared/context/AuthContext.tsx`

```typescript
// Backend roles (from Prisma)
export type UserRole = 'OWNER' | 'STAFF' | 'KITCHEN';

// Optional: Frontend display names
export type UserRoleDisplay = 'Admin' | 'Waiter' | 'KDS';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole; // Use backend enum
  tenantId: string;
}

// Helper to map backend role to display name
export function getRoleDisplayName(role: UserRole): UserRoleDisplay {
  const roleMap: Record<UserRole, UserRoleDisplay> = {
    'OWNER': 'Admin',
    'STAFF': 'Waiter',
    'KITCHEN': 'KDS'
  };
  return roleMap[role];
}
```

### RoleGuard Component
File: `src/shared/components/auth/RoleGuard.tsx`

Wrap pages với `RoleGuard` để bảo vệ routes. **Use backend role enums:**

```tsx
<RoleGuard allowedRoles={['OWNER']}>
  <YourPage />
</RoleGuard>
```

### Page Protection Examples

**Admin Dashboard** (chỉ OWNER):
```tsx
<RoleGuard allowedRoles={['OWNER']}>
  <DashboardPage />
</RoleGuard>
```

**Orders** (OWNER + STAFF):
```tsx
<RoleGuard allowedRoles={['OWNER', 'STAFF']}>
  <OrderManagementPage />
</RoleGuard>
```

**KDS** (chỉ KITCHEN):
```tsx
<RoleGuard allowedRoles={['KITCHEN']}>
  <KDSBoard />
</RoleGuard>
```

## Route Structure

```
/admin
├── /dashboard          → OWNER only
├── /menu               → OWNER only
├── /tables             → OWNER only
├── /orders             → OWNER + STAFF
├── /kds                → KITCHEN only
└── /service-board      → STAFF only
```

## Testing

### Test Different Roles
1. Login với role khác nhau sử dụng dev mode buttons
2. Thử truy cập các routes không được phép
3. Verify rằng RoleGuard hiển thị "Access Denied" page

### Expected Behavior
- ✅ User với role đúng: Xem được nội dung page
- ❌ User với role sai: Hiển thị "Access Denied" message
- ⏳ Chưa login: Redirect về `/login`

## Future Enhancements

### TODO for Production
- [ ] Remove dev mode login buttons
- [ ] Implement real JWT authentication
- [ ] Add API integration for user roles
- [ ] Add role permissions for specific actions (not just pages)
- [ ] Implement fine-grained permissions (CRUD operations)
- [ ] Add audit logging for role changes

### Potential Additional Roles
- `cashier` → Would map to backend: `CASHIER` (if added to Prisma enum)
- `manager` → Would map to backend: `MANAGER` (if added to Prisma enum)

> **Note:** Any new roles must be added to the Prisma schema first (`source/apps/api/prisma/schema.prisma`), then frontend can use them.

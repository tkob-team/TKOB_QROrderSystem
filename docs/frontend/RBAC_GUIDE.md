# Role-Based Access Control (RBAC) System

**Last Updated:** 2026-01-20  
**Applies to:** `source/apps/web-tenant` (tenant/restaurant admin dashboard)

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
  - ⏳ Update order status: ADD HERE (verify backend guards in `source/apps/api/src/modules/order/` for PREPARING → READY permissions)
  - ❌ Dashboard, Menu, Tables, Analytics (không có quyền truy cập)

### 3. **STAFF** (Backend) / "Waiter" (Frontend Display)
- **Mô tả**: Nhân viên phục vụ
- **Backend Role:** `UserRole.STAFF`
- **Frontend Display:** May show as "Waiter" or "Staff" in UI
- **Quyền truy cập**:
  - ✅ Service Board (`/admin/service-board`)
  - ✅ Order Management (`/admin/orders`) - View orders
  - ⏳ Update order status: ADD HERE (verify specific status transitions allowed for STAFF role in backend guards)
  - ✅ View menu (read-only)
  - ✅ Manage table orders
  - ❌ Menu Management, Table Management, Settings (không có quyền truy cập)

## Dev Mode Login (DEV ONLY)

> **⚠️ DEVELOPMENT ONLY:** This feature is for local testing and should be removed/disabled in production builds.

**File:** `source/apps/web-tenant/src/features/auth/ui/pages/LoginPage.tsx` (lines ~150-160)

In development environment, you can bypass authentication with quick role selection:

1. Open Login page (`/auth/login`)
2. Use dev mode shortcuts (if NODE_ENV=development):
   - 🔐 **Login as Admin** → Logs in with OWNER role
   - 👨‍🍳 **Login as KDS** → Logs in with KITCHEN role
   - 🧑‍💼 **Login as Waiter** → Logs in with STAFF role

### Dev Login Implementation (Reference)
```typescript
// Reference from: LoginPage.tsx line ~150
// ⚠️ DEV ONLY - Remove in production
const handleDevLogin = (role: 'admin' | 'kds' | 'waiter') => {
  logger.debug('[auth] LOGIN_PAGE_DEV_LOGIN', { role });
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
  devLogin(role); // Calls AuthContext's devLogin function
  
  // Note: Navigation handled by AuthContext after successful dev login
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
File: `source/apps/web-tenant/src/shared/context/AuthContext.tsx` (re-exports from `features/auth`)

**Note:** Actual auth types defined in `features/auth/domain/types.ts`

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
File: `source/apps/web-tenant/src/shared/guards/RoleGuard.tsx`

Wrap pages with `RoleGuard` to protect routes. **Use backend role enums:**

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

**Verified routes** from `source/apps/web-tenant/src/app/`:

```
/admin
├── /dashboard          → OWNER only (verified: app/admin/dashboard/)
├── /menu               → OWNER only (verified: app/admin/menu/)
├── /tables             → OWNER only (verified: app/admin/tables/)
├── /orders             → OWNER + STAFF (verified: app/admin/orders/)
├── /kds                → KITCHEN only (verified: app/admin/kds/)
├── /service-board      → STAFF only (verified: app/admin/service-board/)
├── /analytics          → OWNER only (verified: app/admin/analytics/)
├── /staff              → OWNER only (verified: app/admin/staff/)
├── /settings           → OWNER only (verified: app/admin/settings/)
├── /subscription       → OWNER only (verified: app/admin/subscription/)
└── /payment-settings   → OWNER only (verified: app/admin/payment-settings/)

/kds                    → Standalone KDS route (verified: app/kds/)
/waiter                 → Standalone waiter route (verified: app/waiter/)
/staff                  → Standalone staff route (verified: app/staff/)
```

## Testing

### Test Different Roles (DEV ONLY)
1. Use dev mode login buttons to switch between roles
2. Try accessing routes not allowed for current role
3. Verify that RoleGuard shows "Access Denied" page (unauthorized page)

### Expected Behavior
- ✅ User with correct role: View page content
- ❌ User with wrong role: Show "Access Denied" page with countdown, then redirect to role-appropriate page
  - Evidence: `RoleGuard.tsx` lines 110-122 (shows Access Denied UI + countdown)
  - Redirect destinations (lines 43-50): `kds` → `/kds`, `waiter` → `/waiter`, `admin` → `/waiter`, fallback → `/auth/login`
- ⏳ Not authenticated: Redirect to `/auth/login`
  - Evidence: `RoleGuard.tsx` line 44: `router.push('/auth/login')`

---

## Production Checklist

### Before Deploying to Production:
- [ ] Remove or disable dev mode login shortcuts (check NODE_ENV guards)
- [ ] Implement real JWT authentication with backend API
- [ ] Verify all RoleGuard protections are in place
- [ ] Test role-based redirects after login
- [ ] Add audit logging for authentication events
- [ ] Configure proper session management

### Current Implementation Status:
- ✅ Role enum definitions (from Prisma schema)
- ✅ RoleGuard component for route protection
- ✅ AuthContext for auth state management
- ✅ Dev mode login (for development only)
- ⏳ Backend JWT integration (ADD HERE: verify with API team)
- ⏳ Fine-grained action permissions (beyond route access)

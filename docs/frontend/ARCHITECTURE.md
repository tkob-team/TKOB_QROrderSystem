## Scope vs MVP

Some frontend features described in this document are post-MVP (future scope). For example: a rich POS interface in order-management, advanced analytics dashboards, and offline support via service workers are planned for later phases.

The MVP will focus on the essential flows:

- **Core MVP:**
  - Tenant onboarding and authentication
  - Menu management (CRUD)
  - Table management and QR code generation
  - Customer ordering and payment
  - Basic kitchen display system (KDS)
- **Future Enhancements:**
  - Full-featured POS/order-management for staff
  - Advanced analytics and reporting dashboards
  - Offline support (service workers/PWA)
  - Loyalty, promotions, and integrations

# Frontend Architecture – Unified Restaurant Ordering Platform (Next.js 15+ App Router)

**Project:** QR Dine-in Ordering Platform  
**Architecture:** Feature-Based Modular Monorepo (Next.js 15+ App Router)  
**Tech Stack:** Next.js 15+, React 19, TypeScript, TailwindCSS  
**Last Updated:** 2025-11-21

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Monorepo Structure](#monorepo-structure)
3. [Next.js App Router Structure](#nextjs-app-router-structure)
4. [Web-Tenant (Admin/Staff Portal)](#web-tenant-adminstaff-portal)
5. [Web-Customer (Client Ordering App)](#web-customer-client-ordering-app)
6. [Shared Packages](#shared-packages)
7. [API Integration](#api-integration)
8. [State Management Strategy](#state-management-strategy)
9. [Naming Conventions](#naming-conventions)
10. [Import Rules](#import-rules)
11. [Code Organization Best Practices](#code-organization-best-practices)
12. [Testing Strategy](#testing-strategy)
13. [Deployment Strategy](#deployment-strategy)
14. [Performance Benchmarks](#performance-benchmarks)
15. [Troubleshooting](#troubleshooting)
16. [Resources](#resources)
17. [Changelog](#changelog)
18. [Approval](#approval)

---

## Architecture Overview

This frontend is a **Next.js 15+ monorepo** with two distinct applications:

- **web-tenant**: Admin/Staff management portal (desktop-first, feature-rich)
- **web-customer**: Customer ordering app (mobile-first, lightweight)

**Key Next.js 15+ Principles:**
- Uses the **App Router** (`app/` directory) for file-based routing.
- **Server Components by default** for data fetching, SEO, and performance.
- **Client Components** only when interactivity or browser APIs are needed (marked with `'use client'`).
- **Streaming UI** with `loading.tsx` and `error.tsx` for route segments.
- **API calls** via `fetch` in Server Components or via TanStack Query in Client Components.
- **Environment variables** use `NEXT_PUBLIC_...` for client-exposed config and `process.env.API_URL` for server-only.

---

## Monorepo & pnpm Workspace

The repository is organized as a monorepo managed with pnpm workspaces. Each application (customer and admin) is isolated under `source/apps/*` with its own tooling configuration, while shared libraries live under `packages/*` and are consumed via workspace dependencies.

At the root, `package.json` and `pnpm-workspace.yaml` declare the workspace globs so dependencies install once at the root and link locally between apps and packages. Run `pnpm install` from the repository root; development commands can be filtered per app.

- Apps (Next.js 15, React 19):
  - `source/apps/web-customer` – customer-facing QR ordering app
  - `source/apps/web-tenant` – admin/staff portal
- Per-app config: each app owns its `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `.eslintrc.json` for independent builds and linting.
- Shared packages: `packages/*` (e.g., `ui`, `dto`, `config`, etc.) published as workspace deps.

Example workspace config and dev commands:

```yaml
# pnpm-workspace.yaml
packages:
  - "source/apps/*"
  - "packages/*"
```

```bash
# install at repo root
pnpm install

# run a single app
pnpm --filter web-customer dev
pnpm --filter web-tenant dev
```

## Monorepo Structure

```
source/
├── apps/
│   ├── web-tenant/          # Admin/Staff Portal
│   │   ├── app/
│   │   │   ├── (admin)/      # Admin routes
│   │   │   ├── (customer)/   # Customer routes (if any)
│   │   │   ├── api/          # API routes (if any)
│   │   │   ├── layout.tsx     # Admin layout
│   │   │   └── page.tsx      # Admin dashboard page
│   │   ├── public/           # Static files
│   │   ├── src/
│   │   │   ├── features/     # Business features
│   │   │   ├── shared/       # Shared UI/hooks/utils
│   │   │   ├── lib/          # API client, providers
│   │   │   ├── store/        # Global state
│   │   │   └── styles/       # Global styles
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── web-customer/        # Customer Ordering App
│   │   ├── app/
│   │   │   ├── (auth)/       # Authentication routes
│   │   │   ├── (menu)/       # Menu browsing routes
│   │   │   ├── (cart)/       # Cart and checkout routes
│   │   │   ├── api/          # API routes (if any)
│   │   │   ├── layout.tsx     # Customer layout
│   │   │   └── page.tsx      # Landing page
│   │   ├── public/           # Static files
│   │   ├── src/
│   │   │   ├── features/     # Business features
│   │   │   ├── shared/       # Shared UI/hooks/utils
│   │   │   ├── lib/          # API client, providers
│   │   │   ├── store/        # Global state
│   │   │   └── styles/       # Global styles
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── api/                 # Backend API (NestJS)
│
├── packages/
│   ├── ui/                  # Shared UI components library
│   ├── dto/                 # Shared TypeScript types
│   ├── config/              # Shared configs (ESLint, TS)
│   └── database/            # Database schemas (if needed)
│
└── docs/
    └── frontend/
        └── ARCHITECTURE.md  # This file
```

---

## Next.js App Router Structure

### 1. App Directory

- The `app/` directory contains the application routes, organized by feature.
- Each feature folder may contain subfolders for components, hooks, services, and types.

### 2. Route Segments

- Route segments are defined by folders inside the `app/` directory.
- Each segment can export `page.tsx` for the main component, `layout.tsx` for shared layout, and special files like `loading.tsx` and `error.tsx`.

### 3. Dynamic Routes

- Dynamic routes use square brackets, e.g., `[id]`, to match segments of the URL.
- Catch-all routes use double square brackets, e.g., `[[...slug]]`, to match multiple segments.

### 4. API Routes

- API routes are defined under `app/api/` and can be accessed via `/api/*` in the URL.
- Supports RESTful and RPC-style endpoints.


### 5. Middleware

- Each app can define its own `middleware.ts` for request handling.
- **apps/web-tenant/middleware.ts**: Handles tenant/admin concerns such as authentication checks and RBAC guard for admin routes.
- **apps/web-customer/middleware.ts** (optional): Used for QR scanning logic, only matches QR-related routes like `/s/:tenantSlug/:token` or `/scan?token=...`.

**Responsibilities:**
- **web-tenant middleware:**
  - Protects private dashboard routes
  - Checks JWT/session validity
  - Redirects to `/login` if not authenticated
  - Enforces RBAC for admin routes
- **web-customer middleware (optional):**
  - Parses QR token from URL
  - Sets context cookies for session/tenant/table
  - Optionally rewrites to the public menu route

### Example Structure

```
web-tenant/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── api/
│   │   └── users/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   ├── loading.tsx
│   ├── error.tsx
│   └── layout.tsx
├── middleware.ts         # ← At project root
├── next.config.js
└── package.json
```

---

## Web-Tenant (Admin/Staff Portal)

**Purpose:** Full-featured management interface for restaurant owners and staff.

### Features Structure

```
web-tenant/src/features/
├── auth/
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   └── AuthLayout.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useAuthForm.ts
│   ├── services/
│   │   └── authService.ts
│   ├── types/
│   │   └── auth.types.ts
│   ├── utils/
│   │   └── authHelpers.ts
│   └── index.ts
│
├── dashboard/
│   ├── components/
│   │   ├── DashboardOverview.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── OrderStats.tsx
│   │   └── PopularItems.tsx
│   ├── hooks/
│   │   ├── useDashboard.ts
│   │   └── useAnalytics.ts
│   ├── services/
│   │   └── analyticsService.ts
│   ├── types/
│   │   └── dashboard.types.ts
│   └── index.ts
│
├── menu-management/
│   ├── components/
│   │   ├── MenuList.tsx
│   │   ├── MenuItemForm.tsx
│   │   ├── CategoryManager.tsx
│   │   ├── ModifierManager.tsx
│   │   └── MenuPublisher.tsx
│   ├── hooks/
│   │   ├── useMenuCRUD.ts
│   │   ├── useCategories.ts
│   │   └── useModifiers.ts
│   ├── services/
│   │   └── menuService.ts
│   ├── types/
│   │   └── menu.types.ts
│   ├── utils/
│   │   └── menuHelpers.ts
│   └── index.ts
│
├── order-management/
│   ├── components/
│   │   ├── OrderList.tsx
│   │   ├── OrderDetails.tsx
│   │   ├── KitchenDisplay.tsx
│   │   ├── OrderStatusUpdater.tsx
│   │   └── POSInterface.tsx
│   ├── hooks/
│   │   ├── useOrders.ts
│   │   ├── useOrderStatus.ts
│   │   └── useKitchenView.ts
│   ├── services/
│   │   └── orderService.ts
│   ├── types/
│   │   └── order.types.ts
│   ├── utils/
│   │   └── orderHelpers.ts
│   └── index.ts
│
├── staff/
│   ├── components/
│   │   ├── StaffList.tsx
│   │   ├── StaffForm.tsx
│   │   └── RoleManager.tsx
│   ├── hooks/
│   │   └── useStaff.ts
│   ├── services/
│   │   └── staffService.ts
│   ├── types/
│   │   └── staff.types.ts
│   └── index.ts
│
└── tables/
    ├── components/
    │   ├── TableList.tsx
    │   ├── TableForm.tsx
    │   ├── QRGenerator.tsx
    │   └── QRDownloader.tsx
    ├── hooks/
    │   ├── useTables.ts
    │   └── useQRGeneration.ts
    ├── services/
    │   └── tableService.ts
    ├── types/
    │   └── table.types.ts
    ├── utils/
    │   └── qrHelpers.ts
    └── index.ts
```

### Shared Components (web-tenant)

```
web-tenant/src/shared/
├── components/
│   ├── ui/                    # Atoms (buttons, inputs, cards)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Tabs.tsx
│   │   └── index.ts
│   ├── layout/                # Admin layouts
│   │   ├── AdminLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── index.ts
│   └── common/                # Reusable components
│       ├── ErrorBoundary.tsx
│       ├── LoadingState.tsx
│       ├── EmptyState.tsx
│       └── index.ts
│
├── hooks/
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   ├── usePermissions.ts
│   └── index.ts
│
├── utils/
│   ├── format.ts
│   ├── validation.ts
│   ├── constants.ts
│   ├── permissions.ts
│   └── index.ts
│
└── types/
    ├── common.types.ts
    └── api.types.ts
```

### Key Features

1. **Authentication & Authorization**
   - JWT-based login
   - Role-based access control (Admin, Staff, Kitchen)
   - Permission guards

2. **Menu Management**
   - Full CRUD for categories, items, modifiers
   - Drag-and-drop ordering
   - Bulk operations
   - Menu versioning

3. **Order Management**
   - Real-time order dashboard
   - Kitchen Display System (KDS)
   - Order status workflow
   - POS integration

4. **Analytics Dashboard**
   - Revenue charts
   - Order statistics
   - Popular items
   - Staff performance

5. **Table & QR Management**
   - Create/edit tables
   - Generate QR codes with HMAC signatures
   - Download/print QR codes
   - QR regeneration

### Frontend RBAC & Route Guards

The web-tenant app enforces role-based access control (RBAC) for all sensitive routes and features.

**Roles:**
- `tenant-admin`: Full access to all admin features
- `manager`: Most admin features (except some tenant-level settings)
- `kitchen`: Access to kitchen display system (KDS) only
- `server`: Access to order-taking and table management

**Route Groups & Access:**
- `(admin)`: Accessible by `tenant-admin`, `manager`
- `(kitchen)`: Accessible by `kitchen` (KDS)
- `(server)`: Accessible by `server` (order-taking)

**Enforcement Pattern:**
- The `useAuth()` hook returns `{ user, role }` for the current session.
- The `RoleGuard` component accepts an `allowedRoles` prop and renders children if the user has permission, or redirects to a Forbidden/AccessDenied page.
- Optionally, a `withRoleGuard` HOC/helper can be used in layout components for DRY protection.

**Example Usage:**
```tsx
import { RoleGuard } from '@/shared/components/auth/RoleGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['tenant-admin', 'manager']}>
      <AdminShellLayout>{children}</AdminShellLayout>
    </RoleGuard>
  );
}
```

**RBAC Rules (Summary):**
- All admin routes must be wrapped in `RoleGuard`.
- Unauthorized users are redirected to `/forbidden` or a custom access denied page.
- The `role` is determined at login and stored in the auth context.
- Use `withRoleGuard` for layouts to avoid repeating logic in every page.

---

## Web-Customer (Client Ordering App)

**Purpose:** Lightweight, mobile-first ordering experience for customers.

### Features Structure

```
web-customer/src/features/
├── landing/
│   ├── components/
│   │   ├── WelcomeScreen.tsx
│   │   ├── TableInfo.tsx
│   │   └── BrandingBanner.tsx
│   ├── hooks/
│   │   └── useQRValidation.ts
│   ├── types/
│   │   └── landing.types.ts
│   └── index.ts
│
├── menu-view/
│   ├── components/
│   │   ├── MenuList.tsx
│   │   ├── MenuItem.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── SearchBar.tsx
│   │   └── MenuItemModal.tsx
│   ├── hooks/
│   │   ├── useMenu.ts
│   │   ├── useMenuFilters.ts
│   │   └── useMenuSearch.ts
│   ├── services/
│   │   └── menuService.ts
│   ├── types/
│   │   └── menu.types.ts
│   ├── utils/
│   │   └── menuHelpers.ts
│   └── index.ts
│
├── cart/
│   ├── components/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── CartEmpty.tsx
│   ├── hooks/
│   │   └── useCart.ts
│   ├── store/
│   │   └── cartStore.ts
│   ├── types/
│   │   └── cart.types.ts
│   ├── utils/
│   │   └── cartCalculations.ts
│   └── index.ts
│
├── checkout/
│   ├── components/
│   │   ├── CheckoutForm.tsx
│   │   ├── CustomerInfoForm.tsx
│   │   ├── PaymentOptions.tsx
│   │   ├── OrderSummary.tsx
│   │   └── CheckoutSuccess.tsx
│   ├── hooks/
│   │   ├── useCheckout.ts
│   │   └── usePayment.ts
│   ├── services/
│   │   ├── checkoutService.ts
│   │   └── paymentService.ts
│   ├── types/
│   │   └── checkout.types.ts
│   ├── utils/
│   │   └── checkoutHelpers.ts
│   └── index.ts
│
└── order-tracking/
    ├── components/
    │   ├── OrderStatus.tsx
    │   ├── OrderTimeline.tsx
    │   └── OrderDetails.tsx
    ├── hooks/
    │   ├── useOrderTracking.ts
    │   └── useOrderWebSocket.ts
    ├── services/
    │   └── trackingService.ts
    ├── types/
    │   └── tracking.types.ts
    └── index.ts
```

### Shared Components (web-customer)

```
web-customer/src/shared/
├── components/
│   ├── ui/                    # Mobile-optimized atoms
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── BottomSheet.tsx
│   │   └── index.ts
│   ├── layout/                # Mobile layouts
│   │   ├── MobileLayout.tsx
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   ├── FloatingCart.tsx
│   │   └── index.ts
│   └── common/                # Reusable components
│       ├── ErrorState.tsx
│       ├── LoadingState.tsx
│       ├── EmptyState.tsx
│       └── index.ts
│
├── hooks/
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   ├── useIntersectionObserver.ts
│   └── index.ts
│
├── utils/
│   ├── format.ts
│   ├── validation.ts
│   ├── constants.ts
│   └── index.ts
│
└── types/
    ├── common.types.ts
    └── api.types.ts
```

### Key Features

1. **QR Code Entry**
   - Scan QR code
   - Validate token
   - Load tenant context

2. **Menu Browsing**
   - View categorized menu
   - Search functionality
   - Filter by availability
   - Item details with modifiers

3. **Cart Management**
   - Add/remove items
   - Modify quantities
   - Apply modifiers
   - Calculate totals

4. **Checkout**
   - Guest checkout (no registration)
   - Customer info form
   - Payment integration (Stripe)
   - Order confirmation

5. **Order Tracking**
   - Real-time status updates
   - Order timeline
   - WebSocket notifications

### Performance Optimizations

1. **Code Splitting with next/dynamic**
   ```typescript
   // Lazy load heavy client components
   import dynamic from 'next/dynamic';
   
   const CheckoutForm = dynamic(
     () => import('@/features/checkout/components/CheckoutForm'),
     { loading: () => <div>Loading checkout...</div> }
   );
   ```

2. **Image Optimization**
   - WebP format with fallbacks
   - Lazy loading images
   - Progressive image loading

3. **Bundle Size**
   - Tree-shaking unused code
   - Dynamic imports for routes
   - Minification in production

4. **Caching Strategy**
   - Service Worker for offline support
   - API response caching (React Query)
   - LocalStorage for cart persistence

---

## Cross-App QR Flow (web-tenant → web-customer)

This section documents how QR codes generated in **web-tenant** (Admin Portal) are scanned and processed by **web-customer** (Customer Ordering App).

### 1. QR URL Generation (Backend)

The backend API provides an endpoint for generating signed QR codes. These QR codes contain encrypted tokens that embed critical ordering context.

**QR URL Format:**
```
https://order.example.com/s/[tenantSlug]/[token]
```

**Example:**
```
https://order.example.com/s/pho-restaurant/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Components:**
- `order.example.com`: The domain hosting **web-customer**
- `s`: Short URL prefix for "scan"
- `[tenantSlug]`: Human-readable restaurant identifier (e.g., `pho-restaurant`)
- `[token]`: JWT/HMAC-signed token containing encrypted session data

### 2. QR Token Structure

The token is a **signed JWT** containing the following payload:

```typescript
interface QRTokenPayload {
  tenantId: string;      // UUID of the restaurant
  tableId: string;       // UUID of the table
  exp: number;           // Expiration timestamp (Unix)
  version: string;       // Token schema version (e.g., "1.0")
  iat?: number;          // Issued at timestamp (optional)
}
```

**Token Generation (Backend Reference):**
```typescript
// Backend: services/qr-generation.service.ts
import * as jwt from 'jsonwebtoken';

export function generateQRToken(tenantId: string, tableId: string): string {
  const payload: QRTokenPayload = {
    tenantId,
    tableId,
    exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year
    version: '1.0',
  };
  
  return jwt.sign(payload, process.env.QR_SECRET_KEY, {
    algorithm: 'HS256',
  });
}
```

**Security Features:**
- **HMAC Signature**: Prevents token tampering
- **Expiration**: Tokens expire after a configurable period (default: 1 year)
- **Version Field**: Allows for token schema evolution

**Related Documentation:**
- See `docs/backend/qr-generation-flow.md` (TODO) for detailed backend QR generation logic
- See `01-product/diagrams/qr-generation-flow.md` for visual flow diagrams

### 3. Customer Scan Flow (web-customer)

When a customer scans the QR code, their mobile browser navigates to the QR URL. The **web-customer** app handles this route and validates the token.

#### 3.1 Route Handling

**File Location:**
```
apps/web-customer/app/s/[tenantSlug]/[token]/page.tsx
```

**Route Structure:**
```typescript
// app/s/[tenantSlug]/[token]/page.tsx
interface ScanPageProps {
  params: {
    tenantSlug: string;
    token: string;
  };
}

export default async function ScanPage({ params }: ScanPageProps) {
  const { tenantSlug, token } = params;
  
  // Server-side token validation
  const session = await validateQRToken(token);
  
  if (!session) {
    return <InvalidQRError />;
  }
  
  // Redirect to menu with session context
  return <RedirectToMenu session={session} />;
}
```

#### 3.2 Token Validation (Server Component)

**File Location:**
```
apps/web-customer/src/lib/qr/validateQRToken.ts
```

**Server-Side Validation:**
```typescript
// lib/qr/validateQRToken.ts
import type { QRTokenPayload } from '@packages/dto';

const API_URL = process.env.API_URL;

export async function validateQRToken(token: string): Promise<QRTokenPayload | null> {
  try {
    const response = await fetch(`${API_URL}/api/public/scan?token=${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store', // Always validate fresh
    });

    if (!response.ok) {
      console.error('Token validation failed:', response.status);
      return null;
    }

    const data: QRTokenPayload = await response.json();
    
    // Additional client-side checks
    if (data.exp && data.exp < Date.now() / 1000) {
      console.error('Token expired');
      return null;
    }

    return data;
  } catch (error) {
    console.error('QR validation error:', error);
    return null;
  }
}
```

**Backend API Endpoint:**
```
GET /api/public/scan?token={token}

Response (200 OK):
{
  "tenantId": "uuid-123",
  "tableId": "uuid-456",
  "exp": 1735689600,
  "version": "1.0"
}

Response (401 Unauthorized):
{
  "error": "Invalid or expired token"
}
```

#### 3.3 Customer Session Creation

After successful validation, a **short-lived customer session** is created client-side. This session is stored in React Context and optionally persisted to `localStorage` for page refreshes.

**File Location:**
```
apps/web-customer/src/shared/context/SessionContext.tsx
```

**Session Context Provider:**
```typescript
// shared/context/SessionContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { QRTokenPayload } from '@packages/dto';

interface SessionContextValue {
  tenantId: string | null;
  tableId: string | null;
  isSessionActive: boolean;
  setSession: (data: QRTokenPayload) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tableId, setTableId] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('customer-session');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.exp > Date.now() / 1000) {
          setTenantId(data.tenantId);
          setTableId(data.tableId);
        } else {
          localStorage.removeItem('customer-session');
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    }
  }, []);

  const setSession = (data: QRTokenPayload) => {
    setTenantId(data.tenantId);
    setTableId(data.tableId);
    
    // Persist to localStorage
    localStorage.setItem('customer-session', JSON.stringify(data));
  };

  const clearSession = () => {
    setTenantId(null);
    setTableId(null);
    localStorage.removeItem('customer-session');
  };

  return (
    <SessionContext.Provider
      value={{
        tenantId,
        tableId,
        isSessionActive: !!tenantId && !!tableId,
        setSession,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
```

### 4. Context Providers Architecture

The **web-customer** app uses multiple React Context providers to manage ordering state:

#### 4.1 Directory Structure

```
apps/web-customer/src/shared/context/
├── SessionContext.tsx       # Customer session (tenantId, tableId)
├── TenantContext.tsx        # Tenant/restaurant details
├── TableContext.tsx         # Table-specific information
└── index.ts                 # Barrel exports
```

#### 4.2 TenantContext Provider

**Purpose:** Fetches and caches restaurant details (name, logo, menu settings) based on `tenantId` from session.

**File Location:**
```
apps/web-customer/src/shared/context/TenantContext.tsx
```

**Implementation:**
```typescript
// shared/context/TenantContext.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from './SessionContext';
import type { Tenant } from '@packages/dto';

interface TenantContextValue {
  tenant: Tenant | null;
  isLoading: boolean;
  error: Error | null;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { tenantId } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/tenants/${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch tenant');
      return res.json();
    },
    enabled: !!tenantId,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  return (
    <TenantContext.Provider value={{ tenant: data ?? null, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}
```

#### 4.3 TableContext Provider

**Purpose:** Fetches table details (name, floor, status) based on `tableId` from session.

**File Location:**
```
apps/web-customer/src/shared/context/TableContext.tsx
```

**Implementation:**
```typescript
// shared/context/TableContext.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from './SessionContext';
import type { Table } from '@packages/dto';

interface TableContextValue {
  table: Table | null;
  isLoading: boolean;
  error: Error | null;
}

const TableContext = createContext<TableContextValue | undefined>(undefined);

export function TableProvider({ children }: { children: ReactNode }) {
  const { tenantId, tableId } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ['table', tenantId, tableId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/public/tenants/${tenantId}/tables/${tableId}`
      );
      if (!res.ok) throw new Error('Failed to fetch table');
      return res.json();
    },
    enabled: !!tenantId && !!tableId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <TableContext.Provider value={{ table: data ?? null, isLoading, error }}>
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTable must be used within TableProvider');
  }
  return context;
}
```

### 5. Provider Hierarchy (Root Layout)

**File Location:**
```
apps/web-customer/app/layout.tsx
```


**Recommended Provider Pattern (Next.js App Router):**

**app/providers.tsx** (Client Component)
```tsx
'use client';
import { SessionProvider } from '@/shared/context/SessionContext';
import { TenantProvider } from '@/shared/context/TenantContext';
import { TableProvider } from '@/shared/context/TableContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <TenantProvider>
          <TableProvider>
            {children}
          </TableProvider>
        </TenantProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
```

**app/layout.tsx** (Server Component)
```tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Provider Order:**
1. **QueryClientProvider**: React Query for server state
2. **SessionProvider**: Manages tenantId/tableId from QR scan
3. **TenantProvider**: Fetches restaurant details (depends on SessionProvider)
4. **TableProvider**: Fetches table details (depends on SessionProvider)

### 6. Consuming Context in Features

Features throughout **web-customer** can access ordering context via custom hooks.

**Example: Menu Feature**
```typescript
// features/menu-view/components/MenuHeader.tsx
'use client';

import { useTenant } from '@/shared/context';
import { useTable } from '@/shared/context';

export function MenuHeader() {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { table, isLoading: tableLoading } = useTable();

  if (tenantLoading || tableLoading) {
    return <div>Loading...</div>;
  }

  return (
    <header>
      <img src={tenant?.logoUrl} alt={tenant?.name} />
      <h1>{tenant?.name}</h1>
      <p>Table: {table?.name}</p>
    </header>
  );
}
```

**Example: Checkout Feature**
```typescript
// features/checkout/hooks/useCheckout.ts
'use client';

import { useSession } from '@/shared/context';
import { useMutation } from '@tanstack/react-query';

export function useCheckout() {
  const { tenantId, tableId } = useSession();

  const submitOrder = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/public/tenants/${tenantId}/orders`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...orderData, tableId }),
        }
      );
      if (!res.ok) throw new Error('Order submission failed');
      return res.json();
    },
  });

  return { submitOrder };
}
```

### 7. QR Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     QR Code Generation Flow                       │
└─────────────────────────────────────────────────────────────────┘

1. Admin (web-tenant) → "Generate QR for Table 5"
                ↓
2. Backend API → Create JWT token with { tenantId, tableId, exp }
                ↓
3. Backend → Return QR URL: https://order.example.com/s/pho-restaurant/eyJ...
                ↓
4. Admin downloads/prints QR code
                ↓
5. QR code placed on physical table

┌─────────────────────────────────────────────────────────────────┐
│                     Customer Scan Flow                            │
└─────────────────────────────────────────────────────────────────┘

1. Customer scans QR code with phone camera
                ↓
2. Browser navigates to: /s/pho-restaurant/eyJ...
                ↓
3. Next.js Server Component (page.tsx) → Validate token via backend
                ↓
4. Backend → Verify JWT signature, check expiration
                ↓
5. Backend → Return { tenantId, tableId, exp, version }
                ↓
6. Client Component → Create session in SessionContext
                ↓
7. SessionProvider → Store in localStorage + React state
                ↓
8. TenantProvider → Fetch restaurant details from tenantId
                ↓
9. TableProvider → Fetch table details from tableId
                ↓
10. Redirect to menu: /menu
                ↓
11. Customer browses menu, adds items to cart
                ↓
12. Checkout → Submit order with tenantId + tableId from context
```

### 8. Error Handling

**Invalid/Expired Token:**
```typescript
// app/s/[tenantSlug]/[token]/page.tsx
export default async function ScanPage({ params }: ScanPageProps) {
  const session = await validateQRToken(params.token);
  
  if (!session) {
    return (
      <div className="error-container">
        <h1>Invalid QR Code</h1>
        <p>This QR code is invalid or has expired.</p>
        <p>Please request a new QR code from the staff.</p>
      </div>
    );
  }
  
  // Success path...
}
```

**Session Expiration During Browsing:**
```typescript
// shared/context/SessionContext.tsx
useEffect(() => {
  const checkExpiration = () => {
    const stored = localStorage.getItem('customer-session');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.exp < Date.now() / 1000) {
        clearSession();
        alert('Your session has expired. Please scan the QR code again.');
        window.location.href = '/';
      }
    }
  };
  
  const interval = setInterval(checkExpiration, 60000); // Check every minute
  return () => clearInterval(interval);
}, []);
```

### 9. Security Considerations

1. **Token Signing**: Use strong secrets (`QR_SECRET_KEY` minimum 32 characters)
2. **HTTPS Only**: QR URLs must use HTTPS in production
3. **Short Expiry for Sensitive Operations**: Consider shorter expiry (e.g., 24 hours) for high-security scenarios
4. **Rate Limiting**: Backend should rate-limit `/api/public/scan` to prevent token brute-forcing
5. **No Sensitive Data in Token**: Token only contains IDs, never include PII or credentials

### 10. Related Documentation

- **Backend QR Generation**: `docs/backend/qr-generation-service.md` (TODO)
- **QR Flow Diagrams**: `01-product/diagrams/qr-generation-flow.md`
- **Security Threat Model**: `08-security/THREAT_MODEL.md`
- **API Documentation**: `02-api/openapi.yaml` (see `/api/public/scan` endpoint)

---

## Shared Packages

### @packages/ui

Shared component library used by both apps:

```
packages/ui/
├── src/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.stories.tsx
│   ├── Input/
│   ├── Card/
│   └── index.ts
├── package.json
└── tsconfig.json
```

**Usage:**
```typescript
// In web-tenant or web-customer
import { Button, Card } from '@packages/ui';
```

### @packages/dto

Shared TypeScript types from backend:

```
packages/dto/
├── auth/
│   └── auth.dto.ts
├── menu/
│   └── menu.dto.ts
├── order/
│   └── order.dto.ts
└── index.ts
```

### @packages/config

Shared configuration files:

```
packages/config/
├── eslint/
│   └── .eslintrc.js
├── typescript/
│   └── tsconfig.base.json
└── tailwind/
    └── tailwind.config.js
```

---

## API Integration

### API Client Setup

**Important:** In Next.js, we have two types of API calls:

1. **Server Components**: Use native `fetch()` with `process.env.API_URL` (server-only, not exposed to client)
2. **Client Components**: Use Axios with `process.env.NEXT_PUBLIC_API_URL` (exposed to browser)

#### Client-Side API Client (Axios)

**⚠️ This client is CLIENT-ONLY** and must only be imported in Client Components (files with `'use client'`) or custom hooks. Do not import this in Server Components.

```typescript
// lib/api/client.ts
'use client';

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
```

### Interceptors (Client-Only)

```typescript
// lib/api/interceptors.ts
'use client';

import apiClient from './client';

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### Service Layer Pattern

#### Server-Side Service (for Server Components)

```typescript
// features/menu/services/menuService.server.ts
import type { MenuItem, MenuCategory } from '../types/menu.types';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

export const menuService = {
  async getMenu(tenantId: string): Promise<MenuItem[]> {
    const res = await fetch(`${API_URL}/tenants/${tenantId}/menu`, {
      cache: 'no-store', // or 'force-cache' for static data
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch menu');
    return res.json();
  },

  async getCategories(tenantId: string): Promise<MenuCategory[]> {
    const res = await fetch(`${API_URL}/tenants/${tenantId}/categories`, {
      next: { revalidate: 3600 }, // ISR: revalidate every hour
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },
};
```

#### Client-Side Service (for Client Components)

```typescript
// features/menu/services/menuService.client.ts
'use client';

import apiClient from '@/lib/api/client';
import type { MenuItem, MenuCategory } from '../types/menu.types';

export const menuService = {
  async getMenu(tenantId: string): Promise<MenuItem[]> {
    const { data } = await apiClient.get(`/tenants/${tenantId}/menu`);
    return data;
  },

  async getCategories(tenantId: string): Promise<MenuCategory[]> {
    const { data } = await apiClient.get(`/tenants/${tenantId}/categories`);
    return data;
  },

  // web-tenant only - mutations typically happen client-side
  async createMenuItem(tenantId: string, item: Partial<MenuItem>): Promise<MenuItem> {
    const { data } = await apiClient.post(`/tenants/${tenantId}/menu`, item);
    return data;
  },
};
```

---

## State Management Strategy

### Global State (React Query)

Use **TanStack Query** for server state in Client Components:

```typescript
// features/menu/hooks/useMenu.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { menuService } from '../services/menuService.client';

export const useMenu = (tenantId: string) => {
  return useQuery({
    queryKey: ['menu', tenantId],
    queryFn: () => menuService.getMenu(tenantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!tenantId,
  });
};
```

### Local State (Zustand)

Use **Zustand** for client-side state:

```typescript
// web-customer/src/features/cart/store/cartStore.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types/cart.types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.id === item.id);
        if (existing) {
          return {
            items: state.items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),
      
      removeItem: (itemId) => set((state) => ({
        items: state.items.filter(i => i.id !== itemId),
      })),
      
      updateQuantity: (itemId, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.id === itemId ? { ...i, quantity } : i
        ),
      })),
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

### State Management Split

| State Type | web-tenant | web-customer |
|------------|------------|--------------|
| **Auth** | Zustand + JWT | LocalStorage (guest) |
| **Menu** | React Query | React Query |
| **Cart** | N/A | Zustand (persisted) |
| **Orders** | React Query | React Query |
| **UI State** | Zustand | Zustand |

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `MenuList.tsx` |
| Hook | camelCase, prefix `use` | `useMenu.ts` |
| Service | camelCase, suffix `Service` | `menuService.ts` |
| Type | camelCase, suffix `.types` | `menu.types.ts` |
| Store | camelCase, suffix `Store` | `cartStore.ts` |
| Util | camelCase | `formatCurrency.ts` |
| Page | PascalCase, suffix `Page` | `MenuPage.tsx` |

### Variables & Functions

```typescript
// ✅ Good
const userName = 'John';
const getUserById = (id: string) => { };
const MAX_ITEMS = 10;

// ❌ Bad
const UserName = 'John';
const get_user_by_id = (id: string) => { };
const max_items = 10;
```

### Types & Interfaces

```typescript
// ✅ Prefer interfaces for objects
interface User {
  id: string;
  name: string;
}

// ✅ Use type for unions/intersections
type UserRole = 'admin' | 'staff' | 'kitchen';

// ✅ Suffix props interfaces
interface MenuItemProps {
  item: MenuItem;
}
```

---

## Import Rules

### ✅ Allowed Imports

```typescript
// 1. External libraries
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Shared packages (monorepo)
import { Button } from '@packages/ui';
import type { MenuItemDTO } from '@packages/dto';

// 3. Shared resources (same app)
import { formatCurrency } from '@/shared/utils';
import { Card } from '@/shared/components/ui';

// 4. Within same feature (relative)
import { useMenu } from '../hooks/useMenu';
import type { MenuItem } from '../types/menu.types';

// 5. From other features (via index.ts only)
import { useCart } from '@/features/cart';
```

### ❌ Prohibited Imports

```typescript
// ❌ Don't import internal files from other features
import { CartItem } from '@/features/cart/components/CartItem';

// ❌ Don't import from other app
import { AdminLayout } from '@apps/web-tenant/shared/components/layout';

// ❌ Don't use deep relative imports across features
import { useAuth } from '../../../auth/hooks/useAuth';
```

### Import Order

```typescript
// 1. React & external libraries
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Monorepo packages
import { Button } from '@packages/ui';

// 3. Internal absolute imports
import { formatCurrency } from '@/shared/utils';

// 4. Feature imports (relative)
import { useMenu } from '../hooks/useMenu';
import type { MenuItem } from '../types/menu.types';

// 5. Styles (if any)
import './MenuList.css';
```

---

## Code Organization Best Practices

### 1. Feature Isolation

Each feature is self-contained:

```typescript
// ✅ Good - Everything related to menu in one place
features/menu-management/
├── components/        # UI
├── hooks/             # Logic
├── services/          # API
├── types/             # Types
├── utils/             # Helpers
└── index.ts           # Public API
```

### 2. Barrel Exports

Use `index.ts` to control public API:

```typescript
// features/menu-management/index.ts
export { MenuList, MenuItem, MenuItemForm } from './components';
export { useMenu, useMenuCRUD } from './hooks';
export { menuService } from './services/menuService';
export type { MenuItem, MenuCategory } from './types/menu.types';

// Internal components not exported
// - MenuItemModal (used only inside MenuList)
// - formatMenuPrice (internal helper)
```

### 3. Component Size

Keep components under **200 lines**:

```typescript
// ✅ Good - Split into smaller components
const MenuList = () => {
  return (
    <div>
      <MenuHeader />
      <MenuFilters />
      <MenuItems />
      <MenuPagination />
    </div>
  );
};

// ❌ Bad - 500 lines monolithic component
const MenuList = () => {
  // Too much logic and UI in one component
};
```

### 4. Custom Hooks for Logic

Extract business logic into hooks:

```typescript
// features/menu/hooks/useMenuCRUD.ts
export const useMenuCRUD = (tenantId: string) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (item: Partial<MenuItem>) => 
      menuService.createMenuItem(tenantId, item),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu', tenantId]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuItem> }) =>
      menuService.updateMenuItem(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu', tenantId]);
    },
  });

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
  };
};
```

### 5. Error Handling

Handle errors consistently:

```typescript
// ✅ Handle errors in hooks
export const useMenu = (tenantId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['menu', tenantId],
    queryFn: () => menuService.getMenu(tenantId),
  });

  if (error) {
    console.error('Menu fetch failed:', error);
  }

  return { menu: data ?? [], isLoading, error };
};

// ✅ Display errors in components
export const MenuList = () => {
  const { menu, isLoading, error } = useMenu(tenantId);

  if (error) return <ErrorState message="Failed to load menu" />;
  if (isLoading) return <LoadingState />;

  return <div>{/* Render menu */}</div>;
};
```

---

## Testing Strategy

### Unit Tests

Colocate tests with files:

```typescript
// features/menu/hooks/useMenu.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useMenu } from './useMenu';

describe('useMenu', () => {
  it('should fetch menu items', async () => {
    const { result } = renderHook(() => useMenu('tenant-1'));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.menu).toHaveLength(5);
  });
});
```

### Component Tests

```typescript
// features/menu/components/MenuItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MenuItem } from './MenuItem';

describe('MenuItem', () => {
  const mockItem = {
    id: '1',
    name: 'Pho Bo',
    price: 50000,
    image: '/pho.jpg',
  };

  it('should render item details', () => {
    render(<MenuItem item={mockItem} onAddToCart={jest.fn()} />);
    
    expect(screen.getByText('Pho Bo')).toBeInTheDocument();
    expect(screen.getByText('50,000 VND')).toBeInTheDocument();
  });

  it('should call onAddToCart when clicked', () => {
    const onAddToCart = jest.fn();
    render(<MenuItem item={mockItem} onAddToCart={onAddToCart} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    
    expect(onAddToCart).toHaveBeenCalledWith('1');
  });
});
```

### E2E Tests (Cypress/Playwright)

```typescript
// e2e/customer-ordering.spec.ts
describe('Customer Ordering Flow', () => {
  it('should complete order from QR scan to checkout', () => {
    cy.visit('/scan?token=xyz123');
    
    // Verify menu loads
    cy.contains('Menu').should('be.visible');
    
    // Add item to cart
    cy.contains('Pho Bo').click();
    cy.contains('Add to Cart').click();
    
    // Proceed to checkout
    cy.get('[data-testid="cart-button"]').click();
    cy.contains('Checkout').click();
    
    // Fill customer info
    cy.get('input[name="name"]').type('John Doe');
    cy.get('input[name="phone"]').type('0123456789');
    
    // Submit order
    cy.contains('Place Order').click();
    cy.contains('Order Confirmed').should('be.visible');
  });
});
```

---

## Deployment Strategy

### Build Configuration

**web-tenant (Admin Portal):**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**web-customer (Customer App):**
```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint"
  }
}
```

### Environment Variables

**web-tenant/.env:**
```env
# Client-side (exposed to browser)
NEXT_PUBLIC_API_URL=https://api.restaurant.com
NEXT_PUBLIC_APP_NAME=Restaurant Admin
NEXT_PUBLIC_WS_URL=wss://api.restaurant.com

# Server-side only (not exposed to browser)
API_URL=https://api.restaurant.com
API_SECRET=your-secret-key
```

**web-customer/.env:**
```env
# Client-side (exposed to browser)
NEXT_PUBLIC_API_URL=https://api.restaurant.com
NEXT_PUBLIC_APP_NAME=Order Now
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Server-side only (not exposed to browser)
API_URL=https://api.restaurant.com
STRIPE_SECRET_KEY=sk_live_xxx
```

### Deployment Targets

| App | Platform | Build Command | Output |
|-----|----------|---------------|--------|
| web-tenant | Vercel/Netlify | `pnpm build --filter web-tenant` | `.next/` |
| web-customer | Vercel/Netlify | `pnpm build --filter web-customer` | `.next/` |

**Note:** Platforms like Vercel automatically handle Next.js build artifacts. For self-hosted deployments, the `.next/` directory contains the production build.

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy-tenant:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build web-tenant
        run: pnpm build --filter web-tenant
      - name: Deploy to Vercel
        run: vercel deploy --prod

  deploy-customer:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build web-customer
        run: pnpm build --filter web-customer
      - name: Deploy to Netlify
        run: netlify deploy --prod
```

---

## Performance Benchmarks

### web-tenant (Target)
- **First Load**: < 2s on 4G
- **Bundle Size**: < 500KB gzipped
- **Lighthouse Score**: > 90

### web-customer (Target)
- **First Load**: < 1.5s on 3G
- **Bundle Size**: < 200KB gzipped
- **Lighthouse Score**: > 95
- **Time to Interactive**: < 3s

---

## Migration Path

### From Single App to Split Apps

If you have existing code in a single app:

1. **Identify Features**
   - List all features
   - Categorize as "Admin" or "Customer"

2. **Create New Apps**
   - Scaffold `web-tenant` and `web-customer`
   - Move features to appropriate app

3. **Extract Shared Code**
   - Move shared components to `@packages/ui`
   - Move shared types to `@packages/dto`

4. **Update Imports**
   - Replace relative imports with monorepo imports
   - Use barrel exports

5. **Test Thoroughly**
   - Run unit tests
   - Test E2E flows
   - Verify bundle sizes

---

## Troubleshooting

### Issue: Module not found '@/shared/...'

**Solution:** Configure path aliases in `tsconfig.json`:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@packages/ui": ["../../packages/ui/src"],
      "@packages/dto": ["../../packages/dto/src"]
    }
  }
}
```

For custom aliases in `next.config.js`:

```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};
```

### Issue: Using client-only APIs in Server Components

**Error:** `localStorage is not defined`, `window is not defined`

**Solution:** 
1. Add `'use client'` directive at the top of files that use browser APIs
2. Check for `typeof window !== 'undefined'` before accessing browser globals
3. Move client logic to Client Components, keep Server Components for data fetching

### Issue: Wrong environment variable prefix

**Error:** `process.env.API_URL` is undefined in browser

**Solution:**
- Use `NEXT_PUBLIC_*` prefix for client-exposed variables
- Use plain names (no prefix) for server-only secrets
- Never expose secrets like API keys to the client

### Issue: Circular dependency between features

**Solution:**
1. Move shared types to `@packages/dto`
2. Use index.ts exports only
3. Consider dependency injection

### Issue: Large bundle size

**Solution:**
1. Use Server Components by default (zero JS to client)
2. Lazy load Client Components with `next/dynamic`
3. Enable tree-shaking (automatic in Next.js)
4. Analyze bundle with `@next/bundle-analyzer`
5. Use `next build --experimental-debug` for detailed analysis

---

## Resources

### Next.js & React
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React 19 Documentation](https://react.dev/)

### State Management
- [TanStack Query (React Query)](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)

### Styling & UI
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)

### Monorepo Tools
- [Turborepo](https://turbo.build/repo)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)

### Testing
- [Playwright](https://playwright.dev/)
- [Cypress](https://www.cypress.io/)
- [React Testing Library](https://testing-library.com/react)

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-21 | 2.0 | Migrated from React+Vite to Next.js 15 App Router |
| 2025-01-11 | 1.0 | Initial split architecture document |

---

## Approval

This architecture must be reviewed and approved by:

- [ ] Tech Lead
- [ ] Senior Frontend Developer
- [ ] Team (3 developers)

**Questions?** Contact the Frontend Lead or open a discussion in the team channel.

---


## Localization / i18n Strategy

- Both **web-tenant** and **web-customer** apps must support multiple languages (English, Vietnamese).
- We use a standard Next.js i18n library (e.g. `next-intl` or `next-i18next`) for robust, scalable translation handling.
- Translation files are organized by app and language:
  - `apps/web-tenant/src/locales/en/*.json`, `vi/*.json`
  - `apps/web-customer/src/locales/en/*.json`, `vi/*.json`
- The i18n provider is set up in each app’s root `layout.tsx`, making translations available via hooks (e.g. `useTranslations()`).
- Language switcher UI: in tenant settings (admin) and as a toggle in the customer app.

**Example (using next-intl):**

```tsx
// apps/web-customer/app/layout.tsx
import { NextIntlProvider } from 'next-intl';
import messages from '../src/locales/en/common.json';

export default function RootLayout({ children }) {
  return (
    <NextIntlProvider messages={messages} locale="en">
      {children}
    </NextIntlProvider>
  );
}
```

---

**END OF FRONTEND ARCHITECTURE DOCUMENT**

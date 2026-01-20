# Web-Customer App (Customer Ordering Interface)

**App Location:** `source/apps/web-customer/`  
**Purpose:** Mobile-first QR ordering app for restaurant customers  
**Tech Stack:** Next.js 15 (App Router), React 19, TailwindCSS v4

## Overview

Frontend Next.js 15 application for customers to scan QR codes, browse menus, order items, and track order status.

**Architecture:** Clean Architecture với Next.js 15 App Router
- **Presentation Layer**: `app/` - Routing và page wrappers
- **Domain Layer**: `src/features/` - Business logic và feature UI
- **Shared Layer**: `src/shared/` - Reusable components/hooks/utils
- **Infrastructure Layer**: `src/lib/` - API clients, providers

## Quick Start
```bash
pnpm --filter web-customer dev
```
Truy cập: http://localhost:3001

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, TailwindCSS v4
- **State**: TanStack Query (server state), Zustand (client state: giỏ hàng)
- **API**: Axios client with interceptors
- **Icons**: lucide-react

## Cấu trúc Thư mục (Clean Architecture)

```
web-customer/
├── public/                      # Static assets
├── src/
│   ├── app/                     # Presentation Layer (Next.js App Router)
│   │   ├── (auth)/              # Route group: Auth pages
│   │   ├── (menu)/              # Route group: Menu browsing
│   │   ├── (cart)/              # Route group: Cart & checkout
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   └── providers.tsx        # Client providers wrapper
│   ├── features/                # Domain Layer (Business logic)
│   │   ├── landing/             # QR validation & welcome
│   │   ├── menu-view/           # Menu browsing
│   │   ├── cart/                # Cart management (with Zustand store)
│   │   ├── checkout/            # Checkout & payment
│   │   └── order-tracking/      # Order status tracking
│   ├── shared/                  # Shared Layer (Reusable)
│   │   ├── components/ui/       # UI primitives (Button, Input, Card)
│   │   ├── context/             # Global contexts (Session, Tenant, Table)
│   │   ├── hooks/               # Shared hooks
│   │   └── utils/               # Helpers
│   ├── lib/                     # Infrastructure Layer
│   │   ├── api/                 # Axios client & endpoints
│   │   └── qr/                  # QR token validation
│   ├── stores/                  # Global state (Zustand)
│   ├── styles/                  # Global styles
│   ├── services/                # External services
│   ├── assets/                  # Images, fonts
│   ├── constants/               # App constants
│   └── types/                   # TypeScript types
├── package.json
├── next.config.mjs
├── tsconfig.json
└── tailwind.config.ts
```

**Note:** Actual folder structure verified via `ls source/apps/web-customer/src/`. Some subfolders may vary.

## Clean Architecture Layers

**1. Presentation Layer (`app/`)**
- **Purpose**: Handle routing only, thin page wrappers
- **Rules**: Import from `features/`, no business logic
- **Example**: `app/menu/page.tsx` renders `<MenuView />` from features

**2. Domain Layer (`src/features/`)**
- **Purpose**: Business logic and feature-specific UI
- **Rules**: Self-contained, can import from `shared/` and `lib/`
- **Example**: `features/cart/` owns cart logic, UI, and Zustand store

**3. Shared Layer (`src/shared/`)**
- **Purpose**: Reusable components/hooks/utils
- **Rules**: No feature-specific logic, used by any feature
- **Example**: `shared/components/ui/Button.tsx` is a generic button

**4. Infrastructure Layer (`src/lib/`)**
- **Purpose**: API clients, external service configs
- **Rules**: Framework-agnostic when possible
- **Example**: `lib/api/client.ts` configures Axios with interceptors

## Architecture Principles

### Data Flow (Clean Architecture)
```
app/page.tsx → features/Feature.tsx → shared/components → lib/api
     ↓              ↓                       ↓                ↓
  Routing      Business Logic        UI Primitives    External APIs
```

### Dependency Rule
- **app/** can import from `features/`
- **features/** can import from `shared/`, `lib/`, other features (via index.ts)
- **shared/** can import from `lib/` only (no features)
- **lib/** can import external libraries only (no app code)

### Component Patterns
- **Dumb (ui)**: Presentational, no side-effects, no API calls
- **Smart (features)**: Can use TanStack Query, Zustand, business logic
- **Page (app)**: Thin wrapper, imports from features, handles routing

## State Management

### Server State (TanStack Query)

**Example pattern:**
```ts
// ⏳ ADD HERE: Verify actual implementation
// Example: features/menu/hooks/useMenu.ts or similar
export const useMenu = (tenantId: string) => {
  return useQuery({
    queryKey: ['menu', tenantId],
    queryFn: () => menuService.getMenu(tenantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

**Verification:** Search for TanStack Query usage in `source/apps/web-customer/src/features/`

### Client State (Zustand)

**Cart store location:** `stores/cart.store.ts` (verified)

**Example pattern:**
```ts
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'cart-storage' }
  )
);
```

**Verification:** See actual implementation in `source/apps/web-customer/src/stores/cart.store.ts`

## Context Providers

⏳ **ADD HERE**: Context providers not yet implemented or located elsewhere.
- Check `source/apps/web-customer/src/shared/` for actual context implementations
- Actual folders: `components/, config/, hooks/, logging/, types/, utils/`

**Example Session Management Pattern:**
```tsx
// Example (pseudo-code)
export function SessionProvider({ children }) {
  const [tenantId, setTenantId] = useState(null);
  const [tableId, setTableId] = useState(null);
  
  return (
    <SessionContext.Provider value={{ tenantId, tableId, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}
```

**Example Provider Hierarchy Pattern:**
```tsx
// Example (pseudo-code) - verify in app/layout.tsx
<QueryClientProvider>
  <SessionProvider>
    <TenantProvider>
      <TableProvider>
        {children}
      </TableProvider>
    </TenantProvider>
  </SessionProvider>
</QueryClientProvider>
```

**Verification:** Check actual provider setup in `source/apps/web-customer/src/app/layout.tsx`

## Import Rules

### ✅ Allowed Patterns
```ts
// External libraries
import { useQuery } from '@tanstack/react-query';

// Shared resources
import { Button } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';

// Within same feature (relative)
import { useController } from '../hooks/useController';

// From other features (via index.ts only)
import { useCart } from '@/features/cart';
```

### ❌ Prohibited Patterns
```ts
// Don't import internal files from other features
import { CartItem } from '@/features/cart/components/CartItem';

// Don't use deep relative imports across features
import { useAuth } from '../../../auth/hooks/useAuth';
```

**Verification:** Check actual import patterns in `source/apps/web-customer/src/features/*/index.ts`

## Extending Features

Thêm feature mới:
1. Tạo folder trong `src/features/<feature-name>/`
2. Tạo hook chuyên biệt (nếu cần) trong `hooks/`
3. Định nghĩa query/mutation trong `services/` hoặc `lib/api.ts`
4. Export public API qua `index.ts`
5. Viết test (nếu áp dụng) cho utils và hooks quan trọng

Ngắn gọn, ưu tiên tách biệt: UI (trình bày) / Feature (nghiệp vụ) / Data (query) / State (store) / Helpers (utils).

## Related Documentation

- **Parent Docs**: [Frontend Overview](../README.md) - Tổng quan frontend architecture
- **Architecture**: [ARCHITECTURE.md](../ARCHITECTURE.md) - Chi tiết kiến trúc monorepo và QR flow
- **Guides**: [guide/](../guide/) - Onboarding, patterns, conventions

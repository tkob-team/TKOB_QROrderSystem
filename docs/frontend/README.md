# Customer Web App (Frontend)

Frontend Next.js 15 cho ứng dụng khách hàng quét QR, đặt món và thanh toán.

## 1. Giới thiệu
Mục tiêu: hiển thị menu theo tenant (quán), cho phép khách thêm vào giỏ, checkout, theo dõi trạng thái đơn hàng.

**Architecture**: Clean Architecture với Next.js 15 App Router
- **Presentation Layer**: `app/` - Routing và page wrappers
- **Domain Layer**: `src/features/` - Business logic và feature UI
- **Shared Layer**: `src/shared/` - Reusable components/hooks/utils
- **Infrastructure Layer**: `src/lib/` - API clients, providers

## 2. Quick Start
```bash
pnpm --filter web-customer dev
```
Truy cập: http://localhost:3001

## 3. Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, TailwindCSS v4
- **State**: TanStack Query (server state), Zustand (client state: giỏ hàng)
- **API**: Axios client with interceptors
- **Icons**: lucide-react

## 4. Cấu trúc Thư mục (Clean Architecture)

```
web-customer/
├─ src/
│  ├─ app/                      # Presentation Layer (Next.js App Router)
│  │  ├─ layout.tsx             # Root layout
│  │  ├─ page.tsx               # Landing page
│  │  ├─ providers.tsx          # Client providers wrapper
│  ├─ (auth)/                   # Route group: Auth pages
│  │  └─ login/page.tsx
│  ├─ (menu)/                   # Route group: Menu browsing
│  │  ├─ menu/page.tsx
│  │  └─ [itemId]/page.tsx
│  └─ (cart)/                   # Route group: Cart & checkout
│     ├─ cart/page.tsx
│     └─ checkout/page.tsx
│
├─ src/
│  ├─ features/                 # Domain Layer (Business logic)
│  │  ├─ landing/               # QR validation & welcome
│  │  ├─ menu-view/             # Menu browsing
│  │  │  ├─ components/
│  │  │  │  ├─ MenuList.tsx
│  │  │  │  └─ MenuItem.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useMenu.ts
│  │  │  └─ index.ts
│  │  ├─ cart/                  # Cart management
│  │  │  ├─ components/
│  │  │  ├─ store/
│  │  │  │  └─ cartStore.ts    # Zustand store
│  │  │  └─ index.ts
│  │  ├─ checkout/              # Checkout & payment
│  │  └─ order-tracking/        # Order status tracking
│  │
│  ├─ shared/                   # Shared Layer (Reusable)
│  │  ├─ components/
│  │  │  ├─ ui/                 # UI primitives
│  │  │  │  ├─ Button.tsx
│  │  │  │  ├─ Input.tsx
│  │  │  │  └─ Card.tsx
│  │  │  └─ layouts/            # Layout components
│  │  ├─ context/               # Global contexts
│  │  │  ├─ SessionContext.tsx  # Customer session
│  │  │  ├─ TenantContext.tsx   # Restaurant details
│  │  │  └─ TableContext.tsx    # Table info
│  │  ├─ hooks/                 # Shared hooks
│  │  └─ utils/                 # Helpers
│  │
│  ├─ lib/                      # Infrastructure Layer
│  │  ├─ api/
│  │  │  ├─ client.ts           # Axios instance
│  │  │  └─ endpoints.ts
│  │  └─ qr/
│  │     └─ validateQRToken.ts
│  │
│  ├─ store/                    # Global state (Zustand)
│  └─ styles/
│     └─ globals.css
│
└─ public/                      # Static assets
```

### Giải thích Clean Architecture Layers

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

## 5. Architecture Principles

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

## 6. State Management

### Server State (TanStack Query)
```ts
// features/menu-view/hooks/useMenu.ts
export const useMenu = (tenantId: string) => {
  return useQuery({
    queryKey: ['menu', tenantId],
    queryFn: () => menuService.getMenu(tenantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Client State (Zustand)
```ts
// features/cart/store/cartStore.ts
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

## 7. Context Providers

### Session Management
```tsx
// shared/context/SessionContext.tsx
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

### Provider Hierarchy
```tsx
// app/providers.tsx
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

## 8. Import Rules

### ✅ Allowed
```ts
// External libraries
import { useQuery } from '@tanstack/react-query';

// Shared resources
import { Button } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';

// Within same feature (relative)
import { useMenu } from '../hooks/useMenu';

// From other features (via index.ts only)
import { useCart } from '@/features/cart';
```

### ❌ Prohibited
```ts
// Don't import internal files from other features
import { CartItem } from '@/features/cart/components/CartItem';

// Don't use deep relative imports across features
import { useAuth } from '../../../auth/hooks/useAuth';
```

## 10. Mở rộng
Thêm feature mới:
1. Tạo folder trong `components/features/<feature>/`.
2. Tạo hook chuyên biệt (nếu cần) trong `hooks/`.
3. Định nghĩa query/mutation trong `lib/api.ts`.
4. Viết test (nếu áp dụng) cho utils và hooks quan trọng.

Ngắn gọn, ưu tiên tách biệt: UI (trình bày) / Feature (nghiệp vụ) / Data (query) / State (store) / Helpers (utils).
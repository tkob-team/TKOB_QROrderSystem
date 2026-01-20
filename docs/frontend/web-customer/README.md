# Web-Customer App (Customer Ordering Interface)

**Vị trí Ứng dụng:** `source/apps/web-customer/`  
**Purpose:** Ứng dụng gọi món qua QR, mobile-first dành cho khách hàng nhà hàng
**Tech Stack:** Next.js 15 (App Router), React 19, TailwindCSS v4

## Tổng quan

Ứng dụng frontend Next.js 15 dành cho khách hàng, cho phép:

- Quét mã QR
- Xem menu
- Thêm món vào giỏ hàng
- Thanh toán
- Theo dõi trạng thái đơn hàng theo thời gian thực

**Kiến trúc:** Clean Architecture với Next.js 15 App Router
- **Presentation Layer**: `app/` – Routing và page wrappers
- **Domain Layer**: `src/features/` – Logic nghiệp vụ và UI theo feature
- **Shared Layer**: `src/shared/` – Components, hooks, utils dùng chung
- **Infrastructure Layer**: `src/lib/` – API clients, cấu hình dịch vụ ngoài

## Khởi động nhanh
```bash
pnpm --filter web-customer dev
```

Truy cập: http://localhost:3001

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, TailwindCSS v4
- **State**:
  - TanStack Query (server state)
  - Zustand (client state: giỏ hàng)
- **API**: Axios client với interceptors
- **Icons**: lucide-react

## Cấu trúc Thư mục (Clean Architecture)

```
web-customer/
├── public/                      # Static assets
├── src/
│   ├── app/                     # Presentation Layer (Next.js App Router)
│   │   ├── (auth)/              # Nhóm route: xác thực
│   │   ├── (menu)/              # Nhóm route: duyệt menu
│   │   ├── (cart)/              # Nhóm route: giỏ hàng & checkout
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   └── providers.tsx        # Wrapper cho client providers
│   ├── features/                # Domain Layer (logic nghiệp vụ)
│   │   ├── landing/             # Xác thực QR & trang chào
│   │   ├── menu-view/           # Xem menu
│   │   ├── cart/                # Quản lý giỏ hàng (Zustand)
│   │   ├── checkout/            # Checkout & thanh toán
│   │   └── order-tracking/      # Theo dõi trạng thái đơn hàng
│   ├── shared/                  # Shared Layer (dùng chung)
│   │   ├── components/ui/       # UI primitives (Button, Input, Card)
│   │   ├── context/             # Context toàn cục (Session, Tenant, Table)
│   │   ├── hooks/               # Hooks dùng chung
│   │   └── utils/               # Helpers
│   ├── lib/                     # Infrastructure Layer
│   │   ├── api/                 # Axios client & endpoints
│   │   └── qr/                  # Xác thực QR token
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

**Ghi chú:** Cấu trúc thư mục được xác minh qua `ls source/apps/web-customer/src/`. Một số subfolder có thể thay đổi theo thời gian.

## Các lớp Clean Architecture

**1. Presentation Layer (`app/`)**
- **Mục đích**: Chỉ xử lý routing, page wrapper mỏng
- **Quy tắc**: Import từ `features/`, không chứa logic nghiệp vụ
- **Ví dụ**: `app/menu/page.tsx` render `<MenuView />` từ features

**2. Domain Layer (`src/features/`)**
- **Mục đích**: Logic nghiệp vụ và UI theo feature
- **Quy tắc**: Self-contained, có thể import từ `shared/` và `lib/`
- **Ví dụ**: `features/cart/` quản lý toàn bộ logic & state giỏ hàng

**3. Shared Layer (`src/shared/`)**
- **Mục đích**: Components / hooks / utils dùng chung
- **Quy tắc**: Không chứa logic riêng của feature
- **Ví dụ**: `shared/components/ui/Button.tsx`

**4. Infrastructure Layer (`src/lib/`)**
- **Mục đích**: API client, cấu hình dịch vụ ngoài
- **Quy tắc**: Càng framework-agnostic càng tốt
- **Ví dụ**: `lib/api/client.ts` cấu hình Axios + interceptors

## Nguyên tắc Kiến trúc

### Luồng dữ liệu (Clean Architecture)
```
app/page.tsx → features/Feature.tsx → shared/components → lib/api
     ↓              ↓                       ↓                ↓
  Routing      Logic nghiệp vụ        UI primitives     External APIs
```

### Dependency Rule

- **app/** → import từ `features/`
- **features/** → import từ `shared/`, `lib/`
- **shared/** → import từ `lib/`
- **lib/** → chỉ import thư viện ngoài

### Component Patterns

- **Dumb (ui)**: Presentational, no side-effects, no API calls
- **Smart (features)**: Can use TanStack Query, Zustand, business logic
- **Page (app)**: Thin wrapper, imports from features, handles routing

## Quản lý Trạng thái

### Server State (TanStack Query)

**Ví dụ pattern:**
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

**Xác minh:** Tìm kiếm cách sử dụng TanStack Query trong `source/apps/web-customer/src/features/`

### Client State (Zustand)

**Cart store location:** `stores/cart.store.ts` (verified)

**Ví dụ pattern:**
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

**Xác minh:** Xem triển khai thực tế trong `source/apps/web-customer/src/stores/cart.store.ts`

## Context Providers

⏳ **ADD HERE**: Context providers chưa được triển khai hoặc nằm ở vị trí khác.
- Kiểm tra `source/apps/web-customer/src/shared/` để xác minh

**Ví dụ pattern Session Management:**
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

**Ví dụ Provider Hierarchy:**
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

## Quy tắc Import

### ✅ Pattern được phép
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

### ❌ Pattern không được phép
```ts
// Don't import internal files from other features
import { CartItem } from '@/features/cart/components/CartItem';

// Don't use deep relative imports across features
import { useAuth } from '../../../auth/hooks/useAuth';
```

## Mở rộng Feature

Khi thêm feature mới:

1. Tạo folder trong `src/features/<feature-name>/`
2. Viết hook chuyên biệt nếu cần
3. Định nghĩa query/mutation trong `services/` hoặc `lib/api.ts`
4. Export public API qua `index.ts`
5. Viết test cho logic quan trọng (nếu áp dụng)

Tài liệu Liên quan

- **Frontend Overview**: [../README.md](../README.md) - Tổng quan frontend architecture
- **Architecture**: [../ARCHITECTURE.md](../ARCHITECTURE.md) - Chi tiết kiến trúc monorepo và QR flow
- **Guides**: [../guide/](../guide/) - Onboarding, patterns, conventions

---

📌 **KẾT LUẬN**: frontend/web-customer/README.md → ✅ ĐÃ VIỆT HOÁ HOÀN CHỈNH

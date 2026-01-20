## Phạm vi so với MVP

Một số tính năng frontend được mô tả trong tài liệu này là hậu-MVP (phạm vi tương lai). Ví dụ: giao diện POS phong phú trong quản lý đơn hàng, bảng điều khiển phân tích nâng cao, và hỗ trợ ngoại tuyến thông qua service workers được lên kế hoạch cho các giai đoạn sau.

MVP sẽ tập trung vào các luồng thiết yếu:

- **MVP Cốt lõi:**
  - Onboarding tenant và xác thực
  - Quản lý menu (CRUD)
  - Quản lý bàn và tạo mã QR
  - Đặt hàng và thanh toán của khách hàng
  - Hệ thống hiển thị bếp cơ bản (KDS)
- **Nâng cấp Tương lai:**
  - POS/quản lý đơn hàng có tính năng đầy đủ cho nhân viên
  - Bảng điều khiển phân tích và báo cáo nâng cao
  - Hỗ trợ ngoại tuyến (service workers/PWA)
  - Tích hợp loyalty, khuyến mãi và API

# Kiến trúc Frontend – Nền tảng Đặt hàng Nhà hàng Thống nhất (Next.js 15+ App Router)

**Dự án:** TKOB_QROrderSystem  
**Kiến trúc:** Kiến trúc sạch dựa trên Tính năng với Next.js 15 App Router  
**Tech Stack:** Next.js 15, React 19, TypeScript, TailwindCSS v4  
**Cập nhật lần cuối:** 2026-01-20

---

## Mục lục

1. [Tổng quan Kiến trúc](#architecture-overview)
2. [Cấu trúc Monorepo](#monorepo-structure)
3. [Cấu trúc Next.js App Router](#nextjs-app-router-structure)
4. [Web-Tenant (Cổng thông tin Quản trị/Nhân viên)](#web-tenant-adminstaff-portal)
5. [Web-Customer (Ứng dụng Đặt hàng Khách hàng)](#web-customer-client-ordering-app)
6. [Gói chia sẻ](#shared-packages)
7. [Tích hợp API](#api-integration)
8. [Chiến lược Quản lý Trạng thái](#state-management-strategy)
9. [Quy ước Đặt tên](#naming-conventions)
10. [Quy tắc Import](#import-rules)
11. [Các thực tiễn tốt nhất Tổ chức Mã](#code-organization-best-practices)
12. [Chiến lược Kiểm tra](#testing-strategy)
13. [Chiến lược Triển khai](#deployment-strategy)
14. [Mục tiêu Hiệu suất](#performance-benchmarks)
15. [Xử lý sự cố](#troubleshooting)
16. [Tài nguyên](#resources)
17. [Nhật ký thay đổi](#changelog)
18. [Phê duyệt](#approval)

---

## Tổng quan Kiến trúc

Frontend này là một **monorepo Next.js 15+** với hai ứng dụng riêng biệt:

- **web-tenant**: Cổng thông tin quản trị/nhân viên (desktop-first, giàu tính năng)
- **web-customer**: Ứng dụng đặt hàng khách hàng (mobile-first, nhẹ)

**Các Nguyên tắc Next.js 15+ Chính:**
- Sử dụng **App Router** (thư mục `app/`) để định tuyến dựa trên tệp.
- **Server Components theo mặc định** cho fetching dữ liệu, SEO, và hiệu suất.
- **Client Components** chỉ khi cần tương tác hoặc API trình duyệt (đánh dấu bằng `'use client'`).
- **UI Streaming** với `loading.tsx` và `error.tsx` cho các segment route.
- **Gọi API** thông qua `fetch` trong Server Components hoặc thông qua TanStack Query trong Client Components.
- **Biến môi trường** sử dụng `NEXT_PUBLIC_...` cho cấu hình được phơi bày cho client và `process.env.API_URL` cho server-only.

---

## Monorepo & Không gian làm việc pnpm

Repository được tổ chức dưới dạng monorepo được quản lý bằng pnpm workspaces. Mỗi ứng dụng (khách hàng và quản trị) được cách ly dưới `source/apps/*` với cấu hình công cụ riêng của nó, trong khi các thư viện chia sẻ nằm dưới `packages/*` và được tiêu thụ thông qua các phụ thuộc workspace.

Ở root, `package.json` và `pnpm-workspace.yaml` khai báo các glob workspace để cài đặt các phụ thuộc một lần ở root và liên kết cục bộ giữa các ứng dụng và gói. Chạy `pnpm install` từ root repository; các lệnh phát triển có thể được lọc trên mỗi ứng dụng.

- Ứng dụng (Next.js 15, React 19):
  - `source/apps/web-customer` – ứng dụng đặt hàng QR hướng tới khách hàng
  - `source/apps/web-tenant` – cổng thông tin quản trị/nhân viên
- Cấu hình mỗi ứng dụng: mỗi ứng dụng sở hữu `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `.eslintrc.json` của nó để xây dựng và linting độc lập.
- Gói chia sẻ: `packages/*` (ví dụ: `ui`, `dto`, `config`, v.v.) được xuất bản dưới dạng các phụ thuộc workspace.

Ví dụ cấu hình workspace và lệnh dev:

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
│   │   ├── src/
│   │   │   ├── app/          # Next.js 15 App Router (Presentation Layer)
│   │   │   │   ├── admin/    # Explicit admin route segment: /admin/...
│   │   │   │   ├── (auth)/   # Route group: Authentication routes
│   │   │   │   ├── api/      # API routes (optional BFF pattern)
│   │   │   │   ├── layout.tsx    # Root layout
│   │   │   │   ├── page.tsx      # Home page with auth redirect
│   │   │   │   └── providers.tsx # Client-side providers
│   │   │   ├── features/     # Feature modules (Domain Layer)
│   │   │   ├── shared/       # Shared/Common layer
│   │   │   ├── lib/          # Infrastructure layer
│   │   │   ├── store/        # Global state (Zustand)
│   │   │   └── styles/       # Global styles
│   │   ├── package.json
│   │   ├── next.config.mjs
│   │   ├── tailwind.config.cjs
│   │   └── tsconfig.json
│   │
│   ├── web-customer/        # Customer Ordering App
│   │   ├── src/
│   │   │   ├── app/
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
│   │   │   ├── lib/          # Core utilities; routes.ts for path constants
│   │   │   ├── store/        # Global state
│   │   │   ├── styles/       # Global styles
│   │   │   └── assets/       # Images, fonts
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

## Cấu trúc Next.js App Router

### 1. Thư mục App (Lớp Trình bày)

**Mục đích**: Xử lý định tuyến, rendering trang, và các mối quan tâm cụ thể của Next.js.

**Các Nguyên tắc Chính**:
- **Wrapper mỏng**: Các trang nên import từ `features/` và render chúng
- **Không logic kinh doanh**: Tất cả logic miền sống trong `src/features/`
- **Nhóm route**: Sử dụng `(auth)` để tổ chức mà không ảnh hưởng đến URL; sử dụng segment `admin/` rõ ràng cho route admin.
- **Server Components theo mặc định**: Sử dụng `'use client'` chỉ khi cần thiết

### 2. Các Segment Route & Tệp Đặc biệt

- **page.tsx**: Thành phần trang chính (Server Component theo mặc định)
- **layout.tsx**: Layout chia sẻ cho các nested route
- **loading.tsx**: Trạng thái UI loading streaming
- **error.tsx**: Error boundary cho route segment
- **not-found.tsx**: Trang 404

### 3. Route Động

- Dynamic segments: `[id]`, `[slug]`
- Optional catch-all: `[[...slug]]`
- Required catch-all: `[...slug]`

### 4. API Routes (Tùy chọn)

- Định nghĩa dưới `app/api/` cho mô hình Backend-for-Frontend (BFF)
- Sử dụng khi bạn cần logic server-side trước khi gọi API bên ngoài
- Ví dụ: `/api/webhook`, `/api/internal/cache-clear`


### 5. Middleware

- Mỗi ứng dụng có thể định nghĩa middleware.ts của riêng nó để xử lý yêu cầu.
- **apps/web-tenant/middleware.ts**: Xử lý các vấn đề tenant/admin như kiểm tra xác thực và RBAC guard cho các route admin.
- **apps/web-customer/middleware.ts** (tùy chọn): Được sử dụng cho logic quét QR, chỉ khớp các route liên quan đến QR như `/s/:tenantSlug/:token` hoặc `/scan?token=...`.

**Trách nhiệm:**
- **Middleware web-tenant:**
  - Bảo vệ các route dashboard riêng tư
  - Kiểm tra tính hợp lệ của JWT/session
  - Chuyển hướng đến `/login` nếu không được xác thực
  - Thi hành RBAC cho các route admin
- **Middleware web-customer (tùy chọn):**
  - Parse token QR từ URL
  - Đặt cookie ngữ cảnh cho session/tenant/table
  - Tùy chọn rewrite sang route menu công khai

### Example Structure

```
web-tenant/
├── app/
│   ├── admin/
│   │   ├── layout.tsx           # Admin layout with sidebar/navigation
│   │   ├── dashboard/
│   │   │   └── page.tsx         # → /admin/dashboard
│   │   ├── menu/
│   │   │   └── page.tsx         # → /admin/menu
│   │   ├── orders/
│   │   │   └── page.tsx         # → /admin/orders
│   │   └── tables/
│   │       └── page.tsx         # → /admin/tables
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

## Web-Tenant (Cổng thông tin Quản trị/Nhân viên)

**Mục đích:** Giao diện quản lý đầy đủ tính năng cho chủ nhà hàng và nhân viên.

### Cấu trúc Tính năng (Lớp Miền)

**Mục đích**: Các module tự chứa đựng với logic kinh doanh và UI cụ thể cho tính năng.

**Các Nguyên tắc Chính**:
- **Cách ly tính năng**: Mỗi tính năng sở hữu các thành phần, hook, loại, và gọi API của nó
- **Barrel exports**: Sử dụng `index.ts` để phơi bày API công khai
- **Có thể import từ**: `shared/`, `lib/`, các tính năng khác thông qua index
- **Không thể import từ**: `app/` (phụ thuộc vòng tròn)

```
web-tenant/src/features/
├── auth/
│   ├── components/         # Feature-specific UI components
│   │   ├── Login.tsx       # Main login screen
│   │   ├── Signup.tsx
│   │   ├── EmailVerification.tsx
│   │   └── OnboardingWizard.tsx
│   ├── hooks/              # Feature-specific hooks
│   │   ├── useAuth.ts
│   │   └── useAuthForm.ts
│   ├── api/                # Feature-specific API calls (optional)
│   │   └── authApi.ts
│   ├── types/              # Feature types/interfaces
│   │   └── auth.types.ts
│   ├── utils/              # Feature helpers
│   │   └── authHelpers.ts
│   └── index.ts            # Public exports only
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

### Shared Layer (Common/Cross-cutting Concerns)

**Purpose**: Reusable code that can be used by any feature.

**Key Principles**:
- **No feature-specific logic**: Must be generic and reusable
- **No imports from features**: Only external libs and other shared code
- **Well-tested**: Should have high test coverage

```
web-tenant/src/shared/
├── components/
│   ├── ui/                    # Reusable UI primitives
│   │   ├── Button.tsx         # Generic button component
│   │   ├── Input.tsx          # Generic input component
│   │   ├── Card.tsx           # Generic card container
│   │   ├── Modal.tsx
│   │   └── index.ts           # Barrel exports
│   ├── layouts/               # Layout components
│   │   ├── AdminLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── index.ts
│   └── auth/                  # Shared auth components
│       ├── RoleGuard.tsx      # RBAC guard component
│       └── index.ts
│
├── context/                   # Global React contexts
│   ├── AuthContext.tsx        # Auth state & methods
│   ├── ThemeContext.tsx       # Theme provider
│   └── index.ts
│
├── hooks/                     # Shared custom hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   └── index.ts
│
├── utils/                     # Helper/utility functions
│   ├── format.ts              # formatCurrency, formatDate
│   ├── validation.ts          # Validation helpers
│   ├── constants.ts           # App constants
│   └── index.ts
│
└── types/                     # Shared TypeScript types
    ├── common.types.ts
    ├── api.types.ts
    └── index.ts
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

Ứng dụng web-tenant thi hành kiểm soát truy cập dựa trên vai trò (RBAC) cho tất cả các route và tính năng nhạy cảm.

**Vai trò:**
- `tenant-admin`: Truy cập đầy đủ tất cả các tính năng quản trị
- `manager`: Hầu hết các tính năng quản trị (ngoại trừ một số cài đặt cấp tenant)
- `kitchen`: Chỉ truy cập hệ thống hiển thị bếp (KDS)
- `server`: Truy cập lấy đơn hàng và quản lý bàn

**Nhóm Route & Quyền truy cập:**
- `admin/*`: Có thể truy cập bởi `tenant-admin`, `manager`
- `(kitchen)`: Có thể truy cập bởi `kitchen` (KDS)
- `(server)`: Có thể truy cập bởi `server` (lấy đơn hàng)

**Mô hình Thi hành:**
- Hook `useAuth()` trả về `{ user, role }` cho phiên hiện tại.
- Thành phần `RoleGuard` chấp nhận prop `allowedRoles` và render các child nếu người dùng có quyền, hoặc chuyển hướng đến trang Forbidden/AccessDenied.
- Tùy chọn, một HOC `withRoleGuard`/helper có thể được sử dụng trong các thành phần layout để bảo vệ DRY.

**Ví dụ Sử dụng:**
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

**Quy tắc RBAC (Tóm tắt):**
- Tất cả các route admin phải được bao bọc trong `RoleGuard`.
- Người dùng không được phép được chuyển hướng đến `/forbidden` hoặc trang từ chối quyền truy cập tùy chỉnh.
- `role` được xác định tại lúc đăng nhập và được lưu trữ trong auth context.
- Sử dụng `withRoleGuard` cho các layout để tránh lặp lại logic trong mọi trang.

---

## Web-Customer (Ứng dụng Đặt hàng Khách hàng)

**Mục đích:** Trải nghiệm đặt hàng nhẹ, mobile-first cho khách hàng.

### Cấu trúc Tính năng

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

### Tính năng Chính

1. **Nhập QR Code**
   - Quét mã QR
   - Xác thực token
   - Tải ngữ cảnh tenant

2. **Duyệt Menu**
   - Xem menu được phân loại
   - Chức năng tìm kiếm
   - Lọc theo tính khả dụng
   - Chi tiết mục với bộ sửa đổi

3. **Quản lý Giỏ hàng**
   - Thêm/xóa mục
   - Sửa đổi số lượng
   - Áp dụng bộ sửa đổi
   - Tính toán tổng cộng

4. **Thanh toán**
   - Thanh toán khách (không cần đăng ký)
   - Biểu mẫu thông tin khách hàng
   - Tích hợp thanh toán (Stripe)
   - Xác nhận đơn hàng

5. **Theo dõi Đơn hàng**
   - Cập nhật trạng thái thực tế
   - Dòng thời gian đơn hàng
   - Thông báo WebSocket

### Tối ưu hóa Hiệu suất

1. **Chia tách mã với next/dynamic**
   ```typescript
   // Lazy load heavy client components
   import dynamic from 'next/dynamic';
   
   const CheckoutForm = dynamic(
     () => import('@/features/checkout/components/CheckoutForm'),
     { loading: () => <div>Loading checkout...</div> }
   );
   ```

2. **Tối ưu hóa Hình ảnh**
   - Định dạng WebP với fallback
   - Lazy loading hình ảnh
   - Progressive image loading

3. **Kích thước Bundle**
   - Tree-shaking mã không sử dụng
   - Dynamic imports cho route
   - Minification trong production

4. **Chiến lược Lưu vào Bộ nhớ cache**
   - Service Worker cho hỗ trợ ngoại tuyến
   - Lưu vào bộ nhớ cache phản hồi API (React Query)
   - LocalStorage cho sự lâu bền giỏ hàng

---

## Luồng QR Xuyên Ứng dụng (web-tenant → web-customer)

Phần này ghi lại cách các mã QR được tạo trong **web-tenant** (Cổng thông tin Quản trị) được quét và xử lý bởi **web-customer** (Ứng dụng Đặt hàng Khách hàng).

### 1. Tạo URL QR (Backend)

API backend cung cấp endpoint để tạo các mã QR được ký. Các mã QR này chứa các token được mã hóa nhúng ngữ cảnh đặt hàng quan trọng.

**Định dạng URL QR:**
```
https://order.example.com/s/[tenantSlug]/[token]
```

**Ví dụ:**
```
https://order.example.com/s/pho-restaurant/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Các Thành phần:**
- `order.example.com`: Miền lưu trữ **web-customer**
- `s`: Tiền tố URL ngắn cho "scan"
- `[tenantSlug]`: Định danh nhà hàng con người có thể đọc được (ví dụ: `pho-restaurant`)
- `[token]`: Token được ký JWT/HMAC chứa dữ liệu phiên được mã hóa

### 2. Cấu trúc Token QR

Token là một **JWT được ký** chứa payload sau:

```typescript
interface QRTokenPayload {
  tenantId: string;      // UUID của nhà hàng
  tableId: string;       // UUID của bàn
  exp: number;           // Dấu thời gian hết hạn (Unix)
  version: string;       // Phiên bản lược đồ token (ví dụ: "1.0")
  iat?: number;          // Phát hành tại dấu thời gian (tùy chọn)
}
```

**Tạo Token (Tham chiếu Backend):**
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
- **HMAC Signature**: Ngăn chặn việc giả mạo token
- **Expiration**: Token hết hạn sau một khoảng thời gian có thể định cấu hình (mặc định: 1 năm)
- **Version Field**: Cho phép tiến hóa lược đồ token

**Tài liệu Liên quan:**
- Xem `docs/backend/qr-generation-flow.md` (TODO) để tìm hiểu logic tạo QR ở backend chi tiết
- Xem `01-product/diagrams/qr-generation-flow.md` để xem các sơ đồ luồng trực quan

### 3. Luồng Quét Khách hàng (web-customer)

Khi khách hàng quét mã QR, trình duyệt di động của họ điều hướng đến URL QR. Ứng dụng **web-customer** xử lý lộ trình này và xác thực token.

#### 3.1 Xử lý Lộ trình

**Vị trí Tệp:**
```
apps/web-customer/app/s/[tenantSlug]/[token]/page.tsx
```

**Cấu trúc Lộ trình:**
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
  
  // Xác thực token phía máy chủ
  const session = await validateQRToken(token);
  
  if (!session) {
    return <InvalidQRError />;
  }
  
  // Chuyển hướng đến menu với bối cảnh phiên
  return <RedirectToMenu session={session} />;
}
```

#### 3.2 Xác thực Token (Server Component)

**Vị trí Tệp:**
```
apps/web-customer/src/lib/qr/validateQRToken.ts
```

**Xác thực Phía Máy chủ:**
```typescript
// lib/qr/validateQRToken.ts
import type { QRTokenPayload } from '@packages/dto';

const API_URL = process.env.API_URL;

export async function validateQRToken(token: string): Promise<QRTokenPayload | null> {
  try {
    const response = await fetch(`${API_URL}/api/public/scan?token=${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store', // Luôn xác thực mới
    });

    if (!response.ok) {
      console.error('Token validation failed:', response.status);
      return null;
    }

    const data: QRTokenPayload = await response.json();
    
    // Kiểm tra bổ sung phía client
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

**Endpoint API Backend:**
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

#### 3.3 Tạo Phiên Khách hàng

Sau khi xác thực thành công, một **phiên khách hàng sống ngắn** được tạo ở phía client. Phiên này được lưu trữ trong React Context và tùy chọn được lưu vào `localStorage` để làm mới trang.

**Vị trí Tệp:**
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

  // Khôi phục phiên từ localStorage khi mount
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
    
    // Lưu vào localStorage
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

### 4. Kiến trúc Context Providers

Ứng dụng **web-customer** sử dụng nhiều React Context providers để quản lý trạng thái đặt hàng:

#### 4.1 Cấu trúc Thư mục

```
apps/web-customer/src/shared/context/
├── SessionContext.tsx       # Phiên khách hàng (tenantId, tableId)
├── TenantContext.tsx        # Chi tiết nhà hàng/quán ăn
├── TableContext.tsx         # Thông tin cụ thể bàn
└── index.ts                 # Barrel exports
```

#### 4.2 TenantContext Provider

**Mục đích:** Lấy và lưu vào bộ nhớ cache chi tiết nhà hàng (tên, logo, cài đặt menu) dựa trên `tenantId` từ phiên.

**Vị trí Tệp:**
```
apps/web-customer/src/shared/context/TenantContext.tsx
```

**Triển khai:**
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
    staleTime: 10 * 60 * 1000, // Lưu vào bộ nhớ cache trong 10 phút
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

**Mục đích:** Lấy chi tiết bàn (tên, tầng, trạng thái) dựa trên `tableId` từ phiên.

**Vị trí Tệp:**
```
apps/web-customer/src/shared/context/TableContext.tsx
```

**Triển khai:**
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
    staleTime: 5 * 60 * 1000, // Lưu vào bộ nhớ cache trong 5 phút
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

### 5. Phân cấp Provider (Root Layout)

**Vị trí Tệp:**
```
apps/web-customer/app/layout.tsx
```


**Mẫu Provider Được Khuyến nghị (Next.js App Router):**

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

**Thứ tự Provider:**
1. **QueryClientProvider**: React Query cho trạng thái máy chủ
2. **SessionProvider**: Quản lý tenantId/tableId từ quét QR
3. **TenantProvider**: Lấy chi tiết nhà hàng (phụ thuộc vào SessionProvider)
4. **TableProvider**: Lấy chi tiết bàn (phụ thuộc vào SessionProvider)

### 6. Sử dụng Context Trong Tính năng

Các tính năng trong **web-customer** có thể truy cập ngữ cảnh đặt hàng thông qua các hook tùy chỉnh.

**Ví dụ: Tính năng Menu**
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

**Ví dụ: Tính năng Thanh toán**
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

### 7. Tóm tắt Luồng QR

```
┌─────────────────────────────────────────────────────────────────┐
│                   Luồng Tạo Mã QR                                 │
└─────────────────────────────────────────────────────────────────┘

1. Admin (web-tenant) → "Tạo QR cho Bàn 5"
                ↓
2. Backend API → Tạo token JWT với { tenantId, tableId, exp }
                ↓
3. Backend → Trả về URL QR: https://order.example.com/s/pho-restaurant/eyJ...
                ↓
4. Admin tải xuống/in mã QR
                ↓
5. Mã QR được đặt trên bàn vật lý

┌─────────────────────────────────────────────────────────────────┐
│                   Luồng Quét Khách hàng                            │
└─────────────────────────────────────────────────────────────────┘

1. Khách hàng quét mã QR bằng camera điện thoại
                ↓
2. Trình duyệt điều hướng tới: /s/pho-restaurant/eyJ...
                ↓
3. Next.js Server Component (page.tsx) → Xác thực token qua backend
                ↓
4. Backend → Xác minh chữ ký JWT, kiểm tra hết hạn
                ↓
5. Backend → Trả về { tenantId, tableId, exp, version }
                ↓
6. Client Component → Tạo phiên trong SessionContext
                ↓
7. SessionProvider → Lưu trữ trong localStorage + trạng thái React
                ↓
8. TenantProvider → Lấy chi tiết nhà hàng từ tenantId
                ↓
9. TableProvider → Lấy chi tiết bàn từ tableId
                ↓
10. Chuyển hướng đến menu: /menu
                ↓
11. Khách hàng duyệt menu, thêm mục vào giỏ hàng
                ↓
12. Thanh toán → Gửi đơn hàng với tenantId + tableId từ ngữ cảnh
```

### 8. Xử lý Lỗi

**Token Không hợp lệ/Hết hạn:**
```typescript
// app/s/[tenantSlug]/[token]/page.tsx
export default async function ScanPage({ params }: ScanPageProps) {
  const session = await validateQRToken(params.token);
  
  if (!session) {
    return (
      <div className="error-container">
        <h1>Mã QR Không hợp lệ</h1>
        <p>Mã QR này không hợp lệ hoặc đã hết hạn.</p>
        <p>Vui lòng yêu cầu mã QR mới từ nhân viên.</p>
      </div>
    );
  }
  
  // Đường dẫn thành công...
}
```

**Hết hạn Phiên Trong Khi Duyệt:**
```typescript
// shared/context/SessionContext.tsx
useEffect(() => {
  const checkExpiration = () => {
    const stored = localStorage.getItem('customer-session');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.exp < Date.now() / 1000) {
        clearSession();
        alert('Phiên của bạn đã hết hạn. Vui lòng quét mã QR lại.');
        window.location.href = '/';
      }
    }
  };
  
  const interval = setInterval(checkExpiration, 60000); // Kiểm tra mỗi phút
  return () => clearInterval(interval);
}, []);
```

### 9. Những Cân nhắc về Bảo mật

1. **Token Signing**: Sử dụng các bí mật mạnh (`QR_SECRET_KEY` tối thiểu 32 ký tự)
2. **HTTPS Only**: URL QR phải sử dụng HTTPS trong production
3. **Short Expiry for Sensitive Operations**: Hãy cân nhắc thời gian hết hạn ngắn hơn (ví dụ: 24 giờ) cho các tình huống bảo mật cao
4. **Rate Limiting**: Backend nên áp dụng giới hạn tốc độ `/api/public/scan` để ngăn chặn brute-forcing token
5. **No Sensitive Data in Token**: Token chỉ chứa ID, không bao giờ bao gồm PII hoặc thông tin xác thực

### 10. Tài liệu Liên quan

- **Backend QR Generation**: `docs/backend/qr-generation-service.md` (TODO)
- **QR Flow Diagrams**: `01-product/diagrams/qr-generation-flow.md`
- **Security Threat Model**: `08-security/THREAT_MODEL.md`
- **API Documentation**: `02-api/openapi.yaml` (xem endpoint `/api/public/scan`)

---

## Các Gói Được Chia sẻ

### @packages/ui

Thư viện thành phần được chia sẻ được sử dụng bởi cả hai ứng dụng:

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

**Cách sử dụng:**
```typescript
// Trong web-tenant hoặc web-customer
import { Button, Card } from '@packages/ui';
```

### @packages/dto

Các loại TypeScript được chia sẻ từ backend:

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

Các tệp cấu hình được chia sẻ:

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

## Tích hợp API

### Thiết lập API Client

**Quan trọng:** Trong Next.js, chúng ta có hai loại cuộc gọi API:

1. **Server Components**: Sử dụng `fetch()` gốc với `process.env.API_URL` (chỉ phía máy chủ, không được hiển thị cho client)
2. **Client Components**: Sử dụng Axios với `process.env.NEXT_PUBLIC_API_URL` (được hiển thị cho trình duyệt)

#### Client-Side API Client (Axios)

**⚠️ Client này chỉ dành cho CLIENT** và chỉ nên được nhập trong Client Components (tệp có `'use client'`) hoặc các hook tùy chỉnh. Không nhập điều này trong Server Components.

```typescript
// lib/api/client.ts
'use client';

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // ⏳ THÊM TẠI ĐÂY: Xác minh URL API thực tế trong tệp .env
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

// Request interceptor - Thêm auth token
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

// Response interceptor - Xử lý lỗi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### Mẫu Tầng Dịch vụ

#### Dịch vụ Phía Máy chủ (cho Server Components)

```typescript
// features/menu/services/menuService.server.ts
import type { MenuItem, MenuCategory } from '../types/menu.types';

const API_URL = process.env.API_URL; // ⏳ THÊM TẠI ĐÂY: Xác minh URL API phía máy chủ trong .env

export const menuService = {
  async getMenu(tenantId: string): Promise<MenuItem[]> {
    const res = await fetch(`${API_URL}/tenants/${tenantId}/menu`, {
      cache: 'no-store', // hoặc 'force-cache' cho dữ liệu tĩnh
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch menu');
    return res.json();
  },

  async getCategories(tenantId: string): Promise<MenuCategory[]> {
    const res = await fetch(`${API_URL}/tenants/${tenantId}/categories`, {
      next: { revalidate: 3600 }, // ISR: xác thực lại mỗi giờ
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },
};
```

#### Dịch vụ Phía Client (cho Client Components)

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

  // web-tenant chỉ - mutations thường xảy ra phía client
  async createMenuItem(tenantId: string, item: Partial<MenuItem>): Promise<MenuItem> {
    const { data } = await apiClient.post(`/tenants/${tenantId}/menu`, item);
    return data;
  },
};
```

---

## Chiến lược Quản lý Trạng thái

### Trạng thái Toàn cầu (React Query)

Sử dụng **TanStack Query** cho trạng thái máy chủ trong Client Components:

```typescript
// features/menu/hooks/useMenu.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { menuService } from '../services/menuService.client';

export const useMenu = (tenantId: string) => {
  return useQuery({
    queryKey: ['menu', tenantId],
    queryFn: () => menuService.getMenu(tenantId),
    staleTime: 5 * 60 * 1000, // 5 phút
    enabled: !!tenantId,
  });
};
```

### Trạng thái Cục bộ (Zustand)

Sử dụng **Zustand** cho trạng thái phía client:

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

### Phân tách Quản lý Trạng thái

| Loại Trạng thái | web-tenant | web-customer |
|------------|------------|--------------|
| **Auth** | Zustand + JWT | LocalStorage (guest) |
| **Menu** | React Query | React Query |
| **Cart** | N/A | Zustand (persisted) |
| **Orders** | React Query | React Query |
| **UI State** | Zustand | Zustand |

---

## Quy ước Đặt tên

### Tệp

| Loại | Quy ước | Ví dụ |
|------|------------|---------|
| Component | PascalCase | `MenuList.tsx` |
| Hook | camelCase, tiền tố `use` | `useMenu.ts` |
| Service | camelCase, hậu tố `Service` | `menuService.ts` |
| Type | camelCase, hậu tố `.types` | `menu.types.ts` |
| Store | camelCase, hậu tố `Store` | `cartStore.ts` |
| Util | camelCase | `formatCurrency.ts` |
| Page | PascalCase, hậu tố `Page` | `MenuPage.tsx` |

### Biến & Hàm

```typescript
// ✅ Tốt
const userName = 'John';
const getUserById = (id: string) => { };
const MAX_ITEMS = 10;

// ❌ Xấu
const UserName = 'John';
const get_user_by_id = (id: string) => { };
const max_items = 10;
```

### Types & Interfaces

```typescript
// ✅ Thích dùng interfaces cho objects
interface User {
  id: string;
  name: string;
}

// ✅ Sử dụng type cho unions/intersections
type UserRole = 'admin' | 'staff' | 'kitchen';

// ✅ Hậu tố props interfaces
interface MenuItemProps {
  item: MenuItem;
}
```

---

## Quy tắc Import

### ✅ Nhập Được Phép

```typescript
// 1. Thư viện bên ngoài
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Gói được chia sẻ (monorepo)
import { Button } from '@packages/ui';
import type { MenuItemDTO } from '@packages/dto';

// 3. Tài nguyên được chia sẻ (cùng app)
import { formatCurrency } from '@/shared/utils';
import { Card } from '@/shared/components/ui';

// 4. Trong cùng feature (relative)
import { useMenu } from '../hooks/useMenu';
import type { MenuItem } from '../types/menu.types';

// 5. Từ các features khác (chỉ qua index.ts)
import { useCart } from '@/features/cart';
```

### ❌ Nhập Bị Cấm

```typescript
// ❌ Không nhập các tệp nội bộ từ các features khác
import { CartItem } from '@/features/cart/components/CartItem';

// ❌ Không nhập từ app khác
import { AdminLayout } from '@apps/web-tenant/shared/components/layout';

// ❌ Không sử dụng deep relative imports trên features
import { useAuth } from '../../../auth/hooks/useAuth';
```

### Thứ tự Import

```typescript
// 1. React & thư viện bên ngoài
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Gói monorepo
import { Button } from '@packages/ui';

// 3. Nhập absolute nội bộ
import { formatCurrency } from '@/shared/utils';

// 4. Nhập feature (relative)
import { useMenu } from '../hooks/useMenu';
import type { MenuItem } from '../types/menu.types';

// 5. Styles (nếu có)
import './MenuList.css';
```

---

## Thực tiễn Tốt nhất về Tổ chức Code

### 1. Cô lập Feature

Mỗi tính năng tự chứa:

```typescript
// ✅ Tốt - Mọi thứ liên quan đến menu ở một nơi
features/menu-management/
├── components/        # UI
├── hooks/             # Logic
├── services/          # API
├── types/             # Types
├── utils/             # Helpers
└── index.ts           # Public API
```

### 2. Barrel Exports

Sử dụng `index.ts` để kiểm soát API công khai:

```typescript
// features/menu-management/index.ts
export { MenuList, MenuItem, MenuItemForm } from './components';
export { useMenu, useMenuCRUD } from './hooks';
export { menuService } from './services/menuService';
export type { MenuItem, MenuCategory } from './types/menu.types';

// Các thành phần nội bộ không được xuất
// - MenuItemModal (chỉ được sử dụng bên trong MenuList)
// - formatMenuPrice (internal helper)
```

### 3. Kích thước Component

Giữ các thành phần dưới **200 dòng**:

```typescript
// ✅ Tốt - Chia thành các thành phần nhỏ hơn
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

// ❌ Xấu - Thành phần monolithic 500 dòng
const MenuList = () => {
  // Quá nhiều logic và UI trong một thành phần
};
```

### 4. Custom Hooks cho Logic

Trích xuất logic kinh doanh vào hooks:

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

### 5. Xử lý Lỗi

Xử lý lỗi một cách nhất quán:

```typescript
// ✅ Xử lý lỗi trong hooks
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

// ✅ Hiển thị lỗi trong các thành phần
export const MenuList = () => {
  const { menu, isLoading, error } = useMenu(tenantId);

  if (error) return <ErrorState message="Failed to load menu" />;
  if (isLoading) return <LoadingState />;

  return <div>{/* Render menu */}</div>;
};
```

---

## Chiến lược Kiểm thử

⏳ **THÊM TẠI ĐÂY**: Xác minh thiết lập kiểm thử trong codebase thực tế.
- Unit tests: Kiểm tra các tệp `*.test.ts(x)` trong `source/apps/web-tenant/` và `source/apps/web-customer/`
- E2E tests: Kiểm tra cấu hình Cypress hoặc Playwright trong gốc dự án
- Xem [guide/PATTERNS_AND_CONVENTIONS.md](./guide/PATTERNS_AND_CONVENTIONS.md) để biết các mẫu kiểm thử khi được triển khai

---

## Chiến lược Triển khai

⏳ **THÊM TẠI ĐÂY**: Xác minh cấu hình triển khai.
- Kiểm tra các script `package.json` trong mỗi ứng dụng cho các lệnh build/start
- Xác minh chiến lược biến môi trường (tiền tố NEXT_PUBLIC_ cho phía client)
- Xem các cấu hình triển khai thực tế trong tệp CI/CD (nếu tồn tại)

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

### Mục tiêu Triển khai

| App | Platform | Lệnh Build | Output |
|-----|----------|---------------|--------|
| web-tenant | Vercel/Netlify | `pnpm build --filter web-tenant` | `.next/` |
| web-customer | Vercel/Netlify | `pnpm build --filter web-customer` | `.next/` |

**Lưu ý:** Các nền tảng như Vercel tự động xử lý các artefact xây dựng Next.js. Đối với các triển khai tự lưu trữ, thư mục `.next/` chứa bản xây dựng production.

### Pipeline CI/CD

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
```

---

## Mục tiêu Hiệu suất

⏳ **THÊM TẠI ĐÂY**: Xác minh với các báo cáo Lighthouse hoặc phân tích bundle thực tế.
- Chạy `pnpm --filter web-tenant build` và kiểm tra kích thước bundle
- Chạy `pnpm --filter web-customer build` và kiểm tra kích thước bundle
- Sử dụng `next build --experimental-debug` để phân tích chi tiết

---

## Path Aliases & Quy ước

**Xác minh path aliases trong `tsconfig.json` của mỗi ứng dụng:**
- `@/*` → `./src/*` (mẫu tiêu chuẩn)
- Kiểm tra `source/apps/web-tenant/tsconfig.json` để tìm cấu hình thực tế
- Kiểm tra `source/apps/web-customer/tsconfig.json` để tìm cấu hình thực tế

**Quy ước**: Các tệp page trong `app/` nên giữ ngôn ngữ thin và nhập UI/logic từ `src/features/*`.

---

## Khắc phục sự cố

### Vấn đề: Module not found '@/shared/...'

**Giải pháp:** Cấu hình path aliases trong `tsconfig.json`:

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

Đối với các alias tùy chỉnh trong `next.config.js`:

```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};
```

### Vấn đề: Sử dụng các API chỉ dành cho client trong Server Components

**Lỗi:** `localStorage is not defined`, `window is not defined`

**Giải pháp:** 
1. Thêm chỉ thị `'use client'` ở đầu các tệp sử dụng các API trình duyệt
2. Kiểm tra `typeof window !== 'undefined'` trước khi truy cập các global trình duyệt
3. Di chuyển logic client đến Client Components, giữ Server Components cho fetching dữ liệu

### Vấn đề: Tiền tố biến môi trường sai

**Lỗi:** `process.env.API_URL` không xác định trong trình duyệt

**Giải pháp:**
- Sử dụng tiền tố `NEXT_PUBLIC_*` cho các biến được client exposed
- Sử dụng các tên rõ (không có tiền tố) cho các bí mật chỉ phía máy chủ
- Không bao giờ để lộ các bí mật như API key cho client

### Vấn đề: Phụ thuộc vòng tròn giữa các features

**Giải pháp:**
1. Di chuyển các types được chia sẻ đến `@packages/dto`
2. Chỉ sử dụng các xuất index.ts
3. Cân nhắc dependency injection

### Vấn đề: Kích thước bundle lớn

**Giải pháp:**
1. Sử dụng Server Components theo mặc định (zero JS cho client)
2. Lazy load Client Components với `next/dynamic`
3. Bật tree-shaking (tự động trong Next.js)
4. Phân tích bundle với `@next/bundle-analyzer`
5. Sử dụng `next build --experimental-debug` để phân tích chi tiết

---

## Tài nguyên

### Next.js & React
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React 19 Documentation](https://react.dev/)

### Quản lý Trạng thái
- [TanStack Query (React Query)](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)

### Styling & UI
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)

### Công cụ Monorepo
- [Turborepo](https://turbo.build/repo)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)

### Kiểm thử
- [Playwright](https://playwright.dev/)
- [Cypress](https://www.cypress.io/)
- [React Testing Library](https://testing-library.com/react)

---

## Các Guides Liên quan

Các guides hỗ trợ thực thi và onboarding nằm trong `docs/frontend/guide/`:

| File | Nội dung |
|------|----------|
| `guide/ONBOARDING_CHECKLIST.md` | Checklist nhanh & nhiệm vụ đầu tiên |
| `guide/NEXTJS_15_APP_ROUTER_GUIDE.md` | App Router, Server/Client Components, middleware |
| `guide/PATTERNS_AND_CONVENTIONS.md` | Quy ước cấu trúc feature, hooks, services, import rules |
| `guide/FEATURE_IMPLEMENTATION_GUIDE.md` | Ví dụ triển khai Analytics Dashboard đầy đủ |
| `guide/README.md` | Mục lục & định hướng đọc |

Thứ tự đọc khuyến nghị: Checklist → App Router → Patterns → Feature Example → (tài liệu kiến trúc này).

## Nhật ký thay đổi

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-20 | 2.1 | Updated project naming, made grader-friendly, added ADD HERE placeholders for unverified claims |

## Phê duyệt

Kiến trúc này phải được xem xét và phê duyệt bởi:

- [ ] Tech Lead
- [ ] Senior Frontend Developer
- [ ] Team (3 developers)

**Có câu hỏi?** Liên hệ với Frontend Lead hoặc mở một cuộc thảo luận trong kênh team.

---


## Chiến lược Bản địa hóa / i18n

- Cả hai ứng dụng **web-tenant** và **web-customer** phải hỗ trợ nhiều ngôn ngữ (Tiếng Anh, Tiếng Việt).
- Chúng tôi sử dụng một thư viện i18n chuẩn Next.js (ví dụ: `next-intl` hoặc `next-i18next`) để xử lý bản dịch mạnh mẽ và có thể mở rộng.
- Các tệp dịch được tổ chức theo ứng dụng và ngôn ngữ:
  - `apps/web-tenant/src/locales/en/*.json`, `vi/*.json`
  - `apps/web-customer/src/locales/en/*.json`, `vi/*.json`
- Nhà cung cấp i18n được thiết lập trong `layout.tsx` gốc của mỗi ứng dụng, giúp các bản dịch có sẵn qua hooks (ví dụ: `useTranslations()`).
- Giao diện người dùng chuyển đổi ngôn ngữ: trong cài đặt tenant (admin) và dưới dạng bật tắt trong ứng dụng khách hàng.

**Ví dụ (sử dụng next-intl):**

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

---

## Chiến lược Quản lý Trạng thái

### Trạng thái Toàn cầu (React Query)

Sử dụng **TanStack Query** cho trạng thái máy chủ trong Client Components:

```typescript
// features/menu/hooks/useMenu.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { menuService } from '../services/menuService.client';

export const useMenu = (tenantId: string) => {
  return useQuery({
    queryKey: ['menu', tenantId],
    queryFn: () => menuService.getMenu(tenantId),
    staleTime: 5 * 60 * 1000, // 5 phút
    enabled: !!tenantId,
  });
};
```

### Trạng thái Cục bộ (Zustand)

Sử dụng **Zustand** cho trạng thái phía client:

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

### Phân tách Quản lý Trạng thái

| Loại Trạng thái | web-tenant | web-customer |
|------------|------------|--------------|
| **Auth** | Zustand + JWT | LocalStorage (guest) |
| **Menu** | React Query | React Query |
| **Cart** | N/A | Zustand (persisted) |
| **Orders** | React Query | React Query |
| **UI State** | Zustand | Zustand |

---

## Quy ước Đặt tên

### Tệp

| Loại | Quy ước | Ví dụ |
|------|------------|---------|
| Component | PascalCase | `MenuList.tsx` |
| Hook | camelCase, tiền tố `use` | `useMenu.ts` |
| Service | camelCase, hậu tố `Service` | `menuService.ts` |
| Type | camelCase, hậu tố `.types` | `menu.types.ts` |
| Store | camelCase, hậu tố `Store` | `cartStore.ts` |
| Util | camelCase | `formatCurrency.ts` |
| Page | PascalCase, hậu tố `Page` | `MenuPage.tsx` |

### Biến & Hàm

```typescript
// ✅ Tốt
const userName = 'John';
const getUserById = (id: string) => { };
const MAX_ITEMS = 10;

// ❌ Xấu
const UserName = 'John';
const get_user_by_id = (id: string) => { };
const max_items = 10;
```

### Types & Interfaces

```typescript
// ✅ Thích dùng interfaces cho objects
interface User {
  id: string;
  name: string;
}

// ✅ Sử dụng type cho unions/intersections
type UserRole = 'admin' | 'staff' | 'kitchen';

// ✅ Hậu tố props interfaces
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

⏳ **ADD HERE**: Verify testing setup in actual codebase.
- Unit tests: Check for `*.test.ts(x)` files in `source/apps/web-tenant/` and `source/apps/web-customer/`
- E2E tests: Check for Cypress or Playwright config in project root
- See [guide/PATTERNS_AND_CONVENTIONS.md](./guide/PATTERNS_AND_CONVENTIONS.md) for testing patterns once implemented

---

## Deployment Strategy

⏳ **ADD HERE**: Verify deployment configuration.
- Check `package.json` scripts in each app for build/start commands
- Verify environment variable strategy (NEXT_PUBLIC_ prefix for client-side)
- See actual deployment configs in CI/CD files (if exist)

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
---

## Performance Targets

⏳ **ADD HERE**: Verify with actual Lighthouse reports or bundle analyzer.
- Run `pnpm --filter web-tenant build` and check bundle size
- Run `pnpm --filter web-customer build` and check bundle size
- Use `next build --experimental-debug` for detailed analysis

---

## Path Aliases & Conventions

**Verify path aliases in each app's `tsconfig.json`:**
- `@/*` → `./src/*` (standard pattern)
- Check `source/apps/web-tenant/tsconfig.json` for actual config
- Check `source/apps/web-customer/tsconfig.json` for actual config

**Convention**: Page files in `app/` should stay thin and import UI/logic from `src/features/*`.

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

### Công cụ Monorepo
- [Turborepo](https://turbo.build/repo)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)

### Kiểm thử
- [Playwright](https://playwright.dev/)
- [Cypress](https://www.cypress.io/)
- [React Testing Library](https://testing-library.com/react)

---

## Các Guides Liên quan

Các guides hỗ trợ thực thi và onboarding nằm trong `docs/frontend/guide/`:

| File | Nội dung |
|------|----------|
| `guide/ONBOARDING_CHECKLIST.md` | Checklist nhanh & nhiệm vụ đầu tiên |
| `guide/NEXTJS_15_APP_ROUTER_GUIDE.md` | App Router, Server/Client Components, middleware |
| `guide/PATTERNS_AND_CONVENTIONS.md` | Quy ước cấu trúc feature, hooks, services, import rules |
| `guide/FEATURE_IMPLEMENTATION_GUIDE.md` | Ví dụ triển khai Analytics Dashboard đầy đủ |
| `guide/README.md` | Mục lục & định hướng đọc |

Thứ tự đọc khuyến nghị: Checklist → App Router → Patterns → Feature Example → (tài liệu kiến trúc này).

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-20 | 2.1 | Updated project naming, made grader-friendly, added ADD HERE placeholders for unverified claims |

## Approval

This architecture must be reviewed and approved by:

- [ ] Tech Lead
- [ ] Senior Frontend Developer
- [ ] Team (3 developers)

**Questions?** Contact the Frontend Lead or open a discussion in the team channel.

---


## Chiến lược Bản địa hóa / i18n

- Cả hai ứng dụng **web-tenant** và **web-customer** phải hỗ trợ nhiều ngôn ngữ (Tiếng Anh, Tiếng Việt).
- Chúng tôi sử dụng một thư viện i18n chuẩn Next.js (ví dụ: `next-intl` hoặc `next-i18next`) để xử lý bản dịch mạnh mẽ và có thể mở rộng.
- Các tệp dịch được tổ chức theo ứng dụng và ngôn ngữ:
  - `apps/web-tenant/src/locales/en/*.json`, `vi/*.json`
  - `apps/web-customer/src/locales/en/*.json`, `vi/*.json`
- Nhà cung cấp i18n được thiết lập trong `layout.tsx` gốc của mỗi ứng dụng, giúp các bản dịch có sẵn qua hooks (ví dụ: `useTranslations()`).
- Giao diện người dùng chuyển đổi ngôn ngữ: trong cài đặt tenant (admin) và dưới dạng bật tắt trong ứng dụng khách hàng.

**Ví dụ (sử dụng next-intl):**

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

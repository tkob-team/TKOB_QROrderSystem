# Ứng dụng Web-Tenant (Cổng quản lý Admin/Nhân viên)

**Vị trí Ứng dụng:** `source/apps/web-tenant/`  
**Mục đích:** Bảng điều khiển quản lý nhà hàng cho vai trò OWNER, STAFF, và KITCHEN  
**Tech Stack:** Next.js 15 (App Router), React 19, TailwindCSS v4

## Tổng quan

Ứng dụng Next.js 15 frontend để chủ nhà hàng và nhân viên quản lý menu, đơn hàng, bàn, phân tích, và tài khoản nhân viên. Bao gồm kiểm soát truy cập dựa trên vai trò (RBAC) cho các vai trò OWNER, STAFF, và KITCHEN.

## Khởi động Nhanh

```bash
pnpm --filter web-tenant dev
```

**Truy cập:** http://localhost:3002  
**Bằng chứng:** `source/apps/web-tenant/package.json` dòng 6: `"dev": "next dev -p 3002"`

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, TailwindCSS v4, Radix UI
- **State:** TanStack Query (server state), Zustand (client state)
- **API:** Orval code generation from OpenAPI spec
- **Auth:** Role-based access control (OWNER/STAFF/KITCHEN)

## Cấu trúc Thư mục

**Xác thực qua `ls source/apps/web-tenant/src/`:**

```
web-tenant/
├── public/                    # Tài sản tĩnh (hình ảnh, âm thanh)
├── src/
│   ├── app/                   # Next.js App Router (routes)
│   │   ├── (authenticated)/   # Nhóm routes được bảo vệ
│   │   ├── (marketing)/       # Routes marketing/public
│   │   ├── admin/             # Routes bảng điều khiển admin
│   │   ├── auth/              # Routes xác thực
│   │   ├── kds/               # Hệ thống hiển thị bếp
│   │   ├── menu/              # Routes liên quan menu
│   │   ├── staff/             # Routes dành cho nhân viên
│   │   ├── waiter/            # Routes dành cho phục vụ viên
│   │   ├── unauthorized/      # Trang từ chối truy cập
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Trang chủ
│   │   └── providers.tsx      # Client providers
│   │
│   ├── features/              # Các module tính năng (logic kinh doanh)
│   │   ├── analytics/         # Phân tích & báo cáo
│   │   ├── auth/              # Xác thực
│   │   ├── dashboard/         # Tổng quan bảng điều khiển
│   │   ├── kds/               # Hệ thống hiển thị bếp
│   │   ├── marketing/         # Các chiến dịch marketing
│   │   ├── menu/              # Quản lý menu
│   │   ├── menu-preview/      # Xem trước menu
│   │   ├── orders/            # Quản lý đơn hàng
│   │   ├── promotions/        # Khuyến mãi
│   │   ├── settings/          # Cài đặt
│   │   ├── staff/             # Quản lý nhân viên
│   │   ├── tables/            # Quản lý bàn
│   │   └── waiter/            # Tính năng phục vụ viên
│   │
│   ├── shared/                # Các thành phần/hook/utils được chia sẻ
│   ├── services/              # Các dịch vụ ngoài
│   ├── store/                 # Trạng thái toàn cục (Zustand)
│   ├── lib/                   # Các tiện ích & helper
│   ├── config/                # Cấu hình ứng dụng
│   ├── assets/                # Hình ảnh, fonts
│   ├── styles/                # Kiểu toàn cục
│   └── middleware.ts          # Next.js middleware (RBAC)
│
├── package.json
├── next.config.mjs
├── orval.config.ts            # Cấu hình tạo mã API
├── tsconfig.json
└── LOGGING_GUIDE.md           # Quy ước ghi nhật ký
```

## Các Tính năng Chính (Xác thực từ src/features/)

- **Authentication** - Đăng nhập, gán vai trò
- **Dashboard** - Tổng quan với phân tích
- **Menu Management** - CRUD cho các mục menu, danh mục, bộ chỉnh sửa
- **Order Management** - Xem/theo dõi đơn hàng, cập nhật trạng thái
- **Kitchen Display System (KDS)** - Xem đơn hàng bếp
- **Table Management** - Tạo/chỉnh sửa bàn, tạo mã QR
- **Staff Management** - Quản lý tài khoản và vai trò nhân viên
- **Analytics** - Báo cáo doanh thu, mục phổ biến
- **Waiter Module** - Giao diện lấy đơn hàng
- **Settings** - Cài đặt nhà hàng, quản lý đăng ký

## Kiểm soát Truy cập dựa trên Vai trò (RBAC)

Xem [RBAC_GUIDE.md](../RBAC_GUIDE.md) để biết đầy đủ quyền hạn vai trò và route guards.

**Vai trò:**
- **OWNER** - Truy cập đầy đủ tất cả các tính năng
- **STAFF** - Quản lý đơn hàng, xem menu
- **KITCHEN** - Chỉ hệ thống hiển thị bếp

**Middleware:** `src/middleware.ts` thực thi RBAC cho các routes được bảo vệ.

## Tạo Mã API (Orval)

Ứng dụng này sử dụng Orval để tạo clients API TypeScript từ spec OpenAPI.

**Lệnh:**
```bash
# Đồng bộ spec OpenAPI từ backend
pnpm --filter web-tenant sync-spec

# Tạo mã client API
pnpm --filter web-tenant orval

# Đồng bộ + Tạo (kết hợp)
pnpm --filter web-tenant codegen
```

Xem [ORVAL.md](../ORVAL.md) để biết cấu hình Orval chi tiết và cách sử dụng.

## Tài liệu Liên quan

- **Parent Docs:** [Frontend Overview](../README.md) - Tổng quan kiến trúc frontend
- **RBAC Guide:** [RBAC_GUIDE.md](../RBAC_GUIDE.md) - Chi tiết kiểm soát truy cập dựa trên vai trò
- **API Integration:** [ORVAL.md](../ORVAL.md) - Hướng dẫn tạo mã Orval
- **Architecture:** [ARCHITECTURE.md](../ARCHITECTURE.md) - Kiến trúc monorepo hoàn chỉnh
- **Logging:** `source/apps/web-tenant/LOGGING_GUIDE.md` - Quy ước ghi nhật ký
- **Developer Guides:** [guide/](../guide/) - Onboarding, patterns, quy ước

## Ghi chú Phát triển

### Biến Môi trường

⏳ **ADD HERE:** Tài liệu các biến môi trường bắt buộc.
- Kiểm tra `.env.example` trong `source/apps/web-tenant/.env.example`
- Các biến phổ biến: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`

**Xác thực:**
```bash
cat source/apps/web-tenant/.env.example
```

### Build & Deploy

```bash
# Phát triển
pnpm --filter web-tenant dev

# Production build
pnpm --filter web-tenant build

# Khởi động server production
pnpm --filter web-tenant start
```

**Bằng chứng:** Các lệnh được xác thực trong `source/apps/web-tenant/package.json` dòng 6-9.

## Tài nguyên Bổ sung

- **Features README:** `source/apps/web-tenant/src/features/README.md` - Hướng dẫn cấu trúc tính năng
- **Logging Guide:** `source/apps/web-tenant/LOGGING_GUIDE.md` - Các thực tiễn tốt nhất ghi nhật ký

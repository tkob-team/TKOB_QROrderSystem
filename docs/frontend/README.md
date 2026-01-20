# Tài liệu Frontend

**Dự án:** TKOB_QROrderSystem  
**Tech Stack:** Next.js 15, React (⏳ ADD HERE: verify version in source/apps/*/package.json), TypeScript, TailwindCSS (⏳ ADD HERE: verify version in source/apps/*/package.json)  
**Architecture:** Monorepo với 2 Ứng dụng (web-tenant, web-customer)

## Tổng quan

Frontend bao gồm **hai ứng dụng Next.js 15 riêng biệt** trong một monorepo pnpm workspace:

1. **web-tenant** - Cổng quản lý Admin/Nhân viên (desktop-first)
   - Quản lý menu, theo dõi đơn hàng, phân tích, quản lý bàn/QR
   - Kiểm soát truy cập dựa trên vai trò (OWNER, STAFF, KITCHEN)
   - Vị trí: `source/apps/web-tenant/`

2. **web-customer** - Ứng dụng đặt hàng khách hàng (mobile-first)
   - Quét mã QR, duyệt menu, giỏ hàng, thanh toán, theo dõi đơn hàng
   - Nhẹ và được tối ưu hóa cho thiết bị di động
   - Vị trí: `source/apps/web-customer/`

## Khởi động Nhanh

```bash
# Cài đặt dependencies tại thư mục gốc repo
pnpm install

# Chạy web-tenant (Admin Portal)
cd source/apps/web-tenant
pnpm dev
# Port: 3002 (verify in source/apps/web-tenant/package.json dev script)

# Chạy web-customer (Customer App) - trong terminal riêng
cd source/apps/web-customer
pnpm dev
# Port: 3001 (verify in source/apps/web-customer/package.json dev script)
```

## Cấu trúc Tài liệu

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Hướng dẫn kiến trúc hoàn chỉnh bao quát cả hai ứng dụng, cấu trúc monorepo, các lớp Clean Architecture, patterns routing, và các luồng chính
- **[RBAC_GUIDE.md](./RBAC_GUIDE.md)** - Kiểm soát truy cập dựa trên vai trò cho web-tenant
- **[ORVAL.md](./ORVAL.md)** - Tạo mã API với Orval (TypeScript client + React Query hooks)
- **[guide/](./guide/)** - Hướng dẫn cho nhà phát triển (onboarding, patterns, Next.js 15 App Router, ví dụ triển khai tính năng)
- **[web-customer/README.md](./web-customer/README.md)** - Chi tiết cụ thể của web-customer (xem bên dưới)
- **[web-tenant/README.md](./web-tenant/README.md)** - Chi tiết cụ thể của web-tenant (⏳ ADD HERE: create if doesn't exist)

## Chi tiết Cụ thể từng Ứng dụng

### Ứng dụng Web-Customer

Xem chi tiết triển khai web-customer tại [web-customer/README.md](./web-customer/README.md):
- Cấu trúc Clean Architecture (các lớp Presentation/Domain/Shared/Infrastructure)
- Tổ chức tính năng (landing, menu-view, cart, checkout, order-tracking)
- Quản lý trạng thái (TanStack Query cho server state, Zustand cho giỏ hàng)
- Context providers (SessionContext, TenantContext, TableContext)
- Luồng quét QR và xác thực token

### Ứng dụng Web-Tenant

Xem chi tiết triển khai web-tenant tại [web-tenant/README.md](./web-tenant/README.md), [ARCHITECTURE.md](./ARCHITECTURE.md), và [RBAC_GUIDE.md](./RBAC_GUIDE.md):
- Các module tính năng (auth, dashboard, menu-management, order-management, staff, tables)
- Route guards dựa trên vai trò
- Layout admin và điều hướng

## Mục lục Hướng dẫn (Tài liệu hướng dẫn bổ sung)

Các tài liệu chi tiết nằm trong thư mục `docs/frontend/guide/` giúp onboard và chuẩn hoá phát triển:

| Tệp | Nội dung |
|------|----------|
| [guide/README.md](./guide/README.md) | Mục lục & định hướng đọc |
| [guide/ONBOARDING_CHECKLIST.md](./guide/ONBOARDING_CHECKLIST.md) | Checklist vào dự án |
| [guide/NEXTJS_15_APP_ROUTER_GUIDE.md](./guide/NEXTJS_15_APP_ROUTER_GUIDE.md) | App Router & Server/Client Components |
| [guide/PATTERNS_AND_CONVENTIONS.md](./guide/PATTERNS_AND_CONVENTIONS.md) | Quy ước tổ chức code & patterns |
| [guide/FEATURE_IMPLEMENTATION_GUIDE.md](./guide/FEATURE_IMPLEMENTATION_GUIDE.md) | Ví dụ triển khai Analytics Dashboard |

Liên kết nhanh: [Guide Index](./guide/README.md) · [Checklist](./guide/ONBOARDING_CHECKLIST.md) · [App Router](./guide/NEXTJS_15_APP_ROUTER_GUIDE.md) · [Patterns](./guide/PATTERNS_AND_CONVENTIONS.md) · [Feature Example](./guide/FEATURE_IMPLEMENTATION_GUIDE.md) · [Architecture](./ARCHITECTURE.md)

---
**Last Updated:** 2026-01-20

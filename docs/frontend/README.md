# Frontend Documentation

**Project:** TKOB_QROrderSystem  
**Tech Stack:** Next.js 15, React (⏳ ADD HERE: verify version in source/apps/*/package.json), TypeScript, TailwindCSS (⏳ ADD HERE: verify version in source/apps/*/package.json)  
**Architecture:** Monorepo with 2 Apps (web-tenant, web-customer)

## Overview

The frontend consists of **two distinct Next.js 15 applications** in a pnpm workspace monorepo:

1. **web-tenant** - Admin/Staff management portal (desktop-first)
   - Menu management, order tracking, analytics, table/QR management
   - Role-based access control (OWNER, STAFF, KITCHEN)
   - Location: `source/apps/web-tenant/`

2. **web-customer** - Customer ordering app (mobile-first)
   - QR code scanning, menu browsing, cart, checkout, order tracking
   - Lightweight and optimized for mobile devices
   - Location: `source/apps/web-customer/`

## Quick Start

```bash
# Install dependencies at repo root
pnpm install

# Run web-tenant (Admin Portal)
cd source/apps/web-tenant
pnpm dev
# Port: 3002 (verify in source/apps/web-tenant/package.json dev script)

# Run web-customer (Customer App) - in separate terminal
cd source/apps/web-customer
pnpm dev
# Port: 3001 (verify in source/apps/web-customer/package.json dev script)
```

## Documentation Structure

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architectural guide covering both apps, monorepo structure, Clean Architecture layers, routing patterns, and key flows
- **[RBAC_GUIDE.md](./RBAC_GUIDE.md)** - Role-based access control for web-tenant
- **[ORVAL.md](./ORVAL.md)** - API code generation with Orval (TypeScript client + React Query hooks)
- **[guide/](./guide/)** - Developer guides (onboarding, patterns, Next.js 15 App Router, feature implementation examples)
- **[web-customer/README.md](./web-customer/README.md)** - Web-customer specific details (see below)
- **[web-tenant/README.md](./web-tenant/README.md)** - Web-tenant specific details (⏳ ADD HERE: create if doesn't exist)

## App-Specific Details

### Web-Customer App

For web-customer implementation details, see [web-customer/README.md](./web-customer/README.md):
- Clean Architecture structure (Presentation/Domain/Shared/Infrastructure layers)
- Feature organization (landing, menu-view, cart, checkout, order-tracking)
- State management (TanStack Query for server state, Zustand for cart)
- Context providers (SessionContext, TenantContext, TableContext)
- QR scanning flow and token validation

### Web-Tenant App

For web-tenant implementation details, see [web-tenant/README.md](./web-tenant/README.md), [ARCHITECTURE.md](./ARCHITECTURE.md), and [RBAC_GUIDE.md](./RBAC_GUIDE.md):
- Feature modules (auth, dashboard, menu-management, order-management, staff, tables)
- Role-based route guards
- Admin layout and navigation

## Guide Index (Tài liệu hướng dẫn bổ sung)

Các tài liệu chi tiết nằm trong thư mục `docs/frontend/guide/` giúp onboard và chuẩn hoá phát triển:

| File | Nội dung |
|------|----------|
| [guide/README.md](./guide/README.md) | Mục lục & định hướng đọc |
| [guide/ONBOARDING_CHECKLIST.md](./guide/ONBOARDING_CHECKLIST.md) | Checklist vào dự án |
| [guide/NEXTJS_15_APP_ROUTER_GUIDE.md](./guide/NEXTJS_15_APP_ROUTER_GUIDE.md) | App Router & Server/Client Components |
| [guide/PATTERNS_AND_CONVENTIONS.md](./guide/PATTERNS_AND_CONVENTIONS.md) | Quy ước tổ chức code & patterns |
| [guide/FEATURE_IMPLEMENTATION_GUIDE.md](./guide/FEATURE_IMPLEMENTATION_GUIDE.md) | Ví dụ triển khai Analytics Dashboard |

Liên kết nhanh: [Guide Index](./guide/README.md) · [Checklist](./guide/ONBOARDING_CHECKLIST.md) · [App Router](./guide/NEXTJS_15_APP_ROUTER_GUIDE.md) · [Patterns](./guide/PATTERNS_AND_CONVENTIONS.md) · [Feature Example](./guide/FEATURE_IMPLEMENTATION_GUIDE.md) · [Architecture](./ARCHITECTURE.md)

---
**Last Updated:** 2026-01-20

# Web-Tenant App (Admin/Staff Portal)

**App Location:** `source/apps/web-tenant/`  
**Purpose:** Restaurant management dashboard for OWNER, STAFF, and KITCHEN roles  
**Tech Stack:** Next.js 15 (App Router), React 19, TailwindCSS v4

## Overview

Frontend Next.js 15 application for restaurant owners and staff to manage menus, orders, tables, analytics, and staff accounts. Includes role-based access control (RBAC) for OWNER, STAFF, and KITCHEN roles.

## Quick Start

```bash
pnpm --filter web-tenant dev
```

**Access:** http://localhost:3002  
**Evidence:** `source/apps/web-tenant/package.json` line 6: `"dev": "next dev -p 3002"`

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, TailwindCSS v4, Radix UI
- **State:** TanStack Query (server state), Zustand (client state)
- **API:** Orval code generation from OpenAPI spec
- **Auth:** Role-based access control (OWNER/STAFF/KITCHEN)

## Folder Structure

**Verified via `ls source/apps/web-tenant/src/`:**

```
web-tenant/
├── public/                    # Static assets (images, sounds)
├── src/
│   ├── app/                   # Next.js App Router (routes)
│   │   ├── (authenticated)/   # Protected routes group
│   │   ├── (marketing)/       # Marketing/public routes
│   │   ├── admin/             # Admin dashboard routes
│   │   ├── auth/              # Authentication routes
│   │   ├── kds/               # Kitchen Display System
│   │   ├── menu/              # Menu-related routes
│   │   ├── staff/             # Staff-specific routes
│   │   ├── waiter/            # Waiter-specific routes
│   │   ├── unauthorized/      # Access denied page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── providers.tsx      # Client providers
│   │
│   ├── features/              # Feature modules (business logic)
│   │   ├── analytics/         # Analytics & reports
│   │   ├── auth/              # Authentication
│   │   ├── dashboard/         # Dashboard overview
│   │   ├── kds/               # Kitchen Display System
│   │   ├── marketing/         # Marketing campaigns
│   │   ├── menu/              # Menu management
│   │   ├── menu-preview/      # Menu preview
│   │   ├── orders/            # Order management
│   │   ├── promotions/        # Promotions
│   │   ├── settings/          # Settings
│   │   ├── staff/             # Staff management
│   │   ├── tables/            # Table management
│   │   └── waiter/            # Waiter features
│   │
│   ├── shared/                # Shared components/hooks/utils
│   ├── services/              # External services
│   ├── store/                 # Global state (Zustand)
│   ├── lib/                   # Utilities & helpers
│   ├── config/                # App configuration
│   ├── assets/                # Images, fonts
│   ├── styles/                # Global styles
│   └── middleware.ts          # Next.js middleware (RBAC)
│
├── package.json
├── next.config.mjs
├── orval.config.ts            # API code generation config
├── tsconfig.json
└── LOGGING_GUIDE.md           # Logging conventions
```

## Key Features (Verified from src/features/)

- **Authentication** - Login, role assignment
- **Dashboard** - Overview with analytics
- **Menu Management** - CRUD for menu items, categories, modifiers
- **Order Management** - View/track orders, update status
- **Kitchen Display System (KDS)** - Kitchen order view
- **Table Management** - Create/edit tables, generate QR codes
- **Staff Management** - Manage staff accounts and roles
- **Analytics** - Revenue reports, popular items
- **Waiter Module** - Order taking interface
- **Settings** - Restaurant settings, subscription management

## Role-Based Access Control (RBAC)

See [RBAC_GUIDE.md](../RBAC_GUIDE.md) for complete role permissions and route guards.

**Roles:**
- **OWNER** - Full access to all features
- **STAFF** - Order management, menu viewing
- **KITCHEN** - Kitchen Display System only

**Middleware:** `src/middleware.ts` enforces RBAC for protected routes.

## API Code Generation (Orval)

This app uses Orval to generate TypeScript API clients from OpenAPI spec.

**Commands:**
```bash
# Sync OpenAPI spec from backend
pnpm --filter web-tenant sync-spec

# Generate API client code
pnpm --filter web-tenant orval

# Sync + Generate (combined)
pnpm --filter web-tenant codegen
```

See [ORVAL.md](../ORVAL.md) for detailed Orval configuration and usage.

## Related Documentation

- **Parent Docs:** [Frontend Overview](../README.md) - Frontend architecture overview
- **RBAC Guide:** [RBAC_GUIDE.md](../RBAC_GUIDE.md) - Role-based access control details
- **API Integration:** [ORVAL.md](../ORVAL.md) - Orval code generation guide
- **Architecture:** [ARCHITECTURE.md](../ARCHITECTURE.md) - Complete monorepo architecture
- **Logging:** `source/apps/web-tenant/LOGGING_GUIDE.md` - Logging conventions
- **Developer Guides:** [guide/](../guide/) - Onboarding, patterns, conventions

## Development Notes

### Environment Variables

⏳ **ADD HERE:** Document required environment variables.
- Check `.env.example` in `source/apps/web-tenant/.env.example`
- Common vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`

**Verification:**
```bash
cat source/apps/web-tenant/.env.example
```

### Build & Deploy

```bash
# Development
pnpm --filter web-tenant dev

# Production build
pnpm --filter web-tenant build

# Start production server
pnpm --filter web-tenant start
```

**Evidence:** Commands verified in `source/apps/web-tenant/package.json` lines 6-9.

## Additional Resources

- **Features README:** `source/apps/web-tenant/src/features/README.md` - Feature structure guide
- **Logging Guide:** `source/apps/web-tenant/LOGGING_GUIDE.md` - Logging best practices

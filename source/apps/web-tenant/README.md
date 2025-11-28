# Web Tenant App

Admin/Staff portal for restaurant management built with Next.js 15 App Router.

## Features

- 🔐 Authentication & RBAC (Role-Based Access Control)
- 📊 Dashboard with analytics and overview
- 🍽️ Menu management (CRUD operations)
- 🪑 Table management & QR code generation
- 📦 Order management & Kitchen Display System (KDS)
- 👥 Staff management

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, TailwindCSS
- **State Management**: Zustand (UI state), TanStack Query (server state)
- **API Client**: Axios
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your API URL
```

### Development

```bash
# Start development server (runs on port 3002)
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

Following **Next.js 15 App Router** + **Clean Architecture** principles:

```
web-tenant/
├── src/
│   ├── app/                           # Next.js 15 App Router (Presentation Layer)
│   │   ├── (auth)/                    # Route group: Authentication pages
│   │   │   ├── login/page.tsx         # Thin wrapper → imports from features/auth
│   │   │   ├── signup/page.tsx
│   │   │   ├── email-verification/page.tsx
│   │   │   └── onboarding/page.tsx
│   │   │
│   │   ├── (admin)/                   # Route group: Protected admin routes
│   │   │   ├── layout.tsx             # Admin layout with navigation
│   │   │   ├── dashboard/page.tsx     # Each page imports from features/
│   │   │   ├── menu/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   └── tables/page.tsx
│   │   │
│   │   ├── api/                       # API routes (if needed for BFF pattern)
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Home page with auth redirect
│   │   └── providers.tsx              # Client-side providers wrapper
│   │
│   ├── features/                  # Feature Modules (Domain Layer)
│   │   │                          # Each feature is self-contained
│   │   ├── auth/
│   │   │   ├── components/        # Feature-specific UI components
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Signup.tsx
│   │   │   │   └── EmailVerification.tsx
│   │   │   ├── hooks/             # Feature-specific hooks
│   │   │   ├── types/             # Feature types/interfaces
│   │   │   ├── api/               # Feature API calls
│   │   │   └── index.ts           # Public exports
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   └── Dashboard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── menu-management/
│   │   ├── order-management/
│   │   ├── tables/
│   │   └── staff/
│   │
│   ├── shared/                    # Shared/Common Layer
│   │   ├── components/
│   │   │   ├── ui/                # Reusable UI components (Button, Input, Card)
│   │   │   ├── layouts/           # Layout components
│   │   │   └── auth/              # Shared auth components (RoleGuard)
│   │   ├── hooks/                 # Shared custom hooks
│   │   ├── utils/                 # Helper/utility functions
│   │   ├── types/                 # Shared TypeScript types
│   │   └── context/               # Global React contexts (AuthContext)
│   │
│   ├── lib/                       # Infrastructure Layer
│   │   ├── api/                   # API client configuration
│   │   │   ├── axios.ts           # Axios instance
│   │   │   └── endpoints.ts       # API endpoint definitions
│   │   ├── providers/             # Provider configurations
│   │   └── router/                # Router utilities
│   │
│   ├── store/                     # Global State Management
│   │   └── (Zustand stores)       # UI state, cached data
│   │
│   └── styles/                    # Global Styles
│       └── globals.css            # Tailwind + custom CSS
│
├── public/                        # Static Assets
│   ├── icons/
│   └── images/
│
└── package.json

```

### Architecture Principles

**Clean Architecture Layers:**

1. **Presentation Layer** (`app/`)
   - Thin page wrappers that only handle routing
   - Import feature components, no business logic
   - Handle Next.js specific concerns (metadata, layouts)

2. **Domain/Feature Layer** (`src/features/`)
   - Self-contained feature modules
   - Business logic and feature-specific UI
   - Can import from `shared/` and `lib/`

3. **Shared Layer** (`src/shared/`)
   - Reusable components, hooks, utilities
   - No feature-specific logic
   - Can be used by any feature

4. **Infrastructure Layer** (`src/lib/`)
   - API clients, providers, external service configs
   - Framework-agnostic when possible

**Data Flow:**
```
app/page.tsx → features/Feature.tsx → shared/components → lib/api
     ↓              ↓                       ↓                ↓
  Routing      Business Logic        UI Primitives    External APIs
```

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `JWT_SECRET`: Secret key for JWT authentication

## Authentication & RBAC

The app supports role-based access control with the following roles:
- **tenant-admin**: Full access to all features
- **manager**: Most admin features
- **kitchen**: Kitchen Display System only
- **server**: Order-taking and table management

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Project Architecture](../../docs/frontend/ARCHITECTURE.md)
- [API Documentation](../../docs/common/OPENAPI.md)

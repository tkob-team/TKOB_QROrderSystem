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

```
web-tenant/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication routes
│   │   └── login/
│   ├── (admin)/            # Admin routes (protected)
│   │   ├── dashboard/
│   │   ├── menu/
│   │   ├── tables/
│   │   └── orders/
│   ├── layout.tsx          # Root layout
│   └── providers.tsx       # Client providers
│
├── src/
│   ├── features/           # Feature modules
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── menu-management/
│   │   ├── tables/
│   │   └── order-management/
│   │
│   ├── shared/             # Shared resources
│   │   ├── components/     # Reusable components
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript types
│   │   └── context/        # React contexts
│   │
│   ├── lib/                # Core libraries
│   │   ├── api/            # API client
│   │   └── providers/      # React providers
│   │
│   ├── store/              # Global state (Zustand)
│   └── styles/             # Global styles
│
├── public/                 # Static assets
└── package.json
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

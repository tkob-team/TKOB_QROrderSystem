# Web Customer App

Mobile-first customer ordering application built with Next.js 15 App Router, following a Clean Architecture layout under `src/`.

## Features

- 📱 Mobile-first responsive design
- 🔍 QR code scanning for table identification
- 🍽️ Menu browsing with categories and search
- 🛒 Shopping cart with real-time updates
- 💳 Checkout and payment integration
- 📊 Real-time order tracking

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, TailwindCSS
- **State Management**: Zustand (cart), TanStack Query (server state)
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
# Start development server (runs on port 3001)
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
web-customer/
├── src/
│   ├── app/                # Next.js App Router (pages, layouts, routes)
│   ├── features/           # Feature modules (UI + logic per feature)
│   ├── shared/             # Reusable components, hooks, context, utils, types
│   ├── lib/                # Core utilities; routes.ts for path constants
│   ├── store/              # Global state (Zustand)
│   ├── styles/             # Global styles & Tailwind setup
│   └── assets/             # Images, fonts, static assets
├── public/                 # Public static assets
└── package.json
```

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe public key (for payments)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Project Architecture](../../docs/frontend/ARCHITECTURE.md)
- [API Documentation](../../docs/common/OPENAPI.md)

## Conventions

- Path aliases: `@/*` → `./src/*`, `@/app/*` → `./src/app/*`.
- App Router only; legacy `src/pages/` is removed to avoid route conflicts.
- Keep page wrappers thin; implement UI logic within `src/features`.

## Routing Helpers

- Path constants: `src/lib/routes.ts` (e.g., `ROUTES.menu`)
- App Router helpers: `src/shared/hooks/useAppRouter.ts`

Usage example:

```ts
import { ROUTES } from "@/lib/routes";
import { useAppRouter } from "@/shared/hooks/useAppRouter";

const { goMenu } = useAppRouter();
goMenu(); // navigates to ROUTES.menu
```

## Tailwind CSS

- Tailwind v4 with PostCSS plugin `@tailwindcss/postcss`.
- Define global styles in `src/styles/globals.css`.

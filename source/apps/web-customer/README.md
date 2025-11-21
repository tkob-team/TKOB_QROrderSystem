# Web Customer App

Mobile-first customer ordering application built with Next.js 15 App Router.

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
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   ├── menu/               # Menu browsing
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout flow
│   └── tracking/           # Order tracking
│
├── src/
│   ├── features/           # Feature modules
│   │   ├── landing/
│   │   ├── menu-view/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── order-tracking/
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
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe public key (for payments)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Project Architecture](../../docs/frontend/ARCHITECTURE.md)
- [API Documentation](../../docs/common/OPENAPI.md)

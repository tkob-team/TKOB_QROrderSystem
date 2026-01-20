# Development Environment Setup Guide

> Complete guide to set up local development environment for **TKOB_QROrderSystem**.

- **Version**: 2.0
- **Last Updated**: 2026-01-20
- **Prerequisites**: Node.js 18+, Docker, pnpm 8+

---

## Quick Start (5 Minutes)

```bash
# 1. Install prerequisites: Node.js 18+, pnpm 8+, Docker
# 2. Clone repository
git clone ADD_HERE (example: git@github.com:your-org/TKOB_QROrderSystem.git)
cd TKOB_QROrderSystem

# 3. Install dependencies
pnpm install

# 4. Start database services
cd source/docker
docker compose up -d

# 5. Setup database (from api directory)
cd ../apps/api
cp .env.example .env
# Edit .env with your configuration
pnpm db:migrate
# Optional: pnpm db:reset (seeds subscription plans)

# 6. Start development servers
# Terminal 1 - API (port 3000)
cd source/apps/api
pnpm start:dev

# Terminal 2 - Customer App (port 3001)
cd source/apps/web-customer
cp .env.example .env
pnpm dev

# Terminal 3 - Tenant Dashboard (port 3002)
cd source/apps/web-tenant
cp .env.example .env
pnpm dev

# 7. Verify
# API: http://localhost:3000/health
# Swagger: http://localhost:3000/api-docs
# Customer: http://localhost:3001
# Tenant: http://localhost:3002
```

---

## Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Install Prerequisites](#2-install-prerequisites)
3. [Clone Repository](#3-clone-repository)
4. [Install Dependencies](#4-install-dependencies)
5. [Environment Configuration](#5-environment-configuration)
6. [Database Setup](#6-database-setup)
7. [Run Development Servers](#7-run-development-servers)
8. [Verify Setup](#8-verify-setup)
9. [Available Scripts](#9-available-scripts)
10. [IDE Setup](#10-ide-setup)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| **OS** | Windows 10/11, macOS 12+, Ubuntu 20.04+ |
| **RAM** | 8GB (16GB recommended) |
| **Disk** | 10GB free space |
| **CPU** | 4 cores (recommended) |

### Software Prerequisites

- **Node.js**: >= 18.0.0 (verified in package.json: `engines.node`)
- **pnpm**: >= 8.0.0 (package manager: `pnpm@10.23.0`)
- **Docker**: >= 24.x with Docker Compose
- **Git**: >= 2.30

---

## 2. Install Prerequisites

### 2.1. Node.js & pnpm

**Install Node.js** (via nvm - recommended):

```bash
# Linux/macOS
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
nvm alias default 20

# Windows: Download nvm-windows from GitHub
# https://github.com/coreybutler/nvm-windows/releases

# Verify
node --version  # v18.x.x or v20.x.x
npm --version
```

**Install pnpm**:

```bash
npm install -g pnpm

# Or via Corepack
corepack enable
corepack prepare pnpm@latest --activate

# Verify
pnpm --version  # 8.x.x or higher
```

### 2.2. Docker & Docker Compose

**Windows**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**macOS**:
```bash
brew install --cask docker
```

**Linux (Ubuntu/Debian)**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

---

## 3. Clone Repository

```bash
# Clone repository
git clone ADD_HERE (example: git@github.com:your-org/TKOB_QROrderSystem.git)
cd TKOB_QROrderSystem

# Verify workspace structure
ls -la
# Expected:
# - source/apps/       (api, web-customer, web-tenant)
# - source/packages/   (shared packages)
# - source/docker/     (docker-compose.yaml)
# - docs/             (documentation)
# - package.json      (workspace root)
# - pnpm-workspace.yaml
```

---

## 4. Install Dependencies

```bash
# From repository root
pnpm install

# This installs dependencies for all workspace packages:
# - source/apps/api
# - source/apps/web-customer
# - source/apps/web-tenant
# - source/packages/* (if any)
```

**Verify installation**:
```bash
pnpm list --depth=0
```

---

## 5. Environment Configuration

### 5.1. Docker Environment

```bash
cd source/docker
cp .env.example .env
```

**Edit `source/docker/.env`**:
```bash
# Database
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=qr_ordering_dev
DATABASE_PORT=5432

# Redis
REDIS_PORT=6379
```

### 5.2. API Environment

```bash
cd source/apps/api
cp .env.example .env
```

**Edit `source/apps/api/.env`** (see `.env.example` for full list):
```bash
# API
API_PORT=3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qr_ordering_dev"

# Logging
LOG_LEVEL=debug
NODE_ENV=development

# JWT
JWT_SECRET=ADD_HERE (example: your-secret-key-min-32-chars)
JWT_ACCESS_TOKEN_EXPIRES_IN=1h
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Email (SendGrid)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=ADD_HERE (optional for dev)
EMAIL_FROM=ADD_HERE (example: noreply@yourdomain.com)

# Storage
STORAGE_DRIVER=local
MAX_FILE_SIZE=5242880
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp,image/gif
```

### 5.3. Frontend Environments

**Customer App (`source/apps/web-customer/.env`)**:
```bash
cp source/apps/web-customer/.env.example source/apps/web-customer/.env
```

Edit:
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_USE_MOCK_API=false

# App
NEXT_PUBLIC_APP_NAME=TKOB Customer

# Logging (dev only)
NEXT_PUBLIC_USE_LOGGING=false
```

**Tenant Dashboard (`source/apps/web-tenant/.env`)**:
```bash
cp source/apps/web-tenant/.env.example source/apps/web-tenant/.env
```

Edit:
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CUSTOMER_APP_URL=http://localhost:3001

# App
NEXT_PUBLIC_APP_NAME=TKOB Tenant

# Auth
JWT_SECRET=ADD_HERE (same as API JWT_SECRET)

# WebSocket (optional)
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Logging (dev only)
NEXT_PUBLIC_USE_LOGGING=false
```

---

## 6. Database Setup

### 6.1. Start Database Services

```bash
# From source/docker directory
cd source/docker
docker compose up -d

# Verify services are running
docker compose ps

# Expected output:
# NAME              SERVICE    STATUS       PORTS
# tkob-db-dev       postgres   Up          0.0.0.0:5432->5432/tcp
# qr-redis-dev      redis      Up          0.0.0.0:6379->6379/tcp
```

### 6.2. Run Database Migrations

```bash
# From api directory
cd source/apps/api

# Generate Prisma Client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Verify migration status
pnpm prisma migrate status --config=./prisma/prisma.config.ts
```

### 6.3. Reset Database (Optional)

To reset database and seed subscription plans:

```bash
cd source/apps/api
pnpm db:reset

# This script (scripts/reset-db.ts):
# - Drops all data
# - Re-seeds subscription plans
# - Does NOT create demo users/tenants
```

**Note**: There is NO automatic seed script for demo tenants or users. You must create test data through the API or manually.

### 6.4. Prisma Studio (Database GUI)

```bash
cd source/apps/api
pnpm db:studio

# Opens at: http://localhost:5555
```

---

## 7. Run Development Servers

### Option 1: Run All Services (Recommended for beginners)

```bash
# From repository root
pnpm dev

# This runs "pnpm run --parallel dev" (from root package.json)
# Runs dev script in all workspaces that have it:
# - web-customer (port 3001)
# - web-tenant (port 3002)
# Note: API has "start:dev", not "dev", so it won't start with this command
```

### Option 2: Run Each Service Separately (Recommended for development)

**Terminal 1 - Backend API**:
```bash
cd source/apps/api
pnpm start:dev

# Runs on: http://localhost:3000
# API prefix: /api/v1
# Swagger: http://localhost:3000/api-docs (from main.ts line 102: SwaggerModule.setup('api-docs', ...))
```

**Terminal 2 - Customer App**:
```bash
cd source/apps/web-customer
pnpm dev

# Runs on: http://localhost:3001 (from package.json: "dev": "next dev -p 3001")
```

**Terminal 3 - Tenant Dashboard**:
```bash
cd source/apps/web-tenant
pnpm dev

# Runs on: http://localhost:3002 (from package.json: "dev": "next dev -p 3002")
```

---

## 8. Verify Setup

### 8.1. Health Checks

**API Health**:
```bash
curl http://localhost:3000/health

# Note: /health is excluded from /api/v1 prefix (see main.ts line 34: exclude: ['/health', '/'])
# Expected: {"status":"ok","timestamp":"..."}
```

**Database Connection**:
```bash
# Test PostgreSQL
docker exec -it tkob-db-dev psql -U postgres -d qr_ordering_dev -c "SELECT version();"

# Test Redis
docker exec -it qr-redis-dev redis-cli ping
# Expected: PONG
```

### 8.2. Access Applications

| Application | URL | Credentials |
|-------------|-----|-------------|
| **Backend API** | http://localhost:3000 | N/A |
| **Swagger UI** | http://localhost:3000/api-docs | N/A |
| **Customer App** | http://localhost:3001 | No login required |
| **Tenant Dashboard** | http://localhost:3002 | ADD_HERE (create via API) |
| **Prisma Studio** | http://localhost:5555 | Run `pnpm db:studio` first |

**Note**: No demo credentials are seeded. You must:
1. Register a tenant via API: `POST /api/v1/auth/register/submit` → `POST /api/v1/auth/register/confirm`
2. Login via: `POST /api/v1/auth/login`

---

## 9. Available Scripts

### Root Scripts (from `package.json`)

```bash
# Development
pnpm dev                      # Run "--parallel dev" in all workspaces (from package.json: "dev": "pnpm run --parallel dev")
pnpm dev:web-customer         # Customer app only
pnpm dev:web-tenant           # Tenant dashboard only

# Build
pnpm build                    # Build all apps
pnpm build:web-customer       # Build customer app
pnpm build:web-tenant         # Build tenant dashboard

# Lint & Type Check
pnpm lint                     # Lint all
pnpm lint:web-customer        # Lint customer app
pnpm lint:web-tenant          # Lint tenant dashboard
pnpm type-check              # Type check all
```

### API Scripts (from `source/apps/api/package.json`)

```bash
cd source/apps/api

# Development
pnpm start:dev                # Start with hot reload
pnpm start:debug              # Start with debugger

# Build & Production
pnpm build                    # Build for production
pnpm start                    # Start production build

# Database
pnpm db:migrate               # Run migrations
pnpm db:generate              # Generate Prisma Client
pnpm db:studio                # Open Prisma Studio
pnpm db:reset                 # Reset DB + seed plans

# Testing
pnpm test                     # Run unit tests
pnpm test:watch               # Watch mode
pnpm test:cov                 # With coverage
pnpm test:e2e                 # E2E tests

# Lint & Format
pnpm lint                     # ESLint
pnpm format                   # Prettier
```

### Frontend Scripts (web-customer / web-tenant)

```bash
cd source/apps/web-customer  # or web-tenant

# Development
pnpm dev                      # Start dev server

# Build
pnpm build                    # Production build
pnpm start                    # Serve production build

# Code Generation
pnpm sync-spec                # Fetch OpenAPI spec from API
pnpm orval                    # Generate TypeScript clients
pnpm codegen                  # sync-spec + orval

# Quality
pnpm lint                     # ESLint
pnpm type-check               # TypeScript check
```

---

## 10. IDE Setup

### VS Code (Recommended)

**Install Extensions**:
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Prisma (`prisma.prisma`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)

**Workspace Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 11. Troubleshooting

### Issue: `pnpm install` fails

```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules
rm -rf node_modules
rm -rf source/apps/*/node_modules
rm -rf source/packages/*/node_modules

# Reinstall
pnpm install
```

### Issue: Docker port conflicts

```bash
# Check what's using the port
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Option 1: Stop conflicting service
sudo systemctl stop postgresql  # Linux
brew services stop postgresql   # macOS

# Option 2: Change port in source/docker/.env
DATABASE_PORT=5433
```

### Issue: Database migration fails

```bash
# Verify database is running
cd source/docker
docker compose ps

# Check logs
docker compose logs postgres

# Restart database
docker compose restart postgres

# Wait for health check, then retry
cd ../apps/api
pnpm db:migrate
```

### Issue: Frontend can't connect to API

```bash
# Verify API is running
curl http://localhost:3000/health

# Check CORS configuration in API main.ts
# Default allowed origins: http://localhost:3001, http://localhost:3002

# Verify frontend .env has correct API_URL
cat source/apps/web-customer/.env | grep API_URL
# Should be: NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Reset Everything

```bash
# Stop and remove Docker volumes
cd source/docker
docker compose down -v

# Remove all node_modules
cd ../..
rm -rf node_modules
find source -name 'node_modules' -type d -prune -exec rm -rf '{}' +

# Clean build artifacts
find source -name 'dist' -type d -prune -exec rm -rf '{}' +
find source -name '.next' -type d -prune -exec rm -rf '{}' +

# Reinstall
pnpm install

# Restart Docker
cd source/docker
docker compose up -d

# Migrate
cd ../apps/api
pnpm db:migrate

# Start servers
pnpm start:dev  # API
# In other terminals: start frontend apps
```

---

## 12. Port Reference

| Service | Port | Source |
|---------|------|--------|
| PostgreSQL | 5432 | `source/docker/docker-compose.yaml` |
| Redis | 6379 | `source/docker/docker-compose.yaml` |
| Backend API | 3000 | `source/apps/api/src/main.ts` (default) |
| Customer App | 3001 | `source/apps/web-customer/package.json` ("dev": "next dev -p 3001") |
| Tenant Dashboard | 3002 | `source/apps/web-tenant/package.json` ("dev": "next dev -p 3002") |
| Prisma Studio | 5555 | Prisma default |

---

## 13. Next Steps

### Explore Codebase

```
source/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/       # Feature modules (auth, tenants, menu, orders, etc.)
│   │   │   ├── common/        # Shared utilities
│   │   │   └── main.ts        # Entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma  # Database schema
│   │   └── scripts/           # Utility scripts
│   ├── web-customer/          # Next.js customer app
│   └── web-tenant/            # Next.js tenant dashboard
├── packages/
│   └── ui/                    # Shared UI components
└── docker/
    └── docker-compose.yaml    # Dev services
```

### Read Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture
- [Database Schema](../backend/database/description.md) - Complete schema documentation
- [API Documentation](http://localhost:3000/api-docs) - Swagger UI (when API running)
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines

---

## Support

- **Documentation**: Check `docs/` folder
- **Issues**: ADD_HERE (example: GitHub Issues URL)
- **Contact**: ADD_HERE (example: dev@yourdomain.com)

---

**Setup complete! 🎉**

*For issues, refer to the Troubleshooting section or create an issue in the repository.*

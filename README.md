# TKOB QR Order System

> This project is complete and no longer actively maintained.
> 
Enterprise-grade, multi-tenant QR ordering platform for restaurants — real-time, role-based, production-deployed.

**Live:** [Customer App](https://tkob-qr-order-system-web-customer.vercel.app) · [Admin Dashboard](https://tkob-qrorder-system.vercel.app) · [API](https://tkob.nphoang.me)

![CI/CD](https://img.shields.io/github/actions/workflow/status/tkob-team/TKOB_QROrderSystem/deploy.yml?branch=main&label=CI%2FCD) ![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-339933?logo=node.js&logoColor=white) ![pnpm](https://img.shields.io/badge/pnpm-10.23.0-F69220?logo=pnpm&logoColor=white) ![Docker](https://img.shields.io/badge/docker-required-2496ED?logo=docker&logoColor=white)

## Table of Contents

- [TKOB QR Order System](#tkob-qr-order-system)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Architecture](#architecture)
    - [Monorepo Layout](#monorepo-layout)
    - [Tech Stack](#tech-stack)
    - [Data Flow](#data-flow)
    - [Deployment](#deployment)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Environment Variables](#environment-variables)
  - [Project Structure](#project-structure)
  - [Capabilities by Role](#capabilities-by-role)
  - [CI/CD](#cicd)
  - [Security](#security)
  - [Documentation](#documentation)
  - [Contributing](#contributing)
  - [License](#license)

## Overview

TKOB QR Order System is a monorepo platform for QR-based dine-in ordering across customer, staff, kitchen, and tenant-admin workflows. It is technically interesting because tenant boundaries are enforced through tenant-scoped data access and role-aware API surfaces across the stack. The runtime architecture combines REST operations with WebSocket-driven order state updates, enabling near real-time coordination between front-of-house and kitchen interfaces. A shared OpenAPI contract is used to generate frontend clients, keeping API integration consistent across both web applications. The result is a production-oriented system that balances operational scope, platform reuse, and clear separation of responsibilities.

## Architecture

### Monorepo Layout

- API: `source/apps/api` (NestJS backend)
- Web Tenant: `source/apps/web-tenant` (owner/admin, staff, kitchen dashboard)
- Web Customer: `source/apps/web-customer` (customer ordering app)
- Shared UI Package: `source/packages/ui`

### Tech Stack

| Layer | Technologies |
| --- | --- |
| Backend | Node.js, NestJS, Prisma ORM, PostgreSQL, Redis, Socket.IO, Zod |
| Frontend | Next.js 15, React 19, Tailwind CSS v4, TanStack Query, Zustand, Orval |
| Infrastructure | Docker, Docker Compose, GitHub Actions, GHCR, AWS EC2 |

### Data Flow

Customers access a table-specific QR link in the customer app, browse menu data from the API, and submit orders and payments through tenant-scoped endpoints. The API persists transactional state in PostgreSQL, uses Redis for runtime support, and emits order events to dashboard clients for staff and kitchen updates. Tenant and staff users operate in the web-tenant application, while both frontend apps consume generated API clients from a shared OpenAPI contract.

### Deployment

API runs on AWS EC2 via Docker ([health check](https://tkob.nphoang.me/health)),
frontend applications are deployed on Vercel, and container images are
distributed through GHCR.

## Prerequisites

| Tool | Minimum Version |
| --- | --- |
| Node.js | 18.0.0 |
| pnpm | 8.0.0 |
| Docker | 24.0 |
| Docker Compose | 2.20 |

## Quick Start

```bash
git clone https://github.com/tkob-team/TKOB_QROrderSystem.git
cd TKOB_QROrderSystem
pnpm install
cp source/docker/.env.example source/docker/.env
cp source/apps/api/.env.example source/apps/api/.env
cp source/apps/web-tenant/.env.example source/apps/web-tenant/.env.local
cp source/apps/web-customer/.env.example source/apps/web-customer/.env.local
docker compose --env-file source/docker/.env -f source/docker/docker-compose.yaml up -d
pnpm --filter @app/api db:migrate
pnpm dev
```

For full setup details, see [docs/common/SETUP.md](docs/common/SETUP.md).

## Environment Variables

Reference the example files for full definitions:
- API: [source/apps/api/.env.example](source/apps/api/.env.example)
- Web Tenant: [source/apps/web-tenant/.env.example](source/apps/web-tenant/.env.example)
- Web Customer: [source/apps/web-customer/.env.example](source/apps/web-customer/.env.example)

| App | Variable | Required | Description |
| --- | --- | --- | --- |
| API | API_PORT | Required | API server port. |
| API | DATABASE_URL | Required | PostgreSQL connection string for Prisma. |
| API | JWT_SECRET | Required | Signing secret for JWT access and refresh tokens. |
| API | REDIS_HOST | Required (local mode) | Redis host when `REDIS_URL` is not used. |
| API | REDIS_PORT | Required (local mode) | Redis port when `REDIS_URL` is not used. |
| API | CORS_ORIGINS | Required | Allowed origins for frontend applications. |
| API | STORAGE_DRIVER | Required | Storage backend selector (`local` or `s3`). |
| API | SEPAY_SECRET_KEY | Optional | Secret key for SePay integration. |
| API | GOOGLE_CLIENT_ID | Optional | Google OAuth client ID. |
| API | GOOGLE_CLIENT_SECRET | Optional | Google OAuth client secret. |
| Web Tenant | NEXT_PUBLIC_API_URL | Required | Base URL of API v1 endpoints. |
| Web Tenant | NEXT_PUBLIC_CUSTOMER_APP_URL | Required | Customer app URL for cross-app navigation. |
| Web Tenant | NEXT_PUBLIC_APP_NAME | Required | Display name for tenant app branding. |
| Web Tenant | NEXT_PUBLIC_WS_URL | Optional | WebSocket endpoint override. |
| Web Customer | NEXT_PUBLIC_API_URL | Required | Base URL of API v1 endpoints. |
| Web Customer | NEXT_PUBLIC_APP_NAME | Required | Display name for customer app branding. |
| Web Customer | NEXT_PUBLIC_WS_URL | Optional | Reserved WebSocket endpoint configuration. |

## Project Structure

```text
.
|-- .github/
|   |-- workflows/
|-- docs/
|   |-- backend/
|   |-- common/
|   |-- frontend/
|-- source/
|   |-- apps/
|   |-- docker/
|   |-- packages/
|-- terraform/
|   |-- main.tf
|   |-- outputs.tf
|   |-- providers.tf
|   |-- variables.tf
|-- docker-compose.local.yml
|-- docker-compose.prod.yml
|-- LICENSE
|-- package.json
|-- pnpm-lock.yaml
|-- pnpm-workspace.yaml
|-- README.md
```

## Capabilities by Role

The platform serves four distinct user roles, each with a dedicated interface and access scope.

| Feature | Description |
| --- | --- |
| Customer: QR Table Access | Start an order session by scanning a table QR code. |
| Customer: Menu and Modifiers | Browse tenant menu and configure item modifiers before checkout. |
| Customer: Cart and Checkout | Build a cart and place orders against an active table session. |
| Customer: Payment Flow | Complete QR payment flow with backend payment orchestration. |
| Owner/Admin: Tenant Configuration | Manage restaurant profile, tenant settings, and business configuration. |
| Owner/Admin: Menu Management | Create and maintain categories, items, modifiers, and media assets. |
| Owner/Admin: Table and QR Management | Manage table inventory and regenerate QR assets as needed. |
| Owner/Admin: Staff and Role Management | Invite staff and assign OWNER, STAFF, and KITCHEN roles. |
| Owner/Admin: Analytics Dashboard | Track revenue, orders, popular items, and operating metrics. |
| Staff: Service Board | Monitor and handle operational order flow for front-of-house service. |
| Staff: Order Coordination | View order states and coordinate table-side delivery workflows. |
| Kitchen: KDS Board | Use kitchen display views optimized for preparation pipelines. |
| Kitchen: Real-Time Queue Updates | Receive live order updates and status changes via WebSocket channels. |

## CI/CD

The pipeline runs on pushes to `main` and pull requests targeting `main`; it executes API tests, builds Docker images for GHCR, and deploys to AWS EC2 on `main` pushes. Status and run logs are available in [`.github/workflows/`](.github/workflows/), with the active workflow defined in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Security

- JWT-based authentication is used for protected API access.
- RBAC is enforced with `OWNER`, `STAFF`, and `KITCHEN` role scopes.
- Multi-tenant isolation is implemented at application level via tenant-scoped data access.
- Payment callbacks are protected with webhook secret validation (`SEPAY_WEBHOOK_SECRET`).
- CORS origin allowlisting is controlled through `CORS_ORIGINS`.
- API and frontend separation reduces privilege overlap between customer and operator surfaces.
- Sensitive configuration is managed via environment variables; no secrets are committed to the repository.

## Documentation

| Doc Title | Path | Description |
| --- | --- | --- |
| Setup Guide | [docs/common/SETUP.md](docs/common/SETUP.md) | Detailed local development setup instructions. |
| System Architecture | [docs/common/ARCHITECTURE.md](docs/common/ARCHITECTURE.md) | End-to-end architecture and implementation status. |
| OpenAPI Guide | [docs/common/OPENAPI.md](docs/common/OPENAPI.md) | Human-readable API overview and conventions. |
| User Guide | [docs/common/USER_GUIDE.md](docs/common/USER_GUIDE.md) | End-user and role-specific operational guide. |
| Contributing Guide | [docs/common/CONTRIBUTING.md](docs/common/CONTRIBUTING.md) | Branching, PR, and team contribution workflow. |
| Backend Overview | [docs/backend/README.md](docs/backend/README.md) | Backend module-level overview. |
| Database Schema | [docs/backend/database/description.md](docs/backend/database/description.md) | Detailed schema and domain model descriptions. |
| Database ER Diagram | [docs/backend/database/er_diagram.md](docs/backend/database/er_diagram.md) | Mermaid ER diagram of core entities and relations. |
| WebSocket Client | [docs/backend/websocket-client.md](docs/backend/websocket-client.md) | Client integration notes for Socket.IO/WebSocket flows. |
| Frontend Architecture | [docs/frontend/ARCHITECTURE.md](docs/frontend/ARCHITECTURE.md) | Structural patterns for frontend applications. |
| RBAC Guide | [docs/frontend/RBAC_GUIDE.md](docs/frontend/RBAC_GUIDE.md) | Role mapping and authorization patterns in frontend. |
| Orval Integration Guide | [docs/frontend/ORVAL.md](docs/frontend/ORVAL.md) | OpenAPI client generation and usage workflow. |
| Onboarding Checklist | [docs/frontend/guide/ONBOARDING_CHECKLIST.md](docs/frontend/guide/ONBOARDING_CHECKLIST.md) | Checklist for onboarding new engineers. |

## Contributing

Contributions are welcome from maintainers and external collaborators through standard pull request workflows. Review contribution standards, branch conventions, and definition of done in [docs/common/CONTRIBUTING.md](docs/common/CONTRIBUTING.md) before opening a PR.

## License

MIT © 2025 TonKnight.

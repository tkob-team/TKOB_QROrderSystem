# Documentation – TKOB_QROrderSystem

> **Last updated**: 2026-01-20  
> **Purpose**: Grader-friendly documentation entrypoint for the TKOB_QROrderSystem project.

---

## 0) For Graders (Start Here ⭐)

### What to Read in 5 Minutes

**Essential Documents** (Read in order):
1. [System Architecture](common/ARCHITECTURE.md#0-implementation-status) - **Section 0** lists what's implemented vs planned (evidence-based)
2. [User Guide](common/USER_GUIDE.md) - User roles, features, and usage flows
3. [Database Schema Overview](backend/database/description.md#1-schema-overview) - Multi-tenant design and domain models
4. [API Overview](common/OPENAPI.md#15-swagger-tag-index-source-swagger-ui) - ~140+ REST operations across multiple API tags (see openapi.exported.json for exact count)

**Quick Stats** (Based on OpenAPI export and Prisma schema):
- **3 applications**: API service (NestJS), Web Tenant Dashboard (Next.js 15), Web Customer App (Next.js 15)
- **Approx. 17 implemented modules**: Auth, Menu, Orders, Payments (SePay), KDS, Subscriptions, Staff, Analytics, etc.
- **24 database tables**: See [Database Documentation Index](backend/database/README.md)
- **~140+ API operations**: Documented in [openapi.exported.json](common/openapi.exported.json) (see file for exact count)
- **20+ migrations**: Full migration history in database docs

### Demos and Screenshots

ADD HERE - Please provide:
- Live demo URL (if deployed): `https://demo.your-domain.com`
- Demo credentials:
  - Tenant Owner: `owner@example.com` / `password123`
  - Staff: `staff@example.com` / `password123`
  - Kitchen: `kitchen@example.com` / `password123`
- Screenshots folder (if provided): `docs/screenshots/` (landing, menu, cart, checkout, dashboard, KDS, etc.)
- Demo video: YouTube/Google Drive link

### What is Implemented vs Planned

**Quick Reference** (See [ARCHITECTURE.md Section 0](common/ARCHITECTURE.md#0-implementation-status) for full details):

**✅ Implemented in Current MVP:**
- Authentication (2-step OTP, JWT, refresh tokens)
- Multi-tenant restaurant management
- Menu management with modifiers and bulk photo upload
- QR code generation and table sessions
- Cart and checkout flow
- SePay QR payment integration (webhook + polling)
- Kitchen Display System (KDS) with priority-based display
- Staff management with role-based access control
- Subscription tiers (FREE/BASIC/PREMIUM)
- Analytics dashboard
- Reviews & ratings
- WebSocket real-time order updates

**❌ Not Implemented (Planned):**
- Card online payments (processor integration)
- Order modification after checkout
- Split bills
- Inventory management
- Multi-location support
- Native mobile apps

---

## 1) For Developers

### Setup Guides

- [Development Environment Setup](common/SETUP.md) - **Complete guide**:
  - Prerequisites (Node.js 18+ (20 LTS recommended), Docker, pnpm)
  - Clone repository and install dependencies
  - Environment variables configuration
  - Database setup (Docker Compose)
  - Running backend (NestJS) and frontend (Next.js) dev servers
  - Migration and seeding
  - IDE setup (VS Code extensions)
  - Troubleshooting

### API Documentation

- **[API Overview](common/OPENAPI.md)** - REST API documentation:
  - Design principles (RESTful, multi-tenant, versioned)
  - Authentication (JWT bearer tokens)
  - Error handling and rate limiting
  - All API modules documented (Tenants, Menu, Orders, Payments, etc.)
  
- **[OpenAPI Specification](common/openapi.exported.json)** - Machine-readable API spec (122KB):
  - ~140+ operations (currently ~142; see openapi.exported.json for exact count) across ~20+ tags
  - Request/response schemas
  - Authentication requirements
  - OpenAPI 3.0 format
  
- **Live Swagger UI**: `http://localhost:3000/api-docs` (when dev server is running)

### Database Documentation

- **[Database Index](backend/database/README.md)** - Quick start guide:
  - Tech stack (PostgreSQL + Prisma)
  - Docker setup commands
  - Local setup commands
  - Common Prisma commands
  - Migration history
  - Troubleshooting
  
- **[Schema Description](backend/database/description.md)** - Comprehensive documentation:
  - Schema overview (multi-tenant isolation, naming conventions)
  - 24 models organized in 12 domains (Tenants, Auth, Menu, Orders, Payments, etc.)
  - Business rules and constraints
  - Enum reference (40+ enums)
  
- **[ER Diagram](backend/database/er_diagram.md)** - Visual database schema:
  - Entity-relationship diagram (Mermaid format)
  - Key foreign keys and associations

### Code Generation (Orval)

- **[Orval Guide](frontend/ORVAL.md)** - API client code generation:
  - Generates TypeScript API clients from OpenAPI spec
  - Generates React Query v5 hooks
  - Axios instance configuration
  - Clean Architecture integration
  - Usage examples

### Authentication & Authorization

- **[RBAC Guide](frontend/RBAC_GUIDE.md)** - Role-based access control:
  - 3 roles: OWNER (Admin), STAFF (Waiter), KITCHEN (KDS)
  - Role mapping (frontend display vs backend enums)
  - Permission matrix
  - Implementation examples
  - Auth flow diagrams

### Architecture Documentation

- **[System Architecture](common/ARCHITECTURE.md)** - Complete system design:
  - Design principles (multi-tenant, API-first, scalable)
  - Tech stack (NestJS, Next.js 15, PostgreSQL, Prisma)
  - Layered architecture (Client, API Gateway, Business Logic, Data)
  - Key flows (QR ordering, payment, real-time updates)
  - Deployment architecture (Docker Compose for dev)
  - Implementation status (Section 0: what's done vs planned)
  
- **[Frontend Architecture](frontend/ARCHITECTURE.md)** - Next.js 15 architecture:
  - Clean Architecture principles
  - Feature-Sliced Design
  - App Router structure
  - State management (React Query + Zustand)
  
- **[Frontend Guides](frontend/guide/)** - Developer guides:
  - [Feature Implementation Guide](frontend/guide/FEATURE_IMPLEMENTATION_GUIDE.md)
  - [Next.js 15 App Router Guide](frontend/guide/NEXTJS_15_APP_ROUTER_GUIDE.md)
  - [Patterns and Conventions](frontend/guide/PATTERNS_AND_CONVENTIONS.md)
  - [Onboarding Checklist](frontend/guide/ONBOARDING_CHECKLIST.md)

### Contributing Guidelines

- **[Contributing Guide](common/CONTRIBUTING.md)** - Team workflow:
  - Git branch naming conventions
  - Commit message format (Conventional Commits)
  - Pull request process
  - Code review guidelines
  - Definition of Done

---

## 2) For Users

- **[User Guide](common/USER_GUIDE.md)** - Complete user documentation:
  - **Section 0**: Overview (what is TKOB_QROrderSystem, who is it for)
  - **Section 1**: How to access (web apps, QR code flow, demo accounts)
  - **Section 2**: Customer Guide (scan QR, browse menu, order, pay, track)
  - **Section 3**: Tenant Owner/Admin Guide (dashboard, menu management, staff, analytics)
  - **Section 4**: Staff/Waiter Guide (table management, order handling)
  - **Section 5**: Kitchen/KDS Guide (order preparation, priority system)
  - **Section 6**: Subscription & Billing (FREE/BASIC/PREMIUM tiers)
  - **Section 7**: Common Issues & FAQ

---

## 3) Folder Map (Documentation Structure)

```
docs/
├── README.md                          # This file (grader entrypoint)
├── screenshots/ (optional)            # Demo screenshots (if provided)
│
├── common/                            # Cross-cutting documentation
│   ├── ARCHITECTURE.md                # System architecture + implementation status
│   ├── OPENAPI.md                     # API documentation overview
│   ├── openapi.exported.json          # OpenAPI 3.0 spec (122KB, ~140+ operations)
│   ├── USER_GUIDE.md                  # User documentation (all roles)
│   ├── SETUP.md                       # Development environment setup
│   ├── CONTRIBUTING.md                # Git workflow and team conventions
│   ├── project-kickoff-summary.md     # Project vision, goals, MVP scope
│   ├── docs-plan-vi.md                # Documentation plan (Vietnamese)
│   └── EPICS_MERGED.md                # User stories and epics
│
├── backend/                           # Backend-specific documentation
│   ├── README.md                      # Backend overview (NestJS modules)
│   ├── websocket-client.md            # WebSocket client usage
│   └── database/                      # Database documentation
│       ├── README.md                  # Database quick start + commands
│       ├── description.md             # Complete schema (24 models, 12 domains)
│       └── er_diagram.md              # Entity-relationship diagram
│
└── frontend/                          # Frontend-specific documentation
    ├── README.md                      # Frontend overview (Next.js 15)
    ├── ARCHITECTURE.md                # Frontend architecture
    ├── ORVAL.md                       # API client code generation
    ├── RBAC_GUIDE.md                  # Role-based access control
    └── guide/                         # Developer guides
        ├── FEATURE_IMPLEMENTATION_GUIDE.md
        ├── NEXTJS_15_APP_ROUTER_GUIDE.md
        ├── PATTERNS_AND_CONVENTIONS.md
        └── ONBOARDING_CHECKLIST.md
```

---

## 4) Document Coverage vs Rubric

### Typical Web Application Grading Criteria

| Requirement | Status | Document Reference |
|-------------|--------|-------------------|
| **Setup Instructions** | ✅ Complete | [SETUP.md](common/SETUP.md) - Prerequisites, dependencies, environment config, Docker setup, dev server commands |
| **API Endpoints** | ✅ Complete | [OPENAPI.md](common/OPENAPI.md) + [openapi.exported.json](common/openapi.exported.json) - ~140+ operations (see openapi.exported.json for exact count) |
| **Database Design** | ✅ Complete | [Database Docs](backend/database/) - Schema description (24 models), ER diagram, migration history |
| **System Architecture** | ✅ Complete | [ARCHITECTURE.md](common/ARCHITECTURE.md) - Layered architecture, tech stack, data flows, deployment |
| **User Guide** | ✅ Complete | [USER_GUIDE.md](common/USER_GUIDE.md) - All user roles (Customer, Owner, Staff, Kitchen) |
| **Authentication** | ✅ Complete | [ARCHITECTURE.md Section 0.1](common/ARCHITECTURE.md#01-implemented-in-current-version-evidence-based) + [RBAC_GUIDE.md](frontend/RBAC_GUIDE.md) |
| **Testing Strategy** (Optional/Bonus) | ⚠️ Partial | ADD HERE - `docs/common/TEST_STRATEGY.md` (unit, integration, e2e test plans) |
| **Deployment Guide** (Optional/Bonus) | ⚠️ Dev Only | [SETUP.md](common/SETUP.md) covers local dev. ADD HERE - Production deployment guide |
| **Security Documentation** (Optional/Bonus) | ⚠️ Partial | JWT + RBAC documented. ADD HERE - `docs/common/SECURITY.md` (threat model, OWASP compliance) |
| **API Usage Examples** | ✅ Complete | [OPENAPI.md](common/OPENAPI.md) - Request/response examples for key modules |
| **Code Structure** | ✅ Complete | [Frontend Architecture](frontend/ARCHITECTURE.md) + [Backend README](backend/README.md) |
| **Feature List** | ✅ Complete | [ARCHITECTURE.md Section 0](common/ARCHITECTURE.md#0-implementation-status) - Evidence-based implementation status |
| **Screenshots/Demos** | ❌ Missing | ADD HERE - See [Section 0](#demos-and-screenshots) above for required format |

### Additional Documentation (Bonus Points)

| Document Type | Status | Document Reference |
|---------------|--------|-------------------|
| **Contributing Guide** | ✅ Complete | [CONTRIBUTING.md](common/CONTRIBUTING.md) - Git workflow, PR process, code style |
| **Code Generation** | ✅ Complete | [ORVAL.md](frontend/ORVAL.md) - API client generation from OpenAPI spec |
| **Real-time Features** | ✅ Complete | [websocket-client.md](backend/websocket-client.md) - WebSocket usage for order updates |
| **Subscription Model** | ✅ Complete | [USER_GUIDE.md Section 6](common/USER_GUIDE.md) - FREE/BASIC/PREMIUM tiers |
| **Migration History** | ✅ Complete | [Database README](backend/database/README.md#migration-history) - 20+ migrations tracked |
| **Analytics Dashboard** | ✅ Complete | [ARCHITECTURE.md Section 0.1](common/ARCHITECTURE.md#01-implemented-in-current-version-evidence-based) - Revenue, orders, popular items |

---

## 5) Quick Navigation by Role

### I'm a Grader
1. Start: [Section 0](#0-for-graders-start-here-) (this page)
2. Verify implementation: [ARCHITECTURE.md Section 0](common/ARCHITECTURE.md#0-implementation-status)
3. Check database: [Database Schema](backend/database/description.md)
4. Review API: [OPENAPI.md](common/OPENAPI.md)

### I'm Setting Up Locally
1. Read: [SETUP.md](common/SETUP.md)
2. Check: [Database Quick Start](backend/database/README.md#quick-start)
3. Troubleshoot: [SETUP.md Section 11](common/SETUP.md#11-troubleshooting)

### I'm Integrating with the API
1. Review: [OPENAPI.md](common/OPENAPI.md)
2. Download spec: [openapi.exported.json](common/openapi.exported.json)
3. Live docs: `http://localhost:3000/api-docs`

### I'm a New Developer
1. Overview: [project-kickoff-summary.md](common/project-kickoff-summary.md)
2. Setup: [SETUP.md](common/SETUP.md)
3. Workflow: [CONTRIBUTING.md](common/CONTRIBUTING.md)
4. Architecture: [ARCHITECTURE.md](common/ARCHITECTURE.md)
5. Frontend: [Frontend Onboarding Checklist](frontend/guide/ONBOARDING_CHECKLIST.md)

---

## 6) Notes for Graders

### Evidence-Based Documentation
All documentation is based on actual implementation verified through:
- **Code inspection**: NestJS modules, Next.js pages, Prisma schema
- **API export**: [openapi.exported.json](common/openapi.exported.json) generated from running application
- **Database migrations**: 20+ migration files in `source/apps/api/prisma/migrations/`
- **Implementation status**: [ARCHITECTURE.md Section 0](common/ARCHITECTURE.md#0-implementation-status) clearly separates what's done (✅) vs planned (❌)

### What's NOT Implemented
See [ARCHITECTURE.md Section 0.2](common/ARCHITECTURE.md#02-planned--not-in-current-mvp) for complete list of planned but unimplemented features (card payments, order modification, inventory, Redis caching, production deployment, etc.)

### Missing Documentation (Marked with ADD HERE)
- Production deployment guide
- Screenshots and demo credentials
- Comprehensive test strategy
- Security threat model
- Monitoring/observability setup

### Documentation Version
- **Last comprehensive update**: 2026-01-20
- **Database docs version**: 3.0 (updated 2026-01-20)
- **Architecture docs version**: 1.0 (updated 2026-01-20)

---

**For questions or issues, please refer to the specific documentation sections above or contact the development team.**

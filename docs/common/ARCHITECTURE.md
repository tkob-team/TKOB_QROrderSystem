# Kiến trúc Hệ thống – TKOB_QROrderSystem

> **Mục đích**: Mô tả kiến trúc tổng thể, các thành phần chính, luồng dữ liệu, công nghệ và quyết định thiết kế cho TKOB_QROrderSystem (Product name: TKQR-in Ordering Platform) - nền tảng gọi món QR đa tenant.

- **Version**: 1.0  
- **Created**: 2025‑01‑11  
- **Last Updated**: 2026‑01‑20

---

## Document Navigation

**Related Documentation:**
- [Setup Guide](./SETUP.md) - Installation and development environment setup (ports: API 3000, Customer 3001, Tenant 3002)
- [OpenAPI Specification](./OPENAPI.md) - Complete API reference (~140+ operations; see openapi.exported.json for exact count)
- [User Guide](./USER_GUIDE.md) - End-user documentation for all roles
- [Database Schema](../backend/database/description.md) - Detailed schema documentation
- [ER Diagram](../backend/database/er_diagram.md) - Entity relationship diagram

---

## Table of Contents (Quick Navigation)

**Status:** [0. Implementation Status](#0-implementation-status) - What's built vs planned  
**Overview:** [1. Tổng quan Kiến trúc](#1-tổng-quan-kiến-trúc) - High-level architecture  
**Components:** [2. Các Thành Phần Chính](#2-các-thành-phần-chính) - Client, backend, data layers  
**Flows:** [3. Luồng Dữ liệu](#3-luồng-dữ-liệu) - Ordering, state transitions, QR generation  
**Security:** [4. Security Architecture](#4-security-architecture) - Auth, multi-tenancy, encryption  
**Scale:** [5. Scalability & Performance](#5-scalability--performance) - Scaling strategies  
**Deploy:** [6. Deployment Architecture](#6-deployment-architecture) - Infrastructure (suggested)  
**Observability:** [7. Monitoring & Observability](#7-monitoring--observability) - Logs, metrics (suggested)  
**Tech Stack:** [8. Technology Stack Summary](#8-technology-stack-summary) - All technologies used  
**NFRs:** [9. Non‑Functional Requirements](#9-nonfunctional-requirements) - Availability, reliability  
**Future:** [10. Future Enhancements](#10-future-enhancements) - Planned features  
**Decisions:** [11. Quyết định Kiến trúc (ADR)](#11-quyết-định-kiến-trúc-adr) - Architecture decisions

---

## 0. Implementation Status

### 0.1. Implemented in Current Version (Evidence-Based)

**Applications Deployed:**
- ✅ **API Service** (`source/apps/api`) - NestJS backend with ~140+ REST operations (see openapi.exported.json)
- ✅ **Web Tenant Dashboard** (`source/apps/web-tenant`) - Next.js 15 admin/staff/kitchen interface
- ✅ **Web Customer App** (`source/apps/web-customer`) - Next.js 15 customer ordering interface

**Implemented Modules (Verified from OpenAPI Spec & Codebase):**

| Module | Status | Evidence |
|--------|--------|----------|
| **Authentication** | ✅ Implemented | 2-step OTP registration, JWT auth, refresh tokens, password reset |
| **Tenants** | ✅ Implemented | Restaurant profile, settings, pricing config, onboarding flow |
| **Menu Management** | ✅ Implemented | Categories, items, modifiers (SINGLE/MULTI choice), photos (bulk upload) |
| **Tables & QR Codes** | ✅ Implemented | CRUD, QR generation/regeneration, download (PNG/SVG/PDF/ZIP), sessions |
| **Cart** | ✅ Implemented | Session-based cart with modifiers, real-time pricing |
| **Orders** | ✅ Implemented | Checkout, status tracking, cancellation (5min window), append items |
| **Payments** | ✅ Implemented | SePay QR integration, webhook + polling fallback, bill-to-table |
| **Payment Config** | ✅ Implemented | SePay API key, bank account, test QR generation |
| **KDS (Kitchen Display)** | ✅ Implemented | Priority-based display (Normal/High/Urgent), real-time stats |
| **Staff Management** | ✅ Implemented | Email invitations, role assignment (STAFF/KITCHEN), limits per plan |
| **Subscriptions** | ✅ Implemented | FREE/BASIC/PREMIUM tiers, usage tracking, upgrade via SePay |
| **Analytics** | ✅ Implemented | Revenue, orders, popular items, hourly distribution, table performance |
| **Reviews & Ratings** | ✅ Implemented | 1-5 star ratings per order item, aggregated stats |
| **Promotions** | ✅ Implemented | Discount codes (PERCENTAGE/FIXED), usage limits, validation |
| **Bills** | ✅ Implemented | Bill generation when closing table session |
| **WebSocket** | ✅ Implemented | Real-time order updates (order.gateway.ts) |
| **Health Checks** | ✅ Implemented | Basic, detailed, readiness, liveness endpoints |

**Database:**
- ✅ **PostgreSQL** with Prisma ORM
- ✅ Multi-tenant isolation via `tenantId` field (application-level)
- ✅ 21 migrations applied (as of 2026-01-20) (see `prisma/migrations/`)

**Authentication & Security:**
- ✅ JWT bearer tokens with refresh mechanism
- ✅ Role-based access control: OWNER, STAFF, KITCHEN
- ✅ Session-based customer authentication (QR scan → table_session_id cookie)
- ✅ Subscription-based feature gating

**API Documentation:**
- ✅ Full OpenAPI 3.0 spec: [openapi.exported.json](./openapi.exported.json)
- ✅ ~140+ documented operations across multiple API tags (see openapi.exported.json for exact count)
- ✅ See also: [OPENAPI.md](./OPENAPI.md)

**User Documentation:**
- ✅ Comprehensive user guide: [USER_GUIDE.md](./USER_GUIDE.md)

### 0.2. Planned / Not in Current MVP

**Features NOT Implemented:**
- ❌ **Card Online Payments** - CARD_ONLINE enum exists but no processor integration
- ❌ **Order Modification** - Cannot edit order after checkout (must cancel and reorder)
- ❌ **Split Bills** - All orders at table combined into one bill
- ❌ **Inventory Management** - No stock tracking or ingredient management
- ❌ **Shift Management** - No staff clock-in/clock-out or shift reports
- ❌ **Multi-Location** - Single restaurant per tenant (no chain support)
- ❌ **Kitchen Printer Integration** - Screen-only KDS display
- ❌ **Native Mobile Apps** - Web-only (no iOS/Android native)
- ❌ **Offline Mode** - Internet required for all operations
- ❌ **Advanced Analytics** - Cohort analysis, heatmaps, predictive analytics
- ❌ **POS Integration** - No external POS system connectivity
- ❌ **Loyalty/Rewards** - No points or rewards program

**Infrastructure NOT Implemented:**
- ❌ **Redis Cache** - Module exists but not actively used for caching
- ❌ **Elasticsearch/Meilisearch** - No full-text search engine
- ❌ **Message Queue** - No RabbitMQ/Kafka for async tasks
- ❌ **Kubernetes** - Development uses Docker Compose only
- ❌ **CDN** - No Cloudflare/CloudFront integration documented
- ❌ **Object Storage** - Photos stored locally in `uploads/` directory

**Deployment NOT Documented:**
- ❌ Production deployment details
- ❌ CI/CD pipeline configuration
- ❌ Monitoring/observability setup (Grafana, Prometheus, etc.)

---

## 1. Tổng quan Kiến trúc

### 1.1. Nguyên tắc Thiết kế
- **Multi‑tenant**: Cách ly dữ liệu hoàn toàn giữa các tenant (nhà hàng)
- **API‑first**: Backend cung cấp RESTful API chuẩn OpenAPI
- **Mobile‑first**: Giao diện khách hàng tối ưu cho thiết bị di động
- **Scalable**: Kiến trúc cho phép mở rộng theo chiều ngang
- **Secure**: Xác thực, phân quyền và mã hóa ở mọi tầng
- **Observable**: Logging, monitoring và audit trail đầy đủ

### 1.2. Kiến trúc Tổng thể (High‑Level)

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Customer   │  │   Waiter    │  │   Kitchen   │          │
  │  Web App    │  │   Console   │  │     KDS     │          │
│  │  (Mobile)   │  │ (Responsive)│  │  (TV/Tab)   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                           │
                    [HTTPS / WSS]
                           │
┌─────────────────────────────────────────────────────────────┐
│         API GATEWAY / CDN (⚠️ SUGGESTED, NOT IN MVP)        │
│  - Rate Limiting (not implemented)                          │
│  - SSL Termination (handled by deployment platform)         │
│  - Request Routing (direct connection to backend in MVP)    │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Backend API Service                      │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐   │  │
│  │  │ Tenants  │ │  Menu    │ │  Orders  │ │Analytics│   │  │
│  │  │ Module   │ │  Module  │ │  Module  │ │ Module  │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘   │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐               │  │
│  │  │  Tables  │ │ Payments │ │   Auth   │               │  │
│  │  │   & QR   │ │ Module   │ │  Module  │               │  │
│  │  └──────────┘ └──────────┘ └──────────┘               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  PostgreSQL  │  │    Redis     │  │  Object      │       │
│  │  (Primary)   │  │   (Partial)  │  │  Storage     │       │
│  │  + tenantId  │  │ Session+OTP  │  │  (Planned)   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Payment    │  │  SMS/Email   │  │  Monitoring  │       │
│  │   Gateway    │  │  Notification│  │  & Logging   │       │
│  │   (SePay)    │  │   Service    │  │  (Planned)   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Các Thành Phần Chính

### 2.1. Client Layer

#### 2.1.1. Customer Web Application
**Mô tả**: Ứng dụng web tối ưu cho mobile, cho phép khách hàng quét QR và gọi món.

**Đặc điểm**:
- **Công nghệ**: Next.js 15 App Router + Tailwind CSS + shadcn/ui
- **Responsive**: Mobile‑first design, hỗ trợ tablet
- **Internet Required**: Cần kết nối internet để sử dụng (PWA/offline mode chưa triển khai)
- **Real-time Updates**: WebSocket cho cập nhật trạng thái đơn hàng

**Tính năng chính**:
- Quét QR code (hoặc nhập link)
- Xem menu theo tenant
- Quản lý giỏ hàng
- Checkout và thanh toán
- Theo dõi trạng thái đơn hàng

#### 2.1.2. Waiter Console
**Mô tả**: Giao diện web responsive cho nhân viên phục vụ, tích hợp trong Tenant Dashboard.

**Đặc điểm**:
- **Công nghệ**: Next.js 15 App Router (route `/waiter` trong web-tenant)
- **Thiết bị**: Tablet, điện thoại, PC
- **Real‑time**: WebSocket (Socket.IO) cho cập nhật đơn hàng
- **Authentication**: JWT với OWNER/STAFF role

**Tính năng chính**:
- Xem danh sách đơn hàng theo trạng thái
- Lọc theo bàn, thời gian
- Nhắc bếp với đơn chậm
- Đánh dấu món đã giao

#### 2.1.3. Kitchen Display System (KDS)
**Mô tả**: Màn hình hiển thị cho bếp, tối ưu cho TV/màn hình lớn, tích hợp trong Tenant Dashboard.

**Đặc điểm**:
- **Công nghệ**: Next.js 15 App Router (route `/kds` trong web-tenant)
- **Thiết bị**: TV, tablet lớn, màn hình PC
- **Display**: Font lớn, dễ đọc từ xa, auto-refresh
- **Real‑time**: WebSocket (Socket.IO) cho đơn mới
- **Authentication**: JWT với KITCHEN role

**Tính năng chính**:
- Hàng đợi đơn hàng theo thời gian
- Chuyển trạng thái: Received → Preparing → Ready
- Âm thanh thông báo đơn mới
- Highlight đơn chờ lâu (priority thresholds: NORMAL ≤100%, HIGH 100-150%, URGENT >150%)

### 2.2. API Gateway / CDN (⚠️ Suggested for Production, Not in MVP)

**Note:** MVP kết nối trực tiếp từ frontend đến backend API. API Gateway/CDN là đề xuất cho production deployment.

**Vai trò (Planned):**
- Load balancing
- Rate limiting (chống abuse)
- SSL termination
- Caching tĩnh (menu images)
- Request routing theo tenant

**Công nghệ gợi ý:**
- Cloudflare / AWS CloudFront
- NGINX / Traefik

**Current MVP:** Frontend apps (localhost:3001, localhost:3002) kết nối trực tiếp với API (localhost:3000).

### 2.3. Backend API Service

#### 2.3.1. Kiến trúc Backend
**Mô hình**: Monolithic Modular (MVP) → Microservices (tương lai)

**Công nghệ**:
- **Runtime**: Node.js 20+ / Bun
- **Framework**: NestJS (cấu trúc module rõ ràng)
- **Language**: TypeScript
- **API Style**: RESTful + OpenAPI 3.0

**Implemented Modules (from `source/apps/api/src/modules/`):**

##### Auth Module ✅
- 2-step OTP registration (email verification)
- JWT-based authentication with refresh tokens
- Password reset flow with email tokens
- Role-based access control: OWNER, STAFF, KITCHEN
- Avatar upload support

##### Tenant Module ✅
- Restaurant profile management (name, slug, address, phone)
- Opening hours configuration (per day)
- Pricing settings (currency, tax, service charge, tip suggestions)
- Onboarding flow (4 steps: profile, hours, settings, payment)
- Currency: VND default (configurable)

##### Menu Module ✅
- **Categories:** CRUD with display order, active/inactive
- **Items:** CRUD with status (DRAFT/PUBLISHED/ARCHIVED), availability toggle
- **Modifiers:** Groups (SINGLE_CHOICE/MULTI_CHOICE) with price deltas
- **Photos:** Bulk upload (max 10), primary photo, display order, delete
- **Public Menu:** Customer-facing endpoint with session/JWT auth

##### Table Module ✅
- CRUD with table number, capacity, location, description
- QR code generation with signed JWT tokens
- QR regeneration (single or bulk)
- QR download formats: PNG, SVG, PDF (single), ZIP/PDF (bulk)
- Table status: AVAILABLE, OCCUPIED, RESERVED, INACTIVE
- Session management (Haidilao-style QR scan → session → menu)
- Close session & generate bill

##### Cart Module ✅
- Session-based cart (tied to table_session_id cookie)
- Add items with modifiers and special notes
- Update quantity, remove items, clear cart
- Real-time pricing calculation (subtotal, tax, service charge, total)

##### Order Module ✅
- Checkout flow (create order from cart)
- Payment methods: BILL_TO_TABLE, SEPAY_QR, CARD_ONLINE (enum only), CASH
- Order status: PENDING → RECEIVED → PREPARING → READY → SERVED → COMPLETED → PAID
- Customer self-cancel within 5 minutes (if kitchen hasn't started)
- Append items to existing BILL_TO_TABLE order
- Order tracking with timeline and ETA
- Priority calculation for KDS: NORMAL (≤100%), HIGH (100-150%), URGENT (>150%)
- Staff actions: update status, mark paid, cancel
- Request bill notification

##### Payment Module ✅
- **SePay Integration:** VietQR payment with QR code generation
- **Webhook:** Automatic payment confirmation from SePay
- **Polling Fallback:** Manual check if webhook unavailable
- **Exchange Rate:** USD to VND conversion
- Payment status tracking: PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED

##### Payment Config Module ✅
- SePay API key management (encrypted storage)
- Bank account configuration (account number, name, bank code)
- Webhook secret for verification
- Test QR generation to validate config
- Supported banks list
- Public endpoint to check enabled payment methods

##### KDS Module ✅
- Active orders grouped by priority (normal, high, urgent)
- Kitchen statistics: total active, avg prep time, orders completed today
- Mark order items as prepared
- Real-time order updates via WebSocket

##### Bill Module ✅
- Bill generation when closing table session
- Includes all unpaid orders for the session
- Subtotal, discount, tip, service charge, tax, total
- Payment method and status tracking

##### Staff Module ✅
- Email invitation system with expiring tokens
- Role assignment: STAFF (table/order management), KITCHEN (KDS only)
- List staff members and pending invitations
- Update role, remove staff, cancel invitations
- Resend invitation emails
- Accept invitation flow with account creation
- Subscription-based limits (FREE: 1, BASIC: 5, PREMIUM: unlimited)

##### Subscription Module ✅
- **Plans:** FREE, BASIC, PREMIUM with different limits
  - Tables: 1, 10, unlimited
  - Menu Items: 10, 50, unlimited
  - Orders/Month: 100, 500, unlimited
  - Staff: 1, 5, unlimited
- Current subscription and usage tracking
- Upgrade via SePay payment
- Feature gating (analytics, promotions)
- Pricing: VND 0, 25000, 50000 (monthly)

##### Analytics Module ✅
- **Overview:** Dashboard stats (today's revenue, orders, active tables)
- **Revenue:** By date range with grouping (day/week/month)
- **Orders:** Statistics with filters
- **Popular Items:** Top selling menu items
- **Hourly Distribution:** Orders by hour of day
- **Table Performance:** Revenue and turnover per table

##### Review Module ✅
- 1-5 star ratings per order item
- Optional comment
- Review statistics per menu item (avg rating, distribution)
- Tenant-wide review stats
- Recent reviews listing

##### Promotion Module ✅
- Discount codes (unique per tenant)
- Types: PERCENTAGE (with max discount cap), FIXED
- Minimum order value requirement
- Usage limits and tracking
- Start/expiry dates
- Validation at checkout
- Feature gated to BASIC+ plans

##### WebSocket Module ✅
- Real-time order updates (order.gateway.ts)
- Tenant-scoped rooms
- Order status change notifications
- Used by KDS and staff dashboard

##### Email Module ✅
- Registration OTP emails
- Password reset emails
- Email verification
- Staff invitation emails

#### 2.3.2. Middleware Pipeline

```
Request → Auth Check → Tenant Isolation → Handler → Response
                ↓              ↓                      ↓
              JWT        tenantId scope           Business
            Verify       Application‑level         Logic
                         Query Filtering
```

### 2.4. Data Layer

#### 2.4.1. PostgreSQL (Primary Database)
**Vai trò**: Lưu trữ dữ liệu chính, ACID transactions

**Schema Design**:
- **Tenant Isolation**: Field‑level `tenantId` với application‑level enforcement (RLS chưa triển khai)
- **Indexes**: Composite indexes trên `(tenantId, ...)` cho performance
- **Audit**: Application‑level logging

**Tables chính**:
```sql
tenants (id, name, slug, settings, created_at, ...)
tables (id, tenant_id, label, qr_token_hash, active, ...)
menu_categories (id, tenant_id, name, display_order, ...)
menu_items (id, tenant_id, category_id, name, price, ...)
modifiers (id, item_id, name, price_delta, ...)
orders (id, tenant_id, table_id, customer_info, state, ...)
order_items (id, order_id, item_id, modifiers, qty, ...)
audit_logs (id, tenant_id, entity, action, user, timestamp, ...)
```

**Migrations**: Sử dụng migration tool (Prisma, TypeORM, Drizzle)

#### 2.4.2. Redis
**Vai trò** (⚠️ **Partially Implemented**):
- ✅ Session storage (table_session_id for customer QR sessions)
- ✅ Registration OTP storage (2-step registration flow)
- ⚠️ Cache menu data (module exists but not actively used in current version)
- ❌ Rate limiting counters (not implemented)
- ❌ Real‑time pub/sub (WebSocket used instead)

**Current Usage**:
- **Registration Flow**: Store temporary registration data + OTP (10 min TTL)
- **Table Sessions**: Store session metadata for customer QR scans
- **Password Reset**: Store reset tokens

**Note**: Redis is set up but not fully utilized. WebSocket module (`order.gateway.ts`) handles real-time updates instead of Redis pub/sub.

#### 2.4.3. File Storage
**Current Implementation**: ⚠️ **Local File System** (MVP)

**Photo Storage (Persistent):**
- **Location:** `source/apps/api/uploads/menu-photos/`, `source/apps/api/uploads/avatars/`
- **Served by:** NestJS static file middleware
- **Upload:** Single or bulk (up to 10 per item)
- **Formats:** JPEG, PNG, WebP, GIF
- **Max size:** 5MB per photo

**QR Code Generation (Dynamic, Not Stored):**
- **Generation:** On-the-fly using `qrcode` library when requested
- **Download formats:** PNG, SVG, PDF (single), ZIP/PDF (bulk)
- **Storage:** NOT stored on disk - regenerated each time
- **Token:** QR contains JWT token (signed payload with table/tenant info)

**Clarification:** QR codes are dynamically generated and NOT persisted to object storage. Only user-uploaded photos (menu items, avatars) are stored on disk.

**Future Migration (Planned):**
- ❌ **NOT IMPLEMENTED**: AWS S3 / Cloudflare R2 for photo storage
- ❌ **NOT IMPLEMENTED**: CDN integration for faster delivery
- **Note:** Current local file system setup is suitable for MVP, requires cloud storage for production scale

### 2.5. External Services

#### 2.5.1. Payment Gateway
**Provider**: **SePay** (VietQR - Vietnam bank transfer) ✅ **IMPLEMENTED**

**Flow**:
1. Customer checkout → Backend creates SePay payment intent
2. Generate VietQR code with transfer content (order number)
3. Customer scans QR with banking app → Makes transfer
4. **Webhook** receives notification from SePay → Auto-confirm payment
5. **Polling Fallback**: If webhook unavailable, manually check via SePay API
6. Update order status to PAID

**Supported Methods**:
- ✅ **BILL_TO_TABLE**: Pay cash at end (mark paid by staff)
- ✅ **SEPAY_QR**: VietQR instant payment
- ⚠️ **CARD_ONLINE**: Enum exists but not integrated
- ✅ **CASH**: For bill closing

**Configuration**:
- Tenant-level SePay API key (encrypted)
- Bank account details (account number, name, bank code)
- Webhook secret for verification
- Test mode available

**Note**: Original plan mentioned Stripe, but **SePay is actually implemented** for Vietnam market.

#### 2.5.2. Notification Service
**Channels**:
- **Email**: Xác nhận đơn, receipt (SendGrid/SES)
- **SMS**: Thông báo đơn sẵn sàng (Twilio) – optional

#### 2.5.3. Monitoring & Observability
**Stack**:
- **Logs**: Winston/Pino → Loki/CloudWatch
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry → Jaeger
- **Alerts**: PagerDuty / Slack webhooks

---

## 3. Luồng Dữ liệu (Data Flow)

### 3.1. Customer Ordering Flow

```
┌─────────┐     1. Scan QR      ┌─────────┐
│Customer │ ─────────────────→  │ Browser │
└─────────┘                     └─────────┘
                                      │
                        2. Parse token (tableId, tenantId)
                                      │
                                      ↓
                              ┌──────────────┐
                         3. GET /menu        │
                              │  + token     │
                              └──────────────┘
                                      │
                                      ↓
                              ┌──────────────┐
                              │   Backend    │ ←─── 4. Verify token
                              │              │      5. Fetch menu (cache)
                              └──────────────┘
                                      │
                                      ↓
                              ┌──────────────┐
                              │  PostgreSQL  │
                              │  + Redis     │
                              └──────────────┘
                                      │
                        6. Return menu JSON
                                      ↓
                              ┌──────────────┐
                              │   Browser    │ ←─── 7. Display menu
                              └──────────────┘
                                      │
                        8. Add to cart, checkout
                                      │
                                      ↓
                        9. POST /orders {items, ...}
                                      │
                                      ↓
                              ┌──────────────┐
                              │   Backend    │ ←─── 10. Validate
                              │              │      11. Create order (DB)
                              │              │      12. Emit event (WebSocket)
                              └──────────────┘
                                      │
                                      ↓
                              ┌──────────────┐
                              │   Waiter     │ ←─── 13. New order notification
                              │   Console    │
                              └──────────────┘
                                      │
                                      ↓
                              ┌──────────────┐
                              │   Kitchen    │ ←─── 14. Order appears in KDS
                              │     KDS      │
                              └──────────────┘
```

### 3.2. Order State Transition Flow

```
Customer Order → [PENDING]
                      │
                      │ Kitchen acknowledges
                      ↓
                  [RECEIVED]
                      │
                      │ Kitchen starts preparation
                      ↓
                  [PREPARING]
                      │
                      │ Kitchen completes
                      ↓
                   [READY]
                      │
                      │ Waiter delivers
                      ↓
                   [SERVED]
                      │
                      │ Customer finishes
                      ↓
                 [COMPLETED]
                      │
                      │ Payment processed
                      ↓
                   [PAID]

Alternative flow at any point before SERVED:
  - Order can transition to [CANCELLED]

Each transition:
  - Logged in order_status_history
  - Timestamp recorded
  - Actor identified (userId or system)
  - WebSocket event emitted
```

### 3.3. QR Code Generation Flow

**Phase 1: Table Creation (One-time)**
```
Admin → [Create Table]
           │
           ↓
    Generate signed JWT token
    {tenantId, tableId, qrToken}
           │
           ↓
    Sign with secret key (HMAC)
           │
           ↓
    Store token hash in database
    (TABLE.qr_token_hash)
           │
           ↓
    Return table metadata
```

**Phase 2: QR Download (On-demand, Dynamic)**
```
Admin requests QR download
    (GET /tables/{id}/qr/download?format=PNG/SVG/PDF)
           │
           ↓
    Read JWT token from database
           │
           ↓
    Generate QR code image ON-THE-FLY
    using `qrcode` library
    (PNG/SVG/PDF format)
           │
           ↓
    Stream file to browser
    (NOT stored to disk or object storage)
           │
           ↓
    Download complete
```

**Bulk Download:**
```
Admin requests all QR codes
    (GET /tables/qr/download-all?format=ZIP/PDF)
           │
           ↓
    Loop through all tables
           │
           ↓
    Generate each QR code dynamically
           │
           ↓
    Combine into ZIP or multi-page PDF
           │
           ↓
    Stream combined file to browser
    (NOT stored to disk)
```

**Important Notes:**
- ✅ **Token stored:** Only JWT token hash is persisted in database
- ❌ **QR NOT stored:** Images are generated on-demand and streamed directly
- ⚠️ **Object Storage:** Planned for future but NOT in current MVP
- 🔄 **Regeneration:** When QR is regenerated, only token hash is updated in DB

**Token Structure (JWT Payload):**
```json
{
  "tid": "tenant123",
  "tbl": "table5",
  "exp": 1735689600,
  "sig": "base64_signature"
}
```

---

## 4. Security Architecture

### 4.1. Authentication & Authorization

#### 4.1.1. Customer Flow
- **Token‑based**: QR token chứa signed payload
- **No registration**: Nhập thông tin tối thiểu (tên, SĐT)
- **Session**: Short‑lived session trong Redis

#### 4.1.2. Staff Flow
- **JWT‑based**: Login → Nhận JWT token
- **Refresh token**: Stored in httpOnly cookie
- **Claims**: `{userId, tenantId, roles[]}`

#### 4.1.3. Role‑Based Access Control (RBAC)

| Role | Permissions |
|------|------------|
| Customer | Read menu, Create order (own) |
| Waiter | Read orders (tenant), Update order state |
| Kitchen | Read orders (tenant), Update order state (Preparing/Ready) |
| Admin | Full CRUD on tenant resources |

### 4.2. Multi‑tenant Isolation

**Current Implementation (✅ Application-Level)**:
1. **Application Level**: Middleware tự động inject `tenantId` filter vào mọi Prisma query
2. **API Level**: JWT token chứa `tenantId`, middleware verify và scope requests
3. **Code Level**: Guards và decorators enforce tenant scope trong controllers

**Implementation Details**:
```typescript
// Example: Application-level isolation in Prisma
await prisma.order.findMany({
  where: { tenantId: user.tenantId }, // Auto-injected by middleware
});
```

**Optional Future Enhancement (Database-Level RLS)**:
```sql
-- NOT IMPLEMENTED: Example RLS policy for future consideration
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### 4.3. Data Encryption

- **In Transit**: TLS 1.3 (HTTPS)
- **At Rest**: Database encryption (PostgreSQL + disk encryption)
- **Sensitive Fields**: PII (phone, email) → AES‑256 encryption

### 4.4. Rate Limiting (❌ Not Implemented)

**Note**: Rate limiting chưa được triển khai trong MVP. Đây là các mức đề xuất cho production.

**Suggested Levels**:
- **API Gateway**: ADD HERE req/min per IP (khi API Gateway được deploy)
- **Application**: ADD HERE req/min per user (cần implement với Redis)
- **QR Scan**: ADD HERE scans/min per QR code (cần implement anti-spam logic)

---

## 5. Scalability & Performance

### 5.1. Horizontal Scaling

**Stateless Backend**:
- Multiple API instances behind load balancer
- Session stored in Redis (shared state)
- WebSocket sticky sessions (optional: Redis adapter)

**Database**:
- Read replicas cho analytics/reports
- Connection pooling (PgBouncer)

### 5.2. Caching Strategy

**Layers**:
1. **CDN**: Static assets (images, QR codes)
2. **Application Cache**: Menu data (Redis, TTL 5m)
3. **Database Cache**: Query result caching

**Cache Invalidation**:
- Menu update → Invalidate cache by `tenantId`
- Order state change → Invalidate order cache

### 5.3. Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 200ms |
| Menu Load Time | < 1s |
| Order Submission | < 500ms |
| WebSocket Latency | < 100ms |
| Database Query (p95) | < 50ms |

---

## 6. Deployment Architecture (⚠️ Suggested / Planned)

**Note**: Section này mô tả các deployment strategies được đề xuất cho production. MVP hiện tại có thể deploy đơn giản hơn (e.g., Vercel for frontend, Railway/Render for backend).

### 6.1. Environment Strategy

**Environments**:
- **Development**: Local Docker Compose
- **Staging**: Cloud (mimic production)
- **Production**: Cloud (multi‑region optional)

### 6.2. Infrastructure (Suggested)

**Option 1: Cloud Managed Services**
```
Frontend: Vercel / Netlify
Backend: Fly.io / Render / Railway
Database: Neon / Supabase (managed Postgres)
Redis: Upstash / Redis Cloud
Storage: Cloudflare R2 / AWS S3
```

**Option 2: Container Orchestration**
```
Platform: Docker + Kubernetes (GKE/EKS)
Services: Pods with auto‑scaling
Database: Cloud SQL / RDS
Redis: ElastiCache / Memorystore
```

### 6.3. CI/CD Pipeline

```
Code Push (GitHub)
     │
     ↓
GitHub Actions
     │
     ├─→ Lint & Test
     ├─→ Build Docker Image
     ├─→ Push to Registry
     ↓
Deployment
     │
     ├─→ Staging (auto)
     └─→ Production (manual approval)
```

**Steps**:
1. Run tests (unit, integration)
2. Build Docker image
3. Push to container registry
4. Deploy to staging
5. Run smoke tests
6. Manual approval → Deploy to production
7. Health check & rollback if needed

---

## 7. Monitoring & Observability (⚠️ Suggested / Planned)

**Note**: Section này mô tả observability best practices được đề xuất. MVP hiện tại có basic console logging và có thể mở rộng dần.

### 7.1. Logging (Suggested)

**Structured Logs (Recommended Format)**:
```json
{
  "timestamp": "2025-01-11T10:30:00Z",
  "level": "info",
  "service": "api",
  "tenantId": "tenant123",
  "userId": "user456",
  "action": "order.created",
  "orderId": "order789",
  "duration": 145
}
```

**Centralized (Planned)**: Loki / ELK / CloudWatch Logs  
**Current MVP**: Console logging với NestJS Logger

### 7.2. Metrics (Suggested)

**Key Metrics (Recommended)**:
- Request rate, error rate, latency (RED)
- Database connections, query time
- Cache hit rate
- Order conversion rate

**Dashboards (Planned)**: Grafana với alerts  
**Current MVP**: Có thể dùng platform metrics (Railway/Vercel dashboards)

### 7.3. Tracing (Suggested)

**Distributed Tracing (Planned)**:
- OpenTelemetry instrumentation (chưa implement)
- Trace request từ frontend → backend → database
- Visualize trong Jaeger

**Current MVP**: Request ID correlation trong logs

### 7.4. Alerts (Suggested)

**Critical Alerts (Recommended)**:
- API error rate > 5%
- Database connection pool exhausted
- Payment webhook failure
- Disk usage > 80%

**Channels (Planned)**: PagerDuty, Slack, Email  
**Current MVP**: Manual monitoring, platform alerts (Railway/Vercel)

---

## 8. Technology Stack Summary

### 8.1. Frontend

| Component | Technology | Status |
|-----------|-----------|--------|
| Customer App | **Next.js 15** App Router + TypeScript | ✅ Implemented |
| Tenant Dashboard | **Next.js 15** App Router + TypeScript | ✅ Implemented |
| Waiter Console | Integrated in Tenant Dashboard (`/waiter` route) | ✅ Implemented |
| KDS | Integrated in Tenant Dashboard (`/kds` route) | ✅ Implemented |
| UI Framework | Tailwind CSS + shadcn/ui | ✅ Implemented |
| State Management | Zustand | ✅ Implemented |
| API Client | TanStack Query | ✅ Implemented |
| Code Generation | **Orval** (from OpenAPI spec) | ✅ Implemented |
| PWA | ❌ Not implemented | Planned |

**Note**: Original plan mentioned separate React apps, but **Next.js 15** with App Router is used for both customer and tenant applications.

### 8.2. Backend

| Component | Technology | Status |
|-----------|-----------|--------|
| Runtime | **Node.js 20+** | ✅ Implemented |
| Framework | **NestJS** | ✅ Implemented |
| Language | **TypeScript** | ✅ Implemented |
| API Docs | **OpenAPI 3.0 (Swagger)** - ~140+ operations (see openapi.exported.json) | ✅ Implemented |
| Validation | **class-validator + class-transformer** | ✅ Implemented |
| ORM | **Prisma** | ✅ Implemented |
| File Upload | **Multer** | ✅ Implemented |
| QR Code | **qrcode** library | ✅ Implemented |
| Email | Nodemailer (local SMTP for dev) | ✅ Implemented |
| WebSocket | **Socket.IO** via NestJS | ✅ Implemented |
| Password Hashing | **bcrypt** | ✅ Implemented |
| JWT | **@nestjs/jwt** | ✅ Implemented |

### 8.3. Database & Storage

| Component | Technology | Status |
|-----------|-----------|--------|
| Primary DB | **PostgreSQL** (via Prisma) | ✅ Implemented |
| ORM | **Prisma** | ✅ Implemented |
| Migrations | **Prisma Migrate** - 20+ migrations | ✅ Implemented |
| Cache | **Redis** (partial usage) | ⚠️ Partial |
| File Storage | Local file system (`uploads/`) | ✅ Implemented |
| Object Storage | ❌ AWS S3 / Cloudflare R2 | Planned |
| Search | ❌ Elasticsearch / Meilisearch | Planned |

**Database Schema**: See [docs/backend/database/description.md](../backend/database/description.md) and [ER diagram](../backend/database/er_diagram.md)

### 8.4. Infrastructure

| Component | Technology |
|-----------|-----------|
| Container | Docker |
| Orchestration | Docker Compose (dev) / Kubernetes (prod) |
| CI/CD | GitHub Actions |
| Hosting | Fly.io / Render / Vercel |
| CDN | Cloudflare |

### 8.5. Observability

| Component | Technology |
|-----------|-----------|
| Logging | Winston/Pino → Loki |
| Metrics | Prometheus + Grafana |
| Tracing | OpenTelemetry + Jaeger |
| Errors | Sentry |

---

## 9. Non‑Functional Requirements

### 9.1. Availability
- **Target**: 99.5% uptime (MVP), 99.9% (production)
- **Strategy**: Load balancing, health checks, auto‑restart

### 9.2. Reliability
- **Database**: Automated backups (daily), point‑in‑time recovery
- **Idempotency**: Order creation với idempotency keys
- **Retry Logic**: Exponential backoff cho external APIs

### 9.3. Maintainability
- **Code Quality**: ESLint, Prettier, Husky hooks
- **Documentation**: OpenAPI, JSDoc, Architecture Decision Records (ADR)
- **Testing**: Unit (>80%), Integration, E2E

### 9.4. Security
- **OWASP Top 10**: Mitigated
- **Secrets Management**: Environment variables, Vault (future)
- **Vulnerability Scanning**: Dependabot, Snyk

---

## 10. Future Enhancements (Planned but Not Implemented)

**Phase 2 Features:**
- Multi‑location support (chuỗi nhà hàng)
- Advanced Analytics (cohort analysis, heatmaps)
- Inventory Management (stock tracking)
- Native mobile apps (iOS/Android)

**Technical Improvements:**
- Microservices architecture (tách modules)
- Event‑Driven with message queue (RabbitMQ/Kafka)
- GraphQL API (thay thế REST)
- Cloud storage (S3/R2) + CDN integration

**Integrations:**
- POS Systems (Square, Toast)
- Kitchen Printers (auto-print orders)
- Loyalty Programs (points, rewards)
- Third‑party Delivery (Grab, Shopee Food)

**Full planned features list:** See [USER_GUIDE.md Section 7](./USER_GUIDE.md#7-faq--known-limitations) for detailed feature roadmap.

---

## 11. Quyết định Kiến trúc (ADR)

### ADR‑001: Monolithic Modular (MVP)
**Quyết định**: Bắt đầu với monolith có cấu trúc module rõ ràng.  
**Lý do**: Đơn giản triển khai, dễ debug, đủ cho MVP.  
**Trade‑off**: Khó scale độc lập từng module, nhưng có thể refactor sau.

### ADR‑002: PostgreSQL with Application-Level Isolation
**Quyết định**: Dùng PostgreSQL với application-level `tenantId` filtering cho multi‑tenant.  
**Lý do**: ACID, mature, đơn giản implementation cho MVP, cost‑effective.  
**Trade‑off**: Phụ thuộc vào application logic (không có database-level RLS), nhưng đủ cho SMB scale và dễ debug.  
**Future**: Có thể thêm Row-Level Security (RLS) policies khi scale lên.

### ADR‑003: JWT cho Auth
**Quyết định**: JWT stateless cho staff/admin, token‑based cho customer.  
**Lý do**: Không cần session server, scale dễ dàng.  
**Trade‑off**: Không thể revoke JWT ngay lập tức (dùng short TTL + refresh token).

### ADR‑004: SePay VietQR Payment (MVP) ✅
**Quyết định**: Dùng **SePay** (VietQR - Vietnam bank transfer) thay vì Stripe.  
**Lý do**: Target market là Vietnam, VietQR phổ biến, không cần credit card, instant confirmation.  
**Implementation**: Webhook + polling fallback, QR code generation, tenant-level config.  
**Trade‑off**: Chỉ support Vietnam banks, cần bank account setup per tenant.

### ADR‑005: Next.js 15 App Router
**Quyết định**: Dùng **Next.js 15** với App Router cho cả customer và tenant apps.  
**Lý do**: SSR/SSG support, file-based routing, React Server Components, TypeScript first-class.  
**Trade‑off**: Learning curve cao hơn Vite, nhưng SEO và performance tốt hơn cho customer app.

### ADR‑006: Orval Code Generation
**Quyết định**: Generate API client code từ OpenAPI spec bằng **Orval**.  
**Lý do**: Type-safe API calls, sync giữa backend và frontend, giảm boilerplate.  
**Trade‑off**: Dependency vào OpenAPI spec quality, cần regenerate khi API thay đổi.

---

## 12. Tài liệu Tham khảo

### 12.1. Internal Docs
- ✅ [OpenAPI Specification](./openapi.exported.json) - Full API spec with ~140+ operations (exact count in file)
- ✅ [OpenAPI Documentation](./OPENAPI.md) - API usage guide
- ✅ [User Guide](./USER_GUIDE.md) - End-user manual for all roles
- ✅ [Database Schema](../backend/database/description.md) - Prisma schema documentation
- ✅ [Database ER Diagram](../backend/database/er_diagram.md) - Entity relationship diagram
- ✅ [Frontend Architecture - Tenant](../frontend/ARCHITECTURE.md) - Next.js app structure
- ✅ [Orval Code Generation](../frontend/ORVAL.md) - API client generation
- ✅ [RBAC Guide](../frontend/RBAC_GUIDE.md) - Role-based access control

### 12.2. External Resources
- [NestJS Documentation](https://docs.nestjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [SePay Documentation](https://docs.sepay.vn/)
- [OpenTelemetry](https://opentelemetry.io/)

---

## 13. Ghi chú & Cập nhật

**Change Log**:
- **2025‑01‑11**: Phiên bản đầu tiên – kiến trúc tổng quan, modules, tech stack
- *(Future)*: Cập nhật khi có thay đổi lớn về kiến trúc

**Contributors**:
- *(TBD)*

**Review Cycle**: Quarterly hoặc khi có major feature/refactor

---

**END OF ARCHITECTURE DOCUMENT**

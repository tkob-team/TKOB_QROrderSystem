# Kiến trúc Hệ thống – TKOB_QROrderSystem

> **Mục đích**: Mô tả kiến trúc tổng thể, các thành phần chính, luồng dữ liệu, công nghệ và quyết định thiết kế cho TKOB_QROrderSystem (Product name: TKQR-in Ordering Platform) - nền tảng gọi món QR đa tenant.

- **Version**: 1.0  
- **Created**: 2025‑01‑11  
- **Last Updated**: 2026‑01‑20

---

## Điều hướng Tài liệu

**Tài liệu Liên quan:**
- [Setup Guide](./SETUP.md) - Cài đặt và thiết lập môi trường phát triển (ports: API 3000, Customer 3001, Tenant 3002)
- [OpenAPI Specification](./OPENAPI.md) - Tài liệu API đầy đủ (~140+ operations; xem openapi.exported.json để biết số lượng chính xác)
- [User Guide](./USER_GUIDE.md) - Tài liệu cho người dùng cuối với tất cả các vai trò
- [Database Schema](../backend/database/description.md) - Tài liệu schema chi tiết
- [ER Diagram](../backend/database/er_diagram.md) - Sơ đồ quan hệ thực thể

---

## Mục Lục (Điều hướng Nhanh)

**Trạng thái:** [0. Trạng thái Triển khai](#0-trạng-thái-triển-khai) - Những gì đã xây dựng vs dự định  
**Tổng quan:** [1. Tổng quan Kiến trúc](#1-tổng-quan-kiến-trúc) - Kiến trúc cấp cao  
**Thành phần:** [2. Các Thành Phần Chính](#2-các-thành-phần-chính) - Client, backend, data layers  
**Luồng dữ liệu:** [3. Luồng Dữ liệu](#3-luồng-dữ-liệu) - Quá trình đặt hàng, chuyển trạng thái, tạo QR  
**Bảo mật:** [4. Security Architecture](#4-security-architecture) - Xác thực, multi-tenancy, mã hóa  
**Khả năng mở rộng:** [5. Scalability & Performance](#5-scalability--performance) - Chiến lược mở rộng  
**Triển khai:** [6. Deployment Architecture](#6-deployment-architecture) - Cơ sở hạ tầng (đề xuất)  
**Quan sát:** [7. Monitoring & Observability](#7-monitoring--observability) - Logs, metrics (đề xuất)  
**Tech Stack:** [8. Technology Stack Summary](#8-technology-stack-summary) - Tất cả các công nghệ được sử dụng  
**Yêu cầu:** [9. Non‑Functional Requirements](#9-nonfunctional-requirements) - Khả dụng, độ tin cậy  
**Tương lai:** [10. Future Enhancements](#10-future-enhancements) - Các tính năng dự định  
**Quyết định:** [11. Quyết định Kiến trúc (ADR)](#11-quyết-định-kiến-trúc-adr) - Các quyết định kiến trúc

---

## 0. Trạng thái Triển khai

### 0.1. Các tính năng đã triển khai trong phiên bản hiện tại (Dựa trên bằng chứng)

**Ứng dụng Đã triển khai:**
- ✅ **API Service** (`source/apps/api`) - NestJS backend với ~140+ REST operations (xem openapi.exported.json)
- ✅ **Web Tenant Dashboard** (`source/apps/web-tenant`) - Next.js 15 admin/staff/kitchen interface
- ✅ **Web Customer App** (`source/apps/web-customer`) - Next.js 15 customer ordering interface

**Các Module Đã triển khai (Xác minh từ OpenAPI Spec & Codebase):**

| Module | Trạng thái | Bằng chứng |
|--------|--------|----------|
| **Xác thực** | ✅ Đã triển khai | OTP 2 bước, xác thực JWT, làm mới token, đặt lại mật khẩu |
| **Tenants** | ✅ Đã triển khai | Hồ sơ nhà hàng, cài đặt, cấu hình giá, luồng onboarding |
| **Quản lý Menu** | ✅ Đã triển khai | Danh mục, mục, modifier (SINGLE/MULTI choice), ảnh (tải hàng loạt) |
| **Bàn & QR Code** | ✅ Đã triển khai | CRUD, tạo/tạo lại QR, tải xuống (PNG/SVG/PDF/ZIP), phiên |
| **Giỏ hàng** | ✅ Đã triển khai | Giỏ hàng dựa trên phiên với modifier, giá thực tế |
| **Đơn hàng** | ✅ Đã triển khai | Thanh toán, theo dõi trạng thái, hủy (cửa sổ 5 phút), thêm mục |
| **Thanh toán** | ✅ Đã triển khai | Tích hợp SePay QR, webhook + polling fallback, tính tiền theo bàn |
| **Cấu hình Thanh toán** | ✅ Đã triển khai | Khóa API SePay, tài khoản ngân hàng, tạo QR kiểm tra |
| **KDS (Hiển thị Bếp)** | ✅ Đã triển khai | Hiển thị dựa trên mức độ ưu tiên (Thường/Cao/Khẩn cấp), thống kê thực tế |
| **Quản lý Nhân viên** | ✅ Đã triển khai | Lời mời email, gán vai trò (STAFF/KITCHEN), giới hạn theo gói |
| **Đăng ký** | ✅ Đã triển khai | Cấp FREE/BASIC/PREMIUM, theo dõi sử dụng, nâng cấp qua SePay |
| **Phân tích** | ✅ Đã triển khai | Doanh thu, đơn hàng, mục phổ biến, phân bố theo giờ, hiệu suất bàn |
| **Đánh giá & Xếp hạng** | ✅ Đã triển khai | Xếp hạng 1-5 sao cho từng mục đơn hàng, thống kê tổng hợp |
| **Khuyến mãi** | ✅ Đã triển khai | Mã chiết khấu (PERCENTAGE/FIXED), giới hạn sử dụng, xác thực |
| **Hóa đơn** | ✅ Đã triển khai | Tạo hóa đơn khi đóng phiên bàn |
| **WebSocket** | ✅ Đã triển khai | Cập nhật đơn hàng thực tế (order.gateway.ts) |
| **Kiểm tra Sức khỏe** | ✅ Đã triển khai | Endpoints cơ bản, chi tiết, sẵn sàng, sống |

**Cơ sở dữ liệu:**
- ✅ **PostgreSQL** với Prisma ORM
- ✅ Cách ly đa tenant qua trường `tenantId` (application-level)
- ✅ 21 migrations đã áp dụng (tính đến 2026-01-20) (xem `prisma/migrations/`)

**Xác thực & Bảo mật:**
- ✅ JWT bearer tokens với cơ chế làm mới
- ✅ Kiểm soát truy cập dựa trên vai trò: OWNER, STAFF, KITCHEN
- ✅ Xác thực khách hàng dựa trên phiên (quét QR → table_session_id cookie)
- ✅ Gating tính năng dựa trên đăng ký

**Tài liệu API:**
- ✅ Đặc tả OpenAPI 3.0 đầy đủ: [openapi.exported.json](./openapi.exported.json)
- ✅ ~140+ hoạt động được ghi chép trên nhiều thẻ API (xem openapi.exported.json để biết số lượng chính xác)
- ✅ Xem thêm: [OPENAPI.md](./OPENAPI.md)

**Tài liệu Người dùng:**
- ✅ Hướng dẫn người dùng toàn diện: [USER_GUIDE.md](./USER_GUIDE.md)

### 0.2. Đã lên kế hoạch / Không có trong MVP hiện tại

**Các tính năng CHƯA triển khai:**
- ❌ **Order Modification** - Không thể chỉnh sửa đơn hàng sau khi thanh toán (phải hủy và đặt lại)
- ❌ **Split Bills** - Tất cả đơn hàng ở bàn được gộp thành một hóa đơn
- ❌ **Inventory Management** - Không có theo dõi kho hoặc quản lý nguyên liệu
- ❌ **Shift Management** - Không có chấm công/giờ về hoặc báo cáo ca làm
- ❌ **Multi-Location** - Một nhà hàng trên mỗi tenant (không hỗ trợ chuỗi)
- ❌ **Kitchen Printer Integration** - Chỉ hiển thị KDS trên màn hình
- ❌ **Native Mobile Apps** - Web-only (không có iOS/Android native)
- ❌ **Offline Mode** - Cần kết nối internet để tất cả hoạt động
- ❌ **Advanced Analytics** - Phân tích cohort, heatmaps, phân tích dự đoán
- ❌ **POS Integration** - Không có kết nối hệ thống POS bên ngoài
- ❌ **Loyalty/Rewards** - Không có chương trình điểm hoặc phần thưởng

**Cơ sở hạ tầng CHƯA triển khai:**
- ❌ **Elasticsearch/Meilisearch** - Không có công cụ tìm kiếm toàn văn
- ❌ **Message Queue** - Không có RabbitMQ/Kafka cho các tác vụ không đồng bộ
- ❌ **Kubernetes** - Phát triển chỉ sử dụng Docker Compose
- ❌ **CDN** - Không có tích hợp Cloudflare/CloudFront được ghi chép
- ❌ **Object Storage** - Ảnh được lưu trữ cục bộ trong thư mục `uploads/`

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
│  - Rate Limiting (chưa triển khai)                          │
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

**Ghi chú:** MVP kết nối trực tiếp từ frontend đến backend API. API Gateway/CDN là đề xuất cho production deployment.

**Vai trò (Dự định):**
- Load balancing
- Rate limiting (chống abuse)
- SSL termination
- Caching tĩnh (menu images)
- Định tuyến yêu cầu theo tenant

**Công nghệ gợi ý:**
- Cloudflare / AWS CloudFront
- NGINX / Traefik

**MVP Hiện tại:** Frontend apps (localhost:3001, localhost:3002) kết nối trực tiếp với API (localhost:3000).

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
- **Bill Request** ✅ **IMPLEMENTED**:
  - Customer calls `POST /orders/session/request-bill` → Staff notified in real-time
  - Backend sets `table_sessions.bill_requested_at` timestamp
  - Session transitions to read-only (blocks new order items)
  - WebSocket event `order:bill_requested` emitted to staff room (staff/owner clients)
  - Staff views pending bills and brings check/payment device to table
  - Customer can cancel with `POST /orders/session/cancel-bill-request` (unlocks session)
  - Idempotent: duplicate requests return success without side effects

##### Mô-đun Thanh toán ✅ **IMPLEMENTED** (Partial)

**Phương thức Thanh toán hỗ trợ**:

| Phương thức | Trạng thái | Chi tiết |
|-----------|----------|---------|
| **BILL_TO_TABLE** | ✅ Implemented | Thanh toán tiền mặt khi khách rời đi (nhân viên đánh dấu đã trả) |
| **SEPAY_QR** | ✅ Implemented | VietQR – thanh toán qua chuyển khoản ngân hàng, webhook automatic confirmation |
| **CARD_ONLINE** | ⚠️ Partial | DTO enum tồn tại, nhưng **CHƯA tích hợp payment processor** (chưa triển khai) |
| **CASH** | ✅ Implemented | Để đóng hóa đơn, không xử lý thanh toán |

**Chi tiết Triển khai**:

**BILL_TO_TABLE** ✅:
- Bàn được cộng các mục vào một đơn hàng chung
- Khách không thanh toán ngay
- Nhân viên cuối cùng chỉ mục lục và chọn thanh toán BILL_TO_TABLE
- Nhân viên đánh dấu PAID (hoặc khách thanh toán qua app)

**SEPAY_QR** ✅:
- Tích hợp gateway thanh toán SePay (VietQR)
- Tạo VietQR (mã QR thanh toán) → Khách quét qua app ngân hàng
- **Webhook**: SePay gửi thông báo thanh toán → Backend auto-confirm
- **Fallback Polling**: Nếu webhook không khả dụng, backend kiểm tra thủ công
- Trạng thái: PENDING → PROCESSING → COMPLETED (hoặc FAILED)
- Yêu cầu: SePay API key + thông tin tài khoản ngân hàng (per tenant)

**CARD_ONLINE** ⚠️ **INCOMPLETE**:
- Enum `CARD_ONLINE` hiện tại trong DTO checkout
- **KHÔNG có tích hợp processor thực tế** (chưa triển khai)
- Frontend component `CardPaymentPage.tsx` bị thiếu (xem Audit Report)
- **Hiện tại**: Nếu chọn CARD_ONLINE, sẽ gây lỗi hoặc không hoạt động
- **Lộ trình**: Dự kiến Q2 2026 (tích hợp Stripe/Adyen)

**Trạng thái Thanh toán**:
- `PENDING`: Chờ thanh toán
- `PROCESSING`: Xử lý (SePay trả lời)
- `COMPLETED`: Thanh toán thành công
- `FAILED`: Thanh toán thất bại
- `REFUNDED`: Hoàn tiền

**Webhook**:
- SePay webhook endpoint: `/webhooks/sepay`
- HMAC verification để đảm bảo legitimacy
- Retry logic nếu webhook handler thất bại

**Tài khoản Ngân hàng**:
- Quản lý per tenant
- Thông tin bí mật được mã hóa trước khi lưu
- Hỗ trợ các ngân hàng Vietnam (xem danh sách from SePay)

##### Mô-đun Cấu hình Thanh toán ✅
- Quản lý khóa API SePay (lưu trữ được mã hóa)
- Cấu hình tài khoản ngân hàng (số tài khoản, tên, mã ngân hàng)
- Bí mật webhook để xác minh
- Tạo mã QR kiểm tra để xác thực cấu hình
- Danh sách các ngân hàng được hỗ trợ
- Endpoint công khai để kiểm tra các phương thức thanh toán được bật

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
- Tenant-scoped rooms (namespace per tenant)
- **Events emitted** ✅:
  - `order:created` → New order (audience: kitchen, staff)
  - `order:status_changed` → State transition (audience: customer, kitchen, staff)
  - `order:bill_requested` → Customer requests bill (audience: staff, owner) — **sets `table_sessions.bill_requested_at`, session becomes read-only**
  - `order:completed` → Order finished (audience: customer)
  - `order:cancelled` → Order cancelled (audience: kitchen, staff)
- Used by KDS, staff console, and customer app (order tracking)

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
**Vai trò** (⚠️ **Một phần được triển khai**):
- ✅ Session storage (table_session_id for customer QR sessions)
- ✅ Registration OTP storage (2-step registration flow)
- ✅ Cache menu data

**Current Usage**:
- **Registration Flow**: Store temporary registration data + OTP (10 min TTL)
- **Table Sessions**: Store session metadata for customer QR scans
- **Password Reset**: Store reset tokens

**Note**: Redis is set up but not fully utilized. WebSocket module (`order.gateway.ts`) handles real-time updates instead of Redis pub/sub.

#### 2.4.3. File Storage
**Current Implementation**: ⚠️ **Local File System** (MVP)

**Lưu trữ Ảnh (Lâu dài):**
- **Vị trí:** `source/apps/api/uploads/menu-photos/`, `source/apps/api/uploads/avatars/`
- **Phục vụ bởi:** NestJS static file middleware
- **Tải lên:** Đơn lẻ hoặc hàng loạt (tối đa 10 cho mỗi mục)
- **Định dạng:** JPEG, PNG, WebP, GIF
- **Kích thước tối đa:** 5MB mỗi ảnh

**Tạo mã QR (Động, Không được Lưu trữ):**
- **Tạo:** Theo yêu cầu bằng thư viện `qrcode`
- **Định dạng tải xuống:** PNG, SVG, PDF (đơn lẻ), ZIP/PDF (hàng loạt)
- **Lưu trữ:** KHÔNG được lưu trữ trên đĩa - tái tạo mỗi lần
- **Token:** QR chứa token JWT (payload ký với thông tin table/tenant)

**Làm rõ:** Mã QR được tạo động và KHÔNG được lưu trữ vào lưu trữ đối tượng. Chỉ các ảnh do người dùng tải lên (các mục menu, ảnh đại diện) mới được lưu trữ trên đĩa.

**Future Migration (Planned):**
- ❌ **Chưa triển khai**: AWS S3 / Cloudflare R2 cho lưu trữ ảnh
- ❌ **Chưa triển khai**: Tích hợp CDN để cấp phát nhanh hơn
- **Ghi chú:** Thiết lập hệ thống tệp cục bộ hiện tại phù hợp cho MVP, yêu cầu lưu trữ đám mây cho sản xuất ở quy mô lớn

### 2.5. External Services

#### 2.5.1. Payment Gateway
**Provider**: **SePay** (VietQR - Vietnam bank transfer) ✅ **IMPLEMENTED**

**Flow**:
1. Khách hàng thanh toán → Backend tạo ý định thanh toán SePay
2. Tạo mã VietQR với nội dung chuyển (số đơn hàng)
3. Khách hàng quét mã QR bằng ứng dụng ngân hàng → Thực hiện chuyển tiền
4. **Webhook** nhận thông báo từ SePay → Xác nhận thanh toán tự động
5. **Fallback Polling**: Nếu webhook không khả dụng, kiểm tra thủ công qua SePay API
6. Cập nhật trạng thái đơn hàng thành PAID

**Các phương thức được hỗ trợ**:
- ✅ **BILL_TO_TABLE**: Thanh toán tiền mặt vào cuối (nhân viên đánh dấu đã trả)
- ✅ **SEPAY_QR**: Thanh toán VietQR tức thời
- ⚠️ **CARD_ONLINE**: Enum tồn tại nhưng chưa tích hợp
- ✅ **CASH**: Để đóng hóa đơn

**Cấu hình**:
- Khóa API SePay cấp Tenant (được mã hóa)
- Thông tin tài khoản ngân hàng (số tài khoản, tên, mã ngân hàng)
- Bí mật webhook để xác minh
- Chế độ kiểm tra có sẵn

**Ghi chú**: Kế hoạch gốc đề cập đến Stripe, nhưng **SePay thực sự đã được triển khai** cho thị trường Vietnam.

#### 2.5.2. Dịch vụ Thông báo
**Các kênh**:
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
                      │ Customer finishes & requests bill (OR staff marks paid)
                      ├─→ [Bill Requested]
                      │   ↓
                      │   table_sessions.bill_requested_at = NOW()
                      │   → WebSocket event order:bill_requested → staff/owner
                      │   → Session locked (blocks new items)
                      │   → Waiter brings bill to table
                      │
                      ↓
                 [COMPLETED]
                      │
                      │ Payment processed
                      ↓
                   [PAID]

Alternative flow at any point before SERVED:
  - Order can transition to [CANCELLED]

Alternative: Bill Request Cancellation:
  - Customer calls cancel-bill-request
  - table_sessions.bill_requested_at = NULL
  - Session unlocked (allows new items again)
  - Waiter notified to cancel bill delivery

Each transition:
  - Logged in order_status_history
  - Timestamp recorded
  - Actor identified (userId or system)
  - WebSocket event emitted (tenant-scoped room)
```

### 3.3. QR Code Generation Flow

**Giai đoạn 1: Tạo Bàn (Một lần)**
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

**Giai đoạn 2: Tải xuống QR (Theo yêu cầu, Động)**
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

**Tải xuống Hàng loạt:**
```
Admin yêu cầu tất cả mã QR
    (GET /tables/qr/download-all?format=ZIP/PDF)
           │
           ↓
    Vòng lặp qua tất cả các bàn
           │
           ↓
    Tạo mã QR động cho mỗi bàn
           │
           ↓
    Kết hợp thành ZIP hoặc PDF nhiều trang
           │
           ↓
    Stream tệp kết hợp đến trình duyệt
    (KHÔNG được lưu trữ trên đĩa)
```

**Important Notes:**
- ✅ **Token stored:** Chỉ hash JWT token được lưu trữ trong cơ sở dữ liệu
- ❌ **QR NOT stored:** Ảnh được tạo theo yêu cầu và stream trực tiếp
- ⚠️ **Object Storage:** Dự định cho tương lai nhưng CHỈ không có trong MVP hiện tại
- 🔄 **Regeneration:** Khi QR được tạo lại, chỉ hash token trong DB được cập nhật

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

#### 4.1.2. Staff Flow (Email/Password)
- **JWT‑based**: Login → Nhận JWT token
- **Refresh token**: Stored in httpOnly cookie
- **Claims**: `{userId, tenantId, roles[]}`

#### 4.1.3. Google OAuth 2.0 (Web-Tenant Only) ✅ **IMPLEMENTED**

**Scope**: Đăng nhập cho Tenant Dashboard (`web-tenant`) - chỉ dành cho admin/owner

**Luồng OAuth**:
```
1. Admin truy cập http://localhost:3002 → Nhấp "Sign in with Google"
                ↓
2. Frontend redirect → Backend Google Auth endpoint
                ↓
3. Backend khởi tạo Google OAuth flow (Passport Strategy)
                ↓
4. Admin login qua Google account
                ↓
5. Google redirect callback → Backend (với authorization code)
                ↓
6. Backend verify code với Google, nhận user profile
                ↓
7. Backend check nếu user đã tồn tại:
   - YES: Cấp JWT tokens
   - NO: Tạo user mới + tạo tenant + assign OWNER role
                ↓
8. Backend redirect → Frontend callback page (với tokens qua query params)
                ↓
9. Frontend lưu tokens (localStorage + cookie)
                ↓
10. Nếu user mới → Redirect /auth/onboarding-wizard
    Nếu user cũ → Redirect /admin/dashboard
```

**Yêu cầu Cấu hình**:
- `GOOGLE_CLIENT_ID` (bắt buộc nếu bật OAuth)
- `GOOGLE_CLIENT_SECRET` (bắt buộc nếu bật OAuth)
- `GOOGLE_CALLBACK_URL` (bắt buộc nếu bật OAuth)

**Ghi chú**: Tất cả 3 biến phải cung cấp. Nếu thiếu, tính năng sẽ vô hiệu.

**Not Supported**: 
- ❌ Google OAuth cho Customer App (`web-customer`) – sử dụng QR-based auth
- ❌ Google OAuth cho staff invitation – chỉ email-based invitations

#### 4.1.4. Role‑Based Access Control (RBAC)

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
-- Chưa triển khai: Ví dụ chính sách RLS dành cho xem xét tương lai
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### 4.3. Data Encryption

- **In Transit**: TLS 1.3 (HTTPS)
- **At Rest**: Database encryption (PostgreSQL + disk encryption)
- **Sensitive Fields**: PII (phone, email) → AES‑256 encryption

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

## 6. Kiến trúc Triển khai (⚠️ Đề xuất / Dự định)

**Ghi chú**: Phần này mô tả các chiến lược triển khai được đề xuất cho sản xuất. MVP hiện tại có thể triển khai đơn giản hơn (ví dụ: Vercel cho frontend, Railway/Render cho backend).

### 6.1. Chiến lược Môi trường

**Môi trường**:
- **Phát triển**: Local Docker Compose
- **Staging**: Cloud (giống sản xuất)
- **Sản xuất**: Cloud (multi-region tùy chọn)

### 6.2. Cơ sở hạ tầng (Đề xuất)

**Tùy chọn 1: Dịch vụ Quản lý Cloud**
```
Frontend: Vercel / Netlify
Backend: Fly.io / Render / Railway
Database: Neon / Supabase (managed Postgres)
Redis: Upstash / Redis Cloud
Storage: Cloudflare R2 / AWS S3
```

**Tùy chọn 2: Điều phối Container**
```
Platform: Docker + Kubernetes (GKE/EKS)
Services: Pods with auto‑scaling
Database: Cloud SQL / RDS
Redis: ElastiCache / Memorystore
```

### 6.3. Pipeline CI/CD

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

**Các bước**:
1. Chạy kiểm tra (unit, integration)
2. Xây dựng Docker image
3. Đẩy đến container registry
4. Triển khai đến staging
5. Chạy smoke tests
6. Manual approval → Triển khai đến sản xuất
7. Kiểm tra sức khỏe & rollback nếu cần

---

## 7. Giám sát & Quan sát (⚠️ Đề xuất / Dự định)

**Ghi chú**: Phần này mô tả best practices quan sát được đề xuất. MVP hiện tại có cơ bản console logging và có thể mở rộng dần dần.

### 7.1. Logging (Đề xuất)

**Structured Logs (Định dạng được Đề xuất)**:
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

**Tập trung hóa (Dự định)**: Loki / ELK / CloudWatch Logs  
**MVP Hiện tại**: Console logging với NestJS Logger

### 7.2. Metrics (Đề xuất)

**Các Metrics Chính (Được Đề xuất)**:
- Request rate, error rate, latency (RED)
- Database connections, query time
- Cache hit rate
- Order conversion rate

**Dashboards (Dự định)**: Grafana với alerts  
**MVP Hiện tại**: Có thể sử dụng platform metrics (Railway/Vercel dashboards)

### 7.3. Tracing (Đề xuất)

**Distributed Tracing (Dự định)**:
- OpenTelemetry instrumentation (chưa triển khai)
- Trace request từ frontend → backend → database
- Visualize trong Jaeger

**MVP Hiện tại**: Request ID correlation trong logs

### 7.4. Alerts (Đề xuất)

**Critical Alerts (Được Đề xuất)**:
- API error rate > 5%
- Database connection pool exhausted
- Payment webhook failure
- Disk usage > 80%

**Channels (Dự định)**: PagerDuty, Slack, Email  
**MVP Hiện tại**: Manual monitoring, platform alerts (Railway/Vercel)

---

## 8. Tóm tắt Tech Stack

### 8.1. Frontend

| Thành phần | Công nghệ | Trạng thái |
|-----------|-----------|--------|
| Customer App | **Next.js 15** App Router + TypeScript | ✅ Implemented |
| Tenant Dashboard | **Next.js 15** App Router + TypeScript | ✅ Implemented |
| Waiter Console | Integrated in Tenant Dashboard (`/waiter` route) | ✅ Implemented |
| KDS | Integrated in Tenant Dashboard (`/kds` route) | ✅ Implemented |
| UI Framework | Tailwind CSS + shadcn/ui | ✅ Implemented |
| State Management | Zustand | ✅ Implemented |
| API Client | TanStack Query | ✅ Implemented |
| Code Generation | **Orval** (from OpenAPI spec) | ✅ Implemented |
| PWA | ❌ Chưa triển khai | Planned |

**Ghi chú**: Kế hoạch gốc đề cập đến các ứng dụng React riêng biệt, nhưng **Next.js 15** với App Router được sử dụng cho cả ứng dụng khách hàng và ứng dụng tenant.

### 8.2. Backend

| Thành phần | Công nghệ | Trạng thái |
|-----------|-----------|--------|
| Runtime | **Node.js 20+** | ✅ Implemented |
| Framework | **NestJS** | ✅ Implemented |
| Language | **TypeScript** | ✅ Implemented |
| API Docs | **OpenAPI 3.0 (Swagger)** - ~140+ operations (xem openapi.exported.json) | ✅ Implemented |
| Validation | **class-validator + class-transformer** | ✅ Implemented |
| ORM | **Prisma** | ✅ Implemented |
| File Upload | **Multer** | ✅ Implemented |
| QR Code | **qrcode** library | ✅ Implemented |
| Email | Nodemailer (local SMTP for dev) | ✅ Implemented |
| WebSocket | **Socket.IO** via NestJS | ✅ Implemented |
| Password Hashing | **bcrypt** | ✅ Implemented |
| JWT | **@nestjs/jwt** | ✅ Implemented |

### 8.3. Cơ sở dữ liệu & Lưu trữ

| Thành phần | Công nghệ | Trạng thái |
|-----------|-----------|--------|
| Primary DB | **PostgreSQL** (via Prisma) | ✅ Implemented |
| ORM | **Prisma** | ✅ Implemented |
| Migrations | **Prisma Migrate** - 20+ migrations | ✅ Implemented |
| Cache | **Redis** (partial usage) | ⚠️ Partial |
| File Storage | Local file system (`uploads/`) | ✅ Implemented |
| Object Storage | ❌ AWS S3 / Cloudflare R2 | Planned |
| Search | ❌ Elasticsearch / Meilisearch | Planned |

**Database Schema**: Xem [docs/backend/database/description.md](../backend/database/description.md) và [ER diagram](../backend/database/er_diagram.md)

### 8.4. Cơ sở hạ tầng

| Thành phần | Công nghệ |
|-----------|-----------|
| Container | Docker |
| Orchestration | Docker Compose (dev) / Kubernetes (prod) |
| CI/CD | GitHub Actions |
| Hosting | Fly.io / Render / Vercel |
| CDN | Cloudflare |

### 8.5. Quan sát

| Thành phần | Công nghệ |
|-----------|-----------|
| Logging | Winston/Pino → Loki |
| Metrics | Prometheus + Grafana |
| Tracing | OpenTelemetry + Jaeger |
| Errors | Sentry |

---

## 9. Các Yêu cầu Phi‑Chức năng

### 9.1. Tính Khả dụng
- **Mục tiêu**: Uptime 99.5% (MVP), 99.9% (sản xuất)
- **Chiến lược**: Load balancing, health checks, auto‑restart

### 9.2. Độ tin cậy
- **Cơ sở dữ liệu**: Automated backups (hàng ngày), point‑in‑time recovery
- **Idempotency**: Order creation với idempotency keys
- **Retry Logic**: Exponential backoff cho external APIs

### 9.3. Khả năng Bảo trì
- **Code Quality**: ESLint, Prettier, Husky hooks
- **Documentation**: OpenAPI, JSDoc, Architecture Decision Records (ADR)
- **Testing**: Unit (>80%), Integration, E2E

### 9.4. Bảo mật
- **OWASP Top 10**: Giảm thiểu
- **Secrets Management**: Environment variables, Vault (tương lai)
- **Vulnerability Scanning**: Dependabot, Snyk

---

## 10. Nâng cấp Tương lai (Đã lên kế hoạch nhưng chưa triển khai)

**Các tính năng Giai đoạn 2:**
- Multi‑location support (chuỗi nhà hàng)
- Advanced Analytics (cohort analysis, heatmaps)
- Inventory Management (stock tracking)
- Native mobile apps (iOS/Android)

**Cải thiện Kỹ thuật:**
- Microservices architecture (tách modules)
- Event‑Driven with message queue (RabbitMQ/Kafka)
- GraphQL API (thay thế REST)
- Cloud storage (S3/R2) + CDN integration

**Tích hợp:**
- POS Systems (Square, Toast)
- Kitchen Printers (auto-print orders)
- Loyalty Programs (points, rewards)
- Third‑party Delivery (Grab, Shopee Food)

**Danh sách đầy đủ các tính năng dự định:** Xem [USER_GUIDE.md Phần 7](./USER_GUIDE.md#7-faq--known-limitations) để biết lộ trình tính năng chi tiết.

---

## 11. Quyết định Kiến trúc (ADR)

### ADR‑001: Monolithic Modular (MVP)
**Quyết định**: Bắt đầu với monolith có cấu trúc module rõ ràng.  
**Lý do**: Triển khai đơn giản, dễ debug, đủ cho MVP.  
**Tradeoff**: Khó scale độc lập từng module, nhưng có thể refactor sau.

### ADR‑002: PostgreSQL với Application-Level Isolation
**Quyết định**: Sử dụng PostgreSQL với application-level `tenantId` filtering cho multi‑tenant.  
**Lý do**: ACID, mature, triển khai đơn giản cho MVP, cost‑effective.  
**Tradeoff**: Phụ thuộc vào application logic (không có database-level RLS), nhưng đủ cho SMB scale và dễ debug.  
**Tương lai**: Có thể thêm Row-Level Security (RLS) policies khi scale lên.

### ADR‑003: JWT cho Auth
**Quyết định**: JWT stateless cho staff/admin, token‑based cho customer.  
**Lý do**: Không cần session server, scale dễ dàng.  
**Tradeoff**: Không thể revoke JWT ngay lập tức (sử dụng short TTL + refresh token).

### ADR‑004: SePay VietQR Payment (MVP) ✅
**Quyết định**: Sử dụng **SePay** (VietQR - Vietnam bank transfer) thay vì Stripe.  
**Lý do**: Target market là Vietnam, VietQR phổ biến, không cần credit card, instant confirmation.  
**Triển khai**: Webhook + polling fallback, QR code generation, tenant-level config.  
**Tradeoff**: Chỉ support Vietnam banks, cần bank account setup per tenant.

### ADR‑005: Next.js 15 App Router
**Quyết định**: Sử dụng **Next.js 15** với App Router cho cả customer và tenant apps.  
**Lý do**: SSR/SSG support, file-based routing, React Server Components, TypeScript first-class.  
**Tradeoff**: Learning curve cao hơn Vite, nhưng SEO và performance tốt hơn cho customer app.

### ADR‑006: Orval Code Generation
**Quyết định**: Generate API client code từ OpenAPI spec bằng **Orval**.  
**Lý do**: Type-safe API calls, sync giữa backend và frontend, giảm boilerplate.  
**Tradeoff**: Dependency vào OpenAPI spec quality, cần regenerate khi API thay đổi.

---

## 12. Tài liệu Tham khảo

### 12.1. Tài liệu Nội bộ
- ✅ [Đặc tả OpenAPI](./openapi.exported.json) - Spec API đầy đủ với ~140+ operations (đếm chính xác trong file)
- ✅ [Tài liệu OpenAPI](./OPENAPI.md) - Hướng dẫn sử dụng API
- ✅ [Hướng dẫn Người dùng](./USER_GUIDE.md) - Hướng dẫn cho người dùng cuối với tất cả các vai trò
- ✅ [Lược đồ Cơ sở dữ liệu](../backend/database/description.md) - Tài liệu lược đồ Prisma
- ✅ [Sơ đồ ER Cơ sở dữ liệu](../backend/database/er_diagram.md) - Sơ đồ quan hệ thực thể
- ✅ [Kiến trúc Frontend - Tenant](../frontend/ARCHITECTURE.md) - Cấu trúc ứng dụng Next.js
- ✅ [Tạo mã Orval](../frontend/ORVAL.md) - Tạo mã client API
- ✅ [Hướng dẫn RBAC](../frontend/RBAC_GUIDE.md) - Kiểm soát truy cập dựa trên vai trò

### 12.2. Tài nguyên Bên ngoài
- [NestJS Documentation](https://docs.nestjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [SePay Documentation](https://docs.sepay.vn/)
- [OpenTelemetry](https://opentelemetry.io/)

---

## 13. Ghi chú & Cập nhật

**Changelog**:
- **2025‑01‑11**: Phiên bản đầu tiên – kiến trúc tổng quan, modules, tech stack
- *(Tương lai)*: Cập nhật khi có thay đổi lớn về kiến trúc

**Những người đóng góp**:
- *(TBD)*

**Chu kỳ Đánh giá**: Hàng quý hoặc khi có major feature/refactor

---

**KẾT THÚC TÀI LIỆU KIẾN TRÚC**

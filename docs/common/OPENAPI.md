# OpenAPI Specification – TKOB_QROrderSystem

> Tài liệu này mô tả đầy đủ REST API của hệ thống TKOB_QROrderSystem theo chuẩn **OpenAPI 3.0**.
>
> **⚠️ NOTE:** This document is a high-level overview. For complete, up-to-date API documentation, refer to the **live Swagger UI** at `http://localhost:3000/api-docs` (development) or your deployed API's `/api-docs` endpoint.

- **Version**: 1.0.0
- **Base URL**: ADD HERE (see section 1.2 for environment-specific URLs)
- **Last Updated**: 2026-01-20

---

## Mục lục

1. [Tổng quan API](#1-tổng-quan-api)
   - [1.5. Swagger Tag Index](#15-swagger-tag-index-source-swagger-ui)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Error Handling](#3-error-handling)
4. [Rate Limiting](#4-rate-limiting)
5. [Tenants API](#5-tenants-api)
6. [Legacy API Examples (Archived)](#6-legacy-api-examples-archived)
7. [OpenAPI Export (Optional)](#7-openapi-export-optional)
8. [Subscription Management API](#8-subscription-management-api)
9. [Staff Management API](#9-staff-management-api)
10. [Bill Management API](#10-bill-management-api)
11. [Review System API](#11-review-system-api)
12. [Promotion System API](#12-promotion-system-api)

---

## 1. Tổng quan API

### 1.1. API Design Principles

- **RESTful**: Tuân thủ nguyên tắc REST (Resources, HTTP Methods, Status Codes)
- **Multi-tenant**: Mọi endpoint đều tenant-scoped
- **Versioned**: API versioning qua URL path (`/api/v1`, `/api/v2`)
- **JSON**: Request/Response format là JSON
- **Idempotent**: POST/PUT với idempotency keys khi cần
- **Pagination**: Cursor-based hoặc offset-based
- **Filtering**: Query parameters cho filter/sort

### 1.2. Base URL

```
Production:  ADD HERE (example: https://api.your-domain.com/api/v1)
Staging:     ADD HERE (example: https://api.staging.your-domain.com/api/v1)
Development: http://localhost:3000/api/v1
```

### 1.3. Content Type

```http
Content-Type: application/json
Accept: application/json
```

### 1.4. API Documentation URL

- **Swagger UI (Development)**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: ADD HERE (example: `http://localhost:3000/api-docs-json` for local, verify exact path in NestJS Swagger config)
- **Production Swagger**: ADD HERE (replace with your deployed domain + `/api-docs`)

> **🔍 Source of Truth:** The Swagger UI auto-generated from code decorators is the authoritative API reference. This markdown document provides conceptual overviews and workflows.

### 1.5. API Overview (Auto-derived from OpenAPI Spec)

> **Source of Truth:** Live Swagger UI at `http://localhost:3000/api-docs`  
> **Total Operations:** 142 endpoints across 23 tags  
> **Last Verified:** 2026-01-20 (from `openapi.exported.json`)

**Operations by Category:**

| Tag | Count | Representative Endpoints |
|-----|-------|-------------------------|
| **Authentication** | 15 | `POST /api/v1/auth/register/submit`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout` |
| **Menu - Categories** | 6 | `POST /api/v1/menu/categories`, `GET /api/v1/menu/categories`, `PATCH /api/v1/menu/categories/{id}`, `DELETE /api/v1/menu/categories/{id}` |
| **Menu - Items** | 7 | `POST /api/v1/menu/item`, `GET /api/v1/menu/item`, `PATCH /api/v1/menu/item/{id}`, `POST /api/v1/menu/item/{id}/publish` |
| **Menu - Items (Public)** | 2 | `GET /api/v1/menu/item/public`, `GET /api/v1/menu/item/public/{id}` |
| **Menu - Modifiers** | 5 | `POST /api/v1/menu/modifiers`, `GET /api/v1/menu/modifiers`, `PATCH /api/v1/menu/modifiers/{id}`, `DELETE /api/v1/menu/modifiers/{id}` |
| **Menu - Photos** | 6 | `POST /api/v1/menu/items/{itemId}/photos`, `GET /api/v1/menu/items/{itemId}/photos`, `DELETE /api/v1/menu/items/{itemId}/photos/{photoId}` |
| **Menu - Public** | 1 | `GET /api/v1/menu/public` (customer-facing menu with session/JWT auth) |
| **Tables** | 15 | `POST /api/v1/admin/tables`, `GET /api/v1/admin/tables`, `POST /api/v1/admin/tables/{id}/qr/generate`, `GET /api/v1/admin/tables/{id}/qr/download` |
| **Tables - Public** | 3 | `GET /api/v1/t/{qrToken}` (QR scan), `GET /api/v1/session`, `GET /api/v1/menu` |
| **Cart** | 5 | `POST /api/v1/cart/items`, `GET /api/v1/cart`, `PATCH /api/v1/cart/items/{itemId}`, `DELETE /api/v1/cart` |
| **Orders** | 14 | `POST /api/v1/checkout`, `GET /api/v1/orders/mergeable`, `POST /api/v1/orders/{orderId}/append-items`, `GET /api/v1/admin/orders` |
| **KDS - Kitchen Display** | 2 | `GET /api/v1/admin/kds/orders/active`, `GET /api/v1/admin/kds/stats` |
| **Bills** | 2 | `GET /api/v1/admin/bills`, `GET /api/v1/admin/bills/{id}` |
| **Payments** | 6 | `POST /api/v1/payment/intent`, `GET /api/v1/payment/{paymentId}`, `POST /api/v1/payment/webhook`, `GET /api/v1/payment/poll` |
| **Payment Config** | 6 | `GET /api/v1/admin/payment-config`, `PUT /api/v1/admin/payment-config`, `POST /api/v1/admin/payment-config/test` |
| **Tenants** | 8 | `GET /api/v1/tenants/me`, `PATCH /api/v1/tenants/profile`, `PATCH /api/v1/tenants/settings`, `POST /api/v1/tenants/complete-onboarding` |
| **Subscription** | 6 | `GET /api/v1/admin/subscription/current`, `GET /api/v1/admin/subscription/usage`, `POST /api/v1/admin/subscription/upgrade` |
| **Subscription - Public** | 3 | `GET /api/v1/subscription/plans`, `GET /api/v1/subscription/plans/{tier}`, `GET /api/v1/subscription/features` |
| **Promotions** | 6 | `POST /api/v1/admin/promotions`, `GET /api/v1/admin/promotions`, `POST /api/v1/checkout/validate-promo` |
| **Reviews** | 5 | `POST /api/v1/orders/{orderId}/items/{itemId}/review`, `GET /api/v1/orders/{orderId}/reviews`, `GET /api/v1/admin/reviews/stats` |
| **Analytics** | 6 | `GET /api/v1/admin/analytics/overview`, `GET /api/v1/admin/analytics/revenue`, `GET /api/v1/admin/analytics/popular-items` |
| **Staff Management** | 9 | `POST /api/v1/admin/staff/invite`, `GET /api/v1/admin/staff`, `POST /api/v1/admin/staff/accept-invite` |
| **Health** | 4 | `GET /health`, `GET /api/v1/health/detailed`, `GET /api/v1/health/ready`, `GET /api/v1/health/live` |

**For complete endpoint details:**
- Request/response schemas: Swagger UI → Expand any tag
- Authentication requirements: Look for 🔒 icon in Swagger UI
- Try endpoints live: Use "Try it out" button in Swagger UI

**Evidence Source:** Verified via Python analysis of `docs/common/openapi.exported.json` (142 operations, 23 tags)

---

## 2. Authentication & Authorization

### 2.1. Authentication Flows (Owner & Staff)

Hệ thống sử dụng cơ chế **Stateful Session with JWT**.

- **Access Token**: Stateless JWT (ngắn hạn), chứa thông tin authorize.
- **Refresh Token**: Stateful (được lưu hash trong bảng `USER_SESSION`), dùng để quản lý phiên đăng nhập và revoke quyền truy cập.

#### 2.1.1. Registration Process (2-Step Flow)

**Quy trình gồm 2 bước API chính**, sử dụng **Redis** làm bộ nhớ tạm để lưu thông tin đăng ký trong lúc chờ xác thực.

**Step 1: Submit & Challenge (Gửi thông tin & Nhận OTP)**

User nhập toàn bộ thông tin đăng ký. Hệ thống kiểm tra trùng lặp (Duplicate Check) trước, nếu hợp lệ thì lưu tạm vào Redis và gửi OTP.

- **Endpoint**: `POST /api/v1/auth/register/submit`
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "email": "ADD HERE (example: owner@example.com)",
  "password": "ADD HERE (example: StrongPassword!123)",
  "fullName": "ADD HERE (example: John Doe)",
  "tenantName": "ADD HERE (example: Restaurant Name)",
  "slug": "ADD HERE (example: restaurant-slug)"
}
```

**Backend Logic**:

1. **Validation**: Kiểm tra format email, password complexity.
2. **Uniqueness Check (Postgres)**:
    - Kiểm tra `email` có trong bảng `USER` chưa?
    - Kiểm tra `slug` có trong bảng `TENANT` chưa?
    - *Nếu trùng*: Trả về `409 Conflict` ngay lập tức (kèm message chi tiết lỗi ở field nào).
3. **Temporary Storage (Redis)**:
    - Hash password.
    - Generate OTP (6 số).
    - Generate `registrationToken` (Random string, dùng làm key truy xuất Redis).
    - Lưu object `{ email, password_hash, fullName, tenantName, slug, otp }` vào Redis với Key=`reg:{registrationToken}` và TTL=10 phút.
4. **Send OTP**: Gửi email chứa OTP cho user.

**Response: 200 OK**

```json
{
  "message": "Validation successful. OTP sent to email.",
  "registrationToken": "a1b2c3d4-e5f6-...", // Token dùng để submit OTP ở bước sau
  "expiresIn": 600
}
```

**Error Response (Ví dụ trùng Email): 409 Conflict**

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Email already exists",
    "details": { "field": "email" }
  }
}
```

---

**Step 2: Confirm & Create (Xác thực OTP & Tạo tài khoản)**

User nhập OTP nhận được để hoàn tất. Dữ liệu sẽ được chuyển từ Redis sang Postgres.

- **Endpoint**: `POST /api/v1/auth/register/confirm`
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "registrationToken": "a1b2c3d4-e5f6-...", // Nhận được từ Step 1
  "otp": "123456"
}
```

**Backend Logic**:

1. **Retrieve**: Dùng `registrationToken` lấy dữ liệu tạm từ Redis. Nếu không thấy -> Lỗi `400` (Token hết hạn hoặc không tồn tại).
2. **Verify OTP**: So khớp `otp` user gửi lên với `otp` trong Redis.
3. **Transactional Write (Postgres)**:
    - Insert `TENANT` (dùng dữ liệu từ Redis).
    - Insert `USER` (dùng email, password_hash từ Redis).
    - Insert `USER_SESSION` (Login luôn cho user).
4. **Cleanup**: Xóa key trong Redis.
5. **Token Generation**: Tạo Access/Refresh Token.

**Response: 201 Created**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1Ni...",
  "refreshToken": "d792f321-...",
  "expiresIn": 3600,
  "user": {
    "id": "ADD HERE (example: uuid-user-1)",
    "email": "ADD HERE (example: owner@example.com)",
    "role": "OWNER",
    "fullName": "ADD HERE (example: John Doe)"
  },
  "tenant": {
    "id": "ADD HERE (example: uuid-tenant-1)",
    "name": "ADD HERE (example: Restaurant Name)",
    "slug": "ADD HERE (example: restaurant-slug)",
    "status": "ACTIVE",
    "onboardingStep": 1
  }
}
```

#### 2.1.2. Login (Session Creation)

Dành cho User đã tồn tại trong DB.

```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "ADD HERE (example: user@example.com)",
  "password": "ADD HERE (example: user_password)",
  "deviceInfo": "ADD HERE (example: Chrome 120 on MacOS)" // Required for USER_SESSION tracking
}

Response: 200 OK
{
  "accessToken": "ADD HERE (example: eyJhbGciOiJIUzI1Ni...)",
  "refreshToken": "ADD HERE (example: d792f321-...)",
  "expiresIn": 3600,
  "user": {
    "id": "ADD HERE (example: uuid-user-1)",
    "email": "ADD HERE (example: user@example.com)",
    "fullName": "ADD HERE (example: John Doe)",
    "role": "OWNER",
    "tenantId": "ADD HERE (example: uuid-tenant-1)"
  },
  "tenant": {
    "id": "ADD HERE (example: uuid-tenant-1)",
    "name": "ADD HERE (example: Restaurant Name)",
    "slug": "ADD HERE (example: restaurant-slug)",
    "status": "ACTIVE",
    "onboardingStep": 1
  }
}
```

#### 2.1.3. Refresh Token (Session Renewal)

Dùng `refreshToken` để lấy `accessToken` mới. Backend sẽ check bảng `USER_SESSION`.

```json
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "82a1b2c3-..."
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1Ni...",
  "expiresIn": 3600
}
```

#### 2.1.4. Logout

Dùng `refreshToken` để đăng xuất khỏi chính xác thiết bị thực hiện `logout` (bằng cách so sánh `refreshToken`)

```json
POST /api/v1/auth/logout
Content-Type: application/json

{
  "refreshToken": "82a1b2c3-..."
}

Response: 200 OK

```
#### 2.1.5. Get Current User Profile

Lấy thông tin user hiện tại từ access token. Yêu cầu gửi access token hợp lệ qua header `Authorization: Bearer <accessToken>`. Backend sẽ giải mã JWT và trả về thông tin user.

```http
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
Accept: application/json
```

**Response: 200 OK**
```json
{
  "user": {
    "id": "ADD HERE (example: uuid-user-1)",
    "email": "ADD HERE (example: owner@example.com)",
    "role": "OWNER",
    "tenantId": "ADD HERE (example: uuid-tenant-1)"
  }
}
```

- Nếu access token không hợp lệ hoặc hết hạn sẽ trả về:
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

**Chú thích:**  
- Endpoint này dùng để lấy thông tin user đang đăng nhập, thường dùng cho trang profile hoặc kiểm tra trạng thái đăng nhập.  
- Không cần truyền thêm tham số nào ngoài access token.

### 2.2. Token Claims & Authorization

#### 2.2.1. JWT Access Token Structure (Staff/Owner)

Payload của Access Token phản ánh trực tiếp dữ liệu từ bảng `USER`.

```json
{
  "sub": "uuid-user-1", // Mapping to USER.id
  "email": "ADD HERE (example: owner@example.com)", // Mapping to USER.email
  "role": "OWNER", // Mapping to USER.role (Enum)
  "tenantId": "uuid-tenant-1", // Mapping to USER.tenant_id
  "sid": "uuid-session-99", // Mapping to USER_SESSION.id (để support logout/revoke)
  "iat": 1704960000,
  "exp": 1704963600
}
```

#### 2.2.2. Role-Based Access Control (RBAC)

Dựa trên Enum `role` trong Database:
_Đối với Super Admin: Không cần registry (liên hệ bên cung cấp sản phẩm để đăng ký tài khoản, login như các role dưới)_

| **Role (DB Enum)** | **Description**   | **Permissions**                                                          |
| ------------------ | ----------------- | ------------------------------------------------------------------------ |
| **OWNER**          | Chủ nhà hàng      | Full CRUD on Tenant, Users, Menu, Payment Config. (Tương đương Admin cũ) |
| **STAFF**          | Nhân viên phục vụ | Read Menu, Create/Update Orders, Payment Status.                         |
| **KITCHEN**        | Đầu bếp/Bar       | Read Orders (Real-time), Update Order State (Preparing -> Ready).        |

### 2.3. Tenant Isolation Strategy

Để đảm bảo tính toàn vẹn dữ liệu giữa các Tenant (Multi-tenancy):

1. **Extraction**: Middleware `AuthGuard` sẽ extract `tenantId` từ JWT (đối với Staff) hoặc từ QR Token (đối với Customer).
2. **Context Injection**: `tenantId` được gán vào `Request Context` (ví dụ: `req.user.tenantId`).
3. **Database Query**: Mọi query xuống Postgres **bắt buộc** phải có mệnh đề `WHERE tenant_id = ...`. Sử dụng chiến lược Defense in Depth với 2 lớp bảo vệ:
    - Application Logic: Middleware của ORM sẽ tự động chèn điều kiện `WHERE tenant_id = <current_tenant>` vào tất cả các câu lệnh `find`, `update`, `delete` trước khi gửi xuống DB.
    - Database RLS (Row-Level Security): Ngay cả khi tầng Application có lỗi (bug ở middleware, quên filter), Database sẽ chặn truy cập nếu`tenant_id` của dòng dữ liệu không khớp với session context hiện tại.

## 3. Error Handling

### 3.1. Error Response Format

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Menu item with ID 'item_123' not found",
    "details": {
      "itemId": "item_123",
      "tenantId": "tenant_456"
    },
    "timestamp": "2025-01-11T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### 3.2. Standard Error Codes

| HTTP Status | Error Code              | Description                                   |
| ----------- | ----------------------- | --------------------------------------------- |
| 400         | `BAD_REQUEST`           | Invalid request format/parameters             |
| 401         | `UNAUTHORIZED`          | Missing or invalid authentication             |
| 403         | `FORBIDDEN`             | Insufficient permissions                      |
| 404         | `NOT_FOUND`             | Resource not found                            |
| 409         | `CONFLICT`              | Resource conflict (duplicate, state mismatch) |
| 422         | `VALIDATION_ERROR`      | Request validation failed                     |
| 429         | `RATE_LIMIT_EXCEEDED`   | Too many requests                             |
| 500         | `INTERNAL_SERVER_ERROR` | Server error                                  |
| 503         | `SERVICE_UNAVAILABLE`   | Service temporarily unavailable               |

### 3.3. Validation Errors

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": [
        {
          "field": "price",
          "message": "must be a positive number",
          "value": -10
        },
        {
          "field": "name",
          "message": "is required"
        }
      ]
    }
  }
}
```

---

## 4. Rate Limiting

### 4.1. Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704960060
```

### 4.2. Rate Limit Policies

| Endpoint Type         | Limit                 |
| --------------------- | --------------------- |
| Public (Menu)         | 100 req/min per IP    |
| Authenticated (Staff) | 1000 req/min per user |
| Order Creation        | 10 req/min per table  |
| Admin Operations      | 100 req/min per admin |

### 4.3. Rate Limit Exceeded Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 30 seconds.",
    "retryAfter": 30
  }
}
```

---

## 5. Tenants API

> Lưu ý: Việc tạo Tenant mới (Create) đã được thực hiện tự động trong quy trình đăng ký 2 bước: `POST /api/v1/auth/register/submit` (Step 1: Submit & Challenge) → `POST /api/v1/auth/register/confirm` (Step 2: Confirm & Create). Các API dưới đây dành cho OWNER để thiết lập thông tin nhà hàng (Onboarding) sau khi đã đăng nhập.

### Base URL

```
/api/v1/tenants
```

### 1. Get Current Tenant Info

```
GET /api/v1/tenants/me
Authorization: Bearer {accessToken}
```

**Response 200 OK:**

```json
{
  "id": "uuid",
  "name": "Phở Ngon 123",
  "slug": "pho-ngon-123",
  "status": "ACTIVE",
  "onboardingStep": 1,
  "settings": {
    "currency": "VND",
    "language": "vi",
    "timezone": "Asia/Ho_Chi_Minh"
  },
  "openingHours": {
    "monday": { "open": "08:00", "close": "22:00", "closed": false },
    "tuesday": { "open": "08:00", "close": "22:00", "closed": false },
    "wednesday": { "open": "08:00", "close": "22:00", "closed": false },
    "thursday": { "open": "08:00", "close": "22:00", "closed": false },
    "friday": { "open": "08:00", "close": "22:00", "closed": false },
    "saturday": { "open": "08:00", "close": "22:00", "closed": false },
    "sunday": { "open": "08:00", "close": "22:00", "closed": true }
  },
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}

```

---

### 5.2. Update Tenant Profile (Onboarding Step 1)

```
PATCH /api/v1/tenants/profile
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Phở Ngon 123",
  "description": "Authentic Vietnamese Pho Restaurant",
  "phone": "ADD HERE (example: +84901234567)",
  "address": "ADD HERE (example: 123 Nguyen Hue, District 1, HCMC)",
  "logoUrl": "ADD HERE (example: https://cdn.example.com/logo.png)",
  "slug": "new-pho-ngon-123"
}
```

**Response 200 OK:**

```json
{
  "id": "uuid",
  "name": "Phở Ngon 123",
  "slug": "new-pho-ngon-123",
  "description": "Authentic Vietnamese Pho Restaurant",
  "phone": "ADD HERE (example: +84901234567)",
  "address": "ADD HERE (example: 123 Nguyen Hue, District 1, HCMC)",
  "logoUrl": "ADD HERE (example: https://cdn.example.com/logo.png)",
  "onboardingStep": 2,
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

---

### 5.3. Update Opening Hours (Onboarding Step 2)

```
PATCH /api/v1/tenants/opening-hours
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "monday": { "open": "08:00", "close": "22:00", "closed": false },
  "tuesday": { "open": "08:00", "close": "22:00", "closed": false },
  "wednesday": { "open": "08:00", "close": "22:00", "closed": false },
  "thursday": { "open": "08:00", "close": "22:00", "closed": false },
  "friday": { "open": "08:00", "close": "23:00", "closed": false },
  "saturday": { "open": "08:00", "close": "23:00", "closed": false },
  "sunday": { "open": "09:00", "close": "21:00", "closed": false }
}
```

**Response 200 OK:**

```json
{
  "openingHours": {
    "monday": { "open": "08:00", "close": "22:00", "closed": false },
    "tuesday": { "open": "08:00", "close": "22:00", "closed": false },
    "wednesday": { "open": "08:00", "close": "22:00", "closed": false },
    "thursday": { "open": "08:00", "close": "22:00", "closed": false },
    "friday": { "open": "08:00", "close": "23:00", "closed": false },
    "saturday": { "open": "08:00", "close": "23:00", "closed": false },
    "sunday": { "open": "09:00", "close": "21:00", "closed": false }
  },
  "onboardingStep": 3,
  "updatedAt": "2025-01-15T11:00:00Z"
}
```

---

### 5.4. Update Settings (Onboarding Step 3)

```
PATCH /api/v1/tenants/settings
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "currency": "VND",
  "language": "vi",
  "timezone": "Asia/Ho_Chi_Minh",
  "tax": {
    "enabled": true,
    "rate": 10,
    "label": "VAT"
  },
  "serviceCharge": {
    "enabled": false,
    "rate": 0
  }
}
```

**Response 200 OK:**

```json
{
  "settings": {
    "currency": "VND",
    "language": "vi",
    "timezone": "Asia/Ho_Chi_Minh",
    "tax": {
      "enabled": true,
      "rate": 10,
      "label": "VAT"
    },
    "serviceCharge": {
      "enabled": false,
      "rate": 0
    }
  },
  "onboardingStep": 4,
  "updatedAt": "2025-01-15T11:30:00Z"
}

```

---

### 5.5. Configure Payment - Stripe Integration (Onboarding Step 4)

Dành cho bảng `TENANT_PAYMENT_CONFIG`. API này liên kết tài khoản Stripe của nhà hàng để nhận tiền.

```json
PATCH /api/v1/tenants/payment-config
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "stripeAccountId": "acct_123456789"
}
```

**Response: 200 OK**

```json
{
  "id": "uuid-payment-config-1",
  "tenantId": "uuid-tenant-123",
  "stripeAccountId": "acct_123456789",
  "updatedAt": "2025-01-11T12:00:00Z",
  "onboardingStep": 5
}
```

---

### 5.6. Complete Onboarding

```
POST /api/v1/tenants/complete-onboarding
Authorization: Bearer {accessToken}
```

**Response 200 OK:**

```json
{
  "message": "Onboarding completed successfully",
  "onboardingStep": 6,
  "completedAt": "2025-01-15T12:00:00Z"
}
```

---

### 5.7. Update Tenant Status (Admin only)

```
PATCH /api/v1/tenants/:id/status
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "SUSPENDED"
}
```

**Response 200 OK:**

```json
{
  "id": "uuid",
  "status": "SUSPENDED",
  "updatedAt": "2025-01-15T12:30:00Z"
}
```

---

## 6. Legacy API Examples (Archived)

> **⚠️ DEPRECATED CONTENT:** Sections 6-11 contained conceptual API examples that are **not guaranteed** to match the actual implementation.
>
> These examples have been moved to: [**docs/appendix/legacy/OPENAPI_LEGACY_EXAMPLES.md**](../../appendix/legacy/OPENAPI_LEGACY_EXAMPLES.md)
>
> **For accurate API documentation, always use:**
> - **Live Swagger UI:** `http://localhost:3000/api-docs`
> - **OpenAPI JSON:** `http://localhost:3000/api-docs-json`
> - **Controller Source Code:** `source/apps/api/src/modules/*/controllers/*.controller.ts`

**Legacy Content Includes:**
- Tables & QR API examples (create, generate QR, revoke, list)
- Menu API examples (public menu, create category, create item, update, publish)
- Orders API examples (create order, get details, list, update state, cancel)
- Payments API examples (create session, webhooks, get status)
- Analytics API examples (dashboard summary, kitchen performance)
- Webhook examples (events, payload format, security)

**Migration Path:**
1. Export current spec: `curl http://localhost:3000/api-docs-json > openapi.json`
2. Compare legacy examples with actual spec
3. Update client code to match Swagger-documented endpoints
4. Test against development API at `http://localhost:3000/api/v1`

---


## 7. OpenAPI Export (Optional)

> **Note:** This project uses NestJS Swagger decorators to auto-generate OpenAPI documentation. The live Swagger UI at `http://localhost:3000/api-docs` is the authoritative source.

### Auto-Generated JSON Endpoint

NestJS Swagger automatically exposes a JSON endpoint at `/api-docs-json`:

- **Development**: `http://localhost:3000/api-docs-json`
- **Production**: ADD HERE (replace with your deployed domain + `/api-docs-json`)

**Evidence:** NestJS Swagger automatically creates this endpoint when calling `SwaggerModule.setup('api-docs', app, document)` in `source/apps/api/src/main.ts:102`

### Exporting OpenAPI Spec to File

To export the OpenAPI specification for use with code generation tools (Orval, OpenAPI Generator, etc.):

```bash
# Development (local API)
curl http://localhost:3000/api-docs-json > docs/common/openapi.exported.json

# Production (replace with your domain)
curl ADD_YOUR_DOMAIN/api-docs-json > docs/common/openapi.exported.json
```

### Current Frontend Apps Usage

The frontend apps currently reference local copies:
- `source/apps/web-tenant/openapi-spec.json`
- `source/apps/web-customer/openapi-spec.json`

**Recommendation:** Export the latest spec and copy to frontend apps:
```bash
# Export from running API
curl http://localhost:3000/api-docs-json > docs/common/openapi.exported.json

# Copy to frontend apps for Orval
cp docs/common/openapi.exported.json source/apps/web-tenant/openapi-spec.json
cp docs/common/openapi.exported.json source/apps/web-customer/openapi-spec.json

# Regenerate API clients
cd source/apps/web-tenant && pnpm orval
cd source/apps/web-customer && pnpm orval
```

---

## 8. Subscription Management API

> **Module:** `SubscriptionModule` - Location: `source/apps/api/src/modules/subscription/`

### Overview
Subscription management system supporting multi-tier plans (FREE, STARTER, PRO) with feature limits and usage tracking. Handles subscription upgrades via SePay payment gateway.

### Base Path
```
/api/v1/admin/subscription
```

### Endpoints

#### 6.1. Get All Subscription Plans
```http
GET /api/v1/subscription/plans
```
- **Authentication:** Public (customer-facing) or Bearer (admin)
- **Description:** Retrieve all available subscription tiers with pricing and feature details
- **Controller:** `PublicSubscriptionController.getPlans()`

#### 6.2. Get Current Tenant Subscription
```http
GET /api/v1/admin/subscription/current
Authorization: Bearer {accessToken}
```
- **Authentication:** Required (JWT)
- **Roles:** OWNER, STAFF
- **Returns:** Current subscription tier, status, usage stats, and limits
- **Controller:** `SubscriptionController.getCurrentSubscription()`

#### 6.3. Get Usage Statistics
```http
GET /api/v1/admin/subscription/usage
Authorization: Bearer {accessToken}
```
- **Authentication:** Required (JWT)
- **Returns:** Current usage vs limits for tables, menu items, orders/month, staff members
- **Controller:** `SubscriptionController.getUsage()`

#### 6.4. Check Action Limit
```http
POST /api/v1/admin/subscription/check-limit
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "action": "createTable" | "createMenuItem" | "createOrder" | "inviteStaff"
}
```
- **Authentication:** Required (JWT)
- **Description:** Check if tenant can perform an action based on subscription limits
- **Controller:** `SubscriptionController.checkLimit()`

#### 6.5. Create Upgrade Payment
```http
POST /api/v1/admin/subscription/upgrade
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "targetTier": "STARTER" | "PRO",
  "billingCycle": "MONTHLY" | "YEARLY"
}
```
- **Authentication:** Required (JWT)
- **Description:** Create SePay payment intent for subscription upgrade. Returns QR code for payment.
- **Controller:** `SubscriptionController.createUpgradePayment()`

#### 6.6. Check Upgrade Payment Status
```http
GET /api/v1/admin/subscription/upgrade/{paymentId}/status
Authorization: Bearer {accessToken}
```
- **Authentication:** Required (JWT)
- **Description:** Poll payment status. Auto-upgrades subscription when payment is confirmed.
- **Controller:** `SubscriptionController.checkUpgradePaymentStatus()`

**Evidence:** `source/apps/api/src/modules/subscription/subscription.controller.ts`

---

## 9. Staff Management API

> **Module:** `StaffModule` - Location: `source/apps/api/src/modules/staff/`

### Overview
Staff invitation and management system. Supports email-based invitations with time-limited tokens (7-day expiry).

### Base Path
```
/api/v1/admin/staff
```

### Endpoints

#### 7.1. Invite Staff Member
```http
POST /api/v1/admin/staff/invite
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "email": "ADD HERE (example: staff@example.com)",
  "role": "STAFF" | "KITCHEN"
}
```
- **Authentication:** Required (JWT)
- **Roles:** OWNER only
- **Guards:** `SubscriptionLimitsGuard` - checks if tenant can invite more staff
- **Description:** Send email invitation with unique token
- **Controller:** `StaffController.inviteStaff()`

#### 7.2. List Staff Members
```http
GET /api/v1/admin/staff
Authorization: Bearer {accessToken}
```
- **Authentication:** Required (JWT)
- **Roles:** OWNER
- **Returns:** All active staff members for the tenant
- **Controller:** `StaffController.listStaff()`

#### 7.3. List Pending Invitations
```http
GET /api/v1/admin/staff/invitations
Authorization: Bearer {accessToken}
```
- **Authentication:** Required (JWT)
- **Roles:** OWNER
- **Returns:** Pending (unused) staff invitations
- **Controller:** `StaffController.listPendingInvitations()`

#### 7.4. Update Staff Role
```http
PATCH /api/v1/admin/staff/{staffId}/role
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "role": "STAFF" | "KITCHEN"
}
```
- **Authentication:** Required (JWT)
- **Roles:** OWNER only
- **Description:** Change staff member's role
- **Controller:** `StaffController.updateStaffRole()` (exists in controller lines 99+)

#### 7.5. Remove Staff Member
```http
DELETE /api/v1/admin/staff/{staffId}
Authorization: Bearer {accessToken}
```
- **Authentication:** Required (JWT)
- **Roles:** OWNER only
- **Controller:** `StaffController.removeStaff()` (exists in controller)

#### 7.6. Accept Invitation (Public)
```http
POST /api/v1/staff/accept-invite
Content-Type: application/json

{
  "token": "invitation-token-here",
  "password": "user-password",
  "fullName": "Staff Name"
}
```
- **Authentication:** Public (token-based)
- **Description:** Staff member accepts invitation and creates account
- **Controller:** `StaffController.acceptInvite()` (public endpoint)

**Evidence:** `source/apps/api/src/modules/staff/staff.controller.ts`

---

## 10. Bill Management API

> **Module:** `BillModule` (part of OrderModule) - Location: `source/apps/api/src/modules/order/controllers/bill.controller.ts`

### Overview
Bill aggregation for tables. Groups multiple orders into a single bill for payment.

### Base Path
```
/api/v1/admin/bills
```

### Endpoints

#### 8.1. Get All Bills
```http
GET /api/v1/admin/bills?tableId={tableId}&paymentStatus={status}&startDate={date}&endDate={date}
Authorization: Bearer {accessToken}
```
- **Authentication:** Required (JWT)
- **Roles:** OWNER, STAFF
- **Query Parameters:**
  - `tableId` (optional): Filter by table
  - `paymentStatus` (optional): PENDING | COMPLETED | FAILED
  - `startDate` (optional): ISO date
  - `endDate` (optional): ISO date
- **Controller:** `BillController.getBills()`

#### 8.2. Get Bill by ID
```http
GET /api/v1/admin/bills/{billId}
Authorization: Bearer {accessToken}
```
- **Authentication:** Required (JWT)
- **Roles:** OWNER, STAFF
- **Returns:** Detailed bill with all associated orders
- **Controller:** `BillController.getBillById()`

#### 8.3. Create Bill (Implicit)
Bills are typically created via order workflows. Check OrderModule for bill creation endpoints related to table checkout.

**Evidence:** `source/apps/api/src/modules/order/controllers/bill.controller.ts`

---

## 11. Review System API

> **Module:** `ReviewModule` - Location: `source/apps/api/src/modules/review/`

### Overview
Customer review system for menu items and orders. Supports 5-star ratings and text comments.

### Endpoints

#### 9.1. Create/Update Review (Customer)
```http
POST /api/v1/orders/{orderId}/items/{itemId}/review?sessionId={sessionId}&tenantId={tenantId}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent pho!"
}
```
- **Authentication:** Public (session-based)
- **Description:** Customer reviews a specific order item
- **Controller:** `ReviewController.createReview()`

#### 9.2. Get Order Reviews
```http
GET /api/v1/orders/{orderId}/reviews?tenantId={tenantId}
```
- **Authentication:** Public
- **Returns:** All reviews for an order with summary statistics
- **Controller:** `ReviewController.getOrderReviews()`

#### 9.3. Get Menu Item Reviews
```http
GET /api/v1/menu-items/{menuItemId}/reviews?tenantId={tenantId}
```
- **Authentication:** Public
- **Returns:** Review statistics for a specific menu item (average rating, count)
- **Controller:** `ReviewController.getMenuItemReviews()`

#### 9.4. Get Tenant Review Stats (Admin)
```http
GET /api/v1/admin/reviews/stats
Authorization: Bearer {accessToken}
```
- **Authentication:** Required (JWT)
- **Roles:** OWNER, STAFF
- **Returns:** Tenant-wide review statistics and top-rated items
- **Controller:** `ReviewController.getTenantReviewStats()`

**Evidence:** `source/apps/api/src/modules/review/review.controller.ts`

---

## 12. Promotion System API

> **Module:** `PromotionModule` - Location: `source/apps/api/src/modules/promotion/`

### Overview
Discount code management system. Supports percentage and fixed-amount discounts with usage limits. Feature-gated by subscription tier.

### Base Path
```
/api/v1/admin/promotions
```

### Endpoints

#### 10.1. Create Promotion
```http
POST /api/v1/admin/promotions
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "code": "SUMMER2026",
  "name": "Summer Sale",
  "discountType": "PERCENTAGE" | "FIXED",
  "discountValue": 20,
  "minOrderAmount": 100000,
  "maxUses": 100,
  "startDate": "2026-06-01T00:00:00Z",
  "endDate": "2026-08-31T23:59:59Z"
}
```
- **Authentication:** Required (JWT)
- **Roles:** OWNER, STAFF
- **Guards:** `FeatureGuard` - requires "promotions" feature in subscription
- **Controller:** `PromotionController.createPromotion()`

#### 10.2. List Promotions
```http
GET /api/v1/admin/promotions?active={true|false}
Authorization: Bearer {accessToken}
```
- **Authentication:** Required (JWT)
- **Roles:** OWNER, STAFF
- **Controller:** `PromotionController.getPromotions()`

#### 10.3. Get Promotion Details
```http
GET /api/v1/admin/promotions/{promotionId}
Authorization: Bearer {accessToken}
```
- **Authentication:** Required (JWT)
- **Roles:** OWNER, STAFF
- **Controller:** `PromotionController.getPromotion()`

#### 10.4. Update Promotion
```http
PUT /api/v1/admin/promotions/{promotionId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "active": false,
  "maxUses": 150
}
```
- **Authentication:** Required (JWT)
- **Roles:** OWNER, STAFF
- **Guards:** `FeatureGuard`
- **Controller:** `PromotionController.updatePromotion()`

#### 10.5. Delete Promotion
```http
DELETE /api/v1/admin/promotions/{promotionId}
Authorization: Bearer {accessToken}
```
- **Authentication:** Required (JWT)
- **Roles:** OWNER, STAFF
- **Controller:** `PromotionController.deletePromotion()` (line 100+)

#### 12.6. Validate Promotion Code (Public/Customer)
```http
POST /api/v1/checkout/validate-promo
Content-Type: application/json

{
  "code": "ADD HERE (example: SUMMER2026)",
  "tenantId": "ADD HERE (example: tenant-uuid)",
  "orderAmount": 150000
}
```
- **Authentication:** Public
- **Description:** Validate if promotion code is applicable to an order
- **Returns:** Discount amount and validity status
- **Controller:** `PromotionController.validatePromoCode()` (public endpoint)

**Evidence:** `source/apps/api/src/modules/promotion/promotion.controller.ts`

# OpenAPI Specification – QR Dine‑in Ordering Platform

> Tài liệu này mô tả đầy đủ REST API của hệ thống QR Dine-in Ordering Platform theo chuẩn **OpenAPI 3.0**.

- **Version**: 1.0.0
- **Base URL**: `https://api.qr-ordering.com/v1`
- **Last Updated**: 2025-23-11

---

## Mục lục

1. [Tổng quan API](#1-tổng-quan-api)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Error Handling](#3-error-handling)
4. [Rate Limiting](#4-rate-limiting)
5. [Tenants API](#5-tenants-api)
<!-- 6. [Tables & QR API](#6-tables--qr-api)
6. [Menu API](#7-menu-api)
7. [Orders API](#8-orders-api)
8. [Payments API](#9-payments-api)
9. [Analytics API](#10-analytics-api)
10. [Webhooks](#11-webhooks)
11. [OpenAPI YAML Specification](#12-openapi-yaml-specification) -->

---

## 1. Tổng quan API

### 1.1. API Design Principles

- **RESTful**: Tuân thủ nguyên tắc REST (Resources, HTTP Methods, Status Codes)
- **Multi-tenant**: Mọi endpoint đều tenant-scoped
- **Versioned**: API versioning qua URL path (`/v1`, `/v2`)
- **JSON**: Request/Response format là JSON
- **Idempotent**: POST/PUT với idempotency keys khi cần
- **Pagination**: Cursor-based hoặc offset-based
- **Filtering**: Query parameters cho filter/sort

### 1.2. Base URL

```
Production:  https://api.qr-ordering.com/v1
Staging:     https://api.staging.qr-ordering.com/v1
Development: http://localhost:3000/v1
```

### 1.3. Content Type

```http
Content-Type: application/json
Accept: application/json
```

### 1.4. API Documentation URL

- **Swagger UI**: `https://api.qr-ordering.com/docs`
- **ReDoc**: `https://api.qr-ordering.com/redoc`
- **OpenAPI JSON**: `https://api.qr-ordering.com/openapi.json`

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

- **Endpoint**: `POST /auth/register/submit`
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "email": "owner@new-restaurant.com",
  "password": "StrongPassword!123",
  "fullName": "Nguyen Van A",
  "tenantName": "Pho Ngon 123",
  "slug": "pho-ngon-123" // Optional, nếu không gửi backend sẽ tự generate từ name
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

- **Endpoint**: `POST /auth/register/confirm`
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
  "user": {
    "id": "uuid-user-1",
    "email": "owner@new-restaurant.com",
    "role": "OWNER",
    "fullName": "Nguyen Van A"
  },
  "tenant": {
    "id": "uuid-tenant-1",
    "name": "Pho Ngon 123",
    "slug": "pho-ngon-123",
    "status": "ACTIVE",
    "onboardingStep": 1
  }
}
```

#### 2.1.2. Login (Session Creation)

Dành cho User đã tồn tại trong DB.

```json
POST /auth/login
Content-Type: application/json

{
  "email": "staff@restaurant.com",
  "password": "user_password",
  "deviceInfo": "Chrome 120 on MacOS" // Required for USER_SESSION tracking
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1Ni...",
  "refreshToken": "82a1b2c3-...", // Client cần lưu secure storage
  "expiresIn": 3600, // Access Token TTL
  "user": {
    "id": "uuid-user-2",
    "fullName": "Tran Van B",
    "role": "STAFF",
    "tenantId": "uuid-tenant-1"
  }
}
```

#### 2.1.3. Refresh Token (Session Renewal)

Dùng `refreshToken` để lấy `accessToken` mới. Backend sẽ check bảng `USER_SESSION`.

```json
POST /auth/refresh
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

### 2.2. Token Claims & Authorization

#### 2.2.1. JWT Access Token Structure (Staff/Owner)

Payload của Access Token phản ánh trực tiếp dữ liệu từ bảng `USER`.

```json
{
  "sub": "uuid-user-1", // Mapping to USER.id
  "email": "owner@rest.com", // Mapping to USER.email
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

> Lưu ý: Việc tạo Tenant mới (Create) đã được thực hiện tự động trong API /auth/register/create. Các API dưới đây dành cho OWNER để thiết lập thông tin nhà hàng (Onboarding) sau khi đã đăng nhập.

### 5.1. Get Tenant Details (Context Loading)

Dùng để Client lấy toàn bộ cấu hình nhà hàng khi App khởi động hoặc vào màn hình Settings.

```json
GET /tenants/{tenantId}
Authorization: Bearer <access_token>
```

Response: 200 OK

Phản ánh đúng cấu trúc JSON trong database.

```json
{
  "id": "uuid-tenant-123",
  "name": "The Golden Spoon",
  "slug": "golden-spoon",
  "status": "DRAFT", // Enum: DRAFT, ACTIVE
  "onboardingStep": 1, // Để Client biết cần hiển thị bước nào tiếp theo
  "settings": {
    "currency": "VND",
    "timezone": "Asia/Ho_Chi_Minh",
    "locale": "vi-VN",
    "brandColor": "#FF5733"
  },
  "openingHours": {
    "monday": { "open": "10:00", "close": "22:00", "closed": false },
    "tuesday": { "open": "10:00", "close": "22:00", "closed": false },
    // ... các ngày khác
    "sunday": { "open": "10:00", "close": "22:00", "closed": false }
  }
}
```

### 5.2. Update Tenant Profile & Settings

Dùng cho các bước trong Onboarding Wizard (Ví dụ: Cập nhật giờ mở cửa, đổi tên quán, cài đặt tiền tệ).

```json
PATCH /tenants/{tenantId}
Authorization: Bearer <access_token>
Content-Type: application/json
```

Request Body:

Cho phép cập nhật từng phần (Partial Update).

```json
{
  "name": "The Golden Spoon Premium", // Optional
  "settings": {
    "currency": "USD",
    "brandColor": "#000000"
  },
  "openingHours": {
    "monday": { "open": "09:00", "close": "21:00" } // Merge với JSON cũ
  },
  "onboardingStep": 2 // Client báo hiệu đã xong bước 1, chuyển sang bước 2
}
```

Response: 200 OK

Trả về object Tenant đã cập nhật.

### 5.3. Configure Payment (Stripe Integration)

Dành cho bảng `TENANT_PAYMENT_CONFIG`. API này liên kết tài khoản Stripe của nhà hàng để nhận tiền.

```json
PUT /tenants/{tenantId}/payment-config
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "stripeAccountId": "acct_123456789", // ID tài khoản Stripe Connect của nhà hàng
  "onboardingStep": 3
}
```

**Response: 200 OK**

```json
{
  "id": "uuid-payment-config-1",
  "tenantId": "uuid-tenant-123",
  "stripeAccountId": "acct_123456789",
  "updatedAt": "2025-01-11T12:00:00Z"
}
```

### 5.4. Activate Tenant (Go Live)

Khi hoàn tất Onboarding, Owner chuyển trạng thái từ `DRAFT` sang `ACTIVE` để bắt đầu phục vụ khách.

```json
POST /tenants/{tenantId}/activate
Authorization: Bearer <access_token>
```

**Request Body:** (Empty)

**Response: 200 OK**

```json
{
  "id": "uuid-tenant-123",
  "status": "ACTIVE",
  "onboardingStep": 4 // Hoặc số max để đánh dấu hoàn thành
}
```

---

<!--
## 6. Tables & QR API

### 6.1. Create Table

```http
POST /tenants/{tenantId}/tables
Authorization: Bearer <admin_token>
Content-Type: application/json

Request:
{
  "label": "Table 5",
  "capacity": 4,
  "zone": "outdoor",
  "active": true
}

Response: 201 Created
{
  "id": "table_5",
  "tenantId": "tenant_123",
  "label": "Table 5",
  "capacity": 4,
  "zone": "outdoor",
  "active": true,
  "qrToken": null,
  "createdAt": "2025-01-11T10:00:00Z"
}
```

### 6.2. Generate QR Code

```http
POST /tenants/{tenantId}/tables/{tableId}/qr
Authorization: Bearer <admin_token>
Content-Type: application/json

Request:
{
  "format": "png",        // png | svg
  "size": 512,            // pixels
  "expiresIn": "365d"     // Token expiry
}

Response: 201 Created
{
  "token": "eyJ0aWQiOiJ0ZW5hbnRfMTIzIiwidGJsIjoidGFibGVfNSIsImV4cCI6MTczNTY4OTYwMCwic2lnIjoiLi4uIn0",
  "qrCodeUrl": "https://cdn.qr-ordering.com/qr/tenant_123/table_5.png",
  "menuUrl": "https://app.qr-ordering.com/menu?token=eyJ0aWQi...",
  "expiresAt": "2026-01-11T10:00:00Z",
  "downloadUrl": "https://api.qr-ordering.com/v1/tenants/tenant_123/tables/table_5/qr/download"
}
```

### 6.3. Revoke QR Token

```http
DELETE /tenants/{tenantId}/tables/{tableId}/qr
Authorization: Bearer <admin_token>

Response: 204 No Content
```

### 6.4. List Tables

```http
GET /tenants/{tenantId}/tables?active=true&zone=outdoor
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "data": [
    {
      "id": "table_1",
      "label": "Table 1",
      "capacity": 2,
      "zone": "indoor",
      "active": true,
      "hasQrCode": true
    },
    // ...more tables
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "pageSize": 10,
    "totalPages": 2
  }
}
```

---

## 7. Menu API

### 7.1. Get Public Menu (Customer)

```http
GET /menu
X-QR-Token: <signed_qr_token>

Response: 200 OK
{
  "tenant": {
    "id": "tenant_123",
    "name": "The Golden Spoon",
    "logo": "https://cdn.qr-ordering.com/tenants/tenant_123/logo.png"
  },
  "table": {
    "id": "table_5",
    "label": "Table 5"
  },
  "menu": {
    "categories": [
      {
        "id": "cat_1",
        "name": "Appetizers",
        "displayOrder": 1,
        "items": [
          {
            "id": "item_1",
            "name": "Spring Rolls",
            "description": "Fresh vegetable spring rolls",
            "price": 50000,
            "currency": "VND",
            "image": "https://cdn.qr-ordering.com/menu/item_1.jpg",
            "available": true,
            "modifiers": [
              {
                "id": "mod_1",
                "name": "Extra Sauce",
                "priceDelta": 5000,
                "type": "addon"
              }
            ]
          }
        ]
      }
    ]
  },
  "publishedAt": "2025-01-11T09:00:00Z"
}
```

### 7.2. Create Menu Category (Admin)

```http
POST /tenants/{tenantId}/menu/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

Request:
{
  "name": "Main Courses",
  "description": "Our signature main dishes",
  "displayOrder": 2,
  "active": true
}

Response: 201 Created
{
  "id": "cat_2",
  "tenantId": "tenant_123",
  "name": "Main Courses",
  "description": "Our signature main dishes",
  "displayOrder": 2,
  "active": true,
  "createdAt": "2025-01-11T10:00:00Z"
}
```

### 7.3. Create Menu Item (Admin)

```http
POST /tenants/{tenantId}/menu/items
Authorization: Bearer <admin_token>
Content-Type: application/json

Request:
{
  "categoryId": "cat_2",
  "name": "Pho Bo",
  "description": "Traditional Vietnamese beef noodle soup",
  "price": 75000,
  "currency": "VND",
  "imageUrl": "https://cdn.qr-ordering.com/menu/pho-bo.jpg",
  "available": true,
  "modifiers": [
    {
      "name": "Extra Beef",
      "priceDelta": 20000,
      "type": "addon"
    },
    {
      "name": "Size",
      "type": "variant",
      "options": [
        { "name": "Small", "priceDelta": -10000 },
        { "name": "Medium", "priceDelta": 0 },
        { "name": "Large", "priceDelta": 15000 }
      ]
    }
  ],
  "tags": ["popular", "signature"],
  "allergens": ["gluten"]
}

Response: 201 Created
{
  "id": "item_10",
  "tenantId": "tenant_123",
  "categoryId": "cat_2",
  "name": "Pho Bo",
  "slug": "pho-bo",
  // ...other fields
  "createdAt": "2025-01-11T10:00:00Z"
}
```

### 7.4. Update Menu Item

```http
PATCH /tenants/{tenantId}/menu/items/{itemId}
Authorization: Bearer <admin_token>
Content-Type: application/json

Request:
{
  "price": 80000,
  "available": false
}

Response: 200 OK
{
  "id": "item_10",
  "price": 80000,
  "available": false,
  "updatedAt": "2025-01-11T11:00:00Z"
}
```

### 7.5. Publish Menu Changes

```http
POST /tenants/{tenantId}/menu/publish
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "status": "published",
  "version": 2,
  "publishedAt": "2025-01-11T11:00:00Z",
  "changesCount": 5
}
```

---

## 8. Orders API

### 8.1. Create Order (Customer)

```http
POST /orders
X-QR-Token: <signed_qr_token>
Content-Type: application/json
Idempotency-Key: <unique_request_id>

Request:
{
  "tableId": "table_5",
  "customerInfo": {
    "name": "Nguyen Van A",
    "phone": "+84901234567",
    "note": "Please prepare quickly"
  },
  "items": [
    {
      "itemId": "item_10",
      "name": "Pho Bo",
      "quantity": 2,
      "price": 75000,
      "modifiers": [
        {
          "id": "mod_1",
          "name": "Extra Beef",
          "priceDelta": 20000
        }
      ],
      "note": "Less onions"
    }
  ],
  "totals": {
    "subtotal": 190000,
    "tax": 0,
    "serviceCharge": 0,
    "total": 190000
  }
}

Response: 201 Created
{
  "id": "order_abc123",
  "orderNumber": "ORD-20250111-001",
  "tenantId": "tenant_123",
  "tableId": "table_5",
  "state": "received",
  "customerInfo": { /* ... */ },
  "items": [ /* ... */ ],
  "totals": { /* ... */ },
  "createdAt": "2025-01-11T10:30:00Z",
  "estimatedReadyAt": "2025-01-11T10:50:00Z"
}
```

### 8.2. Get Order Details

```http
GET /orders/{orderId}
Authorization: Bearer <staff_token>

Response: 200 OK
{
  "id": "order_abc123",
  "orderNumber": "ORD-20250111-001",
  "tenantId": "tenant_123",
  "tableId": "table_5",
  "state": "preparing",
  "customerInfo": { /* ... */ },
  "items": [ /* ... */ ],
  "totals": { /* ... */ },
  "stateHistory": [
    {
      "state": "received",
      "timestamp": "2025-01-11T10:30:00Z",
      "actor": null
    },
    {
      "state": "preparing",
      "timestamp": "2025-01-11T10:32:00Z",
      "actor": "user_kitchen_1"
    }
  ],
  "createdAt": "2025-01-11T10:30:00Z",
  "updatedAt": "2025-01-11T10:32:00Z"
}
```

### 8.3. List Orders (Staff/Kitchen)

```http
GET /orders?state=preparing&sortBy=createdAt:asc&limit=20
Authorization: Bearer <staff_token>

Response: 200 OK
{
  "data": [
    {
      "id": "order_abc123",
      "orderNumber": "ORD-20250111-001",
      "tableLabel": "Table 5",
      "state": "preparing",
      "itemsCount": 2,
      "total": 190000,
      "createdAt": "2025-01-11T10:30:00Z",
      "waitTime": "2m 30s"
    },
    // ...more orders
  ],
  "pagination": {
    "cursor": "next_cursor_xyz",
    "hasMore": true
  }
}
```

### 8.4. Update Order State (Kitchen/Waiter)

```http
PATCH /orders/{orderId}/state
Authorization: Bearer <kitchen_token>
Content-Type: application/json

Request:
{
  "state": "ready",
  "note": "All items prepared"
}

Response: 200 OK
{
  "id": "order_abc123",
  "state": "ready",
  "stateHistory": [
    // ...previous states
    {
      "state": "ready",
      "timestamp": "2025-01-11T10:45:00Z",
      "actor": "user_kitchen_1",
      "note": "All items prepared"
    }
  ],
  "updatedAt": "2025-01-11T10:45:00Z"
}
```

**Valid State Transitions**:

```
received → preparing
preparing → ready
ready → served
served → closed
```

### 8.5. Cancel Order

```http
POST /orders/{orderId}/cancel
Authorization: Bearer <admin_token>
Content-Type: application/json

Request:
{
  "reason": "Customer left",
  "refund": false
}

Response: 200 OK
{
  "id": "order_abc123",
  "state": "cancelled",
  "cancelledAt": "2025-01-11T10:35:00Z",
  "cancelReason": "Customer left"
}
```

---

## 9. Payments API

### 9.1. Create Payment Session (Redirect Flow)

```http
POST /orders/{orderId}/payment
Authorization: Bearer <customer_token>
Content-Type: application/json

Request:
{
  "method": "stripe_checkout",
  "successUrl": "https://app.qr-ordering.com/order/{orderId}/success",
  "cancelUrl": "https://app.qr-ordering.com/order/{orderId}/cancel"
}

Response: 201 Created
{
  "sessionId": "cs_test_abc123",
  "paymentUrl": "https://checkout.stripe.com/pay/cs_test_abc123",
  "expiresAt": "2025-01-11T11:00:00Z"
}
```

### 9.2. Payment Webhook (Stripe)

```http
POST /webhooks/stripe
Stripe-Signature: <signature>
Content-Type: application/json

Request:
{
  "id": "evt_abc123",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_abc123",
      "payment_status": "paid",
      "amount_total": 190000,
      "metadata": {
        "orderId": "order_abc123",
        "tenantId": "tenant_123"
      }
    }
  }
}

Response: 200 OK
{
  "received": true
}
```

### 9.3. Get Payment Status

```http
GET /orders/{orderId}/payment
Authorization: Bearer <staff_token>

Response: 200 OK
{
  "orderId": "order_abc123",
  "status": "paid",
  "method": "card",
  "amount": 190000,
  "currency": "VND",
  "paidAt": "2025-01-11T10:40:00Z",
  "transactionId": "txn_abc123"
}
```

---

## 10. Analytics API

### 10.1. Get Dashboard Summary

```http
GET /analytics/summary?startDate=2025-01-01&endDate=2025-01-11
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-11"
  },
  "metrics": {
    "totalOrders": 150,
    "totalRevenue": 28500000,
    "averageOrderValue": 190000,
    "qrScans": 500,
    "conversionRate": 0.30,
    "ordersByState": {
      "received": 5,
      "preparing": 8,
      "ready": 3,
      "served": 120,
      "closed": 14
    }
  },
  "trends": {
    "ordersGrowth": "+15%",
    "revenueGrowth": "+20%"
  }
}
```

### 10.2. Get Kitchen Performance

```http
GET /analytics/kitchen?startDate=2025-01-01&endDate=2025-01-11
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "averagePrepTime": "18m 30s",
  "p95PrepTime": "25m 00s",
  "ordersByTimeSlot": {
    "11:00-12:00": 25,
    "12:00-13:00": 45,
    "13:00-14:00": 30
  },
  "slowestItems": [
    {
      "itemId": "item_10",
      "name": "Pho Bo",
      "averagePrepTime": "22m"
    }
  ]
}
```

---

## 11. Webhooks

### 11.1. Webhook Events

Hệ thống gửi webhook events đến URL được cấu hình trong tenant settings.

**Event Types**:

- `order.created`
- `order.state_changed`
- `order.cancelled`
- `payment.succeeded`
- `payment.failed`

### 11.2. Webhook Payload Format

```json
{
  "id": "evt_abc123",
  "type": "order.state_changed",
  "tenantId": "tenant_123",
  "timestamp": "2025-01-11T10:32:00Z",
  "data": {
    "orderId": "order_abc123",
    "previousState": "received",
    "currentState": "preparing",
    "actor": "user_kitchen_1"
  }
}
```

### 11.3. Webhook Security

**Signature Verification**:

```http
X-Webhook-Signature: sha256=<hmac_signature>
```

**Verify**:

```javascript
const crypto = require("crypto");

const signature = request.headers["x-webhook-signature"];
const payload = JSON.stringify(request.body);
const secret = process.env.WEBHOOK_SECRET;

const expectedSignature =
  "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");

if (signature !== expectedSignature) {
  throw new Error("Invalid signature");
}
```

---

## 12. OpenAPI YAML Specification

```yaml
# filepath: docs/openapi.yaml

openapi: 3.0.3
info:
  title: QR Dine-in Ordering Platform API
  version: 1.0.0
  description: |
    REST API cho hệ thống QR Dine-in Ordering Platform.
    Multi-tenant platform cho phép nhà hàng quản lý menu, orders, và thanh toán.
  contact:
    email: dev@qr-ordering.com
  license:
    name: Proprietary
    url: https://qr-ordering.com/license

servers:
  - url: https://api.qr-ordering.com/v1
    description: Production
  - url: https://api.staging.qr-ordering.com/v1
    description: Staging
  - url: http://localhost:3000/v1
    description: Development

security:
  - bearerAuth: []

tags:
  - name: Tenants
    description: Tenant management operations
  - name: Tables & QR
    description: Table and QR code management
  - name: Menu
    description: Menu catalog operations
  - name: Orders
    description: Order management
  - name: Payments
    description: Payment processing
  - name: Analytics
    description: Analytics and reporting
  - name: Auth
    description: Authentication operations

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT access token

    qrToken:
      type: apiKey
      in: header
      name: X-QR-Token
      description: Signed QR token for customer access

  schemas:
    Error:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          required:
            - code
            - message
          properties:
            code:
              type: string
              example: RESOURCE_NOT_FOUND
            message:
              type: string
              example: Resource not found
            details:
              type: object
            timestamp:
              type: string
              format: date-time
            requestId:
              type: string

    Tenant:
      type: object
      required:
        - id
        - name
        - slug
      properties:
        id:
          type: string
          example: tenant_123
        name:
          type: string
          example: The Golden Spoon
        slug:
          type: string
          example: golden-spoon
        email:
          type: string
          format: email
        phone:
          type: string
        address:
          $ref: "#/components/schemas/Address"
        settings:
          $ref: "#/components/schemas/TenantSettings"
        plan:
          type: string
          enum: [basic, pro, enterprise]
        status:
          type: string
          enum: [active, suspended, cancelled]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Address:
      type: object
      properties:
        street:
          type: string
        city:
          type: string
        country:
          type: string
        postalCode:
          type: string

    TenantSettings:
      type: object
      properties:
        currency:
          type: string
          example: VND
        timezone:
          type: string
          example: Asia/Ho_Chi_Minh
        locale:
          type: string
          example: vi-VN
        operatingHours:
          type: object
          additionalProperties:
            type: object
            properties:
              open:
                type: string
                example: "10:00"
              close:
                type: string
                example: "22:00"

    Table:
      type: object
      required:
        - id
        - label
      properties:
        id:
          type: string
          example: table_5
        tenantId:
          type: string
        label:
          type: string
          example: Table 5
        capacity:
          type: integer
          minimum: 1
        zone:
          type: string
          example: outdoor
        active:
          type: boolean
        qrToken:
          type: string
        createdAt:
          type: string
          format: date-time

    MenuItem:
      type: object
      required:
        - id
        - name
        - price
      properties:
        id:
          type: string
        categoryId:
          type: string
        name:
          type: string
        description:
          type: string
        price:
          type: number
          format: float
        currency:
          type: string
        image:
          type: string
          format: uri
        available:
          type: boolean
        modifiers:
          type: array
          items:
            $ref: "#/components/schemas/Modifier"
        tags:
          type: array
          items:
            type: string
        allergens:
          type: array
          items:
            type: string

    Modifier:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: string
        name:
          type: string
        priceDelta:
          type: number
        type:
          type: string
          enum: [addon, variant]
        options:
          type: array
          items:
            type: object
            properties:
              name:
                type: string
              priceDelta:
                type: number

    Order:
      type: object
      required:
        - id
        - orderNumber
        - state
      properties:
        id:
          type: string
        orderNumber:
          type: string
        tenantId:
          type: string
        tableId:
          type: string
        state:
          type: string
          enum: [received, preparing, ready, served, closed, cancelled]
        customerInfo:
          $ref: "#/components/schemas/CustomerInfo"
        items:
          type: array
          items:
            $ref: "#/components/schemas/OrderItem"
        totals:
          $ref: "#/components/schemas/OrderTotals"
        stateHistory:
          type: array
          items:
            $ref: "#/components/schemas/StateTransition"
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CustomerInfo:
      type: object
      properties:
        name:
          type: string
        phone:
          type: string
        note:
          type: string

    OrderItem:
      type: object
      required:
        - itemId
        - name
        - quantity
        - price
      properties:
        itemId:
          type: string
        name:
          type: string
        quantity:
          type: integer
          minimum: 1
        price:
          type: number
        modifiers:
          type: array
          items:
            type: object
        note:
          type: string

    OrderTotals:
      type: object
      properties:
        subtotal:
          type: number
        tax:
          type: number
        serviceCharge:
          type: number
        discount:
          type: number
        total:
          type: number

    StateTransition:
      type: object
      properties:
        state:
          type: string
        timestamp:
          type: string
          format: date-time
        actor:
          type: string
        note:
          type: string

paths:
  /health:
    get:
      summary: Health check
      tags: [System]
      security: []
      responses:
        "200":
          description: Service is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: ok
                  timestamp:
                    type: string
                    format: date-time

  /auth/login:
    post:
      summary: User login
      tags: [Auth]
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
      responses:
        "200":
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken:
                    type: string
                  refreshToken:
                    type: string
                  expiresIn:
                    type: integer
                  tokenType:
                    type: string
        "401":
          description: Invalid credentials

  /tenants:
    post:
      summary: Create tenant
      tags: [Tenants]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Tenant"
      responses:
        "201":
          description: Tenant created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Tenant"

  /tenants/{tenantId}:
    get:
      summary: Get tenant details
      tags: [Tenants]
      parameters:
        - name: tenantId
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Tenant details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Tenant"

  /tenants/{tenantId}/tables:
    post:
      summary: Create table
      tags: [Tables & QR]
      parameters:
        - name: tenantId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Table"
      responses:
        "201":
          description: Table created

  /menu:
    get:
      summary: Get public menu
      tags: [Menu]
      security:
        - qrToken: []
      responses:
        "200":
          description: Menu data
          content:
            application/json:
              schema:
                type: object
                properties:
                  tenant:
                    type: object
                  table:
                    type: object
                  menu:
                    type: object

  /orders:
    post:
      summary: Create order
      tags: [Orders]
      security:
        - qrToken: []
      parameters:
        - name: Idempotency-Key
          in: header
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Order"
      responses:
        "201":
          description: Order created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Order"

    get:
      summary: List orders
      tags: [Orders]
      parameters:
        - name: state
          in: query
          schema:
            type: string
        - name: sortBy
          in: query
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        "200":
          description: Order list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Order"
                  pagination:
                    type: object

  /orders/{orderId}/state:
    patch:
      summary: Update order state
      tags: [Orders]
      parameters:
        - name: orderId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - state
              properties:
                state:
                  type: string
                note:
                  type: string
      responses:
        "200":
          description: State updated
```

---

## 13. Testing & Examples

### 13.1. Postman Collection

Download Postman collection: [QR-Ordering-API.postman_collection.json](./QR-Ordering-API.postman_collection.json)

### 13.2. cURL Examples

**Create Order**:

```bash
curl -X POST https://api.qr-ordering.com/v1/orders \
  -H "X-QR-Token: eyJ0aWQi..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{
    "tableId": "table_5",
    "customerInfo": {
      "name": "John Doe",
      "phone": "+84901234567"
    },
    "items": [
      {
        "itemId": "item_10",
        "name": "Pho Bo",
        "quantity": 2,
        "price": 75000
      }
    ],
    "totals": {
      "subtotal": 150000,
      "total": 150000
    }
  }'
```

--- -->

**END OF OPENAPI DOCUMENTATION**

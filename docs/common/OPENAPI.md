# OpenAPI Specification – TKOB_QROrderSystem

> Tài liệu này mô tả đầy đủ REST API của hệ thống TKOB_QROrderSystem theo chuẩn **OpenAPI 3.0**.
>
> **⚠️ LƯU Ý:** Tài liệu này là tổng quan cấp cao. Để có tài liệu API đầy đủ và cập nhật, hãy tham khảo **Swagger UI trực tiếp** tại `http://localhost:3000/api-docs` (phát triển) hoặc endpoint `/api-docs` của API được triển khai.

- **Version**: 1.0.0
- **Base URL**: ADD HERE (see section 1.2 for environment-specific URLs)
- **Last Updated**: 2026-01-20

---

## Mục lục

1. [Tổng quan API](#1-tổng-quan-api)
   - [1.5. Chỉ mục Swagger Tags](#15-swagger-tag-index-source-swagger-ui)
2. [Xác thực và Phân quyền](#2-authentication--authorization)
3. [Xử lý Lỗi](#3-error-handling)
4. [Giới hạn Tỷ lệ](#4-rate-limiting)
5. [API Tenants](#5-tenants-api)
6. [Ví dụ API Cũ (Được Lưu Trữ)](#6-legacy-api-examples-archived)
7. [Xuất OpenAPI (Tùy chọn)](#7-openapi-export-optional)
8. [API Quản lý Đăng ký](#8-subscription-management-api)
9. [API Quản lý Nhân viên](#9-staff-management-api)
10. [API Quản lý Hóa đơn](#10-bill-management-api)
11. [API Hệ thống Đánh giá](#11-review-system-api)
12. [API Hệ thống Khuyến mãi](#12-promotion-system-api)

---

## 1. Tổng quan API

### 1.1. Nguyên tắc Thiết kế API

- **RESTful**: Tuân thủ nguyên tắc REST (Resources, HTTP Methods, Status Codes)
- **Multi-tenant**: Mọi endpoint đều tenant-scoped
- **Versioned**: API versioning qua URL path (`/api/v1`, `/api/v2`)
- **JSON**: Request/Response format là JSON
- **Idempotent**: POST/PUT với idempotency keys khi cần
- **Pagination**: Cursor-based hoặc offset-based
- **Filtering**: Query parameters cho filter/sort

### 1.2. URL Cơ bản

```
Production:  ADD HERE (example: https://api.your-domain.com/api/v1)
Staging:     ADD HERE (example: https://api.staging.your-domain.com/api/v1)
Development: http://localhost:3000/api/v1
```

### 1.3. Loại Nội dung

```http
Content-Type: application/json
Accept: application/json
```

### 1.4. URL Tài liệu API

- **Swagger UI (Development)**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: ADD HERE (example: `http://localhost:3000/api-docs-json` for local, verify exact path in NestJS Swagger config)
- **Production Swagger**: ADD HERE (replace with your deployed domain + `/api-docs`)

> **🔍 Nguồn Sự thật:** Swagger UI được tạo tự động từ code decorators là tài liệu API có thẩm quyền. Tài liệu markdown này cung cấp tổng quan về khái niệm và quy trình làm việc.

### 1.5. Chỉ mục Swagger Tags (Nguồn: Swagger UI)

> **Nguồn Sự thật:** Swagger UI trực tiếp tại `http://localhost:3000/api-docs`  
> **Tổng cộng Hoạt động:** ~140+ (hiện tại ~142; xem openapi.exported.json để biết số lượng chính xác) trên nhiều tags (xem spec để biết số lượng tag chính xác)  
> **Lần xác minh cuối cùng:** 2026-01-20 (từ `openapi.exported.json`)

**Hoạt động theo Danh mục:**

| Tag | Số lượng | Các Endpoints Tiêu biểu |
|-----|-------|-------------------------|
| **Authentication** | 19 | `POST /api/v1/auth/register/submit`, `POST /api/v1/auth/register/confirm`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/google`, `GET /api/v1/auth/google/callback` |
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
| **Bills** | 6 | `GET /api/v1/admin/bills`, `GET /api/v1/admin/bills/{id}`, `GET /api/v1/orders/session/bill-preview`, `POST /api/v1/orders/session/request-bill`, `POST /api/v1/orders/session/cancel-bill-request` |
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

**Để xem chi tiết endpoint hoàn chỉnh:**
- Các schema request/response: Swagger UI → Mở rộng bất kỳ tag nào
- Yêu cầu xác thực: Tìm biểu tượng 🔒 trong Swagger UI
- Thử các endpoint trực tiếp: Sử dụng nút "Try it out" trong Swagger UI

**Nguồn bằng chứng:** Được xác minh qua phân tích Python của `docs/common/openapi.exported.json` (142 hoạt động, 23 tags)

---

## 2. Xác thực và Phân quyền

### 2.1. Quy trình Xác thực (Chủ sở hữu và Nhân viên)

Hệ thống sử dụng cơ chế **Stateful Session with JWT**.

- **Access Token**: Stateless JWT (ngắn hạn), chứa thông tin authorize.
- **Refresh Token**: Stateful (được lưu hash trong bảng `USER_SESSION`), dùng để quản lý phiên đăng nhập và revoke quyền truy cập.

#### 2.1.1. Quy trình Đăng ký (Luồng 2 Bước)

**Quy trình gồm 2 bước API chính**, sử dụng **Redis** làm bộ nhớ tạm để lưu thông tin đăng ký trong lúc chờ xác thực.

**Bước 1: Gửi & Thử thách (Gửi thông tin & Nhận OTP)**

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

**Lôgic Backend**:

1. **Validation**: Kiểm tra format email, password complexity.
2. **Kiểm tra Tính duy nhất (Postgres)**:
    - Kiểm tra `email` có trong bảng `USER` chưa?
    - Kiểm tra `slug` có trong bảng `TENANT` chưa?
    - *Nếu trùng*: Trả về `409 Conflict` ngay lập tức (kèm message chi tiết lỗi ở field nào).
3. **Lưu trữ Tạm thời (Redis)**:
    - Hash password.
    - Generate OTP (6 số).
    - Generate `registrationToken` (Random string, dùng làm key truy xuất Redis).
    - Lưu object `{ email, password_hash, fullName, tenantName, slug, otp }` vào Redis với Key=`reg:{registrationToken}` và TTL=10 phút.
4. **Gửi OTP**: Gửi email chứa OTP cho user.

**Response: 200 OK**

```json
{
  "message": "Validation successful. OTP sent to email.",
  "registrationToken": "a1b2c3d4-e5f6-...", // Token dùng để submit OTP ở bước sau
  "expiresIn": 600
}
```

**Lỗi Response (Ví dụ trùng Email): 409 Conflict**

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

**Bước 2: Xác nhận & Tạo (Xác thực OTP & Tạo tài khoản)**

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

**Lôgic Backend**:

1. **Retrieve**: Dùng `registrationToken` lấy dữ liệu tạm từ Redis. Nếu không thấy -> Lỗi `400` (Token hết hạn hoặc không tồn tại).
2. **Xác minh OTP**: So khớp `otp` user gửi lên với `otp` trong Redis.
3. **Transactional Write (Postgres)**:
    - Insert `TENANT` (dùng dữ liệu từ Redis).
    - Insert `USER` (dùng email, password_hash từ Redis).
    - Insert `USER_SESSION` (Login luôn cho user).
4. **Cleanup**: Xóa key trong Redis.
5. **Tạo Token**: Tạo Access/Refresh Token.

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

#### 2.1.2. Đăng nhập (Tạo Phiên)

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

#### 2.1.3. Làm mới Token (Gia hạn Phiên)

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

#### 2.1.4. Đăng xuất

Dùng `refreshToken` để đăng xuất khỏi chính xác thiết bị thực hiện `logout` (bằng cách so sánh `refreshToken`)

```json
POST /api/v1/auth/logout
Content-Type: application/json

{
  "refreshToken": "82a1b2c3-..."
}

Response: 200 OK

```
#### 2.1.5. Lấy Hồ sơ User Hiện tại

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

#### 2.1.6. Google OAuth - Khởi tạo

```http
GET /api/v1/auth/google
```

- **Xác thực**: Public (redirect-based)
- **Scope**: Web-Tenant only (chủ sở hữu/admin đăng nhập bảng điều khiển)
- **Mô tả**: Khởi tạo quy trình xác thực Google OAuth 2.0. Chuyển hướng người dùng đến Google Sign-In.
- **Guard**: `GoogleAuthGuard` (Passport Google OAuth 2.0)
- **Trả về**: HTTP 302 Redirect tới Google login page (`https://accounts.google.com/o/oauth2/v2/auth`)
- **Yêu cầu**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` phải được cấu hình trong `.env`
- **Lưu ý**: 
  - Chỉ hỗ trợ cho Tenant Dashboard (web-tenant)
  - Ứng dụng khách (web-customer) sử dụng xác thực dựa trên token QR
  - Nếu thiếu bất kỳ env var nào, endpoint sẽ trả về lỗi

#### 2.1.7. Google OAuth - Callback

```http
GET /api/v1/auth/google/callback?code={authorizationCode}&state={state}
```

- **Xác thực**: Public (callback từ Google, protected by CSRF state token)
- **Tham số Query**:
  - `code`: Authorization code từ Google (bắt buộc)
  - `state`: CSRF protection token từ Google (bắt buộc)
- **Mô tả**: Điểm kết thúc callback sau khi người dùng ủy quyền với Google. Trao đổi authorization code để nhận ID token và tạo/cập nhật phiên người dùng.
- **Guard**: `GoogleAuthGuard` (xác minh code với Google, tạo/cập nhật user)
- **Luồng Xác thực**:
  1. Google gửi `authorization code` + `state` trở lại endpoint này
  2. Backend xác minh `state` (CSRF protection)
  3. Backend trao đổi code lấy Google ID token
  4. Backend xác minh/tạo người dùng với `google_id` trong bảng `USER`
  5. Tạo phiên JWT (USER_SESSION)
  6. Tạo Access Token + Refresh Token
  7. Chuyển hướng tới frontend với tokens (hoặc lỗi)
- **Trả về**: 
  - Thành công (302 Redirect): Chuyển hướng tới web-tenant dashboard với token trong URL query hoặc cookie
  - Thất bại: Chuyển hướng tới trang lỗi đăng nhập
- **Lưu ý**: 
  - Yêu cầu `GOOGLE_CLIENT_SECRET` để trao đổi authorization code (không bao giờ phơi bày cho client)
  - Callback URL phải khớp chính xác với `GOOGLE_CALLBACK_URL` được đăng ký tại Google Cloud Console
  - Người dùng được tự động tạo nếu `google_id` chưa tồn tại, bằng cách extract `email` + `name` từ Google profile
  - Xác minh email được tự động nếu Google cung cấp `email_verified: true`

### 2.2. Token Claims & Phân quyền

#### 2.2.1. Cấu trúc Access Token JWT (Nhân viên/Chủ sở hữu)

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

#### 2.2.2. Kiểm soát Truy cập Dựa trên Role (RBAC)

Dựa trên Enum `role` trong Database:
_Đối với Super Admin: Không cần registry (liên hệ bên cung cấp sản phẩm để đăng ký tài khoản, login như các role dưới)_

| **Role (DB Enum)** | **Mô tả**   | **Quyền**                                                          |
| ------------------ | ----------------- | ------------------------------------------------------------------------ |
| **OWNER**          | Chủ nhà hàng      | Full CRUD on Tenant, Users, Menu, Payment Config. (Tương đương Admin cũ) |
| **STAFF**          | Nhân viên phục vụ | Read Menu, Create/Update Orders, Payment Status.                         |
| **KITCHEN**        | Đầu bếp/Bar       | Read Orders (Real-time), Update Order State (Preparing -> Ready).        |

### 2.3. Chiến lược Cách ly Tenant

Để đảm bảo tính toàn vẹn dữ liệu giữa các Tenant (Multi-tenancy):

1. **Extraction**: Middleware `AuthGuard` sẽ extract `tenantId` từ JWT (đối với Staff) hoặc từ QR Token (đối với Customer).
2. **Context Injection**: `tenantId` được gán vào `Request Context` (ví dụ: `req.user.tenantId`).
3. **Database Query**: Mọi query xuống Postgres **bắt buộc** phải có mệnh đề `WHERE tenant_id = ...`. Sử dụng chiến lược Defense in Depth với 2 lớp bảo vệ:
    - Application Logic: Middleware của ORM sẽ tự động chèn điều kiện `WHERE tenant_id = <current_tenant>` vào tất cả các câu lệnh `find`, `update`, `delete` trước khi gửi xuống DB.
    - (Optional/Planned) Database RLS (Row-Level Security): Ngay cả khi tầng Application có lỗi (bug ở middleware, quên filter), Database sẽ chặn truy cập nếu`tenant_id` của dòng dữ liệu không khớp với session context hiện tại.

## 3. Xử lý Lỗi

### 3.1. Định dạng Response Lỗi

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

### 3.2. Mã Lỗi Tiêu chuẩn

| Mã HTTP | Mã Lỗi              | Mô tả                                   |
| ----------- | ----------------------- | --------------------------------------------- |
| 400         | `BAD_REQUEST`           | Định dạng request/parameters không hợp lệ             |
| 401         | `UNAUTHORIZED`          | Missing or invalid authentication             |
| 403         | `FORBIDDEN`             | Quyền hạn không đủ                      |
| 404         | `NOT_FOUND`             | Tài nguyên không tìm thấy                            |
| 409         | `CONFLICT`              | Xung đột tài nguyên (duplicate, state mismatch) |
| 422         | `VALIDATION_ERROR`      | Xác thực request không thành công                     |
| 429         | `RATE_LIMIT_EXCEEDED`   | Quá nhiều request                             |
| 500         | `INTERNAL_SERVER_ERROR` | Lỗi server                                  |
| 503         | `SERVICE_UNAVAILABLE`   | Dịch vụ tạm thời không khả dụng               |

### 3.3. Lỗi Xác thực

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

## 4. Giới hạn Tỷ lệ

### 4.1. Các Header Giới hạn Tỷ lệ

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704960060
```

### 4.2. Chính sách Giới hạn Tỷ lệ

| Loại Endpoint         | Giới hạn                 |
| --------------------- | --------------------- |
| Public (Menu)         | 100 req/min per IP    |
| Authenticated (Staff) | 1000 req/min per user |
| Order Creation        | 10 req/min per table  |
| Admin Operations      | 100 req/min per admin |

### 4.3. Response Vượt quá Giới hạn Tỷ lệ

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

## 5. API Tenants

> Lưu ý: Việc tạo Tenant mới (Create) đã được thực hiện tự động trong quy trình đăng ký 2 bước: `POST /api/v1/auth/register/submit` (Step 1: Submit & Challenge) → `POST /api/v1/auth/register/confirm` (Step 2: Confirm & Create). Các API dưới đây dành cho OWNER để thiết lập thông tin nhà hàng (Onboarding) sau khi đã đăng nhập.

### URL Cơ bản

```
/api/v1/tenants
```

### 5.1. Lấy Thông tin Tenant Hiện tại

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

### 5.2. Cập nhật Hồ sơ Tenant (Bước Onboarding 1)

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

### 5.3. Cập nhật Giờ Mở cửa (Bước Onboarding 2)

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

### 5.4. Cập nhật Cài đặt (Bước Onboarding 3)

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

### 5.5. Cấu hình Thanh toán (Bước Onboarding 4 - Lên kế hoạch: Stripe)

Dành cho bảng `TENANT_PAYMENT_CONFIG`. API này dự kiến liên kết tài khoản thanh toán (ví dụ: Stripe) của nhà hàng để nhận tiền.

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

### 5.6. Hoàn tất Onboarding

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

### 5.7. Cập nhật Trạng thái Tenant (Chỉ Admin)

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

## 6. Ví dụ API Cũ (Được Lưu Trữ)

> **⚠️ NỘI DUNG LỖI THỜI:** Các phần 6-11 chứa các ví dụ API khái niệm không được đảm bảo khớp với việc triển khai thực tế.
>
> Các ví dụ này đã được chuyển tới: [**docs/appendix/legacy/OPENAPI_LEGACY_EXAMPLES.md**](../../appendix/legacy/OPENAPI_LEGACY_EXAMPLES.md)
>
> **Để có tài liệu API chính xác, luôn sử dụng:**
> - **Swagger UI trực tiếp:** `http://localhost:3000/api-docs`
> - **OpenAPI JSON:** `http://localhost:3000/api-docs-json`
> - **Mã nguồn Controller:** `source/apps/api/src/modules/*/controllers/*.controller.ts`

**Nội dung Cũ Bao gồm:**
- Ví dụ Tables & QR API (create, generate QR, revoke, list)
- Ví dụ Menu API (public menu, create category, create item, update, publish)
- Ví dụ Orders API (create order, get details, list, update state, cancel)
- Ví dụ Payments API (create session, webhooks, get status)
- Ví dụ Analytics API (dashboard summary, kitchen performance)
- Ví dụ Webhook (events, payload format, security)

**Đường dẫn Di chuyển:**
1. Xuất spec hiện tại: `curl http://localhost:3000/api-docs-json > openapi.json`
2. So sánh các ví dụ cũ với spec thực tế
3. Cập nhật mã client để khớp với các endpoint được ghi trong Swagger
4. Kiểm tra lại API phát triển tại `http://localhost:3000/api/v1`

---


## 7. Xuất OpenAPI (Tùy chọn)

> **Lưu ý:** Dự án này sử dụng NestJS Swagger decorators để tự động tạo tài liệu OpenAPI. Swagger UI trực tiếp tại `http://localhost:3000/api-docs` là nguồn có thẩm quyền.

### Endpoint JSON Được Tạo Tự động

NestJS Swagger tự động phơi bày một endpoint JSON tại `/api-docs-json`:

- **Development**: `http://localhost:3000/api-docs-json`
- **Production**: ADD HERE (thay thế bằng tên miền được triển khai + `/api-docs-json`)

**Bằng chứng:** NestJS Swagger tự động tạo endpoint này khi gọi `SwaggerModule.setup('api-docs', app, document)` trong `source/apps/api/src/main.ts:102`

### Xuất Spec OpenAPI vào Tệp

Để xuất thông số kỹ thuật OpenAPI để sử dụng với các công cụ tạo mã (Orval, OpenAPI Generator, v.v.):

```bash
# Development (local API)
curl http://localhost:3000/api-docs-json > docs/common/openapi.exported.json

# Production (thay thế bằng tên miền của bạn)
curl ADD_YOUR_DOMAIN/api-docs-json > docs/common/openapi.exported.json
```

### Cách sử dụng Ứng dụng Frontend Hiện tại

Các ứng dụng frontend hiện tại tham chiếu các bản sao cục bộ:
- `source/apps/web-tenant/openapi-spec.json`
- `source/apps/web-customer/openapi-spec.json`

**Khuyến nghị:** Xuất spec mới nhất và sao chép vào các ứng dụng frontend:
```bash
# Xuất từ API chạy
curl http://localhost:3000/api-docs-json > docs/common/openapi.exported.json

# Sao chép đến các ứng dụng frontend cho Orval
cp docs/common/openapi.exported.json source/apps/web-tenant/openapi-spec.json
cp docs/common/openapi.exported.json source/apps/web-customer/openapi-spec.json

# Tạo lại các API clients
cd source/apps/web-tenant && pnpm orval
cd source/apps/web-customer && pnpm orval
```

---

## 8. API Quản lý Đăng ký

> **Module:** `SubscriptionModule` - Vị trí: `source/apps/api/src/modules/subscription/`

### Tổng quan
Hệ thống quản lý đăng ký hỗ trợ các kế hoạch đa tầng (FREE, BASIC, PREMIUM) với giới hạn tính năng và theo dõi mức sử dụng. Xử lý nâng cấp đăng ký thông qua cổng thanh toán SePay.

### Đường dẫn Cơ bản
```
/api/v1/admin/subscription
```

### Endpoints

#### 8.1. Lấy Tất cả Kế hoạch Đăng ký
```http
GET /api/v1/subscription/plans
```
- **Xác thực:** Public (customer-facing) hoặc Bearer (admin)
- **Mô tả:** Lấy tất cả các tầng đăng ký có sẵn với chi tiết giá cả và tính năng
- **Controller:** `PublicSubscriptionController.getPlans()`

#### 8.2. Lấy Đăng ký Tenant Hiện tại
```http
GET /api/v1/admin/subscription/current
Authorization: Bearer {accessToken}
```
- **Xác thực:** Bắt buộc (JWT)
- **Roles:** OWNER, STAFF
- **Trả về:** Tầng đăng ký hiện tại, trạng thái, thống kê mức sử dụng và giới hạn
- **Controller:** `SubscriptionController.getCurrentSubscription()`

#### 8.3. Lấy Thống kê Sử dụng
```http
GET /api/v1/admin/subscription/usage
Authorization: Bearer {accessToken}
```
- **Xác thực:** Bắt buộc (JWT)
- **Trả về:** Mức sử dụng hiện tại so với giới hạn cho bảng, mục menu, đơn hàng/tháng, thành viên nhân viên
- **Controller:** `SubscriptionController.getUsage()`

#### 8.4. Kiểm tra Giới hạn Hành động
```http
POST /api/v1/admin/subscription/check-limit
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "action": "createTable" | "createMenuItem" | "createOrder" | "inviteStaff"
}
```
- **Xác thực:** Bắt buộc (JWT)
- **Mô tả:** Kiểm tra xem tenant có thể thực hiện hành động dựa trên giới hạn đăng ký không
- **Controller:** `SubscriptionController.checkLimit()`

#### 8.5. Tạo Thanh toán Nâng cấp
```http
POST /api/v1/admin/subscription/upgrade
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "targetTier": "BASIC" | "PREMIUM",
  "billingCycle": "MONTHLY" | "YEARLY"
}
```
- **Xác thực:** Bắt buộc (JWT)
- **Mô tả:** Tạo ý định thanh toán SePay để nâng cấp đăng ký. Trả về mã QR để thanh toán.
- **Controller:** `SubscriptionController.createUpgradePayment()`

#### 8.6. Kiểm tra Trạng thái Thanh toán Nâng cấp
```http
GET /api/v1/admin/subscription/upgrade/{paymentId}/status
Authorization: Bearer {accessToken}
```
- **Xác thực:** Bắt buộc (JWT)
- **Mô tả:** Khảo sát trạng thái thanh toán. Tự động nâng cấp đăng ký khi thanh toán được xác nhận.
- **Controller:** `SubscriptionController.checkUpgradePaymentStatus()`

**Bằng chứng:** `source/apps/api/src/modules/subscription/subscription.controller.ts`

---

## 9. API Quản lý Nhân viên

> **Module:** `StaffModule` - Vị trí: `source/apps/api/src/modules/staff/`

### Tổng quan
Hệ thống mời nhân viên và quản lý. Hỗ trợ lời mời dựa trên email với token hết hạn giới hạn thời gian (hết hạn 7 ngày).

### Đường dẫn Cơ bản
```
/api/v1/admin/staff
```

### Endpoints

#### 9.1. Mời Thành viên Nhân viên
```http
POST /api/v1/admin/staff/invite
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "email": "ADD HERE (example: staff@example.com)",
  "role": "STAFF" | "KITCHEN"
}
```
- **Xác thực:** Bắt buộc (JWT)
- **Roles:** Chỉ OWNER
- **Guards:** `SubscriptionLimitsGuard` - kiểm tra xem tenant có thể mời thêm nhân viên không
- **Mô tả:** Gửi email mời với token duy nhất
- **Controller:** `StaffController.inviteStaff()`

#### 9.2. Danh sách Thành viên Nhân viên
```http
GET /api/v1/admin/staff
Authorization: Bearer {accessToken}
```
- **Xác thực:** Bắt buộc (JWT)
- **Roles:** OWNER
- **Trả về:** Tất cả thành viên nhân viên hoạt động cho tenant
- **Controller:** `StaffController.listStaff()`

#### 9.3. Danh sách Lời mời Đang chờ
```http
GET /api/v1/admin/staff/invitations
Authorization: Bearer {accessToken}
```
- **Xác thực:** Bắt buộc (JWT)
- **Roles:** OWNER
- **Trả về:** Lời mời nhân viên đang chờ (chưa sử dụng)
- **Controller:** `StaffController.listPendingInvitations()`

#### 9.4. Cập nhật Vai trò Nhân viên
```http
PATCH /api/v1/admin/staff/{staffId}/role
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "role": "STAFF" | "KITCHEN"
}
```
- **Xác thực:** Bắt buộc (JWT)
- **Roles:** Chỉ OWNER
- **Mô tả:** Thay đổi vai trò của thành viên nhân viên
- **Controller:** `StaffController.updateStaffRole()` (hiện diện trong controller dòng 99+)

#### 9.5. Xóa Thành viên Nhân viên
```http
DELETE /api/v1/admin/staff/{staffId}
Authorization: Bearer {accessToken}
```
- **Xác thực:** Bắt buộc (JWT)
- **Roles:** Chỉ OWNER
- **Controller:** `StaffController.removeStaff()` (hiện diện trong controller)

#### 9.6. Chấp nhận Lời mời (Public)
```http
POST /api/v1/staff/accept-invite
Content-Type: application/json

{
  "token": "invitation-token-here",
  "password": "user-password",
  "fullName": "Staff Name"
}
```
- **Xác thực:** Public (token-based)
- **Mô tả:** Nhân viên chấp nhận lời mời và tạo tài khoản
- **Controller:** `StaffController.acceptInvite()` (public endpoint)

**Bằng chứng:** `source/apps/api/src/modules/staff/staff.controller.ts`

---

## 10. API Quản lý Hóa đơn

> **Module:** `BillModule` (phần của OrderModule) - Vị trí: `source/apps/api/src/modules/order/controllers/bill.controller.ts`

### Tổng quan
Tổng hợp hóa đơn cho các bảng. Nhóm nhiều đơn hàng thành một hóa đơn để thanh toán.

### Đường dẫn Cơ bản
```
/api/v1/admin/bills
```

### Endpoints

#### 10.1. Lấy Tất cả Hóa đơn
```http
GET /api/v1/admin/bills?tableId={tableId}&paymentStatus={status}&startDate={date}&endDate={date}
Authorization: Bearer {accessToken}
```
- **Xác thực:** Bắt buộc (JWT)
- **Roles:** OWNER, STAFF
- **Tham số Query:**
  - `tableId` (tùy chọn): Lọc theo bảng
  - `paymentStatus` (tùy chọn): PENDING | COMPLETED | FAILED
  - `startDate` (tùy chọn): Ngày ISO
  - `endDate` (tùy chọn): Ngày ISO
- **Controller:** `BillController.getBills()`

#### 10.2. Lấy Hóa đơn theo ID
```http
GET /api/v1/admin/bills/{billId}
Authorization: Bearer {accessToken}
```
- **Xác thực:** Bắt buộc (JWT)
- **Roles:** OWNER, STAFF
- **Trả về:** Hóa đơn chi tiết với tất cả các đơn hàng liên quan
- **Controller:** `BillController.getBillById()`

#### 10.3. Tạo Hóa đơn (Ngầm)
Hóa đơn thường được tạo thông qua các quy trình đơn hàng. Kiểm tra OrderModule để tìm các endpoint tạo hóa đơn liên quan đến thanh toán bảng.

#### 10.4. Yêu cầu Hóa đơn (Customer)
```http
POST /api/v1/orders/session/request-bill
Cookie: table_session_id={sessionId}
Content-Type: application/json
```
- **Xác thực**: Session-based (table_session_id cookie) hoặc Bearer token
- **Guard**: `SessionGuard` (xác thực session bàn hoặc JWT)
- **Public**: Đúng (khách hàng có thể gọi qua trình duyệt)
- **Mô tả**: Khách hàng yêu cầu hóa đơn cho tất cả đơn hàng trong phiên hiện tại. Cập nhật `bill_requested_at` timestamp và gửi thông báo real-time tới staff qua WebSocket.
- **Quy trình**:
  1. Khách hàng yêu cầu hóa đơn từ ứng dụng web-customer
  2. Backend cập nhật `table_sessions.bill_requested_at` = now
  3. Backend gửi thông báo WebSocket `order:bill_requested` tới staff room
  4. Staff nhận được thông báo để chuẩn bị hóa đơn/thanh toán
  5. Phiên bàn bị "khóa" (không thêm đơn hàng mới được)
- **Trả về**: 200 OK
  ```json
  {
    "success": true,
    "message": "Bill request sent successfully",
    "sessionId": "uuid-session-123",
    "tableNumber": "Bàn 5",
    "totalAmount": 450000,
    "orderCount": 3,
    "requestedAt": "2026-01-20T10:30:00Z"
  }
  ```
- **Lỗi**: 
  - 400 Bad Request: Bill đã được yêu cầu (duplicate request)
  - 404 Not Found: Session hoặc bàn không tồn tại
- **Lưu ý**:
  - Idempotent: Gọi lại endpoint không làm gì (trả về success nếu bill đã được request)
  - Session bị khóa: Sau khi bill request, không thể thêm đơn hàng mới (cart sẽ từ chối)
  - Có thể hủy bằng `POST /api/v1/orders/session/cancel-bill-request`

#### 10.5. Hủy Yêu cầu Hóa đơn (Customer)
```http
POST /api/v1/orders/session/cancel-bill-request
Cookie: table_session_id={sessionId}
Content-Type: application/json
```
- **Xác thực**: Session-based (table_session_id cookie) hoặc Bearer token
- **Guard**: `SessionGuard`
- **Public**: Đúng (khách hàng có thể gọi qua trình duyệt)
- **Mô tả**: Khách hàng hủy yêu cầu hóa đơn đã gửi trước đó. Xóa `bill_requested_at` timestamp và cho phép thêm đơn hàng mới.
- **Trả về**: 200 OK
  ```json
  {
    "success": true,
    "message": "Bill request cancelled",
    "sessionId": "uuid-session-123"
  }
  ```
- **Lỗi**:
  - 400 Bad Request: Không có bill request nào để hủy
  - 404 Not Found: Session hoặc bàn không tồn tại
- **Lưu ý**:
  - Phiên bàn được "mở khóa" lại, khách hàng có thể tiếp tục đặt hàng
  - Thông báo WebSocket được gửi tới staff để cập nhật UI

#### 10.6. Xem trước Hóa đơn Phiên (Customer)
```http
GET /api/v1/orders/session/bill-preview
Cookie: table_session_id={sessionId}
```
- **Xác thực**: Session-based (table_session_id cookie) hoặc Bearer token
- **Guard**: `SessionGuard`
- **Public**: Đúng (khách hàng có thể xem)
- **Mô tả**: Lấy xem trước hóa đơn tổng hợp cho phiên hiện tại, bao gồm tất cả đơn hàng được nhóm cho thanh toán.
- **Query Parameters**:
  - Không có
- **Trả về**: 200 OK
  ```json
  {
    "sessionId": "uuid-session-123",
    "tableId": "uuid-table-456",
    "tableNumber": "Bàn 5",
    "orderCount": 3,
    "itemCount": 8,
    "subtotal": 400000,
    "tax": 40000,
    "serviceCharge": 0,
    "tip": 0,
    "total": 440000,
    "billRequestedAt": "2026-01-20T10:30:00Z",
    "orders": [
      {
        "id": "order-1",
        "orderNumber": "ORD-20260120-0001",
        "status": "SERVED",
        "items": [
          {
            "id": "item-1",
            "name": "Phở Bò",
            "quantity": 2,
            "unitPrice": 80000,
            "modifiers": [
              {
                "name": "Medium",
                "priceAdjust": 0
              }
            ],
            "itemTotal": 160000
          }
        ],
        "subtotal": 160000
      }
    ]
  }
  ```
- **Lỗi**:
  - 404 Not Found: Session hoặc bàn không tồn tại
- **Lưu ý**:
  - Không bao gồm tip (được thêm sau khi thanh toán)
  - Thường được gọi trước `POST /api/v1/orders/session/request-bill` để xem tổng tiền
  - Hữu ích cho customer app hiển thị tóm tắt thanh toán

**Bằng chứng:** `source/apps/api/src/modules/order/controllers/bill.controller.ts`

---

## 11. API Hệ thống Đánh giá

> **Module:** `ReviewModule` - Vị trí: `source/apps/api/src/modules/review/`

### Tổng quan
Hệ thống đánh giá khách hàng cho các mục menu và đơn hàng. Hỗ trợ đánh giá 5 sao và nhận xét văn bản.

### Endpoints

#### 11.1. Tạo/Cập nhật Đánh giá (Khách hàng)
```http
POST /api/v1/orders/{orderId}/items/{itemId}/review?sessionId={sessionId}&tenantId={tenantId}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent pho!"
}
```
- **Xác thực:** Public (session-based)
- **Mô tả:** Khách hàng đánh giá một mục đơn hàng cụ thể
- **Controller:** `ReviewController.createReview()`

#### 11.2. Lấy Đánh giá Đơn hàng
```http
GET /api/v1/orders/{orderId}/reviews?tenantId={tenantId}
```
- **Xác thực:** Public
- **Trả về:** Tất cả đánh giá cho một đơn hàng với thống kê tóm tắt
- **Controller:** `ReviewController.getOrderReviews()`

#### 11.3. Lấy Đánh giá Mục Menu
```http
GET /api/v1/menu-items/{menuItemId}/reviews?tenantId={tenantId}
```
- **Xác thực:** Public
- **Trả về:** Thống kê đánh giá cho một mục menu cụ thể (đánh giá trung bình, số lượng)
- **Controller:** `ReviewController.getMenuItemReviews()`

#### 11.4. Lấy Thống kê Đánh giá Tenant (Admin)
```http
GET /api/v1/admin/reviews/stats
Authorization: Bearer {accessToken}
```
- **Xác thực:** Bắt buộc (JWT)
- **Roles:** OWNER, STAFF
- **Trả về:** Thống kê đánh giá trên toàn tenant và các mục được xếp hạng cao nhất
- **Controller:** `ReviewController.getTenantReviewStats()`

**Bằng chứng:** `source/apps/api/src/modules/review/review.controller.ts`

---

## 12. API Hệ thống Khuyến mãi

> **Module:** `PromotionModule` - Vị trí: `source/apps/api/src/modules/promotion/`

### Tổng quan
Hệ thống quản lý mã giảm giá. Hỗ trợ chiết khấu phần trăm và số tiền cố định với giới hạn sử dụng. Tính năng được ghi ở tầng đăng ký.

### Đường dẫn Cơ bản
```
/api/v1/admin/promotions
```

### Endpoints

#### 12.1. Tạo Khuyến mãi
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
- **Xác thực:** Bắt buộc (JWT)
- **Roles:** OWNER, STAFF
- **Guards:** `FeatureGuard` - yêu cầu tính năng "promotions" trong đăng ký
- **Controller:** `PromotionController.createPromotion()`

#### 12.2. Danh sách Khuyến mãi
```http
GET /api/v1/admin/promotions?active={true|false}
Authorization: Bearer {accessToken}
```
- **Xác thực:** Bắt buộc (JWT)
- **Roles:** OWNER, STAFF
- **Controller:** `PromotionController.getPromotions()`

#### 12.3. Lấy Chi tiết Khuyến mãi
```http
GET /api/v1/admin/promotions/{promotionId}
Authorization: Bearer {accessToken}
```
- **Xác thực:** Bắt buộc (JWT)
- **Roles:** OWNER, STAFF
- **Controller:** `PromotionController.getPromotion()`

#### 12.4. Cập nhật Khuyến mãi
```http
PUT /api/v1/admin/promotions/{promotionId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "active": false,
  "maxUses": 150
}
```
- **Xác thực:** Bắt buộc (JWT)
- **Roles:** OWNER, STAFF
- **Guards:** `FeatureGuard`
- **Controller:** `PromotionController.updatePromotion()`

#### 12.5. Xóa Khuyến mãi
```http
DELETE /api/v1/admin/promotions/{promotionId}
Authorization: Bearer {accessToken}
```
- **Xác thực:** Bắt buộc (JWT)
- **Roles:** OWNER, STAFF
- **Controller:** `PromotionController.deletePromotion()` (dòng 100+)

#### 12.6. Xác thực Mã Khuyến mãi (Public/Khách hàng)
```http
POST /api/v1/checkout/validate-promo
Content-Type: application/json

{
  "code": "ADD HERE (example: SUMMER2026)",
  "tenantId": "ADD HERE (example: tenant-uuid)",
  "orderAmount": 150000
}
```
- **Xác thực:** Public
- **Mô tả:** Xác thực xem mã khuyến mãi có áp dụng được cho đơn hàng không
- **Trả về:** Số tiền chiết khấu và trạng thái hợp lệ
- **Controller:** `PromotionController.validatePromoCode()` (public endpoint)

**Bằng chứng:** `source/apps/api/src/modules/promotion/promotion.controller.ts`

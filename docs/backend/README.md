# Server - Tài liệu API Backend

## 1. Giới thiệu

Backend API cho **Unified Restaurant Ordering Platform** - hệ thống đặt món QR-based cho nhà hàng. Dự án được xây dựng trên **NestJS** framework với kiến trúc module-based, cung cấp RESTful API và WebSocket cho real-time notifications.

## 2. Khởi động Nhanh

### Chạy Development Server
```bash
pnpm --filter @app/api dev
```

### Database Commands
```bash
# Chạy migrations
pnpm --filter @app/api db:migrate

# Tạo dữ liệu mẫu (seed data)
pnpm --filter @app/api db:seed

# Mở Prisma Studio (database GUI)
pnpm --filter @app/api db:studio
```

## 3. Cấu trúc Module

Dự án được tổ chức theo **domain-driven architecture**, mỗi module đảm nhận một business domain cụ thể:

### Core Modules

#### `AuthModule`
- Xử lý đăng ký, đăng nhập với JWT authentication
- Xác thực QR token sử dụng HMAC signature
- Guard và decorator cho authorization

#### `TenantModule`
- Quản lý thông tin nhà hàng (tenant/restaurant)
- CRUD operations cho restaurant profiles
- Multi-tenancy support

#### `MenuModule`
- Quản lý thực đơn: categories, items, modifiers
- Pricing và availability management
- Menu versioning và publishing

#### `TableModule`
- Quản lý thông tin bàn (tables)
- Tạo và validate QR codes cho bàn
- QR token generation với HMAC security

#### `OrderModule`
- Xử lý luồng đặt hàng từ khách
- Order state machine: `received` → `preparing` → `ready` → `completed`
- Order history và tracking

#### `PaymentModule`
- Tích hợp Stripe payment gateway
- Xử lý payment intents và webhooks
- Payment status tracking

#### `NotificationModule`
- Real-time notifications qua WebSocket
- Push updates cho Kitchen Display System (KDS)
- Order status updates cho khách hàng

#### `AnalyticsModule`
- Dashboard analytics: doanh thu, AOV (Average Order Value)
- Sales reports và metrics
- Business intelligence queries

## 4. Cơ sở Dữ liệu

- **Database:** PostgreSQL
- **ORM:** Prisma
- **Schema Location:** `packages/api/prisma/schema.prisma`

### Lệnh Prisma
```bash
# Generate Prisma Client
pnpm db:generate

# View/edit data in browser
pnpm db:studio
```

## 5. Tài liệu Liên quan

- [SETUP.md](../../SETUP.md) - Hướng dẫn setup chi tiết
- [Project Kickoff Summary](../project-kickoff-summary.md) - Tổng quan dự án
- API Documentation: `http://localhost:3000/api-docs` (Swagger UI khi chạy dev)

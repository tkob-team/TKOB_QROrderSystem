# Chỉ mục Tài liệu Cơ sở Dữ liệu

Chào mừng đến với tài liệu cơ sở dữ liệu cho dự án **TKOB_QROrderSystem**.

---

## Liên kết Nhanh

- **[Mô tả Schema](./description.md)** - Tài liệu schema cơ sở dữ liệu toàn diện
  - Tổng quan schema (cách ly multi-tenant, các quy ước đặt tên)
  - Domain models (Tenants, Users, Tables, Menu, Orders, Payments, Subscriptions, v.v.)
  - Tham chiếu Enums
  - Các quy tắc kinh doanh và ràng buộc

- **[Sơ đồ ER](./er_diagram.md)** - Sơ đồ Entity-Relationship
  - Biểu diễn trực quan các mối quan hệ cơ sở dữ liệu
  - Các khóa ngoại chính và liên kết

- **[Prisma Schema](../../../source/apps/api/prisma/schema.prisma)** - Nguồn sự thật
  - Định nghĩa schema Prisma hoàn chỉnh
  - Tất cả các models, enums, và relations

- **[Migrations](../../../source/apps/api/prisma/migrations/)** - Lịch sử migration cơ sở dữ liệu
  - 21 migrations applied (as of 2026-01-20)
  - Migration lock file

---

## Stack Công nghệ Cơ sở Dữ liệu

- **Database**: PostgreSQL
- **ORM**: Prisma 5.x
- **Migration Tool**: Prisma Migrate
- **Isolation**: Application-level `tenantId` filtering

---

## Khởi động Nhanh (Local Development)

### Yêu cầu Tiên quyết

- Node.js >=18.0.0 (source: root package.json engines field)
- PostgreSQL 16+ (source: docker-compose.yaml image tag postgres:16-alpine)
- pnpm package manager

### Tùy chọn 1: Docker Compose (Được Khuyến nghị)

```bash
# Khởi động PostgreSQL trong Docker
cd source/docker
docker compose up -d postgres

# Chờ PostgreSQL sẵn sàng
# Database sẽ có sẵn tại: postgresql://postgres:postgres@localhost:5432/qr_ordering_dev
# (Defaults from docker-compose.yaml: user=postgres, password=postgres, db=qr_ordering_dev)
```

### Tùy chọn 2: PostgreSQL Cục bộ

```bash
# Đảm bảo PostgreSQL chạy cục bộ
# Cập nhật tệp .env với URL cơ sở dữ liệu của bạn:
DATABASE_URL="ADD HERE (example: postgresql://user:password@localhost:5432/dbname)"
```

### Áp dụng Migrations

```bash
# Điều hướng đến thư mục API
cd source/apps/api

# Áp dụng tất cả các migrations đang chờ
pnpm prisma:migrate:deploy
# OR: npx prisma migrate deploy --config=./prisma/prisma.config.ts

# OR for development (creates new migrations)
pnpm db:migrate
# OR: npx prisma migrate dev --config=./prisma/prisma.config.ts

# Generate Prisma Client
pnpm db:generate
# OR: npx prisma generate --config=./prisma/prisma.config.ts
```

### Reset Cơ sở Dữ liệu với Seed Data

```bash
# Reset database and re-seed subscription plans (deletes ALL data)
cd source/apps/api
pnpm db:reset
# Runs: ts-node scripts/reset-db.ts
# Seeds: FREE, BASIC, PREMIUM subscription plans
# ⚠️ WARNING: Deletes all tenant data, users, orders, etc.
```

**Ghi chú:** Không có script seed chính thức cho dữ liệu demo tenant/menu. Chỉ sử dụng `db:reset` để xóa cơ sở dữ liệu và tái seed các kế hoạch đăng ký (source: package.json line 26, scripts/reset-db.ts).

### Xem Cơ sở Dữ liệu trong Prisma Studio

```bash
# Open Prisma Studio GUI
cd source/apps/api
pnpm db:studio
# OR: npx prisma studio --config=./prisma/prisma.config.ts

# Opens at: http://localhost:5555
```

---

## Các Lệnh Thường gặp

### Tạo New Migration

```bash
cd source/apps/api
pnpm db:migrate
# OR with custom migration name:
npx prisma migrate dev --name describe_your_changes --config=./prisma/prisma.config.ts
```

### Reset Cơ sở Dữ liệu (⚠️ Destructive)

```bash
cd source/apps/api
pnpm db:reset
# Deletes ALL data (tenants, users, orders, etc.) and re-seeds subscription plans
# Source: package.json line 26, scripts/reset-db.ts
```

### Kiểm tra Trạng thái Migration

```bash
cd source/apps/api
pnpm prisma migrate status
```

### Định dạng Schema

```bash
cd source/apps/api
pnpm prisma format
```

---

## Kết nối Cơ sở Dữ liệu

### Biến Môi trường

Cấu hình những biến này trong tệp `.env` của bạn:

```env
# PostgreSQL connection string (Docker default from docker-compose.yaml)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qr_ordering_dev"

# Optional: Direct connection for Prisma Studio
DATABASE_URL_DIRECT="postgresql://postgres:postgres@localhost:5432/qr_ordering_dev"
```

### Cài đặt Connection Pool

- **Default Pool Size**: 10 connections (Prisma default)
- **Connection Timeout**: 10 seconds
- **For Production**: Use connection pooler (PgBouncer) for horizontal scaling

---

## Quy ước Schema

### Tên Bảng
- Lowercase snake_case plural (e.g., `menu_items`, `user_sessions`)

### Tên Cột
- Lowercase snake_case (e.g., `created_at`, `tenant_id`)
- Foreign keys follow `{entity}_id` pattern

### Khóa Chính
- UUID v4 format (`@id @default(uuid())`)

### Timestamps
- All tables include `created_at` and `updated_at`
- Auto-managed by Prisma

### Cách ly Multi-Tenant
- Every tenant-scoped table has `tenant_id` foreign key
- Composite indexes on `(tenant_id, ...)` for performance
- Application-level filtering via Prisma middleware

---

## Lịch sử Migration

**Latest Migration**: `20260119060909_add_user_avatar`  
**Total Migrations**: 21 (as of 2026-01-20)

### Các Cột mốc Chính

1. **Init** (`20251124113547`) - Initial auth and tenant models
2. **Payments** (`20251204091502`) - Payment configuration schema
3. **Tables** (`20251216035526`) - Table management
4. **Sessions** (`20251218110840`) - Haidilao-style table sessions
5. **Photos** (`20251222071034`) - Menu item photo support
6. **Orders** (`20260102014103`) - Order system
7. **KDS** (`20260109164002`) - Kitchen Display System timestamps
8. **Cart** (`20260111051002`) - Shopping cart
9. **Payments** (`20260111053918`) - SePay integration
10. **Subscriptions** (`20260114170300`) - Subscription tiers
11. **Bills** (`20260118102004`) - Bill consolidation

View full migration history in [migrations folder](../../../source/apps/api/prisma/migrations/).

---

## Backup & Recovery

### Backup Cơ sở Dữ liệu

```bash
# Backup with pg_dump (replace DB name with your actual database)
pg_dump -h localhost -U postgres -d qr_ordering_dev > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific schemas or tables:
# pg_dump -t tenants -t users ... (specify tables as needed)
```

### Khôi phục Cơ sở Dữ liệu

```bash
# Restore from backup (replace DB name with your actual database)
psql -h localhost -U postgres -d qr_ordering_dev < backup_file.sql
```

---

## Mẹo Hiệu suất

1. **Indexes**: Critical indexes defined in schema.prisma:
   - `(tenant_id, ...)` for all tenant-scoped queries
   - Foreign keys for join performance
   - Status fields for filtering

2. **Query Optimization**:
   - Always filter by `tenant_id` first (multi-tenant pattern)
   - Use `select` to limit returned fields
   - Use `include` carefully to avoid N+1 queries

3. **Caching**: See [ARCHITECTURE.md](../../common/ARCHITECTURE.md) for Redis caching strategy

---

## Khắc phục Sự cố

### Xung đột Migration

```bash
# If migrations are out of sync
cd source/apps/api
pnpm prisma migrate resolve --applied <migration_name>

# Force reset (⚠️ loses data)
pnpm prisma migrate reset
```

### Vấn đề Kết nối

```bash
# Test database connection
cd source/apps/api
pnpm prisma db pull
# If successful, connection is working
```

### Tạo Prisma Client

```bash
# Regenerate Prisma Client
cd source/apps/api
pnpm db:generate
# OR: npx prisma generate --config=./prisma/prisma.config.ts

# If types are not recognized, restart TypeScript server in your IDE
```

---

## Tài nguyên Bổ sung

- **Prisma Documentation**: https://www.prisma.io/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Project Architecture**: [ARCHITECTURE.md](../../common/ARCHITECTURE.md)
- **API Documentation**: [OpenAPI Spec](../../common/openapi.exported.json)

---

**Last Updated**: 2026-01-20  
**Maintained By**: Development Team

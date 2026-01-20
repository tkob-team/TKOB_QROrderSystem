# Hướng dẫn Cài đặt Môi trường Phát triển

> Hướng dẫn đầy đủ để cài đặt môi trường phát triển local cho **TKOB_QROrderSystem**.

- **Version**: 2.0
- **Cập nhật lần cuối**: 2026-01-20
- **Yêu cầu**: Node.js 18+ (khuyến nghị 20 LTS), Docker, pnpm 8+

---

## Quick Start (5 Phút)

```bash
# 1. Cài đặt yêu cầu: Node.js 18+ (khuyến nghị 20 LTS), pnpm 8+, Docker
# 2. Clone repository
git clone TBD (repository URL)
cd TKOB_QROrderSystem

# 3. Cài đặt dependencies
pnpm install

# 4. Khởi động database services
cd source/docker
docker compose up -d

# 5. Setup database
cd ../apps/api
cp .env.example .env
# Chỉnh sửa .env với cấu hình của bạn
pnpm db:generate
pnpm db:migrate
# Tùy chọn: pnpm db:reset (seed subscription plans)

cd ../../..  # quay về repo root
```

**Dừng tại đây.** Bây giờ mở 3 terminal riêng biệt từ repo root cho các dịch vụ bên dưới.

```bash
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

# Xác minh
# API: http://localhost:3000/health
# Swagger: http://localhost:3000/api-docs
# Customer: http://localhost:3001
# Tenant: http://localhost:3002
```

---

## Mục lục

1. [Yêu cầu Hệ thống](#1-yêu-cầu-hệ-thống)
2. [Cài đặt Yêu cầu](#2-cài-đặt-yêu-cầu)
3. [Clone Repository](#3-clone-repository)
4. [Cài đặt Dependencies](#4-cài-đặt-dependencies)
5. [Cấu hình Environment](#5-cấu-hình-environment)
6. [Setup Database](#6-setup-database)
7. [Chạy Development Servers](#7-chạy-development-servers)
8. [Xác minh Setup](#8-xác-minh-setup)
9. [Scripts có sẵn](#9-scripts-có-sẵn)
10. [Setup IDE](#10-setup-ide)
11. [Khắc phục sự cố](#11-khắc-phục-sự-cố)

---

## 1. Yêu cầu Hệ thống

### Yêu cầu Tối thiểu

| Thành phần | Yêu cầu |
|-----------|-------------|
| **OS** | Windows 10/11, macOS 12+, Ubuntu 20.04+ |
| **RAM** | 8GB (khuyến nghị 16GB) |
| **Disk** | 10GB dung lượng trống |
| **CPU** | 4 cores (khuyến nghị) |

### Yêu cầu Phần mềm

- **Node.js**: >= 18.0.0 (20 LTS recommended)
- **pnpm**: >= 8 (tested with pnpm 10.x)
- **Docker**: >= 24.x with Docker Compose
- **Git**: >= 2.30

---

## 2. Cài đặt Yêu cầu

### 2.1. Node.js & pnpm

**Cài đặt Node.js** (qua nvm - khuyến nghị):

```bash
# Linux/macOS
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
nvm alias default 20

# Windows: Tải nvm-windows từ GitHub
# https://github.com/coreybutler/nvm-windows/releases

# Xác minh (yêu cầu Node.js 18+, khuyến nghị 20 LTS)
node --version  # v18.x.x hoặc v20.x.x
npm --version
```

**Cài đặt pnpm**:

```bash
npm install -g pnpm

# Hoặc qua Corepack
corepack enable
corepack prepare pnpm@latest --activate

# Xác minh
pnpm --version  # 8.x.x hoặc cao hơn
```

### 2.2. Docker & Docker Compose

**Windows**: Tải [Docker Desktop](https://www.docker.com/products/docker-desktop/)

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

# Xác minh
docker --version
docker compose version
```

---

## 3. Clone Repository

```bash
# Clone repository
git clone TBD (repository URL)
cd TKOB_QROrderSystem

# Xác minh cấu trúc workspace
ls -la
# Kết quả mong đợi:
# - source/apps/       (api, web-customer, web-tenant)
# - source/packages/   (shared packages)
# - source/docker/     (docker-compose.yaml)
# - docs/             (documentation)
# - package.json      (workspace root)
# - pnpm-workspace.yaml
```

---

## 4. Cài đặt Dependencies

```bash
# Từ repository root
pnpm install

# Lệnh này cài đặt dependencies cho tất cả workspace packages:
# - source/apps/api
# - source/apps/web-customer
# - source/apps/web-tenant
# - source/packages/* (nếu có)
```

**Xác minh cài đặt**:
```bash
pnpm list --depth=0
```

---

## 5. Cấu hình Environment

### 5.1. Docker Environment

```bash
cd source/docker
cp .env.example .env
```

**Chỉnh sửa `source/docker/.env`**:
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

**Chỉnh sửa `source/apps/api/.env`** (xem `.env.example` để biết danh sách đầy đủ):
```bash
# API
API_PORT=3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qr_ordering_dev"

# Logging
LOG_LEVEL=debug
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-min-32-chars-CHANGE-THIS
JWT_ACCESS_TOKEN_EXPIRES_IN=1h
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
# Lưu ý: Đặt một secret mạnh (tối thiểu 32 ký tự) cho production

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Email (SendGrid)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=optional-for-dev
EMAIL_FROM=noreply@localhost
# Lưu ý: Đặt thông tin xác thực thật cho chức năng email production

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

Chỉnh sửa:
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_USE_MOCK_API=false

# App
NEXT_PUBLIC_APP_NAME=TKOB Customer

# Logging (chỉ cho dev)
NEXT_PUBLIC_USE_LOGGING=false
```

**Tenant Dashboard (`source/apps/web-tenant/.env`)**:
```bash
cp source/apps/web-tenant/.env.example source/apps/web-tenant/.env
```

Chỉnh sửa:
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CUSTOMER_APP_URL=http://localhost:3001

# App
NEXT_PUBLIC_APP_NAME=TKOB Tenant

# WebSocket (tùy chọn - xác minh đường dẫn thực tế trong backend implementation)
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Logging (chỉ cho dev)
NEXT_PUBLIC_USE_LOGGING=false

# Lưu ý: Frontend sử dụng access tokens do API cấp
# Không cần JWT_SECRET trong frontend environment
```

---

## 6. Setup Database

### 6.1. Khởi động Database Services

```bash
# Từ thư mục source/docker
cd source/docker
docker compose up -d

# Xác minh các dịch vụ đang chạy
docker compose ps

# Kết quả mong đợi:
# NAME              SERVICE    STATUS       PORTS
# tkob-db-dev       postgres   Up          0.0.0.0:5432->5432/tcp
# qr-redis-dev      redis      Up          0.0.0.0:6379->6379/tcp
```

### 6.2. Chạy Database Migrations

```bash
# Từ thư mục api
cd source/apps/api

# Generate Prisma Client
pnpm db:generate

# Chạy migrations
pnpm db:migrate

# Xác minh trạng thái migration
pnpm prisma migrate status --config=./prisma/prisma.config.ts
```

### 6.3. Reset Database (Tùy chọn)

Để reset database và seed subscription plans:

```bash
cd source/apps/api
pnpm db:reset

# Script này (scripts/reset-db.ts):
# - Xoá tất cả dữ liệu
# - Seed lại subscription plans
# - KHÔNG tạo demo users/tenants
```

**Lưu ý**: KHÔNG có script seed tự động cho demo tenants hoặc users. Bạn phải tạo test data thông qua API hoặc thủ công.

### 6.4. Prisma Studio (Database GUI)

```bash
cd source/apps/api
pnpm db:studio

# Mở tại: http://localhost:5555
```

---

## 7. Chạy Development Servers

### Phương án 1: Chạy Tất cả Các Dịch vụ (Khuyến nghị cho người mới)

```bash
# Từ repository root
pnpm dev

# Chạy "pnpm run --parallel dev" (từ root package.json)
# Chạy dev script trong tất cả workspaces có nó:
# - web-customer (port 3001)
# - web-tenant (port 3002)
# Lưu ý: API có "start:dev", không phải "dev", nên sẽ không khởi động với lệnh này
```

### Phương án 2: Chạy Từng Dịch vụ Riêng biệt (Khuyến nghị cho phát triển)

**Terminal 1 - Backend API**:
```bash
cd source/apps/api
pnpm start:dev

# Chạy tại: http://localhost:3000
# API prefix: /api/v1
# Swagger: http://localhost:3000/api-docs (xem source/apps/api/src/main.ts: SwaggerModule.setup('api-docs', ...))
```

**Terminal 2 - Customer App**:
```bash
cd source/apps/web-customer
pnpm dev

# Chạy tại: http://localhost:3001 (từ package.json: "dev": "next dev -p 3001")
```

**Terminal 3 - Tenant Dashboard**:
```bash
cd source/apps/web-tenant
pnpm dev

# Chạy tại: http://localhost:3002 (từ package.json: "dev": "next dev -p 3002")
```

---

## 8. Xác minh Setup

### 8.1. Health Checks

**API Health**:
```bash
curl http://localhost:3000/health

# Lưu ý: /health được loại trừ khỏi /api/v1 prefix (xem source/apps/api/src/main.ts - global prefix excludes /health và /)
# Kết quả mong đợi: {"status":"ok","timestamp":"..."}
```

**Kết nối Database**:
```bash
# Test PostgreSQL
docker exec -it tkob-db-dev psql -U postgres -d qr_ordering_dev -c "SELECT version();"

# Test Redis
docker exec -it qr-redis-dev redis-cli ping
# Kết quả mong đợi: PONG
```

### 8.2. Truy cập Các Ứng dụng

| Ứng dụng | URL | Thông tin đăng nhập |
|-------------|-----|-------------|
| **Backend API** | http://localhost:3000 | N/A |
| **Swagger UI** | http://localhost:3000/api-docs | N/A |
| **Customer App** | http://localhost:3001 | Không cần đăng nhập |
| **Tenant Dashboard** | http://localhost:3002 | Tạo qua Auth API (xem các endpoints bên dưới) |
| **Prisma Studio** | http://localhost:5555 | Chạy `pnpm db:studio` trước |

**Lưu ý**: Không có demo credentials được seed. Bạn phải:
1. Đăng ký tenant qua API: `POST /api/v1/auth/register/submit` → `POST /api/v1/auth/register/confirm`
2. Đăng nhập qua: `POST /api/v1/auth/login`

Xem [OPENAPI.md](./OPENAPI.md) để biết các ví dụ API đầy đủ.

---

## 9. Scripts có sẵn

### Root Scripts (từ `package.json`)

```bash
# Development
pnpm dev                      # Chạy "--parallel dev" trong tất cả workspaces (từ package.json: "dev": "pnpm run --parallel dev")
pnpm dev:web-customer         # Chỉ customer app
pnpm dev:web-tenant           # Chỉ tenant dashboard

# Build
pnpm build                    # Build tất cả apps
pnpm build:web-customer       # Build customer app
pnpm build:web-tenant         # Build tenant dashboard

# Lint & Type Check
pnpm lint                     # Lint tất cả
pnpm lint:web-customer        # Lint customer app
pnpm lint:web-tenant          # Lint tenant dashboard
pnpm type-check               # Type check tất cả
```

### API Scripts (từ `source/apps/api/package.json`)

```bash
cd source/apps/api

# Development
pnpm start:dev                # Khởi động với hot reload
pnpm start:debug              # Khởi động với debugger

# Build & Production
pnpm build                    # Build cho production
pnpm start                    # Khởi động production build

# Database
pnpm db:migrate               # Chạy migrations
pnpm db:generate              # Generate Prisma Client
pnpm db:studio                # Mở Prisma Studio
pnpm db:reset                 # Reset DB + seed plans

# Testing
pnpm test                     # Chạy unit tests
pnpm test:watch               # Watch mode
pnpm test:cov                 # Với coverage
pnpm test:e2e                 # E2E tests

# Lint & Format
pnpm lint                     # ESLint
pnpm format                   # Prettier
```

### Frontend Scripts (web-customer / web-tenant)

```bash
cd source/apps/web-customer  # hoặc web-tenant

# Development
pnpm dev                      # Khởi động dev server

# Build
pnpm build                    # Production build
pnpm start                    # Serve production build

# Code Generation
pnpm sync-spec                # Fetch OpenAPI spec từ API
pnpm orval                    # Generate TypeScript clients
pnpm codegen                  # sync-spec + orval

# Quality
pnpm lint                     # ESLint
pnpm type-check               # TypeScript check
```

---

## 10. Setup IDE

### VS Code (Khuyến nghị)

**Cài đặt Extensions**:
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

## 11. Khắc phục sự cố

### Vấn đề: `pnpm install` thất bại

```bash
# Xóa pnpm cache
pnpm store prune

# Xoá node_modules
rm -rf node_modules
rm -rf source/apps/*/node_modules
rm -rf source/packages/*/node_modules

# Cài đặt lại
pnpm install
```

### Vấn đề: Xung đột port Docker

```bash
# Kiểm tra điều gì đang dùng port
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Phương án 1: Dừng dịch vụ xung đột
sudo systemctl stop postgresql  # Linux
brew services stop postgresql   # macOS

# Phương án 2: Thay đổi port trong source/docker/.env
DATABASE_PORT=5433
```

### Vấn đề: Database migration thất bại

```bash
# Xác minh database đang chạy
cd source/docker
docker compose ps

# Kiểm tra logs (thay <service-name> với tên dịch vụ thực tế từ ps output)
docker compose logs <service-name>

# Khởi động lại database
docker compose restart <service-name>

# Đợi health check, sau đó thử lại
cd ../apps/api  # từ source/docker
pnpm db:migrate
```

### Vấn đề: Frontend không kết nối được với API

```bash
# Xác minh API đang chạy
curl http://localhost:3000/health

# Kiểm tra cấu hình CORS trong API main.ts
# Đảm bảo http://localhost:3001 và http://localhost:3002 được cho phép

# Xác minh frontend .env có API_URL đúng
cat source/apps/web-customer/.env | grep API_URL
# Nên là: NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Reset Tất cả

```bash
# Dừng và xoá Docker volumes
cd source/docker
docker compose down -v

# Xoá tất cả node_modules
cd ../..
rm -rf node_modules
find source -name 'node_modules' -type d -prune -exec rm -rf '{}' +

# Xóa build artifacts
find source -name 'dist' -type d -prune -exec rm -rf '{}' +
find source -name '.next' -type d -prune -exec rm -rf '{}' +

# Cài đặt lại
pnpm install

# Khởi động lại Docker
cd source/docker
docker compose up -d

# Migrate
cd ../apps/api
pnpm db:migrate

# Khởi động servers
pnpm start:dev  # API
# Ở các terminal khác: khởi động frontend apps
```

---

## 12. Tham chiếu Port

| Dịch vụ | Port | Nguồn |
|---------|------|--------|
| PostgreSQL | 5432 | `source/docker/docker-compose.yaml` |
| Redis | 6379 | `source/docker/docker-compose.yaml` |
| Backend API | 3000 | `source/apps/api/src/main.ts` (mặc định) |
| Customer App | 3001 | `source/apps/web-customer/package.json` ("dev": "next dev -p 3001") |
| Tenant Dashboard | 3002 | `source/apps/web-tenant/package.json` ("dev": "next dev -p 3002") |
| Prisma Studio | 5555 | Prisma mặc định |

---

## 13. Các Bước Tiếp theo

### Khám phá Codebase

```
source/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/       # Feature modules (auth, tenants, menu, orders, v.v.)
│   │   │   ├── common/        # Tiện ích dùng chung
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

### Đọc Tài liệu

- [Kiến trúc](./ARCHITECTURE.md) - Kiến trúc hệ thống
- [Database Schema](../backend/database/description.md) - Tài liệu schema đầy đủ
- [Tài liệu API](http://localhost:3000/api-docs) - Swagger UI (khi API đang chạy)
- [Contributing](./CONTRIBUTING.md) - Hướng dẫn đóng góp

---

## Support

- **Tài liệu**: Kiểm tra thư mục `docs/`
- **Issues**: TBD (team will fill later)
- **Contact**: TBD (team will fill later)

---

**Hoàn tất setup! 🎉**

*Nếu gặp vấn đề, tham khảo phần Khắc phục sự cố hoặc tạo issue trong repository.*

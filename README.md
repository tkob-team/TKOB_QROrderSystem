# TKOB_QROrderSystem – TKQR-in Ordering Platform

> Hệ thống đặt hàng qua mã QR cho nhà hàng (QR-based restaurant ordering system) – đa tenant, thời gian thực, với tích hợp thanh toán.

![Monorepo](https://img.shields.io/badge/Monorepo-pnpm-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📑 Nội dung

1. [Tổng quan](#tổng-quan)
2. [Kiến trúc & Thành phần](#kiến-trúc--thành-phần)
3. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
4. [Hướng dẫn cài đặt & chạy localhost](#hướng-dẫn-cài-đặt--chạy-localhost)
5. [Hướng dẫn sử dụng môi trường đã deploy](#hướng-dẫn-sử-dụng-môi-trường-đã-deploy)
6. [Khắc phục sự cố](#khắc-phục-sự-cố)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Cấu trúc dự án](#cấu-trúc-dự-án)
9. [Tính năng chính](#tính-năng-chính)
10. [Tài liệu](#-tài-liệu)
11. [Trạng thái dự án](#trạng-thái-dự-án)
12. [Phát triển](#-phát-triển)
13. [Bảo mật](#-bảo-mật)
14. [Hỗ trợ & Đóng góp](#-hỗ-trợ--đóng-góp)

---

## Yêu cầu hệ thống

### Bắt buộc

| Yêu cầu | Phiên bản tối thiểu | Ghi chú |
|--------|-------------------|--------|
| **Node.js** | ≥18.0.0 | Khuyến nghị 20 LTS hoặc cao hơn |
| **pnpm** | ≥8.0.0 | Package manager cho monorepo |
| **Docker** | ≥24.0 | Cho PostgreSQL & Redis (recommended) |
| **Docker Compose** | ≥2.20 | Bundled với Docker Desktop |

### Kiểm tra phiên bản

```bash
# Kiểm tra Node.js
node --version              # Should output v18.0.0 or higher

# Kiểm tra pnpm
pnpm --version              # Should output 8.0.0 or higher

# Kiểm tra Docker
docker --version
docker compose version
```

### Tùy chọn (cho tính năng cụ thể)

- **Google OAuth**: Chỉ cần cấu hình `.env` nếu muốn login qua Google (không bắt buộc cho localhost)
- **SePay Payment**: Chỉ cần khóa API nếu muốn test thanh toán thực (không bắt buộc cho localhost)

---

## Tổng quan

**TKQR-in Ordering Platform** (tên dự án: TKOB_QROrderSystem) là một nền tảng tạo hóa đơn đầy đủ cho nhà hàng cho phép:

- 🔐 **Khách hàng**: Quét mã QR → xem menu → thêm vào giỏ → thanh toán trực tiếp
- 📱 **Chủ nhà hàng/Admin**: Quản lý menu, bàn, QR, đơn hàng, nhân viên, phân tích, đăng ký
- 👨‍💼 **Nhân viên**: Quản lý bàn, dịch vụ, xem đơn hàng
- 👨‍🍳 **Bếp (KDS)**: Xem đơn hàng theo ưu tiên, cập nhật trạng thái

**Tính năng chính:**
- ✅ Multi-tenant isolation (application-level)
- ✅ WebSocket thời gian thực cho cập nhật đơn hàng
- ✅ Tích hợp thanh toán SePay QR + webhook
- ✅ RBAC (Role-Based Access Control): OWNER, STAFF, KITCHEN
- ✅ Xác thực Google OAuth cho chủ nhà hàng/nhân viên
- ✅ Yêu cầu hóa đơn từ khách hàng + thông báo thời gian thực cho nhân viên
- ✅ Hệ thống đánh giá & xếp hạng, khuyến mãi
- ✅ Analytics: doanh thu, đơn hàng, mục phổ biến
- ✅ Database audit logs, hóa đơn

---

## Kiến trúc & Thành phần

Monorepo **pnpm workspace** với 3 ứng dụng chính + 1 UI package dùng chung:

### 📦 Ứng dụng

| Ứng dụng | Loại | Vị trí | Mô tả | Port | Dev Script |
|---------|------|--------|-------|------|-----------|
| **API** | NestJS | `source/apps/api` | Backend REST API (~140+ endpoints) | 3000 | `pnpm dev` (from root) |
| **Web Tenant** | Next.js 15 | `source/apps/web-tenant` | Dashboard admin/staff/kitchen | 3002 | `pnpm dev:web-tenant` |
| **Web Customer** | Next.js 15 | `source/apps/web-customer` | Ứng dụng gọi món khách hàng | 3001 | `pnpm dev:web-customer` |
| **UI Package** | Shared | `packages/ui` | Shared UI components (TailwindCSS) | — | — |

### 🗄️ Backend Stack
- **Framework**: NestJS 10+
- **Database**: PostgreSQL 16 + Prisma ORM (21 migrations)
- **Cache**: Redis (menu, session, queue)
- **Real-time**: WebSocket via Socket.IO
- **Payment**: SePay QR integration
- **Validation**: Zod, class-validator

### 🎨 Frontend Stack
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, TailwindCSS v4, Shadcn/ui
- **State**: TanStack Query v5 (server state), Zustand (client state)
- **API Client**: Axios + interceptors
- **Icons**: lucide-react

### 📊 Infrastructure

- **PostgreSQL 16** (Docker Compose) – Primary database
- **Redis 7** (Docker Compose) – Cache & session storage
- **MinIO** (Optional) – S3 mock cho upload ảnh menu

---

## Hướng dẫn cài đặt & chạy localhost

### Bước 1: Clone repository

```bash
git clone https://github.com/tkob-team/TKOB_QROrderSystem
cd TKOB_QROrderSystem
```

### Bước 2: Cài đặt dependencies

```bash
pnpm install
```

**Lưu ý**: Lệnh này cài tất cả packages cho tất cả ứng dụng (API, web-customer, web-tenant, UI).

### Bước 3: Cấu hình Environment Variables

Bạn cần tạo file `.env` cho mỗi ứng dụng. Mỗi ứng dụng đã có `.env.example` làm mẫu.

#### 3a. API (.env)

```bash
cd source/apps/api

# Copy template
cp .env.example .env

# Edit .env và điền các giá trị sau (tối thiểu):
```

**Các biến bắt buộc** (giá trị mẫu cho localhost):

```dotenv
# API
API_PORT=3000

# Database (sử dụng PostgreSQL từ Docker Compose)
DATABASE_URL=postgresql://postgres:tkob_bathangkho123@localhost:5432/qr_ordering

# Logging
LOG_LEVEL=debug
NODE_ENV=development

# JWT (tạo chuỗi ngẫu nhiên, ví dụ: openssl rand -base64 32)
JWT_SECRET=your-super-secret-key-here
JWT_ACCESS_TOKEN_EXPIRES_IN=1h
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Redis (từ Docker Compose)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (tuỳ chọn cho localhost)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-key

# OTP
OTP_LENGTH=6
OTP_EXPIRY_SECONDS=600

# Storage
STORAGE_DRIVER=local
MAX_FILE_SIZE=5242880
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp

# CORS
CORS_ORIGINS=http://localhost:3001,http://localhost:3002,http://localhost:3000

# Optional: SePay Payment (chỉ khi muốn test thanh toán)
# PAYMENT_PROVIDER=sepay
# SEPAY_API_URL=https://api.sepay.vn/v1
# SEPAY_SECRET_KEY=your-sepay-key
```

**File tham khảo**: [source/apps/api/.env.example](source/apps/api/.env.example)

```bash
cd ../..  # Quay về root
```

#### 3b. Web Tenant (.env.local)

```bash
cd source/apps/web-tenant

# Copy template
cp .env.example .env.local

# Edit .env.local và điền:
```

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_CUSTOMER_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=TKQR Admin

# Optional: Logging (development only)
NEXT_PUBLIC_USE_LOGGING=false
```

**File tham khảo**: [source/apps/web-tenant/.env.example](source/apps/web-tenant/.env.example)

```bash
cd ../..
```

#### 3c. Web Customer (.env.local)

```bash
cd source/apps/web-customer

# Copy template
cp .env.example .env.local

# Edit .env.local và điền:
```

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME=TKQR Order

# Optional: Logging (development only)
NEXT_PUBLIC_USE_LOGGING=false
```

**File tham khảo**: [source/apps/web-customer/.env.example](source/apps/web-customer/.env.example)

```bash
cd ../..
```

### Bước 4: Khởi động Infrastructure (PostgreSQL & Redis)

```bash
cd source/docker

# Khởi động containers
docker compose up -d

# Kiểm tra status
docker compose ps

# Expected output: PostgreSQL + Redis running
# Logs: docker compose logs -f postgres redis
```

**Services khởi động**:
- **PostgreSQL**: `localhost:5432` (user: `postgres`, password: `tkob_bathangkho123`)
- **Redis**: `localhost:6379`

```bash
cd ../..  # Quay về root
```

### Bước 5: Setup Database

```bash
cd source/apps/api

# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm db:migrate

# Optional: Seed database (nếu không có, migration sẽ tạo schema cơ bản)
# (Hiện tại repo không cung cấp seed script mẫu)

cd ../..
```

**Kiểm tra**:
```bash
# Mở Prisma Studio (giao diện quản lý database)
cd source/apps/api
pnpm db:studio
# Mở browser: http://localhost:5555
cd ../..
```

### Bước 6: Khởi động ứng dụng

Mở **3 terminal riêng** từ thư mục root và chạy các lệnh dưới đây:

#### Terminal 1: API Server

```bash
pnpm dev
# Hoặc chỉ API:
# cd source/apps/api && pnpm start:dev
```

**Output mong đợi**:
```
🚀 Application is running on port 3000
📚 API Documentation: http://localhost:3000/api-docs
```

**Kiểm tra health**:
```bash
curl http://localhost:3000/health
# Expected response: { "status": "ok" }
```

#### Terminal 2: Web Customer App

```bash
pnpm dev:web-customer
```

**Output mong đợi**:
```
▲ Next.js 15.x
- Local: http://localhost:3001
```

#### Terminal 3: Web Tenant (Admin) App

```bash
pnpm dev:web-tenant
```

**Output mong đợi**:
```
▲ Next.js 15.x
- Local: http://localhost:3002
```

### Bước 7: Xác minh tất cả thành phần

Mở browser và kiểm tra:

| Ứng dụng | URL | Mô tả |
|---------|-----|-------|
| **API Health** | http://localhost:3000/health | Health check |
| **Swagger Docs** | http://localhost:3000/api-docs | REST API documentation |
| **Customer App** | http://localhost:3001 | Ứng dụng gọi món khách hàng |
| **Tenant Dashboard** | http://localhost:3002 | Bảng điều khiển admin/staff |

**Test flow đơn giản**:
1. Truy cập http://localhost:3002 (Tenant app)
   - Đăng ký tài khoản chủ nhà hàng
   - Tạo menu & bàn
   - Tạo QR code cho bàn
2. Truy cập http://localhost:3001 (Customer app)
   - Quét QR code (hoặc copy URL từ QR)
   - Xem menu & thêm vào giỏ
   - Checkout

---

## Hướng dẫn sử dụng môi trường đã deploy

### Truy cập ứng dụng

Khi hệ thống được deploy lên production, bạn có thể truy cập các URL sau:

| Ứng dụng | URL | Mô tả |
|---------|-----|-------|
| **Customer App** | `https://tkob-qr-order-system-web-customer.vercel.app` | Ứng dụng gọi món khách hàng |
| **Tenant/Admin App** | `https://tkob-qrorder-system.vercel.app` | Dashboard quản lý nhà hàng |
| **API Base URL** | `https://tkob.nphoang.me/` | REST API |
| **API Swagger Docs** | `https://tkob.nphoang.me/api-docs` | Tài liệu API |

**Ghi chú**: Thay `example.com` bằng tên miền thực tế của bạn.

### Happy Path: Tạo đơn hàng và thanh toán

#### 1. Chủ nhà hàng (Admin) – Chuẩn bị

1. Truy cập **Tenant Dashboard**: `https://tkob-qrorder-system.vercel.app`
2. **Đăng ký / Đăng nhập** với email hoặc Google
3. **Thiết lập menu**:
   - Vào phần "Menu"
   - Tạo danh mục (Phở, Bánh mì, Đồ uống, v.v.)
   - Thêm mục vào mỗi danh mục với giá
4. **Tạo bàn**:
   - Vào phần "Tables" → "Create"
   - Tạo bàn (ví dụ: T01, T02, T03)
   - Tạo / tạo lại QR code → Tải xuống (PNG/SVG/PDF/ZIP)
5. **In QR codes** hoặc dán trên bàn

#### 2. Khách hàng (Customer) – Đặt hàng

1. Quét **QR code** tại bàn (hoặc nhập URL thủ công)
2. Truy cập **Customer App**: `https://tkob-qr-order-system-web-customer.vercel.app/t/{qrToken}`
3. **Duyệt menu** theo danh mục
4. **Thêm mục vào giỏ**:
   - Chọn số lượng
   - Chọn modifier (nếu có: size, topping, v.v.)
5. **Xem giỏ** → **Checkout**
6. **Thanh toán**:
   - Quét **QR code SePay** với app ngân hàng hỗ trợ
   - Hoặc nhập số tiền thủ công (tùy setup)
7. **Chờ** – Đơn hàng được gửi đến bếp

#### 3. Nhân viên / Bếp (Staff/Kitchen)

1. Truy cập **KDS (Kitchen Display System)**: `https://tkob-qrorder-system.vercel.app/kds`
2. **Xem danh sách đơn hàng** → Sắp xếp theo ưu tiên
3. **Cập nhật trạng thái**:
   - "Preparing" → "Ready" → "Completed"
4. **Thông báo real-time** được gửi tới khách hàng

#### 4. Khách hàng – Theo dõi

Khách hàng nhìn thấy **cập nhật trạng thái real-time** trên app và nhận **thông báo**:
- Đơn hàng đã nhận
- Đang chuẩn bị
- Sẵn sàng phục vụ

### Demo Accounts (nếu có)

**Lưu ý**: Nếu production có seed demo accounts, liệt kê dưới đây:

| Vai trò | Email | Mật khẩu | Ghi chú |
|--------|-------|---------|--------|
| Admin/Owner | `owner@example.com` | `DemoPass123!` | Nhà hàng mẫu |
| Staff | `staff@example.com` | `DemoPass123!` | Phục vụ viên mẫu |
| Kitchen | `kitchen@example.com` | `DemoPass123!` | Bếp mẫu |

**Hoặc**: Nếu không có demo accounts, tạo tài khoản mới tại `https://tkob-qrorder-system.vercel.app/auth/signup`

### Quyền truy cập (Roles)

| Vai trò | Quyền hạn |
|--------|----------|
| **Admin/Owner** | Quản lý tất cả (menu, bàn, nhân viên, thanh toán, analytics) |
| **Staff** | Quản lý bàn, xem đơn hàng, phục vụ |
| **Kitchen** | Xem đơn hàng KDS, cập nhật trạng thái |
| **Customer** | Đặt hàng qua QR, thanh toán, xem trạng thái |

### Google OAuth (nếu được config)

Nếu deployed config hỗ trợ **Google Login**:
1. Chủ nhà hàng có thể **đăng nhập qua Google**
2. Cần email Google hợp lệ
3. (Secrets được lưu trữ an toàn trên server, không hiển thị)

### Thanh toán (SePay QR)

- Khách hàng quét **QR code** với ứng dụng ngân hàng
- Hỗ trợ các ngân hàng Việt Nam qua **VietQR**
- Thanh toán được xác nhận **tự động** hoặc qua **webhook**

---

## Khắc phục sự cố

### Port bị chiếm

**Vấn đề**: "Port 3000/3001/3002 already in use"

**Giải pháp**:

```bash
# Tìm process đang dùng port
lsof -i :3000        # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Giết process
kill -9 <PID>        # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Hoặc chạy trên port khác
cd source/apps/api && PORT=3005 pnpm start:dev
```

### Database không ready

**Vấn đề**: "ConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:5432"

**Giải pháp**:

```bash
# Kiểm tra Docker containers
docker compose ps

# Nếu PostgreSQL không running
cd source/docker
docker compose up -d postgres
docker compose logs postgres

# Chờ 10-15 giây để PostgreSQL sẵn sàng
# Check health
docker compose exec postgres pg_isready
```

### Redis không ready

**Vấn đề**: "Error: connect ECONNREFUSED 127.0.0.1:6379"

**Giải pháp**:

```bash
cd source/docker

# Khởi động Redis
docker compose up -d redis
docker compose logs redis

# Test kết nối
docker compose exec redis redis-cli ping
# Expected: PONG
```

### Migration thất bại

**Vấn đề**: "Migration pending" hoặc "Schema not up to date"

**Giải pháp**:

```bash
cd source/apps/api

# Xem migrations
pnpm prisma:generate
pnpm db:migrate

# Nếu vẫn lỗi, reset database (mất dữ liệu!)
pnpm db:reset
```

### Biến environment bị thiếu

**Vấn đề**: "Error: JWT_SECRET is not defined"

**Giải pháp**:

1. Kiểm tra file `.env` tồn tại
2. Điền tất cả biến bắt buộc (xem [Bước 3](#bước-3-cấu-hình-environment-variables))
3. Khởi động lại ứng dụng

### OAuth redirect URI không khớp

**Vấn đề**: "Redirect URI mismatch" khi đăng nhập qua Google

**Giải pháp**:

1. Vào Google Cloud Console: https://console.cloud.google.com
2. Chọn dự án
3. Vào "Credentials" → "OAuth 2.0 Client IDs"
4. Thêm redirect URI:
   - Localhost: `http://localhost:3002/auth/google/callback`
   - Production: `https://tkob-qrorder-system.vercel.app/auth/google/callback`
5. Lưu và khởi động lại

### WebSocket không kết nối

**Vấn đề**: "Real-time updates không hoạt động"

**Giải pháp**:

1. Kiểm tra API chạy trên cùng host/port (3000)
2. Kiểm tra CORS config:
   ```bash
   # In source/apps/api/src/main.ts
   # CORS_ORIGINS phải bao gồm frontend URL
   ```
3. Kiểm tra browser console (F12 → Network → WS)

### Lỗi TypeScript / Build

**Vấn đề**: "Type error" hoặc build fail

**Giải pháp**:

```bash
# Type check
pnpm type-check

# Rebuild all
pnpm clean
pnpm install
pnpm build

# Hoặc từng app
cd source/apps/api && pnpm build
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

Repo sử dụng **GitHub Actions** để tự động test, build, và deploy.

**Workflow File**: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

### Khi nào chạy?

| Trigger | Chi tiết |
|---------|---------|
| **Push to `main`** | Chạy test → build Docker image → deploy |
| **Pull Request** | Chạy test → linting |
| **Manual** | Có thể trigger từ GitHub Actions tab |

### Các bước trong Pipeline

1. **Test (CI)**: Chạy `pnpm test` trên API
   - Prisma migration check
   - Unit tests (nếu có)

2. **Build (CD)**: Build Docker image
   - Tag: `latest`, `sha-{commit}`, `pr-{number}`
   - Push to GitHub Container Registry

3. **Deploy (CD)**: Deploy lên AWS EC2
   - Copy `docker-compose.prod.yml`
   - Pull image mới
   - Restart services (zero-downtime)
   - Cleanup old images

### Xem Workflow Status

Vào: https://github.com/{owner}/{repo}/actions

---

## Cấu trúc dự án

# Linting & Type Check
pnpm lint
pnpm type-check
```

---

## Tính năng chính (Chi tiết)

### 👥 Khách hàng (Customer)
- Quét QR tại bàn → thiết lập phiên
- Duyệt menu theo danh mục, tìm kiếm
- Thêm mục với modifier (SINGLE/MULTI choice)
- Giỏ hàng + thanh toán qua SePay QR
- Theo dõi trạng thái đơn hàng theo thời gian thực
- Hủy đơn hàng (cửa sổ 5 phút)
- Đánh giá & xếp hạng

### 🏪 Chủ nhà hàng / Admin
- **Hồ sơ & Cài đặt**: Thông tin nhà hàng, logo, email
- **Menu**: Tạo danh mục → mục → modifier (ảnh tải hàng loạt)
- **Bàn & QR**: CRUD, tạo/tạo lại QR (PNG/SVG/PDF/ZIP)
- **Nhân viên**: Lời mời email, gán vai trò (STAFF/KITCHEN), giới hạn theo gói
- **Đơn hàng**: Xem chi tiết, lịch sử, thêm mục
- **Thanh toán**: Cấu hình khóa SePay, xem webhook log
- **Khuyến mãi**: Tạo mã giảm giá (PERCENTAGE/FIXED)
- **Hóa đơn**: Tạo từ đơn hàng, xuất PDF
- **Analytics**: Doanh thu, mục phổ biến, phân bố theo giờ, hiệu suất bàn
- **Đăng ký**: FREE/BASIC/PREMIUM, theo dõi sử dụng, nâng cấp qua SePay

### 👨‍💼 Nhân viên (Staff)
- Xem bàn, trạng thái phiên
- Xem đơn hàng, phục vụ khách hàng
- Ghi chú, chuyển yêu cầu bếp

### 👨‍🍳 Bếp (KDS – Kitchen Display System)
- Xem danh sách đơn hàng theo ưu tiên (Thường/Cao/Khẩn cấp)
- Cập nhật trạng thái: Chuẩn bị → Hoàn thành → Phục vụ
- Thống kê thực tế
- WebSocket cập nhật ngay lập tức

---

## 📚 Tài liệu

**Tài liệu chính:**
- [Setup Guide](docs/common/SETUP.md) – Cài đặt env, database migration, troubleshooting
- [Architecture](docs/common/ARCHITECTURE.md) – Kiến trúc toàn hệ thống, tech stack, security
- [User Guide](docs/common/USER_GUIDE.md) – Hướng dẫn cho từng vai trò (customer, admin, staff, kitchen)
- [OpenAPI Spec](docs/common/OPENAPI.md) – Tài liệu REST API (~140+ operations)
- [Contributing Guide](docs/common/CONTRIBUTING.md) – Quy trình đóng góp, code standards

**Tài liệu Frontend:**
- [Web Tenant README](docs/frontend/web-tenant/README.md) – Architecture, features, setup
- [Web Customer README](docs/frontend/web-customer/README.md) – Architecture, features, setup
- [RBAC Guide](docs/frontend/RBAC_GUIDE.md) – Role-based access control patterns

**Tài liệu Backend:**
- [Backend README](docs/backend/README.md)
- [Database Schema](docs/backend/database/description.md) – Tất cả bảng, trường, quan hệ
- [ER Diagram](docs/backend/database/er_diagram.md)
- [WebSocket Guide](docs/backend/websocket-client.md)

---

## Trạng thái dự án

### ✅ Đã triển khai (MVP)

| Module | Trạng thái |
|--------|-----------|
| Xác thực (JWT + OTP) | ✅ |
| Google OAuth (Owner/Staff) | ✅ |
| Multi-tenant | ✅ |
| Quản lý menu & danh mục | ✅ |
| Bàn & QR Code (tạo/tạo lại/tải xuống) | ✅ |
| Giỏ hàng & checkout | ✅ |
| Đơn hàng (tạo, hủy, theo dõi) | ✅ |
| Yêu cầu hóa đơn + thông báo staff | ✅ |
| Thanh toán (SePay QR) | ✅ |
| WebSocket (real-time updates) | ✅ |
| KDS (Kitchen Display System) | ✅ |
| Quản lý nhân viên + RBAC | ✅ |
| Đăng ký (gói FREE/BASIC/PREMIUM) | ✅ |
| Analytics & Reports | ✅ |
| Đánh giá & Xếp hạng | ✅ |
| Khuyến mãi & Mã giảm giá | ✅ |
| Hóa đơn | ✅ |
| CI/CD Pipeline (GitHub Actions) | ⚠️ Không hoàn chỉnh* |

*Xem [CI_CD.md](docs/common/CI_CD.md) cho chi tiết. Blocker: `docker-compose.prod.yml` bị thiếu.

### 📋 Dự định (Planned)

- Thanh toán thẻ (Card online) – Dự tính Q2 2026
- Tích hợp Facebook Orders
- Mobile app (React Native) – Tối ưu hóa mobile
- Advanced analytics (Predictive)
- Loyalty program

---

## 🛠️ Phát triển

### Folder Structure

```
TKOB_QROrderSystem/
├── docs/
│   ├── common/             # Shared documentation
│   ├── backend/            # Backend-specific docs
│   └── frontend/           # Frontend-specific docs
├── source/
│   ├── apps/
│   │   ├── api/            # NestJS backend
│   │   ├── web-customer/   # Customer app (Next.js)
│   │   └── web-tenant/     # Tenant dashboard (Next.js)
│   ├── packages/           # Shared packages
│   │   └── ui/             # Shared UI components
│   └── docker/             # docker-compose.yaml
├── packages/
│   └── ui/                 # Root UI package (aliases)
├── package.json            # Root workspace
├── pnpm-workspace.yaml     # Workspace config
└── README.md               # This file
```

### Cấu trúc Code (Clean Architecture)

Cả frontend lẫn backend tuân theo **Clean Architecture**:

**Frontend** (`web-customer`, `web-tenant`):
- `app/` – Presentation Layer (routing)
- `src/features/` – Domain Layer (business logic)
- `src/shared/` – Shared Layer (reusable UI, hooks)
- `src/lib/` – Infrastructure Layer (API client)

**Backend** (`api`):
- `src/modules/` – Feature modules (auth, menu, orders, etc.)
- `src/common/` – Shared utilities, decorators, guards
- `src/database/` – Prisma schema, migrations
- `src/main.ts` – App bootstrap

---

## 🔒 Bảo mật

- **Authentication**: JWT bearer tokens + refresh token rotation
- **Authorization**: Role-based access control (OWNER, STAFF, KITCHEN)
- **Multi-tenancy**: Tenant isolation via `tenantId` (application-level)
- **Payment**: Webhook validation + polling fallback
- **Database**: Audit logs cho thay đổi quan trọng

---

## 📞 Hỗ trợ & Đóng góp

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Contributing**: Xem [CONTRIBUTING.md](docs/common/CONTRIBUTING.md)

---

## 📄 Giấy phép

MIT License © 2025 TonKnight – Xem [LICENSE](LICENSE)

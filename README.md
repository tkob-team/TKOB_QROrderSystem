# TKOB_QROrderSystem – TKQR-in Ordering Platform

> Hệ thống đặt hàng qua mã QR cho nhà hàng (QR-based restaurant ordering system) – đa tenant, thời gian thực, với tích hợp thanh toán.

![Monorepo](https://img.shields.io/badge/Monorepo-pnpm-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![License](https://img.shields.io/badge/License-MIT-blue)

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

| Ứng dụng | Loại | Vị trí | Mô tả | Port |
|---------|------|--------|-------|------|
| **API** | NestJS | `source/apps/api` | Backend REST API (~140+ endpoints) | 3000 |
| **Web Tenant** | Next.js 15 | `source/apps/web-tenant` | Dashboard admin/staff/kitchen | 3002 |
| **Web Customer** | Next.js 15 | `source/apps/web-customer` | Ứng dụng gọi món khách hàng | 3001 |
| **UI Package** | Shared | `packages/ui` | Shared UI components (TailwindCSS) | — |

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

### 📊 Dữ liệu

- **PostgreSQL** (Docker Compose)
- **Redis** (cache & session)
- **MinIO** (S3 mock cho upload ảnh menu – optional)

---

## Quick Start (Local)

### Yêu cầu

- **Node.js**: ≥20.0.0 (khuyến nghị 20 LTS, matched with CI/CD)
- **pnpm**: ≥8.0.0 (CI sử dụng v4 action, works with pnpm v8+)
- **Docker**: ≥24.x với Docker Compose
- **Git**: ≥2.30

### Khởi động trong 5 phút

```bash
# 1. Clone
git clone <repo-url>
cd TKOB_QROrderSystem

# 2. Cài dependencies
pnpm install

# 3. Khởi động Docker services (PostgreSQL, Redis)
cd source/docker
docker compose up -d
cd ../..

# 4. Setup database
cd source/apps/api
cp .env.example .env          # Chỉnh sửa nếu cần
pnpm db:generate
pnpm db:migrate
cd ../../..

# 5. Khởi động 3 ứng dụng (mở 3 terminal riêng từ repo root)
# Terminal 1: API (port 3000)
pnpm dev:api

# Terminal 2: Customer (port 3001)
pnpm dev:web-customer

# Terminal 3: Tenant Dashboard (port 3002)
pnpm dev:web-tenant

# 6. Kiểm tra
# API: http://localhost:3000/health
# API Docs: http://localhost:3000/api-docs
# Customer: http://localhost:3001
# Tenant: http://localhost:3002
```

**Lưu ý:** Thay `dev:api` bằng lệnh thực tế nếu script không tồn tại. Xem `package.json` để confirm.

### Script chính

```bash
# Development
pnpm dev              # Chạy tất cả (parallel)
pnpm dev:web-customer
pnpm dev:web-tenant

# Building
pnpm build
pnpm build:web-customer
pnpm build:web-tenant

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

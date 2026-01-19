# 20 - Deployment

Created: January 16, 2026 10:05 PM

# Thông tin Deployment

## 1. **Thông Tin Tổng Quan Hệ Thống**

### Tech Stack

- **Runtime**: Node.js (NestJS Framework)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Cache/Session**: Redis
- **WebSocket**: [Socket.IO](http://socket.io/)
- **Authentication**: JWT (Access + Refresh tokens)

### Kiến Trúc Ứng Dụng

- **Pattern**: Multi-tenant SaaS
- **Module Structure**:
    - Auth & User Management
    - Tenant Management (Restaurant owners)
    - Menu Management (Categories, Items, Modifiers)
    - Table Management (QR code generation)
    - Order Management (Cart, Checkout, KDS)
    - Payment Integration (SePay VietQR)
    - Analytics & Reporting
    - Staff Management
    - Reviews
    - Subscriptions (Freemium model)
    - Promotions
    - Real-time Updates (WebSocket)

---

## 2. **Environment Variables Cần Thiết**

### Core Configuration

```bash
NODE_ENV=production
API_PORT=3000
```

### Database

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### JWT Authentication

```bash
JWT_SECRET=<secure-random-string-min-32-chars>
JWT_ACCESS_TOKEN_EXPIRES_IN=1h
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
```

### Redis Configuration

```bash
# Option 1: Full URL (recommended for managed services)
REDIS_URL=redis://default:password@host:6379

# Option 2: Individual variables
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Email Service

```bash
# Option A: SendGrid (recommended for production)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=<your-sendgrid-api-key>
EMAIL_FROM=noreply@yourdomain.com

# Option B: SMTP (Gmail/Outlook)
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=<app-specific-password>
EMAIL_FROM=your-email@gmail.com
```

### OTP Configuration

```bash
OTP_LENGTH=6
OTP_EXPIRY_SECONDS=300
REGISTRATION_DATA_EXPIRY_SECONDS=1800
```

### Customer App URL

```bash
CUSTOMER_APP_URL=https://customer.yourdomain.com
TENANT_APP_URL=https://admin.yourdomain.com
```

### Storage Configuration (AWS S3)

```bash
STORAGE_DRIVER=s3
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET_NAME=qr-ordering-assets
AWS_S3_BUCKET_URL=https://qr-ordering-assets.s3.amazonaws.com
AWS_CLOUDFRONT_URL=https://cdn.yourdomain.com
MAX_FILE_SIZE=5242880
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp
```

### Payment Configuration (SePay VietQR)

```bash
SEPAY_API_URL=https://my.sepay.vn/userapi
SEPAY_SECRET_KEY=<your-sepay-api-token>
SEPAY_ACCOUNT_NUMBER=<your-bank-account>
SEPAY_ACCOUNT_NAME=<account-holder-name>
SEPAY_BANK_CODE=VCB
SEPAY_WEBHOOK_SECRET=<optional-webhook-secret>
PAYMENT_EXPIRY_MINUTES=15
PAYMENT_RETRY_ATTEMPTS=3
PAYMENT_RETRY_DELAY=1000
```

### Optional: Unsplash (Demo data photos)

```bash
UNSPLASH_ACCESS_KEY=<your-unsplash-key>
```

---

## 3. **Build & Start Commands**

### Package Manager

- **Preferred**: `pnpm` (fastest, efficient)
- **Alternative**: `npm` or `yarn`

### Scripts

```json
{
  "prebuild": "pnpm prisma:generate",
  "build": "nest build",
  "start": "node dist/src/main.js",
  "start:prod": "node dist/src/main",
  "prisma:generate": "prisma generate --config=./prisma/prisma.config.ts",
  "prisma:migrate:deploy": "prisma migrate deploy --config=./prisma/prisma.config.ts"
}
```

### Build Process

```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Generate Prisma Client
pnpm prisma:generate

# 3. Run migrations
pnpm prisma:migrate:deploy

# 4. Build application
pnpm build

# 5. Start production server
pnpm start:prod
```

---

## 4. **Dependencies & System Requirements**

### Node.js Version

- **Required**: Node.js >= 18.x (LTS recommended)

### Critical Dependencies

```json
{
  "@nestjs/core": "^11.0.1",
  "@nestjs/platform-express": "^11.0.1",
  "@nestjs/websockets": "^11.0.1",
  "@nestjs/jwt": "^11.0.0",
  "@prisma/client": "^6.2.1",
  "ioredis": "^5.4.2",
  "socket.io": "^4.8.1",
  "bcrypt": "^6.0.0",
  "axios": "^1.8.2",
  "pdfkit": "^0.17.4"
}
```

### Dev Dependencies (required for build)

```json
{
  "@nestjs/cli": "^11.0.0",
  "prisma": "^6.2.1",
  "typescript": "^5.7.2"
}
```

---

## 5. **Infrastructure Requirements**

### Compute Resources

- **API Server**:
    - Memory: 512MB minimum, 1GB recommended
    - CPU: 1 vCPU minimum
    - Disk: 10GB (for logs, uploads if local storage)

### Database (PostgreSQL)

- **Version**: PostgreSQL 14+
- **Storage**: 10GB minimum
- **Connection Pool**: Configure in DATABASE_URL
    - Example: `?connection_limit=10&pool_timeout=20`

### Cache (Redis)

- **Version**: Redis 6+
- **Memory**: 256MB minimum, 512MB recommended
- **Persistence**: Optional (AOF or RDB)
- **Use Cases**:
    - Session storage
    - OTP verification
    - Registration flow data
    - Rate limiting

### Storage Options (AWS S3)

- **Service**: AWS S3 + CloudFront CDN
- **Region**: Same as API server (reduce latency)
- **Bucket Policy**: Public read, private write
- **Use Cases**: Menu item photos, tenant logos

---

## 6. **Network & Security**

### Ports

- **API**: `3000` (configurable via `API_PORT`)
- **Health Check**: `/health` (port 3000)

### CORS Configuration

```tsx
{
  origin: [
    process.env.CUSTOMER_APP_URL,  // Customer-facing app
    process.env.TENANT_APP_URL     // Admin dashboard
  ],
  credentials: true
}
```

### WebSocket Namespaces

- `/orders` - Real-time order updates
    - Rooms: `tenant:{tenantId}:staff`, `tenant:{tenantId}:customer:{tableId}`

### Security Headers

- Helmet.js enabled
- Rate limiting via Redis
- JWT validation on protected routes

---

## 7. **Health Checks & Monitoring**

### Endpoints

- **Basic**: `GET /health` → `{ "status": "ok" }`
- **Detailed**: `GET /health/detailed` → Database, Redis status
- **Ready**: `GET /health/ready` → Pod readiness

### Logging

- **Level**:
    - Development: `['log', 'error', 'warn', 'debug', 'verbose']`
    - Production: `['log', 'error', 'warn']`
- **Format**: JSON (via pino logger)

### Metrics to Monitor

- API response time
- Database connection pool
- Redis connection status
- WebSocket connections count
- Order processing rate
- Payment success rate

---

## 8. **Database Migrations**

### Prisma Schema Location

```
prisma/schema.prisma
prisma/migrations/
```

### Migration Strategy

```bash
# Auto-run on deployment
pnpm prisma:migrate:deploy
```

### Seed Data

```bash
# Subscription plans (auto-seeded on startup)
# Demo data per tenant (triggered on registration)
```

---

## 09. **CI/CD Pipeline Suggestions**

### GitHub Actions Workflow

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 18
      - Install pnpm
      - Install dependencies
      - Run tests
      - Build application
      - Deploy to Render/AWS
```

---

# Chiến lược deploy

## 1. Kiến trúc Đích (Target Architecture)

Mục tiêu: **High Availability** (ở mức chấp nhận được), **Security**, và **Automation**.

```mermaid
graph TD
    User[User Internet]

    subgraph AWS_Cloud
        subgraph CDN_Layer
            CF_Cust[CloudFront Web Customer]
            CF_Ten[CloudFront Web Tenant]
        end

        subgraph Storage_Layer
            S3_Cust[S3 Customer App Static Files]
            S3_Ten[S3 Tenant App Static Files]
            S3_Media[S3 User Uploads Images]
        end

        subgraph Compute_Layer_EC2
            LB[Nginx Reverse Proxy Load Balancer]
            API[NestJS API Container]
            Redis[Redis Container]
            Socket[Socket IO Handling]
        end

        subgraph Database_Layer
            RDS[(RDS PostgreSQL)]
        end
    end

    User -->|HTTPS| CF_Cust
    User -->|HTTPS| CF_Ten
    User -->|API WebSocket| LB

    CF_Cust --> S3_Cust
    CF_Ten --> S3_Ten

    LB --> API
    API --> Redis
    API --> Socket
    API --> RDS
    API --> S3_Media

```

---

## 2. Chiến lược DevOps cho Monorepo

Thách thức lớn nhất của Monorepo khi deploy là: **Làm sao để Docker chỉ đóng gói những gì `apps/api` cần mà không kéo theo cả `apps/web` hay các thư viện thừa?**

### Bước 1: Containerization (Docker hóa) chuẩn Monorepo

Bạn không thể chỉ viết Dockerfile đơn giản như repo thường. Bạn cần áp dụng **Multi-stage Build** và cơ chế **Pruning** (nếu dùng Turborepo) để tối ưu image.

**Tư duy First Principles:** Docker Image cần nhỏ nhất có thể (để pull nhanh, ít lỗ hổng bảo mật).

- **Base Image:** Dùng `node:20-alpine`.
- **Build Context:** Phải set ở thư mục gốc (`source/`), không phải `source/apps/api`, vì `api` có thể phụ thuộc vào `packages/ui` hoặc `packages/database`.

**Chiến lược Dockerfile (gợi ý):**

1. **Prune Stage:** Dùng `turbo prune --scope=api --docker` để trích xuất một bản copy tối thiểu của monorepo chỉ chứa code của api và các internal packages nó phụ thuộc.
2. **Install Stage:** Cài dependencies từ bản pruned đó.
3. **Build Stage:** Build source code.
4. **Runner Stage:** Chỉ copy thư mục `dist` và `node_modules` cần thiết để chạy.

### Bước 2: Infrastructure as Code (IaC) - Học Terraform

Thay vì click chuột trên AWS Console (ClickOps), bạn hãy dùng **Terraform**. Đây là kỹ năng "must-have" của DevOps.

- **Tại sao?** Nó biến hạ tầng thành code (version control được). Nếu bạn lỡ tay xóa EC2, chỉ cần chạy `terraform apply` là mọi thứ phục hồi.
- **Bài tập cho bạn:**
    1. Viết file Terraform để tạo **VPC** (Mạng ảo).
    2. Tạo **Security Group** (Firewall): Chỉ mở port 80/443 và 22 (SSH từ IP của bạn).
    3. Provision **EC2** instance.
    4. Provision **RDS** Postgres.

### Bước 3: CI/CD Pipeline (GitHub Actions)

Tự động hóa quy trình từ lúc commit code đến lúc server chạy code mới.

- **Workflow 1: CI (Continuous Integration)**
    - Trigger: Pull Request.
    - Job: Lint, Test, Typecheck.
    - *Lưu ý:* Sử dụng tính năng "Affected" của Monorepo tool (Nx/Turbo) để chỉ chạy test cho app nào bị thay đổi code.
- **Workflow 2: CD (Continuous Deployment)**
    - Trigger: Push to `main`.
    - **Job Build & Push:**
        - Login AWS ECR (Elastic Container Registry).
        - Build Docker Image cho `apps/api`.
        - Push Image lên ECR.
    - **Job Deploy Frontend:**
        - Build `apps/web-customer` và `apps/web-tenant`.
        - Sync thư mục `dist` lên S3 Buckets tương ứng.
        - Invalidate CloudFront cache (để user thấy code mới ngay).
    - **Job Deploy Backend:**
        - SSH vào EC2.
        - Pull image mới từ ECR.
        - `docker compose up -d`.

---

## 3. Chi tiết Dịch vụ AWS & Tối ưu chi phí ($100)

Với $100, bạn cần "tiêu tiền thông minh":

1. **Backend (API + Redis + Socket.IO):**
    - **Service:** **EC2 (t3.small)**.
    - **Chiến thuật:** Chạy Docker Compose trên EC2 này. Bao gồm 1 container cho NestJS API và 1 container cho Redis.
    - *Tại sao không dùng Elasticache (Managed Redis)?* Quá đắt (~$15/tháng cho t2.micro). Chạy Redis trong Docker trên EC2 là miễn phí (tận dụng RAM của EC2).
    - *Socket.IO:* Chạy chung trong container API. Cấu hình Nginx trên EC2 để handle WebSocket upgrade headers.
2. **Database:**
    - **Service:** **RDS (PostgreSQL)**.
    - **Chiến thuật:** Dùng `db.t3.micro`.
    - *Lưu ý:* Đặt RDS trong **Private Subnet** (mạng nội bộ), chỉ cho phép EC2 kết nối tới. Tuyệt đối không để `Publicly Accessible = Yes`.
3. **Frontend (Web Apps):**
    - **Service:** **S3 + CloudFront**.
    - **Chiến thuật:**
        - Tạo 2 S3 Buckets: 1 cho Customer, 1 cho Tenant.
        - Tạo 2 CloudFront Distributions trỏ vào 2 buckets đó.
    - *SPA Routing:* Cấu hình CloudFront Error Pages để khi user F5 ở trang con (`/menu/123`), nó redirect về `index.html` (để React Router xử lý) thay vì báo lỗi 404.
4. **Media/Image Storage:**
    - **Service:** **S3**.
    - **Chiến thuật:** Upload ảnh món ăn/QR code vào đây. Dùng chung CloudFront của Frontend hoặc tạo CloudFront riêng để cache ảnh.

---
# Hướng dẫn Đóng góp (Contributing Guide)

> Cảm ơn bạn đã quan tâm đến việc đóng góp cho **TKQR-in Ordering Platform**! Tài liệu này sẽ giúp bạn hiểu quy trình và tiêu chuẩn để tham gia phát triển dự án.

- **Version**: 1.0
- **Last Updated**: 2025-01-11

---

## Mục lục

1. [Quy tắc Ứng xử](#1-quy-tắc-ứng-xử)
2. [Bắt đầu như thế nào](#2-bắt-đầu-như-thế-nào)
3. [Thiết lập Môi trường Phát triển](#3-thiết-lập-môi-trường-phát-triển)
4. [Quy trình Đóng góp](#4-quy-trình-đóng-góp)
5. [Tiêu chuẩn Code](#5-tiêu-chuẩn-code)
6. [Commit Messages](#6-commit-messages)
7. [Hướng dẫn Pull Request](#7-hướng-dẫn-pull-request)
8. [Yêu cầu Kiểm thử](#8-yêu-cầu-kiểm-thử)
9. [Tài liệu Hóa](#9-tài-liệu-hóa)
10. [Báo cáo Lỗi](#10-báo-cáo-lỗi)
11. [Đề xuất Tính năng](#11-đề-xuất-tính-năng)
12. [Liên hệ & Hỗ trợ](#12-liên-hệ--hỗ-trợ)

---

## 1. Quy tắc Ứng xử

### 1.1. Cam kết của chúng tôi

Chúng tôi cam kết tạo ra một môi trường cởi mở và thân thiện cho tất cả mọi người, bất kể:
- Kinh nghiệm lập trình
- Giới tính, định hướng giới tính
- Khuyết tật
- Dân tộc, quốc tịch
- Tôn giáo

### 1.2. Hành vi được khuyến khích

- Sử dụng ngôn ngữ thân thiện và bao dung
- Tôn trọng quan điểm và kinh nghiệm khác nhau
- Chấp nhận phản hồi xây dựng một cách khiêm tốn
- Tập trung vào những gì tốt nhất cho cộng đồng
- Thể hiện sự đồng cảm với các thành viên khác

### 1.3. Hành vi không được chấp nhận

- Ngôn ngữ hoặc hình ảnh khiêu dâm
- Troll, bình luận xúc phạm/hạ thấp
- Quấy rối công khai hoặc riêng tư
- Công bố thông tin cá nhân của người khác
- Hành vi không chuyên nghiệp khác

---

## 2. Bắt đầu như thế nào

### 2.1. Các cách đóng góp

Bạn có thể đóng góp theo nhiều cách:

#### 🐛 Báo cáo Bug
- Kiểm tra [Issues](../../../issues) xem bug đã được báo cáo chưa
- Tạo issue mới với template [Bug Report]
- Cung cấp thông tin chi tiết: các bước tái tạo, hành vi mong đợi so với hành vi thực tế

#### 💡 Đề xuất Feature
- Kiểm tra [Roadmap](./readme.md#18-lộ-trình--next-steps) và [Issues](../../../issues)
- Tạo issue với template [Feature Request]
- Giải thích use case và giá trị của tính năng

#### 📝 Cải thiện Documentation
- Fix typos, làm rõ nội dung
- Thêm examples, diagrams
- Dịch tài liệu (nếu có)

#### 🔧 Code Contributions
- Sửa bugs
- Implement features mới
- Cải thiện performance
- Refactoring

#### 🧪 Testing
- Viết unit tests
- Viết integration tests
- Manual testing và báo cáo

### 2.2. Issues Tốt cho Người Bắt đầu

Nếu bạn mới tham gia, hãy tìm issues với label:
- `good first issue` – Phù hợp cho người mới
- `help wanted` – Cần thêm người giúp đỡ
- `documentation` – Không cần code nhiều

---

## 3. Thiết lập Môi trường Phát triển

### 3.1. Prerequisites

Đảm bảo bạn đã cài đặt:

- **Node.js**: >= 20.x (khuyến nghị dùng [nvm](https://github.com/nvm-sh/nvm))
- **pnpm**: >= 8.x (`npm install -g pnpm`)
- **Docker**: >= 24.x (cho local database)
- **Git**: >= 2.30
- **VS Code**: (khuyến nghị) + extensions được đề xuất

### 3.2. Fork và Clone Repository

```bash
# 1. Fork repo trên GitHub (click nút Fork)

# 2. Clone fork của bạn
git clone https://github.com/YOUR_USERNAME/qr-dine-in-platform.git
cd qr-dine-in-platform

# 3. Thêm upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/qr-dine-in-platform.git

# 4. Verify remotes
git remote -v
```

### 3.3. Cài đặt Dependencies

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Chỉnh sửa .env với thông tin local của bạn
```

### 3.4. Chạy Database (Docker)

```bash
# Start PostgreSQL + Redis
docker-compose up -d

# Run migrations
pnpm db:migrate

# Seed sample data (optional)
pnpm db:seed
```

### 3.5. Chạy Development Server

```bash
# Terminal 1: Backend API
pnpm --filter @app/api dev

# Terminal 2: Customer Web App
pnpm --filter @app/web-customer dev

# Terminal 3: Staff Console
pnpm --filter @app/web-staff dev
```

### 3.6. Verify Setup

- Backend API: http://localhost:3000
- Customer App: http://localhost:5173
- Staff Console: http://localhost:5174
- API Docs: http://localhost:3000/api-docs

---

## 4. Quy trình Đóng góp

### 4.1. Git Workflow

Chúng tôi sử dụng **Git Flow** đơn giản hóa:

```
main (production)
  ↑
develop (integration)
  ↑
feature/xxx, fix/xxx, docs/xxx (your branches)
```

### 4.2. Branching Strategy

#### Quy tắc đặt tên branch:

```bash
# Feature mới
feature/epic-name/short-description
# Ví dụ: feature/menu-management/add-modifiers

# Bug fix
fix/issue-number-short-description
# Ví dụ: fix/123-qr-scan-error

# Documentation
docs/what-you-update
# Ví dụ: docs/api-openapi-spec

# Chore (config, deps, etc.)
chore/what-you-do
# Ví dụ: chore/update-dependencies
```

### 4.3. Quy trình Chi tiết

#### Bước 1: Tạo branch mới

```bash
# Đảm bảo develop là mới nhất
git checkout develop
git pull upstream develop

# Tạo branch mới
git checkout -b feature/menu-management/add-modifiers
```

#### Bước 2: Thực hiện thay đổi

```bash
# Code, test, commit
git add .
git commit -m "feat(menu): add modifier support for menu items"

# Thường xuyên pull từ upstream
git pull upstream develop
```

#### Bước 3: Push và tạo Pull Request

```bash
# Push lên fork của bạn
git push origin feature/menu-management/add-modifiers

# Tạo Pull Request trên GitHub
# Base: upstream/develop ← Head: your-fork/feature/xxx
```

#### Bước 4: Code Review

- Maintainers sẽ review code
- Trả lời comments, thực hiện changes nếu cần
- Push thêm commits vào cùng branch

#### Bước 5: Merge

- Sau khi approved, maintainer sẽ merge
- Branch sẽ được xóa tự động

---

## 5. Tiêu chuẩn Code

### 5.1. General Principles

- **DRY** (Don't Repeat Yourself)
- **SOLID** principles
- **KISS** (Keep It Simple, Stupid)
- **YAGNI** (You Aren't Gonna Need It)

### 5.2. Code Style

Chúng tôi sử dụng **ESLint** + **Prettier** để enforce code style.

#### Chạy linter:

```bash
# Check
pnpm lint

# Auto-fix
pnpm lint:fix

# Format
pnpm format
```

#### Pre-commit hooks:

- Husky + lint-staged tự động chạy trước mỗi commit
- Không được skip hooks (`--no-verify`) trừ khi thực sự cần thiết

### 5.3. TypeScript Guidelines

#### Typing:

```typescript
// ✅ DO: Explicit return types cho functions
export function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ❌ DON'T: Implicit any
function process(data) { // ❌ Parameter 'data' implicitly has 'any' type
  // ...
}
```

#### Interfaces vs Types:

```typescript
// ✅ Prefer interfaces cho object shapes
interface MenuItem {
  id: string;
  name: string;
  price: number;
}

// ✅ Use types cho unions, tuples
type OrderState = 'received' | 'preparing' | 'ready' | 'served';
```

### 5.4. Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `menu-item.service.ts` |
| Classes | PascalCase | `MenuItemService` |
| Interfaces | PascalCase | `IMenuItem` hoặc `MenuItem` |
| Functions | camelCase | `createMenuItem()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Variables | camelCase | `menuItems` |

### 5.5. File Structure

```typescript
// filepath: src/modules/menu/menu-item.service.ts

// 1. Imports: external → internal
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { MenuItem } from './entities';
import { CreateMenuItemDto } from './dto';

// 2. Class definition
@Injectable()
export class MenuItemService {
  // 3. Constructor
  constructor(
    private readonly repository: Repository<MenuItem>,
  ) {}

  // 4. Public methods
  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    // ...
  }

  // 5. Private methods
  private validatePrice(price: number): boolean {
    // ...
  }
}
```

### 5.6. Comments

```typescript
// ✅ DO: Comment WHY, not WHAT
// Apply 10% discount for orders above $50 per business rule BR-042
if (total > 50) {
  discount = total * 0.1;
}

// ❌ DON'T: Obvious comments
// Set total to zero
total = 0;
```

### 5.7. Error Handling

```typescript
// ✅ DO: Specific error types
try {
  await this.createOrder(dto);
} catch (error) {
  if (error instanceof MenuItemNotFoundError) {
    throw new BadRequestException('Invalid menu item');
  }
  if (error instanceof PaymentFailedError) {
    throw new PaymentRequiredException();
  }
  throw error; // Re-throw unknown errors
}

// ❌ DON'T: Silent catch
try {
  await this.doSomething();
} catch (error) {
  // ❌ Empty catch block
}
```

---

## 6. Commit Messages

### 6.1. Format

Chúng tôi tuân theo **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Ví dụ:

```
feat(menu): add modifier support for menu items

- Add Modifier entity and relations
- Implement CRUD operations
- Add validation for price delta
- Update OpenAPI spec

Closes #123
```

### 6.2. Types

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| `feat` | Tính năng mới | `feat(orders): add order cancellation` |
| `fix` | Bug fix | `fix(qr): resolve token expiration issue` |
| `docs` | Documentation | `docs(api): update OpenAPI spec` |
| `style` | Formatting, whitespace | `style: format with prettier` |
| `refactor` | Code refactoring | `refactor(menu): extract validation logic` |
| `perf` | Performance improvement | `perf(db): add index on tenantId` |
| `test` | Tests | `test(orders): add unit tests for state machine` |
| `chore` | Build, deps, config | `chore: update dependencies` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |

### 6.3. Scope

Scope là phần module/feature bị ảnh hưởng:

- `menu`, `orders`, `tenants`, `auth`, `payments`, `qr`, `analytics`
- `api`, `web-customer`, `web-staff`, `kds`
- `db`, `ui`, `docs`

### 6.4. Subject

- Sử dụng imperative mood ("add", không phải "added" hay "adds")
- Không viết hoa chữ cái đầu
- Không có dấu chấm cuối
- Tối đa 72 ký tự

### 6.5. Body (Optional)

- Giải thích **what** và **why**, không phải **how**
- Wrap at 72 characters
- Separate từ subject bằng blank line

### 6.6. Footer (Optional)

- Reference issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: ...`

---

## 7. Hướng dẫn Pull Request

### 7.1. Trước khi tạo PR

**Danh kiểm tra**:

- [ ] Code tuân theo [style guidelines](#5-tiêu-chuẩn-code)
- [ ] Đã chạy `pnpm lint` và sửa errors
- [ ] Đã chạy `pnpm format`
- [ ] Đã viết/update tests (coverage >= 80%)
- [ ] Tất cả tests pass (`pnpm test`)
- [ ] Đã update documentation nếu cần
- [ ] Commit messages tuân theo [convention](#6-commit-messages)
- [ ] Branch được rebase với `develop` mới nhất

### 7.2. PR Title

Giống format commit message:

```
feat(menu): add modifier support for menu items
```

### 7.3. PR Description Template

```markdown
## Mô tả

<!-- Mô tả ngắn gọn thay đổi -->

## Loại thay đổi

- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix hoặc feature làm thay đổi API)
- [ ] Documentation update

## Liên quan đến Issue

Closes #123

## Cách test

<!-- Mô tả các bước để test thay đổi -->

1. ...
2. ...

## Screenshots (nếu có)

<!-- Paste screenshots cho UI changes -->

## Checklist

- [ ] Code tuân theo style guidelines
- [ ] Self-review code
- [ ] Commented code ở những chỗ khó hiểu
- [ ] Updated documentation
- [ ] Không có warnings mới
- [ ] Added tests (coverage >= 80%)
- [ ] Tất cả tests pass
- [ ] Dependent changes đã được merge
```

### 7.4. PR Size

- **Prefer small PRs**: < 400 lines changed
- Nếu PR lớn, chia thành nhiều PRs nhỏ
- Mỗi PR nên focus vào **một** feature/fix

### 7.5. Review Process

#### Reviewer sẽ kiểm tra:

1. **Functionality**: Code có hoạt động đúng không?
2. **Tests**: Coverage đủ chưa? Tests có ý nghĩa không?
3. **Style**: Tuân theo conventions?
4. **Performance**: Có bottlenecks không?
5. **Security**: Có vulnerabilities không?
6. **Documentation**: Có cần update docs không?

#### Responding to feedback:

- Trả lời tất cả comments
- Mark conversations as resolved sau khi fix
- Push thêm commits (không force-push)
- Re-request review sau khi update

### 7.6. Merge Requirements

PR được merge khi:

- ✅ Ít nhất 1 approval từ maintainer
- ✅ Tất cả CI checks pass
- ✅ Không có conflicts với base branch
- ✅ Tất cả conversations resolved

---

## 8. Yêu cầu Kiểm thử

### 8.1. Tháp Kiểm thử

```
       /\
      /  \    E2E Tests (5%)
     /____\   
    /      \  Integration Tests (15%)
   /________\ 
  /          \ Unit Tests (80%)
 /____________\
```

### 8.2. Unit Tests

**Coverage target**: >= 80%

#### Viết tests cho:

- Business logic functions
- Validators
- Utilities
- State machines

#### Example:

```typescript
// filepath: src/modules/orders/order-state-machine.spec.ts

describe('OrderStateMachine', () => {
  describe('canTransition', () => {
    it('should allow transition from received to preparing', () => {
      const result = OrderStateMachine.canTransition('received', 'preparing');
      expect(result).toBe(true);
    });

    it('should not allow transition from preparing to received', () => {
      const result = OrderStateMachine.canTransition('preparing', 'received');
      expect(result).toBe(false);
    });
  });
});
```

### 8.3. Integration Tests

Test tương tác giữa modules:

```typescript
describe('MenuItemController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Setup test app
  });

  it('POST /menu-items should create item', async () => {
    const response = await request(app.getHttpServer())
      .post('/menu-items')
      .set('Authorization', `Bearer ${token}`)
      .send(createDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });
});
```

### 8.4. E2E Tests

Test user flows quan trọng:

```typescript
describe('Customer Ordering Flow (E2E)', () => {
  it('should complete full ordering flow', async () => {
    // 1. Scan QR
    // 2. View menu
    // 3. Add to cart
    // 4. Checkout
    // 5. Verify order created
  });
});
```

### 8.5. Running Tests

```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:cov

# Watch mode
pnpm test:watch
```

---

## 9. Tài liệu Hóa

### 9.1. Tài liệu Code

#### JSDoc cho public APIs:

```typescript
/**
 * Creates a new menu item for the specified tenant.
 *
 * @param tenantId - The tenant identifier
 * @param dto - Menu item creation data
 * @returns The created menu item
 * @throws {MenuItemAlreadyExistsError} If item with same name exists
 * @throws {CategoryNotFoundError} If category doesn't exist
 *
 * @example
 * ```typescript
 * const item = await menuService.create('tenant-123', {
 *   name: 'Pho Bo',
 *   price: 50000,
 *   categoryId: 'cat-1'
 * });
 * ```
 */
async create(tenantId: string, dto: CreateMenuItemDto): Promise<MenuItem> {
  // ...
}
```

### 9.2. Architecture Documentation

Khi thay đổi kiến trúc quan trọng:

1. Update `ARCHITECTURE.md`
2. Tạo Architecture Decision Record (ADR) trong `docs/adr/`
3. Update diagrams nếu có

#### ADR Template:

```markdown
# ADR-00X: Title

## Status
Proposed | Accepted | Deprecated | Superseded

## Context
<!-- Vấn đề cần giải quyết -->

## Decision
<!-- Quyết định được đưa ra -->

## Consequences
<!-- Hệ quả của quyết định -->

### Positive
- ...

### Negative
- ...

## Các Giải pháp Thay thế Đã Xem xét
<!-- Các phương án khác đã cân nhắc -->
```

### 9.3. API Documentation

- Update OpenAPI spec (`docs/openapi.yaml`)
- Thêm examples cho mọi endpoint
- Document error responses

---

## 10. Báo cáo Lỗi

### 10.1. Trước khi báo cáo

- [ ] Tìm kiếm issues hiện có
- [ ] Kiểm tra tài liệu
- [ ] Cập nhật lên phiên bản mới nhất
- [ ] Có sẵn reproduction tối thiểu

### 10.2. Mẫu Báo cáo Lỗi

```markdown
**Mô tả bug**
Mô tả ngắn gọn bug là gì.

**Các bước Tái tạo**
1. Vào '...'
2. Click vào '...'
3. Scroll xuống '...'
4. Thấy lỗi

**Hành vi Mong đợi**
Mô tả kết quả mong đợi.

**Hành vi Thực tế**
Kết quả thực tế xảy ra.

**Screenshots**
Nếu có, thêm screenshots.

**Môi trường**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Version: [e.g. v1.2.3]

**Thêm Bối cảnh**
Thêm thông tin khác nếu cần.
```

---

## 11. Đề xuất Tính năng

### 11.1. Mẫu Đề xuất Tính năng

```markdown
**Tính năng đề xuất**
Mô tả rõ ràng tính năng bạn muốn.

**Vấn đề liên quan**
Giải thích vấn đề mà tính năng này giải quyết.

**Giải pháp đề xuất**
Mô tả giải pháp bạn muốn.

**Các Giải pháp Thay thế Đã Xem xét**
Các giải pháp thay thế bạn đã cân nhắc.

**Các Trường hợp Sử dụng**
Ai sẽ sử dụng? Trong tình huống nào?

**Ưu tiên**
- [ ] Critical
- [ ] High
- [ ] Medium
- [ ] Low

**Thêm Bối cảnh**
Screenshots, mockups, links, etc.
```

---

## 12. Liên hệ & Hỗ trợ

### 12.1. Kênh Giao tiếp

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Q&A, ideas, show & tell
- **Email**: dev@example.com (cho security issues)
- **Slack/Discord**: *(TBD)*

### 12.2. Câu hỏi Thường gặp

#### Q: Tôi mới bắt đầu, nên làm gì trước?

A: 
1. Đọc [README](../readme.md) và [ARCHITECTURE](./ARCHITECTURE.md)
2. Setup development environment
3. Tìm `good first issue` và comment "I'd like to work on this"
4. Ask questions nếu cần!

#### Q: PR của tôi bị reject, tôi nên làm gì?

A: Không sao! Đọc feedback, học hỏi, và thử lại. Mọi người đều từng bị reject.

#### Q: Tôi có thể đề xuất thay đổi lớn (breaking change) không?

A: Có, nhưng:
1. Tạo issue trước để discussion
2. Đợi approval từ maintainers
3. Viết ADR giải thích quyết định

#### Q: Code coverage của tôi không đạt 80%, có sao không?

A: Nếu có lý do chính đáng (e.g., UI code, third-party integration), giải thích trong PR. Maintainers sẽ xem xét.

---

## 13. Acknowledgements

Cảm ơn tất cả contributors đã dành thời gian và công sức cho dự án! 🎉

Danh sách contributors: *(sẽ được cập nhật)*

---

## 14. License

Bằng việc contribute, bạn đồng ý rằng contributions của bạn sẽ được license theo cùng license với project (TBD).

---

**Happy Contributing! 🚀**

*Nếu có câu hỏi, đừng ngại tạo issue hoặc discussion!*

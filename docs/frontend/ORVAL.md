# Hướng dẫn Orval (Codegen API) – Next.js 15 + Clean Architecture

Tài liệu này hướng dẫn quy trình tích hợp **Orval** để sinh client API + hooks React Query từ OpenAPI/Swagger, phù hợp với cấu trúc Clean Architecture và Feature-Sliced Design.

**⏳ ADD HERE:** Verify @tanstack/react-query and orval in package.json dependencies

## Mục tiêu
- Tự động sinh code client (Axios) và hooks React Query (⏳ ADD HERE: verify major version in package.json).
- Lưu code sinh ra tại lớp **Infrastructure/Data**: `src/services/api` (verify output path in orval.config.ts).
- Sử dụng **mutator** là Axios instance trung tâm (`src/services/axios.ts`).
- Tách DTO/schemas tại `src/services/api/models` (verify schemas path in orval.config.ts).

## Cấu trúc thư mục
```
source/apps/<app-name>/
├── src/
│   ├── app/               # App Router: chỉ wrapper route/layout/page
│   ├── features/          # Business logic theo domain (auth, menu,...)
│   ├── services/
│   │   ├── axios.ts       # Axios instance + interceptors
│   │   └── api/           # ← Orval output (endpoints & models)
│   ├── shared/            # UI atoms/molecules/layout/common
│   ├── store/             # Zustand/Redux
│   └── types/             # Global types (env,...)
└── orval.config.ts
```

## Cấu hình Orval
Ví dụ cấu hình (đã có sẵn):
```ts
// source/apps/web-customer/orval.config.ts
import { defineConfig } from 'orval';
export default defineConfig({
  customerApi: {
    input: { target: './openapi-spec.json' }, // Local copy of exported spec
    output: {
      mode: 'tags-split',
      target: 'src/services/api',        // ⏳ Verify output path in actual config
      schemas: 'src/services/api/models', // ⏳ Verify schemas path in actual config
      client: 'react-query',
      prettier: true,
      mock: false,
      override: {
        mutator: { path: 'src/services/axios.ts', name: 'api' },
        reactQuery: { version: 5, suspense: false },
      },
    },
  },
});
```
Tương tự cho web-tenant (`source/apps/web-tenant/orval.config.ts`).

## Cập nhật OpenAPI Spec

Trước khi chạy codegen, cần cập nhật `openapi-spec.json` từ API server đang chạy:

```bash
# Export latest spec from running API
curl http://localhost:3000/api-docs-json > docs/common/openapi.exported.json

# Copy to frontend apps
cp docs/common/openapi.exported.json source/apps/web-tenant/openapi-spec.json
cp docs/common/openapi.exported.json source/apps/web-customer/openapi-spec.json
```

**Lưu ý:** Đảm bảo API server đang chạy trước khi export (`pnpm dev` trong `source/apps/api`).

## Chạy codegen
```bash
# Trong thư mục app tương ứng
pnpm install
pnpm orval
```
- Orval sẽ đọc `./openapi-spec.json` (local copy exported từ API) và sinh code vào `src/services/api`.
- Nếu thay đổi API schema, cần export lại spec từ API server rồi chạy `pnpm orval`.

## Cách sử dụng trong Features
- KHÔNG import trực tiếp trong `src/app`. Hãy tạo hooks/logic tại `src/features/*/hooks` và gọi hooks sinh từ Orval.
```ts
// src/features/menu-view/hooks/useMenu.ts
'use client';
// ⏳ ADD HERE: Replace with actual generated hook name from src/services/api/
// After running orval, check src/services/api/<tag-name>/<tag-name>.ts for available hooks
// Example pattern: useGet<ResourceName> or usePost<ResourceName>
import { use[GeneratedHookName] } from '@/services/api/[tag-name]';

export const useMenu = (tenantId: string) => {
  const query = use[GeneratedHookName](tenantId, { query: { staleTime: 5 * 60_000 } });
  return { menu: query.data ?? [], ...query };
};
```
- Page wrappers ở `src/app` chỉ render từ `src/features`:
```tsx
// src/app/menu/page.tsx
import { MenuPage } from '@/features/menu-view';
export default function Page() { return <MenuPage />; }
```

## Nguyên tắc kiến trúc
- `src/app`: Chỉ router/layout/page – tránh business logic.
- `src/features`: Đặt UI thông minh (smart components) + hooks + services domain.
- `src/shared/ui`: Atoms/Molecules “dumb” tái sử dụng.
- `src/services/api`: Chỉ chứa code sinh từ Orval (không chỉnh sửa thủ công).
- `src/services/axios.ts`: Axios instance duy nhất – dùng làm mutator.
- DTO/Model sinh ra ở `src/services/api/models`.

## Lưu ý
- Hooks Orval là client-only; đặt trong nơi phù hợp (hooks/features) hoặc gọi từ Client Components.
- Thêm cấu hình `NEXT_PUBLIC_API_URL` trong `.env` để Axios baseURL hoạt động.
- Tránh import chéo trái phép giữa features – dùng barrel `index.ts` tại mỗi feature.

## Khắc phục sự cố
- “Module not found” sau khi đổi cấu trúc: kiểm tra alias `@/*` → `./src/*`, `@/app/*` → `./src/app/*` trong `tsconfig.json`.
- Lỗi type trong editor: restart TypeScript server trong VSCode.
- Lỗi 401 từ Axios: kiểm tra interceptor token setup.
  - ⏳ ADD HERE: Verify actual token storage key by checking `src/services/axios.ts` or auth implementation
  - Common patterns: localStorage.getItem('token'), cookies, or session storage

---
**Last Updated:** 2026-01-20

# Hướng Dẫn Next.js 15 App Router (Tiếng Việt)

> Mục tiêu: Giúp dev mới nắm vững cách tổ chức `app/` trong Next.js 15, phân biệt Server/Client Components, data fetching, middleware, routing nâng cao và best practices trong dự án này.

## 1. Tổng Quan
App Router (thay thế Pages Router cũ) cung cấp:
- File-based routing trong thư mục `app/`
- Server Components mặc định (SSR + streaming + ít JS bundle)
- Client Components khi cần tương tác (thêm `'use client'`)
- Layout phân cấp, loading state streaming, error boundary
- Route Groups `(group)` không xuất hiện trong URL
- Dynamic Segments `[id]`, Catch-all `[...slug]`
- Edge Middleware ở root cho bảo vệ route / rewrite / header injection

Trong dự án: `web-tenant` (portal admin) và `web-customer` (ứng dụng khách) đều dùng App Router với nguyên tắc: **Page mỏng, logic nằm ở features/**.

## 2. Cấu Trúc Cơ Bản
```
app/
  layout.tsx          # Root layout (Server Component)
  page.tsx            # Trang gốc (Landing / Redirect)
  (auth)/             # Route group: đăng nhập, verification
    login/page.tsx
  admin/              # Phân đoạn được bảo vệ RBAC
    layout.tsx
    dashboard/page.tsx
  api/                # (Tuỳ chọn) API route Next.js (BFF)
  loading.tsx         # Loading UI streaming
  error.tsx           # Error boundary
  not-found.tsx       # 404
  providers.tsx       # Client providers (QueryClient, contexts)
```

### Quy Ước Trong Dự Án
| File | Vai trò |
|------|---------|
| `layout.tsx` | Khung HTML + Providers (Server) |
| `providers.tsx` | Client Component gói React Query, Context |
| `page.tsx` | Render component feature (vd: `<Dashboard />`) |
| `loading.tsx` | Trạng thái khi server chưa stream xong |
| `error.tsx` | Error boundary cho segment |
| `middleware.ts` | Áp dụng logic auth/RBAC/rewrites |

## 3. Server vs Client Components
### Server Component (mặc định)
- Không cần `'use client'`
- Có thể fetch trực tiếp (fetch API native)
- Không truy cập `window`, `localStorage`, event handlers
- Giảm kích thước bundle JS

### Client Component
- Thêm `'use client'` đầu file
- Dùng state, effect, event handlers, browser APIs
- Chỉ import từ Server Components nếu server component không phụ thuộc client logic

**Example patterns:**
```tsx
// Server component (không cần 'use client')
// ⏳ ADD HERE: Verify API_URL env var in .env.example
export default async function AdminPage() {
  const data = await fetch(process.env.API_URL + '/stats', { cache: 'no-store' }).then(r => r.json());
  return <StatsView data={data} />; // StatsView có thể là client hoặc server component
}

// Client component
'use client';
import { useState } from 'react';
export function Toggle() {
  const [open, setOpen] = useState(false);
  return <button onClick={() => setOpen(o => !o)}>{open ? 'Đóng' : 'Mở'}</button>;
}
```

### Nguyên Tắc Dự Án
- Mặc định viết component server để tối ưu SEO & performance
- Chỉ chuyển client khi cần: interactivity, browser API, context provider, React Query hooks
- Tách phần hiển thị tĩnh (server) và phần tương tác (client) để tránh `'use client'` lan rộng

## 4. Data Fetching Patterns
### Trong Server Component
**Example (pseudo-code):**
```tsx
// ⏳ ADD HERE: Verify API_URL env var and endpoint paths in OpenAPI docs
export default async function MenuPage({ params }) {
  const menu = await fetch(process.env.API_URL + `/tenants/${params.tenantId}/menu`, {
    cache: 'no-store'
  }).then(r => r.json());
  return <MenuView initialData={menu} />;
}
```
`cache` options:
- `no-store`: luôn fresh (thích hợp dữ liệu thay đổi nhanh)
- `force-cache`: cache static
- `{ next: { revalidate: 3600 } }`: ISR (revalidate sau X giây)

### Trong Client Component (React Query + Axios)
**Example pattern:**
```tsx
// ⏳ ADD HERE: Verify apiClient path and endpoint in OpenAPI docs
'use client';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

export function useMenu(tenantId: string) {
  return useQuery({
    queryKey: ['menu', tenantId],
    queryFn: async () => (await apiClient.get(`/tenants/${tenantId}/menu`)).data,
    staleTime: 5 * 60 * 1000,
    enabled: !!tenantId,
  });
}
```

### Kết Hợp (Hydration)
- Server component fetch data → truyền `initialData` xuống client hook (nếu cần immediate render + query cache)
- Ưu tiên server fetch cho SEO / giảm TTFB

## 5. Routing Chi Tiết
### Route Groups
```
app/(auth)/login/page.tsx   -> /login
app/(public)/menu/page.tsx  -> /menu
```
- Tổ chức code, không ảnh hưởng URL

### Dynamic Segment
```
app/admin/orders/[orderId]/page.tsx  -> /admin/orders/123
```
`params.orderId` lấy từ segment.

### Catch-all
```
app/docs/[...slug]/page.tsx   // /docs/a/b/c
```

### Optional Catch-all
```
app/blog/[[...slug]]/page.tsx // /blog hoặc /blog/a/b
```

### Parallel Routes / Intercepting (Future Scope)
- Chỉ dùng khi cần hiển thị nhiều vùng nội dung đồng thời hoặc overlay modal route

## 6. Layout, Loading, Error, Not Found
```tsx
// layout.tsx (Server)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        {/* Providers client nằm trong providers.tsx */}
        {children}
      </body>
    </html>
  );
}
```
```tsx
// loading.tsx
export default function Loading() {
  return <div className="animate-pulse p-4">Đang tải...</div>;
}
```
```tsx
// error.tsx
'use client';
export default function ErrorBoundary({ error }: { error: Error }) {
  return <div>Lỗi: {error.message}</div>;
}
```
```tsx
// not-found.tsx
export default function NotFound() {
  return <div>Không tìm thấy nội dung.</div>;
}
```

## 7. Middleware
File `middleware.ts` ở root app:
- Dùng cho auth redirect, RBAC, rewrite QR URL

Ví dụ kiểm tra JWT & role:
```ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth')?.value;
  const url = req.nextUrl;

  if (url.pathname.startsWith('/admin')) {
    if (!token) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    // TODO (English): verify role & append headers
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

## 8. Environment Variables
| Loại | Ví dụ | Sử dụng |
|------|-------|---------|
| Server-only | `API_URL` | fetch trong Server Components |
| Client-exposed | `NEXT_PUBLIC_API_URL` | Axios / React Query |
**⏳ ADD HERE:** Verify actual environment variable names in source/apps/web-tenant/.env.example and source/apps/web-customer/.env.example
Quy tắc:
- Không lộ secret KEY ở client
- Dùng `process.env.NEXT_PUBLIC_*` trong client code, `process.env.*` trong server component
- Kiểm tra biến tồn tại (fallback) để tránh undefined

## 9. RBAC & Guards (Tổng Quan Nhanh)
- Trang trong `admin/` luôn được bọc bởi guard component hoặc middleware redirect
- Client guard example: `<RoleGuard allowedRoles={["OWNER","STAFF"]}>...</RoleGuard>`
  - **Note:** Canonical roles are OWNER, STAFF, KITCHEN (see docs/frontend/RBAC_GUIDE.md)
  - ⏳ ADD HERE: Verify actual RoleGuard implementation and role enum mapping
- Middleware bảo đảm người không hợp lệ sẽ bị chuyển hướng trước khi render

## 10. Best Practices (Dự Án)
| Chủ đề | Thực hành |
|--------|-----------|
| Phân lớp | Page mỏng, import từ `features/*` |
| Client huỷ bỏ | Chỉ `'use client'` khi thật cần thiết |
| Data | Server fetch cho danh sách chính, client query cho tương tác realtime |
| Tái sử dụng | UI atoms ở `shared/components/ui` |
| Biến môi trường | Phân biệt server vs client rõ ràng |
| Import | Dùng path alias `@/` thay vì relative sâu |
| Code splitting | `dynamic()` cho component nặng ít dùng |
| Streaming | Sử dụng `loading.tsx` cho trải nghiệm tốt hơn |
| Error | Centralized error boundary segment |

## 11. Checklist Nhanh Cho Dev Mới
1. Mở `app/` xem `layout.tsx` và `providers.tsx`
2. Xác định route cần thêm (public? protected?)
3. Tạo file `page.tsx` mỏng -> import component từ `features/`
4. Nếu tương tác: component con thêm `'use client'`
5. Data chính: fetch ở server component (SEO) hoặc hook React Query ở client
6. Thêm guard nếu ở `admin/`
7. Cập nhật điều hướng sidebar / menu (nếu cần)
8. Viết test cho hook/service quan trọng

## 12. FAQ
**Q: Tại sao component bị lỗi `window is not defined`?**  
A: Bạn đang dùng browser API trong Server Component. Thêm `'use client'` hoặc tách logic.

**Q: Có nên dùng Axios trong Server Component?**  
A: Không. Dùng `fetch` vì server environment tối ưu & không cần bundle thêm.

**Q: Khi nào dùng ISR (`revalidate`)?**  
A: Với dữ liệu ít thay đổi (category, bảng giá) để giảm tải và cải thiện tốc độ.

**Q: Có thể đặt React Query trong Server Component?**  
A: Không, React Query là client-state library.

## 13. Liên Kết Tài Liệu Liên Quan
- `../ARCHITECTURE.md` – Tổng quan kiến trúc
- `./PATTERNS_AND_CONVENTIONS.md` – Pattern & quy ước code
- `./FEATURE_IMPLEMENTATION_GUIDE.md` – Hướng dẫn triển khai feature
- `./ONBOARDING_CHECKLIST.md` – Checklist vào dự án

---
Last Updated: 2026-01-20

# FEATURE IMPLEMENTATION GUIDE (Ví dụ: Analytics Dashboard)

> Mục tiêu: Hướng dẫn dev mới thêm một feature hoàn chỉnh (Analytics Dashboard) vào **web-tenant** gồm: cấu trúc thư mục, types, services (server/client), hooks, UI components, page route App Router, RBAC guard, navigation, test, tối ưu hiệu năng.

## 1. Bối Cảnh & Mục Tiêu Feature
Feature: **Analytics Dashboard** trong khu vực admin.

Chức năng cơ bản:
- Hiển thị tổng quan doanh thu, số lượng đơn hàng, top món bán chạy.
- Biểu đồ (có thể lazy load) + thẻ KPI.
- Bộ lọc theo khoảng thời gian (today / 7 days / 30 days / custom range).

Các phần nâng cao (có thể làm sau – post-MVP):
- So sánh kỳ trước (period comparison).
- Drill-down tới chi tiết món.
- Export CSV.

## 2. Các Bước Tổng Quan
1. Tạo folder feature `features/analytics/`.
2. Khai báo `types` (DTO / interfaces).
3. Viết service server (fetch SSR) & client (axios cho mutation hoặc refetch).
4. Viết hooks: `useAnalyticsSummary`, `useAnalyticsFilters`.
5. Tạo UI components: `AnalyticsOverview`, `RevenueChart`, `KPIGrid`.
6. Tạo page `app/admin/analytics/page.tsx` (mỏng) → import từ feature.
7. Thêm RBAC guard - Canonical roles: OWNER, STAFF (see docs/frontend/RBAC_GUIDE.md).
8. Cập nhật navigation sidebar admin.
9. Viết test đơn giản cho hook hoặc utils.
10. Tối ưu: dynamic import chart, memo hóa tính toán.

## 3. Cấu Trúc Thư Mục
```
web-tenant/src/features/analytics/
  components/
    AnalyticsOverview.tsx
    RevenueChart.tsx
    KPIGrid.tsx
    FiltersBar.tsx
    index.ts
  hooks/
    useAnalyticsSummary.ts
    useAnalyticsFilters.ts
  services/
    analyticsService.server.ts
    analyticsService.client.ts
  types/
    analytics.types.ts
  utils/
    analyticsHelpers.ts
  index.ts
```

`index.ts` (barrel):
```ts
export * from './components';
export * from './hooks/useAnalyticsSummary';
export * from './hooks/useAnalyticsFilters';
export * from './types/analytics.types';
export { analyticsService } from './services/analyticsService.client';
```

## 4. Khai Báo Types
`analytics.types.ts`
```ts
export interface AnalyticsSummary {
  totalRevenue: number; // VND
  ordersCount: number;
  topItems: Array<{ id: string; name: string; quantity: number; revenue: number }>;
  period: { from: string; to: string }; // ISO date string
}

export interface RevenuePoint { date: string; value: number; }

export interface AnalyticsFilterState {
  preset: 'today' | '7d' | '30d' | 'custom';
  from?: string; // ISO
  to?: string;   // ISO
}
```

## 5. Service Layer
### Server Service (SSR fetch)
**Example (pseudo-code):**
```ts
// ⏳ ADD HERE: Verify API_URL env var in .env.example
// ⏳ ADD HERE: Verify analytics endpoints in OpenAPI docs (see docs/common/OPENAPI.md)
const API_URL = process.env.API_URL; // server-only
export const analyticsServiceServer = {
  async getSummary(tenantId: string, from: string, to: string) {
    const url = `${API_URL}/tenants/${tenantId}/analytics/summary?from=${from}&to=${to}`;
    const res = await fetch(url, { cache: 'no-store' }); // no-store vì thay đổi nhanh
    if (!res.ok) throw new Error('Failed to fetch analytics summary');
    return res.json();
  },
  async getRevenueSeries(tenantId: string, from: string, to: string) {
    const url = `${API_URL}/tenants/${tenantId}/analytics/revenue-series?from=${from}&to=${to}`;
    const res = await fetch(url, { next: { revalidate: 600 } }); // 10 phút revalidate
    if (!res.ok) throw new Error('Failed to fetch revenue series');
    return res.json();
  },
};
```

### Client Service (Axios + React Query)
**Example (pseudo-code):**
```ts
// ⏳ ADD HERE: Verify apiClient import path and analytics endpoints in OpenAPI docs
'use client';
import apiClient from '@/lib/api/client';
export const analyticsService = {
  async getSummary(tenantId: string, from: string, to: string) {
    return (await apiClient.get(`/tenants/${tenantId}/analytics/summary`, { params: { from, to } })).data;
  },
  async getRevenueSeries(tenantId: string, from: string, to: string) {
    return (await apiClient.get(`/tenants/${tenantId}/analytics/revenue-series`, { params: { from, to } })).data;
  },
};
```

## 6. Hooks
**Example pattern (useAnalyticsFilters.ts):**
```ts
// ⏳ ADD HERE: Verify react imports in package.json
'use client';
import { useState, useCallback } from 'react';
import type { AnalyticsFilterState } from '../types/analytics.types';
import { computeRange } from '../utils/analyticsHelpers';

export function useAnalyticsFilters() {
  const [filters, setFilters] = useState<AnalyticsFilterState>({ preset: '7d' });
  const range = computeRange(filters); // { from,to }

  const setPreset = useCallback((preset: AnalyticsFilterState['preset']) => {
    setFilters({ preset });
  }, []);

  const setCustomRange = useCallback((from: string, to: string) => {
    setFilters({ preset: 'custom', from, to });
  }, []);

  return { filters, range, setPreset, setCustomRange };
}
```

**Example pattern (useAnalyticsSummary.ts):**
```ts
// ⏳ ADD HERE: Verify @tanstack/react-query in package.json
'use client';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService.client';

export function useAnalyticsSummary(tenantId: string, from: string, to: string) {
  return useQuery({
    queryKey: ['analyticsSummary', tenantId, from, to],
    queryFn: () => analyticsService.getSummary(tenantId, from, to),
    staleTime: 60 * 1000, // 1 phút
    enabled: !!tenantId && !!from && !!to,
  });
}
```

## 7. Utils
**Example (analyticsHelpers.ts):**
```ts
// English: compute date range from preset
export function computeRange(filters: { preset: string; from?: string; to?: string }) {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  let start: Date;
  switch (filters.preset) {
    case 'today':
      start = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0);
      break;
    case '7d':
      start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
      break;
    case 'custom':
      return { from: filters.from!, to: filters.to! };
    default:
      start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
  }
  return { from: start.toISOString(), to: end.toISOString() };
}
```

## 8. Components
**Example (KPIGrid.tsx):**
```tsx
'use client';
export function KPIGrid({ data }: { data: { totalRevenue: number; ordersCount: number } }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded bg-slate-800 text-white">
        <p className="text-xs opacity-70">Doanh thu</p>
        <p className="text-xl font-semibold">{data.totalRevenue.toLocaleString()} VND</p>
      </div>
      <div className="p-4 rounded bg-slate-800 text-white">
        <p className="text-xs opacity-70">Đơn hàng</p>
        <p className="text-xl font-semibold">{data.ordersCount}</p>
      </div>
    </div>
  );
}
```

**Example (RevenueChart.tsx - dynamic import pattern):**
```tsx
// ⏳ ADD HERE: Verify chart library (e.g., recharts) in package.json
'use client';
import dynamic from 'next/dynamic';
// English: Assume HeavyChart wraps a chart library (e.g., recharts)
const HeavyChart = dynamic(() => import('./HeavyChart'), { ssr: false, loading: () => <div>Đang tải biểu đồ...</div> });
export function RevenueChart({ series }: { series: Array<{ date: string; value: number }> }) {
  return <HeavyChart data={series} />;
}
```

**Example (AnalyticsOverview.tsx):**
```tsx
'use client';
import { useAnalyticsSummary } from '../hooks/useAnalyticsSummary';
import { KPIGrid } from './KPIGrid';
import { RevenueChart } from './RevenueChart';

export function AnalyticsOverview({ tenantId, range }: { tenantId: string; range: { from: string; to: string } }) {
  const { data, isLoading, error } = useAnalyticsSummary(tenantId, range.from, range.to);
  if (error) return <div>Lỗi tải dữ liệu analytics.</div>;
  if (isLoading) return <div>Đang tải...</div>;
  return (
    <div className="space-y-6">
      <KPIGrid data={data} />
      <RevenueChart series={data.revenueSeries || []} />
    </div>
  );
}
```

## 9. Page Wrapper App Router
**Example (app/admin/analytics/page.tsx):**
```tsx
import { RoleGuard } from '@/shared/components/auth/RoleGuard';
import { AnalyticsOverview } from '@/features/analytics';
import { computeRange } from '@/features/analytics/utils/analyticsHelpers';
import { getTenantContext } from '@/lib/server/tenantContext'; // giả định

// ⏳ ADD HERE: Verify RoleGuard implementation and allowed roles
// Canonical roles: OWNER, STAFF, KITCHEN (see docs/frontend/RBAC_GUIDE.md)
export default async function AnalyticsPage() {
  // Server: lấy tenantId từ context/session (tuỳ thuộc vào middleware set cookie)
  const { tenantId } = await getTenantContext();
  const initialRange = computeRange({ preset: '7d' });
  // Có thể prefetch summary: SSR -> truyền xuống client
  // const summary = await analyticsServiceServer.getSummary(tenantId, initialRange.from, initialRange.to);

  return (
    <RoleGuard allowedRoles={['OWNER','STAFF']}>
      {/* Client component sẽ fetch realtime thay vì SSR prefetch ở ví dụ đơn giản này */}
      <AnalyticsOverview tenantId={tenantId} range={initialRange} />
    </RoleGuard>
  );
}
```

## 10. Thêm Navigation
**Example pattern - AdminSidebar.tsx:**
```tsx
// ⏳ ADD HERE: Verify actual sidebar component location and structure
// Example: Add analytics link to sidebar navigation
<Link href="/admin/analytics" className="sidebar-item">Analytics</Link>
```

## 11. RBAC Guard
- Đảm bảo page bọc `RoleGuard` hoặc middleware chặn.
- Kiểm tra `RoleGuard` trả về trang lỗi nếu user role không phù hợp.

## 12. Testing (Ví dụ Hook)
**Example (useAnalyticsFilters.test.ts):**
```ts
// ⏳ ADD HERE: Verify @testing-library/react in package.json
import { renderHook, act } from '@testing-library/react';
import { useAnalyticsFilters } from './useAnalyticsFilters';

describe('useAnalyticsFilters', () => {
  it('default preset is 7d', () => {
    const { result } = renderHook(() => useAnalyticsFilters());
    expect(result.current.filters.preset).toBe('7d');
  });
  it('changes preset', () => {
    const { result } = renderHook(() => useAnalyticsFilters());
    act(() => result.current.setPreset('today'));
    expect(result.current.filters.preset).toBe('today');
  });
});
```

## 13. Performance & Tối Ưu
| Kỹ thuật | Áp dụng |
|----------|---------|
| Dynamic import chart | Giảm bundle initial load |
| Server fetch + no-store | Dữ liệu mới nhất KPI |
| React Query caching | 1 phút stale tránh gọi lại quá nhiều - ⏳ ADD HERE: verify @tanstack/react-query |
| Memo hóa dữ liệu phức tạp | Dùng `useMemo` nếu transform lớn |
| Batching state | Gộp setFilters nếu nhiều cập nhật |

## 14. Common Pitfalls
| Vấn đề | Giải pháp |
|--------|-----------|
| Import client service vào page server | Tách server/client rõ ràng |
| Quên RBAC → lộ dữ liệu | Luôn bọc `RoleGuard` hoặc middleware |
| Query key thiếu tham số | Đảm bảo `['analyticsSummary', tenantId, from, to]` đầy đủ |
| Dùng `window` trong server component | Thêm `'use client'` và tách logic |
| Không invalidation sau mutation | Gọi `invalidateQueries` hoặc update cache |

## 15. Checklist Hoàn Thành Feature
- [ ] Tạo folder và `index.ts` đúng chuẩn
- [ ] Types rõ ràng, không lẫn logic
- [ ] Service server & client tách biệt
- [ ] Hooks trả về trạng thái đầy đủ (data, isLoading, error)
- [ ] UI components nhỏ gọn, tái sử dụng khi cần
- [ ] Page wrapper mỏng không chứa business logic phức tạp
- [ ] Guard RBAC áp dụng đúng
- [ ] Navigation đã thêm
- [ ] Test ít nhất 1 hook hoặc utils core
- [ ] Code splitting cho phần nặng (chart)

## 16. Mở Rộng Tương Lai
- Thêm so sánh kỳ trước: hook `useAnalyticsComparison`
- Export CSV: service `exportAnalytics` + nút download
- Drill-down: route mới `app/admin/analytics/items/[itemId]/page.tsx`
- Skeleton loading: thêm component skeleton KPI & chart

## 17. Liên Kết Tài Liệu
- `../ARCHITECTURE.md`
- `./PATTERNS_AND_CONVENTIONS.md`
- `./NEXTJS_15_APP_ROUTER_GUIDE.md`
- `./ONBOARDING_CHECKLIST.md` (sẽ tạo)

---
Last Updated: 2026-01-20

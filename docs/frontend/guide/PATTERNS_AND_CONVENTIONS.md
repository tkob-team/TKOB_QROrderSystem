# PATTERNS & CONVENTIONS (Quy Ước & Mẫu Thiết Kế Frontend)

> Mục tiêu: Chuẩn hoá cách viết code, tổ chức feature, tái sử dụng, tránh nợ kỹ thuật. Ngôn ngữ: tiếng Việt (code comment English).

## 1. Triết Lý Chung
- **Tách biệt rõ** Presentation (app/) vs Domain (features/) vs Shared (shared/) vs Infrastructure (lib/).
- **Ít phụ thuộc chéo**: feature chỉ expose qua `index.ts` (barrel) tránh import sâu.
- **Predictable scaling**: mỗi feature tự chứa UI + logic + types + services.
- **Clear boundaries**: shared không chứa nghiệp vụ, chỉ các thành phần generic.
- **Small components**: < 200 dòng; tách Hook + UI.

## 2. Feature Folder Template
```
features/<tenancy|menu|orders>/
  components/        # UI chuyên biệt
    <Name>.tsx
    <Name>.test.tsx  # (tuỳ chọn) unit test UI nhẹ
  hooks/             # Custom hooks (business + side effects)
    useX.ts
  services/          # Giao tiếp API (server/client service tách riêng nếu cần)
    xService.client.ts
    xService.server.ts
  types/             # Interface, type union
    x.types.ts
  utils/             # Helper thuần, pure functions
    x.helpers.ts
  index.ts           # Barrel exports (public surface)
```

### index.ts (Barrel Exports)
```ts
// Export những gì muốn public
export * from './components';
export * from './hooks';
export * from './types/x.types';
export { xService } from './services/xService.client';
// Không export helpers internal nếu không cần dùng ngoài
```

## 3. Phân Loại Component
| Loại | Đặc điểm | Ví dụ |
|------|----------|-------|
| Atom (shared/ui) | Stateless, style, không side-effect | Button, Input |
| Molecule (shared/ui hoặc feature/components) | Tổ hợp atoms, logic nhẹ | CardWithHeader |
| Feature Component | Kết hợp hooks + atoms + business logic hiển thị | MenuItemForm |
| Page Wrapper (app/...) | Server component mỏng, import từ feature | `app/admin/menu/page.tsx` |

**Rule**: Page wrapper không chứa logic nghiệp vụ; logic đi vào hook trong feature.

## 4. Hooks Pattern
### Nguyên Tắc
- Một hook = một trách nhiệm (fetch, form state, combine queries).
- Tên hook `use<Domain><Verb>` hoặc `use<Concept>`.
- Đặt hooks ở `features/<feature>/hooks/` nếu đặc thù; generic thì ở `shared/hooks`.

**Example pattern:**
```ts
// Example: features/menu/hooks/useMenuCRUD.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '../services/menuService.client';

export function useMenuCRUD(tenantId: string) {
  const qc = useQueryClient();

  const createItem = useMutation({
    mutationFn: (data: Partial<MenuItem>) => menuService.createMenuItem(tenantId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu', tenantId] }),
  });

  return {
    create: createItem.mutate,
    isCreating: createItem.isPending,
    errorCreate: createItem.error,
  };
}
```

## 5. Service Layer Pattern
### Phân Tách Server vs Client
- `*.server.ts`: dùng `fetch`, chạy trong Server Component (SEO + ít JS)
- `*.client.ts`: dùng Axios + interceptors trong Client Component (cần token, trạng thái realtime)

**Example pattern (pseudo-code):**
```ts
// Example: features/menu/services/menuService.server.ts
// ⏳ ADD HERE: Verify actual API_URL env var in .env files
const API_URL = process.env.API_URL; // Verify in source/apps/web-tenant/.env.example
export const menuServiceServer = {
  async getMenu(tenantId: string) {
    const res = await fetch(`${API_URL}/tenants/${tenantId}/menu`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Fetch menu failed');
    return res.json();
  }
};

// Example: features/menu/services/menuService.client.ts
'use client';
import apiClient from '@/lib/api/client';
export const menuService = {
  async getMenu(tenantId: string) {
    return (await apiClient.get(`/tenants/${tenantId}/menu`)).data;
  },
  async createMenuItem(tenantId: string, dto: Partial<MenuItem>) {
    return (await apiClient.post(`/tenants/${tenantId}/menu`, dto)).data;
  },
};
```

**Verification:** Check actual service implementations in `source/apps/web-tenant/src/features/*/services/`

### Quy Tắc
| Điều | Lý do |
|------|-------|
| Không import client service vào server component | Tránh bundle axios + code client |
| Mutation thực hiện ở client + invalidation React Query | Cập nhật cache nhanh |
| Server service có thể dùng ISR (`revalidate`) | Tối ưu dữ liệu ít đổi |

## 6. Import Rules & Layering
| Layer | Cho phép import từ |
|-------|--------------------|
| app/ (presentation) | features/, shared/, packages/ |
| features/ | shared/, lib/, packages/ (không import app/) |
| shared/ | lib/, packages/ (không import features/) |
| lib/ | packages/, external libs (không import app/ or features/) |

**Cấm**: Deep import nội bộ vào folder con của feature khác.
```ts
// ❌ Tránh
import { CartItem } from '@/features/cart/components/CartItem';
// ✅ Dùng barrel
import { CartItem } from '@/features/cart';
```

## 7. Naming Conventions
| Đối tượng | Quy tắc | Ví dụ |
|-----------|---------|-------|
| Component | PascalCase | `MenuList.tsx` |
| Hook | camelCase + `use` prefix | `useMenu.ts` |
| Service | camelCase + Service | `menuService.ts` |
| Types file | kebab-case + `.types.ts` | `menu.types.ts` |
| Store | camelCase + Store | `cartStore.ts` |
| Utils | camelCase | `formatCurrency.ts` |

Types:
```ts
interface MenuItem { id: string; name: string; price: number; }
export type MenuStatus = 'ACTIVE' | 'INACTIVE';
interface MenuItemProps { item: MenuItem; }
```

## 8. Error Handling Pattern
```ts
// Hook
const { data, error, isLoading } = useQuery({ /* ... */ });
if (error) console.error('Menu error', error);

// UI
if (error) return <ErrorState message="Không tải được menu" />;
if (isLoading) return <LoadingState />;
```
- Luôn log error ở hook/service layer (English comment ok)
- UI layer hiển thị component ErrorState/EmptyState chuẩn hóa

## 9. React Query Guidelines
| Chủ đề | Khuyến nghị |
|--------|-------------|
| Query Keys | Mảng ổn định: `['menu', tenantId]` |
| staleTime | 5-10 phút cho menu, ngắn hơn cho realtime |
| enabled | Bật khi đủ context (vd `tenantId`) |
| Mutation invalidation | `invalidateQueries` hoặc `setQueryData` tối ưu |

Prefetch:
```ts
qc.prefetchQuery({ queryKey: ['menu', tenantId], queryFn: () => menuService.getMenu(tenantId) });
```

## 10. Zustand Store Guidelines
- Chỉ dùng cho client state thuần (giỏ hàng, UI toggle, ephemeral states)
- Persist bằng `persist` middleware khi cần giữ qua reload
- Không lưu dữ liệu nhạy cảm (token) nếu có thể dùng cookie/httpOnly

**Example pattern:**
```ts
// Example: features/cart/store/cartStore.ts
'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState { items: CartItem[]; add: (i: CartItem) => void; clear: () => void; }
export const useCartStore = create<CartState>()(persist((set) => ({
  items: [],
  add: (i) => set(s => ({ items: [...s.items, i] })),
  clear: () => set({ items: [] }),
}), { name: 'cart-storage' }));
```

**Verification:** Check actual store implementations in `source/apps/web-customer/src/stores/` (verified: cart.store.ts, checkout.store.ts, order.store.ts)

## 11. Folder Decision Matrix
| Khi nào tạo feature mới? | Điều kiện |
|--------------------------|----------|
| Tách folder riêng | Nghiệp vụ đủ lớn > 2 component + >= 1 hook/service |
| Gom vào shared | Logic thuần tái sử dụng multi feature |
| Tách utils | Hàm pure không phụ thuộc React |
| Thêm vào existing feature | Mở rộng cùng domain (vd thêm filter vào menu-view) |

## 12. Code Splitting & Performance
- Dùng `dynamic(() => import(...), { loading: ... })` cho component nặng hiếm dùng.
- Không dynamic import cho atoms nhỏ.
- Giảm re-renders: tách phần dùng store/hook ra component con.

```tsx
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('./HeavyChart'), { ssr: false }); // English: skip SSR if browser-only
```

## 13. Form Handling Pattern
- Form nhỏ: dùng controlled state + basic validation
- Form phức tạp: dùng `react-hook-form` (khi thêm dependency) + schema (Zod)

**Example pattern:**
```tsx
// Example: MenuItemForm component (pseudo-code)
'use client';
export function MenuItemForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return; // TODO: show validation message
    onSubmit({ name, price: Number(price) });
  };
  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={price} onChange={e => setPrice(e.target.value)} />
      <button>Lưu</button>
    </form>
  );
}
```

## 14. Testing Guidelines (Tối Giản)
| Loại | Ưu tiên |
|------|---------|
| Pure utils | ✅ Dễ test |
| Hooks dữ liệu quan trọng | ✅ (behavior/network) |
| UI atoms | ✱ Chỉ test nếu logic điều kiện |
| Feature component lớn | ✱ Snapshot hoặc render test |

## 15. Code Review Checklist
- [ ] Đúng layer import (không vượt boundary)
- [ ] Không deep import feature khác
- [ ] Component < 200 dòng? Nếu > tách nhỏ
- [ ] Hook đơn nhiệm, tên rõ ràng
- [ ] Mutation có invalidation hoặc cập nhật cache
- [ ] Không lạm dụng `'use client'` ở file chỉ hiển thị tĩnh
- [ ] Env var đúng prefix (client vs server)
- [ ] Xử lý lỗi đầy đủ (log + UI state)
- [ ] Barrel exports sạch (không expose internal helpers)

## 16. FAQ Nhanh
**Q: Khi nào chia service server/client?**  
A: Khi cùng domain vừa cần SEO fetch (server) vừa cần tương tác mutation (client).

**Q: Có thể import trực tiếp file trong feature khác để dùng component internal?**  
A: Không. Tạo export chính thức hoặc di chuyển component đó lên shared nếu generic.

**Q: Làm sao tránh vòng lặp import giữa hai feature?**  
A: Trích types chung ra `@packages/dto`, dùng event/callback thay vì import ngược.

## 17. Liên Kết
- `../ARCHITECTURE.md`
- `./NEXTJS_15_APP_ROUTER_GUIDE.md`
- `./FEATURE_IMPLEMENTATION_GUIDE.md`
- `./ONBOARDING_CHECKLIST.md`

---
Last Updated: 2026-01-20

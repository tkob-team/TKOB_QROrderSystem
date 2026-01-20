# ONBOARDING CHECKLIST (Frontend)

> Mục tiêu: Giúp dev mới tham gia nhanh vào dự án frontend (web-tenant & web-customer). Ngôn ngữ: tiếng Việt. Comment giải thích có thể English để rõ ràng.

## 1. Prerequisites (Yêu Cầu Ban Đầu)
| Thành phần | Phiên bản khuyến nghị | Ghi chú |
|------------|-----------------------|--------|
| Node.js | >= 20.x | Kiểm tra bằng `node -v` |
| pnpm | >= 9.x | Cài: `npm i -g pnpm` |
| Git | Latest stable | |
| Editor | VSCode | Extensions: ESLint, Tailwind CSS IntelliSense |

Optional (sau):
- Chrome DevTools Performance
- React Developer Tools

## 2. Clone & Cài Đặt
```bash
# Clone repo
# ⏳ ADD HERE: Replace <REPO_URL> with actual repository URL
git clone <REPO_URL> TKOB_QROrderSystem
cd TKOB_QROrderSystem

# Cài dependencies toàn monorepo
pnpm install
```

## 3. Chạy Ứng Dụng Dev
```bash
# Portal (web-tenant) - navigate to app folder and run dev
cd source/apps/web-tenant
pnpm dev

# Customer app (web-customer) - in separate terminal
cd source/apps/web-customer
pnpm dev
```

**Alternative (if package names verified):**
```bash
# ⏳ ADD HERE: Verify package names in source/apps/*/package.json ("name" field)
# Then use: pnpm --filter <package-name> dev
```

**Ports:** web-tenant runs on port 3002, web-customer on port 3001 (verified in source/apps/*/package.json dev scripts).

## 4. Cấu Trúc Chính Cần Biết Nhanh
```
source/apps/web-tenant/src/
  app/          # Next.js App Router pages/layouts (presentation)
  features/     # Domain features (auth, menu-management, analytics...)
  shared/       # Reusable UI, hooks, contexts
  lib/          # Infrastructure (api client, helpers)

source/apps/web-customer/src/
  app/
  features/
  shared/
  lib/
```

## 5. Thứ Tự Đọc Tài Liệu Khuyến Nghị
1. `guide/ONBOARDING_CHECKLIST.md` (file này)
2. `guide/NEXTJS_15_APP_ROUTER_GUIDE.md` – Hiểu App Router
3. `guide/PATTERNS_AND_CONVENTIONS.md` – Quy ước code
4. `guide/FEATURE_IMPLEMENTATION_GUIDE.md` – Ví dụ triển khai feature Analytics
5. `../ARCHITECTURE.md` – Bức tranh tổng quan
6. `../ORVAL.md` – API codegen (nếu dùng Orval) / tương tự
7. `../RBAC_GUIDE.md` (nếu tồn tại) – Phân quyền

## 6. Nhiệm Vụ Đầu Tiên Gợi Ý
| Nhiệm vụ | Mục tiêu học |
|----------|--------------|
| Thêm mục navigation mới giả lập | Hiểu layout & route admin |
| Viết 1 hook nhỏ `useDebouncedValue` ở shared/hooks | Hiểu pattern custom hook |
| Thêm KPI card mới vào Dashboard (clone dạng có sẵn) | Hiểu feature composition |
| Tạo 1 page đơn giản `/admin/test-lab` dùng layout admin | Nắm App Router + RBAC |

## 7. Quy Trình Thêm Feature Mới (Tóm Tắt)
1. Tạo thư mục `features/<feature-name>/` theo template.
2. Tạo `types` trước → rõ dữ liệu.
3. Service server/client (nếu cần). Không mix axios vào server component.
4. Hooks: truy xuất data + xử lý business.
5. Components: chia nhỏ (KPI grid, chart...).
6. Page wrapper trong `app/admin/.../page.tsx` import từ feature.
7. Thêm vào sidebar / navigation.
8. Test tối thiểu cho 1 hook hoặc helper quan trọng.

## 8. Quy Tắc Code Nhanh
| Chủ đề | Quy tắc |
|--------|---------|
| Imports | Dùng path alias `@/` + barrel tổng |
| Layering | Không import ngược từ shared vào feature logic cụ thể nếu có vòng phụ thuộc |
| Component | < 200 dòng, tách logic ra hook |
| Env vars | `NEXT_PUBLIC_` cho client, bí mật để server-only |
| State server | React Query (server state) - ⏳ ADD HERE: verify @tanstack/react-query in package.json |
| State client | Zustand - ⏳ ADD HERE: verify zustand in package.json |
| SSR fetch | Dùng `fetch(process.env.*)` trong server component - ⏳ ADD HERE: verify env var names in source/apps/*/.env.example |

## 9. Kiểm Tra Trước Khi Mở PR
- [ ] Tên file & thư mục đúng convention
- [ ] Không commit file lạ (node_modules, lock ngoài root)
- [ ] Không dùng hard-coded secrets / URL
- [ ] Hook có error handling (console.error + UI fallback)
- [ ] RBAC: trang admin bọc `RoleGuard`
- [ ] Query key stable, đủ tham số
- [ ] Không deep import vào folder con feature khác

## 10. Troubleshooting Nhanh
| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| `window is not defined` | Dùng browser API trong Server Component | Thêm `'use client'` hoặc tách code |
| Axios 401 logout không chạy | Thiếu interceptor (if present) | Kiểm tra `lib/api/` cho interceptor setup |
| Không load được style | Thiếu import globals.css trong layout | Kiểm tra `app/layout.tsx` |
| RoleGuard luôn chặn | Sai role hoặc context auth chưa khởi tạo | In ra `user.role` debug |
| Query không refetch | Thiếu invalidation sau mutation | `queryClient.invalidateQueries([...])` |

## 11. Best Practices Tích Lũy
- Tách service server/client khi cần tối ưu SEO + interactive.
- Luôn định nghĩa types trước để tránh phình logic.
- Prefetch data quan trọng ở server nếu ảnh hưởng FCP.
- Dùng dynamic import cho chart / bản đồ / editor.
- Giữ hook thuần (ít JSX); component chỉ trình bày.

## 12. Roadmap Học Tiếp
| Giai đoạn | Nội dung |
|-----------|----------|
| Tuần 1 | Routing, layout, RBAC, đọc code hiện có |
| Tuần 2 | Thêm feature nhỏ, viết hooks & test |
| Tuần 3 | Performance tối ưu (dynamic import, memo) |
| Tuần 4 | Codegen API nâng cao, analytics mở rộng |

## 13. Liên Kết Nhanh
- `./NEXTJS_15_APP_ROUTER_GUIDE.md`
- `./PATTERNS_AND_CONVENTIONS.md`
- `./FEATURE_IMPLEMENTATION_GUIDE.md`
- `../ARCHITECTURE.md`
- `../ORVAL.md`

## 14. FAQ
**Q: Em muốn biết service nào nên server vs client?**  
A: Nếu chỉ đọc dữ liệu + cần SEO → server. Nếu cần auth token, interactive filter nhanh → client.

**Q: Có cần tạo index.ts cho mọi folder?**  
A: Cho feature chính có khả năng tái sử dụng hoặc import nhiều nơi. Folder nhỏ đơn lẻ có thể bỏ qua nhưng nên thống nhất.

**Q: Khi nào dùng ISR (`revalidate`)?**  
A: Dữ liệu thay đổi theo chu kỳ (danh mục, thống kê ngày) không cần realtime tuyệt đối.

---
Last Updated: 2026-01-20

# Frontend Guide Index (Mục Lục Tài Liệu Hướng Dẫn)

> Đây là điểm bắt đầu cho mọi tài liệu hướng dẫn liên quan đến frontend của dự án. Tất cả các file trong thư mục `guide/` được viết để hỗ trợ dev mới onboard nhanh, duy trì chất lượng code và mở rộng hệ thống đúng chuẩn kiến trúc.

## 1. Danh Sách Guide
| Tài liệu | Mục đích |
|----------|---------|
| `ONBOARDING_CHECKLIST.md` | Checklist vào dự án, nhiệm vụ đầu tiên, quy tắc nhanh |
| `NEXTJS_15_APP_ROUTER_GUIDE.md` | Giải thích App Router, Server/Client Components, routing nâng cao |
| `PATTERNS_AND_CONVENTIONS.md` | Quy ước tổ chức feature, đặt tên, hooks, services, import rules |
| `FEATURE_IMPLEMENTATION_GUIDE.md` | Ví dụ triển khai đầy đủ 1 feature (Analytics Dashboard) từng bước |

## 2. Thứ Tự Đọc Khuyến Nghị
1. `ONBOARDING_CHECKLIST.md`
2. `NEXTJS_15_APP_ROUTER_GUIDE.md`
3. `PATTERNS_AND_CONVENTIONS.md`
4. `FEATURE_IMPLEMENTATION_GUIDE.md`
5. `../ARCHITECTURE.md` (bức tranh tổng quan)
6. `../ORVAL.md` (nếu làm việc với API codegen)
7. `../RBAC_GUIDE.md` (nếu cần hiểu phân quyền)

## 3. Mục Tiêu Chung Các Guide
- Giảm thời gian làm quen cấu trúc dự án.
- Thống nhất pattern tránh nợ kỹ thuật sớm.
- Hỗ trợ mở rộng: thêm feature mới ít xung đột.
- Làm rõ ranh giới layer: presentation / domain / shared / infrastructure.

## 4. Nguyên Tắc Viết Code (Tóm Tắt)
| Chủ đề | Quy chuẩn |
|--------|-----------|
| Page (App Router) | Mỏng, import từ `features/` |
| Feature | Tự chứa: components/hooks/services/types/utils + barrel export |
| Shared | Không chứa logic nghiệp vụ đặc thù |
| Service | Tách server (`fetch`) vs client (Axios) khi cần |
| State | React Query cho server state, Zustand cho client ephemeral |
| Env Vars | `NEXT_PUBLIC_` cho client, server-only bí mật không prefix |
| Import | Path alias `@/` + barrel, tránh deep import giữa feature |

## 5. Flow Thêm Feature Mới (Tóm Tắt)
1. Tạo folder `features/<tenancy|analytics|orders>/` theo template.
2. Định nghĩa `types` trước.
3. Viết server service (nếu cần SSR) + client service (nếu mutation / interactive).
4. Viết hooks truy xuất + combine logic.
5. Tạo UI components nhỏ (< 200 dòng mỗi cái).
6. Tạo page wrapper trong `app/.../page.tsx`.
7. Áp dụng RBAC bằng `RoleGuard` hoặc middleware.
8. Thêm navigation.
9. Viết test tối thiểu 1 hook hoặc utils quan trọng.
10. Tối ưu (dynamic import, memo) nếu cần.

## 6. F.A.Q Nhanh
**Q: Em nên đọc file nào đầu tiên?**  
A: Bắt đầu với `ONBOARDING_CHECKLIST.md` để biết tổng quan công việc.

**Q: Khi nào cần tạo service server riêng?**  
A: Khi muốn SSR + SEO + giảm JS bundle cho dữ liệu read-only.

**Q: Em có thể import trực tiếp component nội bộ của feature khác không?**  
A: Không. Dùng barrel export hoặc refactor component vào shared nếu thực sự generic.

**Q: Làm sao kiểm tra nhanh code không vi phạm layering?**  
A: Không để `features/*` import từ `app/`, không để `shared/*` import từ `features/*`.

## 7. Gợi Ý Cải Tiến Tương Lai
| Ý tưởng | Lợi ích |
|---------|---------|
| Thêm guide về Testing Strategy chi tiết | Chuẩn hoá test coverage |
| Thêm performance playbook | Giảm thời gian phân tích khi scale |
| Thêm style guide UI (design tokens) | Nhất quán giao diện |
| Thêm devtools script (prefetch) | Cải thiện DX |

## 8. Cập Nhật & Bảo Trì
- Mỗi lần thêm feature lớn mới: cân nhắc cập nhật `FEATURE_IMPLEMENTATION_GUIDE.md` hoặc tạo guide riêng.
- Khi thay đổi kiến trúc: sửa `../ARCHITECTURE.md` và bổ sung tham chiếu tại đây.
- Định kỳ (mỗi sprint): review các guide để tránh lỗi thời.

## 9. Liên Kết Ngoài
- Next.js Docs: https://nextjs.org/docs/app
- TanStack Query: https://tanstack.com/query/latest
- Zustand: https://github.com/pmndrs/zustand
- TailwindCSS: https://tailwindcss.com/

## 10. Đóng Góp vào Guide
| Bước | Hành động |
|------|-----------|
| 1 | Tạo nhánh mới `docs/<topic>` |
| 2 | Viết hoặc cập nhật file trong `guide/` |
| 3 | Thêm mục vào bảng Danh Sách Guide nếu là file mới |
| 4 | Mở PR, tag người review chính (Lead Dev) |
| 5 | Merge sau khi được approve |

---
Last Updated: 2026-01-20

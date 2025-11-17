# Tài liệu Dự án - Unified Restaurant Ordering Platform

Chào mừng thành viên mới! Đây là **trung tâm tài liệu** cho dự án của chúng ta.

Để bắt đầu, vui lòng đọc theo "luồng" (flow) được khuyến nghị dưới đây để hiểu rõ về dự án và bắt đầu công việc một cách nhanh nhất.

--- 

Repo này được chia nhỏ để **tách biệt tài liệu theo từng phần**:

- `./backend/` – Code & tài liệu dành riêng cho **Backend** (NestJS, API, DB, v.v.).
- `./frontend/` – Code & tài liệu dành riêng cho **Frontend** (React/Next.js, UI, v.v.).
- `./common/` – Tài liệu **dùng chung cho cả nhóm** (kickoff, kiến trúc tổng, OpenAPI, quy ước làm việc, v.v.).
- `./report/` – Khung **báo cáo chính thức** theo các file/report mà thầy cung cấp (sẽ dùng khi viết báo cáo cuối kỳ / nộp đồ án).

Nếu bạn:
- Muốn viết thêm docs **chỉ cho backend** → đặt trong `./backend/`.
- Muốn viết docs **chỉ cho frontend** → đặt trong `./frontend/`.
- Muốn viết docs **cho toàn bộ hệ thống / cả nhóm** → đặt trong `./common/`.
- Muốn soạn **báo cáo nộp thầy** → chỉnh sửa/điền nội dung vào `./report/`.

---

## 🧭 Luồng đọc tài liệu (Reading Flow khuyến nghị)

Hãy đọc theo thứ tự sau để nắm dự án nhanh nhất:

### 1. 🚀 (Đọc đầu tiên) Tổng quan Dự án

- **File:** [`./common/project-kickoff-summary.md`](./common/project-kickoff-summary.md)
- **Mục đích:** File này là **quan trọng nhất**. Nó trả lời:
  - Dự án này là gì? (Vision & OKRs)
  - Chúng ta giải quyết vấn đề gì? (Problem & Business Goals)
  - MVP gồm những gì? (MVP Scope)
  - Kiến trúc hệ thống & Tech Stack ra sao?
  - Luồng nghiệp vụ chính hoạt động như thế nào? (Key Flows: QR, Ordering, Order State Machine, v.v.)

### 2. 💻 Hướng dẫn Cài đặt & Chạy Dự án

- **File:** [`./common/SETUP.md`](./common/SETUP.md)
- **Mục đích:** Hướng dẫn chi tiết (từng bước) để:
  - Cài đặt tool cần thiết (Node, DB, v.v.).
  - Clone repo, cấu hình `.env`.
  - Chạy backend + frontend trên máy local.
  - Chạy migration, seed dữ liệu demo.

> Sau khi đọc xong 1 & 2, bạn đã có thể **chạy được dự án local** và hiểu sơ sơ hệ thống.

### 3. 📜 (Bắt buộc) Quy ước Làm việc Nhóm

- **File:** [`./common/CONTRIBUTING.md`](./common/CONTRIBUTING.md)
- **Mục đích:** Đây là **“bộ luật” của nhóm**:
  - Cách đặt tên branch, flow Git (`main`, `develop`, `feature/*`, v.v.).
  - Quy ước commit (ví dụ: Conventional Commits).
  - Quy trình tạo & review Pull Request (PR).
  - Yêu cầu về code style, testing trước khi merge.
  - Definition of Done (điều kiện 1 task/story được coi là xong).

> Vui lòng đọc kỹ và **tuân theo** để tránh conflict về sau.

---

## 🛠️ Hướng dẫn cho Developer theo từng mảng

Sau khi đã đọc 3 file trên, bạn có thể đi sâu hơn theo role của mình.

### 🔙 Dành cho Backend Developer

- **Kiến trúc & mô-đun backend:**
  - [`./backend/README.md`](./backend/README.md)  
    → Giải thích cấu trúc thư mục backend, các module chính (Auth, Tenant, Menu, Order, Payment, v.v.).

- **Hợp đồng API (REST):**
  - [`./common/OPENAPI.md`](./common/OPENAPI.md)  
    → Giới thiệu spec OpenAPI, cách xem `openapi.yaml`, conventions (base URL, auth, error format, v.v.).

- **Các docs khác cho backend (tuỳ chọn):**
  - Đặt thêm trong [`./backend/`](./backend/) nếu bạn cần:
    - `backend/ARCHITECTURE.md` (kiến trúc chi tiết backend)
    - `backend/DECISIONS.md` (lý do chọn kỹ thuật)
    - `backend/docs/` (tài liệu module-level)

### 🖥️ Dành cho Frontend Developer

- **Kiến trúc & cấu trúc component:**
  - [`./frontend/README.md`](./frontend/README.md)  
    → Giải thích cấu trúc Next.js/React, layout chính, pages, routes, state management, UI library, v.v.

- **Cách gọi API backend:**
  - [`./common/OPENAPI.md`](./common/OPENAPI.md)  
    → Xem các route, request/response, status code để implement call từ frontend.

- **Docs riêng cho frontend (tuỳ chọn):**
  - Bạn có thể thêm:
    - `frontend/ARCHITECTURE.md` (pattern sử dụng: hooks, context, state, v.v.)
    - `frontend/UX_GUIDELINES.md` (rule về UI/UX chung)
    - Hoặc folder `frontend/docs/` cho các note chi tiết.

---

## 📚 Tài liệu dùng chung (Common Docs)

Toàn bộ tài liệu mang tính **toàn cục** cho dự án sẽ nằm trong `./common/`, ví dụ:

- [`project-kickoff-summary.md`](./common/project-kickoff-summary.md) – Bản tóm tắt khởi động dự án (Vision, Scope, Architecture, Flows).
- [`docs-plan-vi.md`](./common/docs-plan-vi.md) – Kế hoạch cấu trúc toàn bộ tài liệu.
- [`OPENAPI.md`](./common/OPENAPI.md) – Overview cho OpenAPI + link tới file `openapi.yaml`.
- [`ARCHITECTURE.md`](./common/ARCHITECTURE.md), [`ER_DIAGRAM.md`](./common/ER_DIAGRAM.md) – Kiến trúc toàn hệ thống, mô hình dữ liệu (nếu có).
- [`TEST_STRATEGY.md`](./common/TEST_STRATEGY.md), [`THREAT_MODEL.md`](./common/THREAT_MODEL.md), v.v. – Các tài liệu về chất lượng, bảo mật, QA.
> Nguyên tắc:  
> - **Docs nào liên quan đến nhiều phần (FE + BE + OPS)** → đặt vào `./common/`.  
> - **Docs chỉ liên quan đến một phần** → đặt trong thư mục tương ứng (`./backend/` hoặc `./frontend/`).

---

## 📝 Thư mục `./report/` – Báo cáo nộp thầy

Thư mục [`./report/`](./report/) chứa **các file report** được tổ chức theo **khung sườn mà thầy đã cung cấp** (ví dụ: SRS, kiến trúc, test plan, risk, v.v.).

- Bạn có thể mở từng file `.md` bên trong để:
  - Biết **mỗi file report tương ứng với yêu cầu nào** của thầy.
  - Điền nội dung dựa trên tài liệu đã build trong [`./common/`](./common/), [`./backend/`](./backend/), [`./frontend/`](./frontend/).

Gợi ý workflow:
1. Viết & refine nội dung kỹ thuật ở [`./common/`](./common/), [`./backend/`](./backend/), [`./frontend/`](./frontend/).
2. Khi gần đến hạn nộp, **tổng hợp lại** thành report chính thức ở [`./report/`](./report/) (theo format/đề cương thầy yêu cầu).
---

## 🔚 Kết luận

Nếu bạn mới join dự án, hãy:

1. Đọc **[`./common/project-kickoff-summary.md`](./common/project-kickoff-summary.md)** để nắm tổng quan.
2. Làm theo **[`./common/SETUP.md`](./common/SETUP.md)** để chạy được dự án.
3. Đọc **[`./common/CONTRIBUTING.md`](./common/CONTRIBUTING.md)** để hiểu cách làm việc chung.
4. Sau đó:
   - Nếu làm backend → vào [`./backend/`](./backend/).
   - Nếu làm frontend → vào [`./frontend/`](./frontend/).
   - Nếu chuẩn bị báo cáo → vào [`./report/`](./report/).

Chúc bạn onboard nhanh & code vui! 🚀

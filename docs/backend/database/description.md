# TÀI LIỆU LƯỢC ĐỒ CƠ SỞ DỮ LIỆU

- **Phiên bản**: 3.0
- **Cập nhật lần cuối**: 2026-01-20
- **Cơ sở dữ liệu**: PostgreSQL với Prisma ORM
- **Migrations**: 21 migrations được áp dụng (từ 2026-01-20) (xem [thư mục migrations](../../../source/apps/api/prisma/migrations/))

---

## Mục lục

1. [Tổng quan lược đồ](#tổng-quan-lược-đồ)
2. [Mô hình miền](#mô-hình-miền)
   - [Miền Tenants](#1-miền-tenants)
   - [Người dùng & Xác thực](#2-người-dùng--xác-thực)
   - [Quản lý nhân viên](#3-quản-lý-nhân-viên)
   - [Bàn & Phiên](#4-bàn--phiên)
   - [Quản lý menu](#5-quản-lý-menu)
   - [Giỏ hàng](#6-giỏ-hàng)
   - [Đơn hàng](#7-đơn-hàng)
   - [Thanh toán](#8-thanh-toán)
   - [Hóa đơn](#9-hóa-đơn)
   - [Đăng ký](#10-đăng-ký)
   - [Khuyến mãi](#11-khuyến-mãi)
   - [Đánh giá](#12-đánh-giá)
3. [Tham chiếu Enums](#tham-chiếu-enums)
4. [Tài liệu liên quan](#tài-liệu-liên-quan)

---

## Tổng quan lược đồ

### Cách ly tenant đa nhân viên

**Mô hình**: Thực thi mức ứng dụng với trường `tenantId`

- Mỗi bảng có phạm vi tenant bao gồm khóa ngoài `tenant_id`
- Middleware Prisma tự động lọc các truy vấn theo `tenantId`
- Các chỉ mục tổng hợp trên `(tenant_id, ...)` để có hiệu suất tốt
- Xoá dây chuyền khi tenant bị xoá

**Ghi chú**: Row-Level Security (RLS) ở cấp độ cơ sở dữ liệu được lên kế hoạch nhưng hiện chưa được triển khai.

### Quy ước đặt tên

- **Bảng**: Chữ thường snake_case số nhiều (ví dụ: `menu_items`, `order_status_history`)
- **Cột**: Chữ thường snake_case (ví dụ: `created_at`, `tenant_id`)
- **Khóa chính**: UUID v4 (`@id @default(uuid())`)
- **Khóa ngoài**: Mô hình `{entity}_id` (ví dụ: `tenant_id`, `order_id`)
- **Dấu thời gian**: `created_at`, `updated_at` trên tất cả các bảng
- **Xoá mềm**: Cờ boolean `active` nếu áp dụng

### Các ràng buộc chính

- **Tính duy nhất**: `slug` duy nhất toàn cầu, `email` duy nhất toàn cầu, bàn `number` duy nhất cho mỗi tenant
- **Xoá dây chuyền**: Các bản ghi con bị xoá khi tenant cha bị xoá
- **Xoá giới hạn**: Khóa ngoài đến MenuItem, MenuCategory sử dụng RESTRICT để ngăn xoá vô tình

---

## Mô hình miền

### 1. Miền Tenants

**Mục đích**: Cách ly tenant đa nhân viên cốt lõi. Mỗi tenant đại diện cho một nhà hàng/kinh doanh thực phẩm.

**Bảng**: `tenants`, `tenant_payment_configs`, `tenant_subscriptions`

#### TENANT

| Trường           | Kiểu         | Ràng buộc                | Mô tả                                    |
| --------------- | ------------ | -------------------------- | ---------------------------------------------- |
| id              | UUID         | PK                         | Khóa chính                                    |
| name            | String       | Bắt buộc                   | Tên nhà hàng                                |
| slug            | String       | Duy nhất toàn cầu            | Định danh thân thiện với URL (ví dụ: "pho-hung")     |
| status          | Enum         | Mặc định: DRAFT             | TenantStatus: DRAFT, ACTIVE, SUSPENDED         |
| settings        | JSON         | Mặc định: {}                | Cấu hình linh hoạt: mô tả, điện thoại, địa chỉ   |
| opening_hours   | JSON         | Có thể rỗng                   | Cấu hình giờ kinh doanh                   |
| onboarding_step | Int          | Mặc định: 1                 | Bộ theo dõi tiến độ onboarding (1-5)              |
| created_at      | DateTime     | Tự động                       | Dấu thời gian tạo                             |
| updated_at      | DateTime     | Tự động                       | Dấu thời gian cập nhật cuối                          |

**Quan hệ**: users, paymentConfig, menuItems, tables, orders, carts, subscriptions, bills

**Quy tắc kinh doanh**:
- Slug phải duy nhất cho định tuyến tên miền con
- Trạng thái DRAFT → ACTIVE sau khi hoàn thành onboarding
- Xoá dây chuyền tất cả dữ liệu tenant khi bị xoá

#### TENANT_PAYMENT_CONFIG

| Trường            | Kiểu    | Ràng buộc       | Mô tả                                  |
| ---------------- | ------- | ----------------- | -------------------------------------------- |
| id               | UUID    | PK                | Khóa chính                                  |
| tenant_id        | UUID    | FK, Duy nhất (1:1)  | Liên kết đến tenant                              |
| sepay_enabled    | Boolean | Mặc định: false    | Tích hợp SePay VietQR được bật             |
| sepay_api_key    | String  | Có thể rỗng          | Khóa API SePay (được mã hóa)                    |
| sepay_account_no | String  | Có thể rỗng          | Số tài khoản ngân hàng cho VietQR               |
| sepay_account_name | String  | Có thể rỗng          | Tên chủ tài khoản ngân hàng                     |
| sepay_bank_code  | String  | Có thể rỗng          | Mã ngân hàng (MB, VCB, ACB, v.v.)               |
| webhook_secret   | String  | Có thể rỗng          | Xác minh chữ ký webhook                               |
| webhook_enabled  | Boolean | Mặc định: false    | Trạng thái tích hợp webhook                   |

**Quy tắc kinh doanh**:
- Một cấu hình cho mỗi tenant (quan hệ 1:1)
- Khóa API được lưu trữ được mã hóa
- ✅ **Triển khai**: Nhà cung cấp thanh toán SePay VietQR

---

### 2. Người dùng & Xác thực

**Mục đích**: Tài khoản người dùng, vai trò và quản lý phiên cho nhân viên/chủ sở hữu.

**Bảng**: `users`, `user_sessions`

#### USER

| Trường         | Kiểu     | Ràng buộc             | Mô tả                             |
| ------------- | -------- | ----------------------- | --------------------------------------- |
| id            | UUID     | PK                      | Khóa chính                             |
| email         | String   | Duy nhất toàn cầu         | Email đăng nhập                             |
| password_hash | String   | Bắt buộc                | Mật khẩu được mã hóa Bcrypt                  |
| full_name     | String   | Bắt buộc                | Tên đầy đủ của người dùng                          |
| avatar_url    | String   | Có thể rỗng                | URL hình đại diện người dùng                 |
| role          | Enum     | Mặc định: STAFF          | UserRole: OWNER, STAFF, KITCHEN         |
| status        | Enum     | Mặc định: PENDING        | UserStatus: ACTIVE, INACTIVE, PENDING, LOCKED |
| tenant_id     | UUID     | FK                      | Liên kết đến tenant                         |
| created_at    | DateTime | Tự động                    | Dấu thời gian tạo                      |
| updated_at    | DateTime | Tự động                    | Dấu thời gian cập nhật cuối                   |

**Chỉ mục**: `(tenant_id, email)` để tìm kiếm nhanh theo phạm vi tenant

**Quan hệ**: sessions, tenant

**Quy tắc kinh doanh**:
- Email duy nhất toàn cầu (được thực thi bằng ràng buộc @unique trong lược đồ)
- Trạng thái PENDING cho đến khi email được xác minh hoặc quản trị viên phê duyệt
- Vai trò OWNER có quyền truy cập đầy đủ, STAFF có quyền truy cập hạn chế, KITCHEN chỉ xem KDS
- Xoá dây chuyền các phiên khi người dùng bị xoá

#### USER_SESSION

| Trường              | Kiểu     | Ràng buộc | Mô tả                            |
| ------------------ | -------- | ----------- | -------------------------------------- |
| id                 | UUID     | PK          | Khóa chính                            |
| user_id            | UUID     | FK          | Liên kết đến người dùng                          |
| refresh_token_hash | String   | Bắt buộc    | Mã hash refresh token (JWT)             |
| device_info        | String   | Có thể rỗng    | Thông tin trình duyệt/thiết bị                    |
| last_used_at       | DateTime | Tự động        | Dấu thời gian hoạt động cuối                |
| expires_at         | DateTime | Bắt buộc    | Thời gian hết hạn phiên                |
| created_at         | DateTime | Tự động        | Dấu thời gian tạo                     |

**Quy tắc kinh doanh**:
- Cho phép nhiều phiên hoạt động cho mỗi người dùng
- Các refresh token được lưu trữ chỉ dưới dạng hash (không bao giờ plaintext)
- Tự động dọn dẹp các phiên hết hạn thông qua công việc nền

---

### 3. Quản lý nhân viên

**Mục đích**: Mời và onboarding các thành viên nhân viên mới.

**Bảng**: `staff_invitations`

#### STAFF_INVITATION

| Trường      | Kiểu     | Ràng buộc         | Mô tả                               |
| ---------- | -------- | ------------------- | ----------------------------------------- |
| id         | UUID     | PK                  | Khóa chính                               |
| tenant_id  | UUID     | FK                  | Liên kết đến tenant                           |
| email      | String   | Bắt buộc            | Địa chỉ email được mời                     |
| role       | Enum     | Mặc định: STAFF      | UserRole để gán                        |
| token      | String   | Duy nhất toàn cầu     | Mã thông báo mời bảo mật                       |
| expires_at | DateTime | Bắt buộc            | Hết hạn lời mời (mặc định 7 ngày)        |
| used_at    | DateTime | Có thể rỗng            | Dấu thời gian khi lời mời được chấp nhận        |
| invited_by | UUID     | Bắt buộc            | ID người dùng của người mời                        |
| created_at | DateTime | Tự động                | Dấu thời gian tạo                        |

**Chỉ mục**: `(tenant_id, email)`, `(token)`

**Quy tắc kinh doanh**:
- Mã thông báo hết hạn sau 7 ngày
- Đánh dấu là đã sử dụng (`used_at`) khi được chấp nhận
- Một lời mời cho mỗi email cho mỗi tenant (có thể gửi lại nếu hết hạn)

---

### 4. Bàn & Phiên

**Mục đích**: Quản lý bàn nhà hàng với bảo mật mã QR và theo dõi phiên.

**Bảng**: `tables`, `table_sessions`

#### TABLE

| Trường               | Kiểu     | Ràng buộc                | Mô tả                                    |
| ------------------- | -------- | -------------------------- | ---------------------------------------------- |
| id                  | UUID     | PK                         | Khóa chính                                    |
| tenant_id           | UUID     | FK                         | Liên kết đến tenant                                |
| table_number        | String   | Duy nhất trên mỗi tenant          | Định danh bàn (ví dụ: "Bàn 1", "A1")       |
| capacity            | Int      | Mặc định: 4, Phạm vi: 1-20    | Số lượng khách tối đa                       |
| location            | String   | Có thể rỗng                   | Vị trí vật lý (Tầng 1, Sân hiên)           |
| description         | String   | Có thể rỗng                   | Ghi chú bổ sung                                |
| status              | Enum     | Mặc định: AVAILABLE         | TableStatus: AVAILABLE, OCCUPIED, RESERVED, INACTIVE |
| qr_token            | String   | Duy nhất toàn cầu, Có thể rỗng  | Mã thông báo mã QR được ký HMAC                      |
| qr_token_hash       | String   | Có thể rỗng                   | Mã hash SHA256 để xác thực                     |
| qr_token_created_at | DateTime | Có thể rỗng                   | Dấu thời gian tạo mã QR                   |
| qr_invalidated_at   | DateTime | Có thể rỗng                   | Khi mã QR được tạo lại/bị vô hiệu hóa            |
| current_session_id  | UUID     | Có thể rỗng                   | Tham chiếu phiên hoạt động                       |
| display_order       | Int      | Mặc định: 0                 | Thứ tự sắp xếp hiển thị                          |
| active              | Boolean  | Mặc định: true              | Cờ xoá mềm                               |

**Chỉ mục**: `(tenant_id, status)`, `(tenant_id, active)`, `(qr_token)`, `(current_session_id)`

**Quan hệ**: sessions, orders, carts, bills, tenant

**Quy tắc kinh doanh**:
- `table_number` duy nhất trên mỗi tenant (ví dụ: không thể có hai "Bàn 1")
- Mã thông báo QR duy nhất toàn cầu để bảo mật
- Trạng thái OCCUPIED khi tồn tại phiên hoạt động
- Vô hiệu hóa QR cũ khi tạo lại (biện pháp bảo mật)

#### TABLE_SESSION

| Trường      | Kiểu     | Ràng buộc | Mô tả                                 |
| ---------- | -------- | ----------- | ------------------------------------------- |
| id         | UUID     | PK          | Khóa chính                                 |
| table_id   | UUID     | FK          | Liên kết đến bàn                              |
| tenant_id  | UUID     | FK          | Liên kết đến tenant                             |
| scanned_at | DateTime | Tự động        | Khi khách hàng quét mã QR                    |
| active     | Boolean  | Mặc định: true | Trạng thái phiên hoạt động                     |
| cleared_at | DateTime | Có thể rỗng    | Khi nhân viên xóa/đóng phiên           |
| cleared_by | UUID     | Có thể rỗng    | ID người dùng nhân viên đã xóa phiên           |

**Chỉ mục**: `(table_id, active)`, `(tenant_id, active)`, `(active, created_at)`

**Quy tắc kinh doanh**:
- Một phiên hoạt động trên mỗi bàn (kiểu Haidilao)
- Nhân viên điều khiển khi bàn trống (cleared_at)
- Theo dõi lịch sử phiên để phân tích

---

### 5. Quản lý menu

**Mục đích**: Cấu trúc menu với danh mục, mục, bộ sửa đổi và ảnh.

**Bảng**: `menu_categories`, `menu_items`, `menu_item_photos`, `modifier_groups`, `modifier_options`, `menu_item_modifiers`

#### MENU_CATEGORY

| Trường         | Kiểu     | Ràng buộc            | Mô tả                          |
| ------------- | -------- | ---------------------- | ------------------------------------ |
| id            | UUID     | PK                     | Khóa chính                          |
| tenant_id     | UUID     | FK                     | Liên kết đến tenant                      |
| name          | String   | Duy nhất trên mỗi tenant      | Tên danh mục                        |
| description   | String   | Có thể rỗng               | Mô tả danh mục                 |
| display_order | Int      | Mặc định: 0             | Thứ tự sắp xếp hiển thị                |
| active        | Boolean  | Mặc định: true          | Cờ hiển thị                      |

**Chỉ mục**: `(tenant_id, active)`, `(tenant_id, display_order)`

**Ràng buộc duy nhất**: `(name, tenant_id)`

**Quy tắc kinh doanh**:
- Tên danh mục duy nhất trong tenant
- Danh mục không hoạt động bị ẩn khỏi menu khách hàng

#### MENU_ITEM

| Trường             | Kiểu     | Ràng buộc                | Mô tả                                       |
| ----------------- | -------- | -------------------------- | ------------------------------------------------- |
| id                | UUID     | PK                         | Khóa chính                                       |
| tenant_id         | UUID     | FK                         | Liên kết đến tenant                                   |
| category_id       | UUID     | FK (RESTRICT)              | Liên kết đến danh mục                                 |
| name              | String   | Duy nhất trên tenant+danh mục | Tên mục menu                                    |
| description       | String   | Có thể rỗng                   | Mô tả mục                                  |
| price             | Decimal  | Bắt buộc                   | Giá cơ sở (độ chính xác 10,2)                       |
| image_url         | String   | Có thể rỗng, Không dùng nữa       | Trường ảnh đơn lẻ kế thừa                         |
| status            | Enum     | Mặc định: DRAFT             | MenuItemStatus: DRAFT, PUBLISHED, ARCHIVED        |
| available         | Boolean  | Mặc định: true              | Tính khả dụng hàng tồn kho                                |
| display_order     | Int      | Mặc định: 0                 | Thứ tự sắp xếp hiển thị                             |
| preparation_time  | Int      | Có thể rỗng, Phạm vi: 0-240     | Thời gian chuẩn bị ước tính tính bằng phút                    |
| chef_recommended  | Boolean  | Mặc định: false             | Cờ nổi bật/được đề xuất                         |
| popularity        | Int      | Mặc định: 0                 | Điểm phổ biến được lưu vào bộ nhớ đệm để sắp xếp               |
| primary_photo_id  | UUID     | Có thể rỗng                   | Tham chiếu đến MenuItemPhoto chính                |
| tags              | JSON     | Mặc định: []                | Mảng thẻ (ví dụ: ["cay", "chay"])     |
| allergens         | JSON     | Mặc định: []                | Mảng chất gây dị ứng (ví dụ: ["hạt", "gluten"])     |
| published_at      | DateTime | Có thể rỗng                   | Khi mục được xuất bản                           |

**Chỉ mục**: `(tenant_id, status, available)`, `(tenant_id, category_id)`, `(tenant_id, popularity)`, `(tenant_id, chef_recommended)`

**Ràng buộc duy nhất**: `(name, tenant_id, category_id)`

**Quan hệ**: category, modifierGroups, photos, orderItems, cartItems, tenant

**Quy tắc kinh doanh**:
- Tên mục duy nhất trong phạm vi tenant+danh mục
- Trạng thái PUBLISHED bắt buộc để hiển thị cho khách hàng
- RESTRICT trên FK danh mục ngăn xoá danh mục vô tình
- Chỉ một ảnh chính trên mỗi mục

#### MENU_ITEM_PHOTO

| Trường         | Kiểu     | Ràng buộc | Mô tả                                 |
| ------------- | -------- | ----------- | ------------------------------------------- |
| id            | UUID     | PK          | Khóa chính                                 |
| menu_item_id  | UUID     | FK          | Liên kết đến mục menu                          |
| url           | String   | Bắt buộc    | URL hình ảnh đầy đủ (S3/Cloudinary hoặc cục bộ)     |
| filename      | String   | Bắt buộc    | Tên tệp được sanitized gốc                 |
| mime_type     | String   | Bắt buộc    | Loại MIME hình ảnh (image/jpeg, image/png)     |
| size          | Int      | Bắt buộc    | Kích thước tệp tính bằng byte                          |
| width         | Int      | Có thể rỗng    | Chiều rộng hình ảnh tính bằng pixel                       |
| height        | Int      | Có thể rỗng    | Chiều cao hình ảnh tính bằng pixel                       |
| display_order | Int      | Mặc định: 0  | Thứ tự sắp xếp hiển thị                       |
| is_primary    | Boolean  | Mặc định: false | Cờ hình ảnh chính (một trên mỗi mục)        |

**Chỉ mục**: `(menu_item_id)`, `(menu_item_id, is_primary)`

**Quy tắc kinh doanh**:
- Nhiều ảnh cho mỗi mục menu
- Chỉ một `is_primary = true` trên mỗi mục
- Xoá dây chuyền khi mục menu bị xoá
- ✅ **Triển khai**: Lưu trữ tệp cục bộ trong `uploads/menu-photos/`
- ❌ **Lên kế hoạch**: Lưu trữ đám mây (S3/Cloudflare R2)

#### MODIFIER_GROUP

| Trường         | Kiểu     | Ràng buộc | Mô tả                                        |
| ------------- | -------- | ----------- | -------------------------------------------------- |
| id            | UUID     | PK          | Khóa chính                                        |
| tenant_id     | UUID     | FK          | Liên kết đến tenant                                    |
| name          | String   | Bắt buộc    | Tên nhóm (ví dụ: "Kích thước", "Topping")              |
| description   | String   | Có thể rỗng    | Mô tả nhóm                                  |
| type          | Enum     | Bắt buộc    | ModifierType: SINGLE_CHOICE, MULTI_CHOICE          |
| required      | Boolean  | Mặc định: false | Khách hàng phải chọn từ nhóm này?           |
| min_choices   | Int      | Mặc định: 0  | Lựa chọn tối thiểu (cho MULTI_CHOICE)              |
| max_choices   | Int      | Có thể rỗng    | Lựa chọn tối đa (null = không giới hạn)              |
| display_order | Int      | Mặc định: 0  | Thứ tự sắp xếp hiển thị                              |
| active        | Boolean  | Mặc định: true | Cờ hiển thị                                  |

**Chỉ mục**: `(tenant_id, active)`

**Quan hệ**: options, menuItems (junction), tenant

**Quy tắc kinh doanh**:
- SINGLE_CHOICE: nút radio (ví dụ: Kích thước: S/M/L)
- MULTI_CHOICE: checkboxes (ví dụ: Topping: lựa chọn nhiều)
- `min_choices` và `max_choices` thực thi các quy tắc lựa chọn

#### MODIFIER_OPTION

| Trường         | Kiểu    | Ràng buộc | Mô tả                          |
| ------------- | ------- | ----------- | ------------------------------------ |
| id            | UUID    | PK          | Khóa chính                          |
| group_id      | UUID    | FK          | Liên kết đến nhóm bộ sửa đổi              |
| name          | String  | Bắt buộc    | Tên tùy chọn (ví dụ: "Lớn", "Phô mai thêm") |
| price_delta   | Decimal | Mặc định: 0  | Điều chỉnh giá (+/- từ cơ sở)     |
| display_order | Int     | Mặc định: 0  | Thứ tự sắp xếp hiển thị                |
| active        | Boolean | Mặc định: true | Cờ khả dụng                  |

**Chỉ mục**: `(group_id, active)`

**Quy tắc kinh doanh**:
- `price_delta` có thể dương (phụ tùng) hoặc zero (không tính phí)
- Xoá dây chuyền khi nhóm bộ sửa đổi bị xoá

#### MENU_ITEM_MODIFIER (Bảng Điểm nối)

| Trường             | Kiểu     | Ràng buộc | Mô tả                                     |
| ----------------- | -------- | ----------- | ----------------------------------------------- |
| menu_item_id      | UUID     | FK          | Liên kết đến mục menu                              |
| modifier_group_id | UUID     | FK          | Liên kết đến nhóm bộ sửa đổi                         |
| display_order     | Int      | Mặc định: 0  | Thứ tự hiển thị cho bộ sửa đổi này trong mục     |

**Khóa chính tổng hợp**: `(menu_item_id, modifier_group_id)`

**Chỉ mục**: `(menu_item_id)`, `(modifier_group_id)`

**Quy tắc kinh doanh**:
- Quan hệ nhiều-với-nhiều giữa các mục menu và nhóm bộ sửa đổi
- Xoá dây chuyền khi bất kỳ bên nào bị xoá

---

### 6. Giỏ hàng

**Mục đích**: Giỏ hàng bền bỉ cho khách hàng trước khi thanh toán.

**Bảng**: `carts`, `cart_items`

#### CART

| Trường      | Kiểu     | Ràng buộc         | Mô tả                                  |
| ---------- | -------- | ------------------- | -------------------------------------------- |
| id         | UUID     | PK                  | Khóa chính                                  |
| tenant_id  | UUID     | FK                  | Liên kết đến tenant                              |
| table_id   | UUID     | FK                  | Liên kết đến bàn                               |
| session_id | UUID     | Có thể rỗng            | Theo dõi phiên tùy chọn                    |
| expires_at | DateTime | Bắt buộc            | Hết hạn tự động sau 1 giờ không hoạt động       |

**Ràng buộc duy nhất**: `(table_id, session_id)`

**Chỉ mục**: `(expires_at)`, `(tenant_id, created_at)`

**Quy tắc kinh doanh**:
- Một giỏ hàng cho mỗi bàn+phiên kết hợp
- Dọn dẹp tự động thông qua công việc cron khi hết hạn
- Chuyển đổi giỏ hàng thành đơn hàng khi thanh toán

#### CART_ITEM

| Trường       | Kiểu    | Ràng buộc | Mô tả                                       |
| ----------- | ------- | ----------- | ------------------------------------------------- |
| id          | UUID    | PK          | Khóa chính                                       |
| cart_id     | UUID    | FK          | Liên kết đến giỏ hàng                                     |
| menu_item_id | UUID    | FK          | Liên kết đến mục menu                                |
| quantity    | Int     | Mặc định: 1  | Số lượng mục                                     |
| unit_price  | Decimal | Bắt buộc    | Ảnh chụp giá khi thêm                        |
| notes       | String  | Có thể rỗng    | Ghi chú khách hàng cho mục này                      |
| modifiers   | JSON    | Mặc định: [] | Mảng các bộ sửa đổi được chọn                          |

**Chỉ mục**: `(cart_id)`, `(menu_item_id)`

**Quy tắc kinh doanh**:
- Ảnh chụp `unit_price` khi thêm vào giỏ hàng
- Định dạng `modifiers` JSON: `[{ groupId, optionId, name, priceDelta }]`
- Xoá dây chuyền khi giỏ hàng bị xoá

---

### 7. Đơn hàng

**Mục đích**: Vòng đời đơn hàng từ lúc đặt đến hoàn thành.

**Bảng**: `orders`, `order_items`, `order_status_history`

#### ORDER

| Trường               | Kiểu     | Ràng buộc            | Mô tả                                          |
| ------------------- | -------- | ---------------------- | ---------------------------------------------------- |
| id                  | UUID     | PK                     | Khóa chính                                          |
| order_number        | String   | Được lập chỉ mục (không duy nhất)   | ID đơn hàng dễ đọc (ví dụ: "ORD-20260120-0001") |
| tenant_id           | UUID     | FK                     | Liên kết đến tenant                                      |
| table_id            | UUID     | FK (RESTRICT)          | Liên kết đến bàn                                       |
| session_id          | UUID     | Có thể rỗng               | Liên kết đến phiên bàn                               |
| customer_name       | String   | Có thể rỗng               | Tên khách hàng (tùy chọn)                             |
| customer_notes      | String   | Có thể rỗng               | Hướng dẫn đặc biệt                                 |
| status              | Enum     | Mặc định: PENDING       | OrderStatus (xem danh sách enum)                          |
| priority            | Enum     | Mặc định: NORMAL        | OrderPriority: NORMAL, HIGH, URGENT                  |
| subtotal            | Decimal  | Bắt buộc               | Tổng các mục trước khi điều chỉnh                      |
| tax                 | Decimal  | Mặc định: 0             | Số tiền thuế                                           |
| service_charge      | Decimal  | Mặc định: 0             | Số tiền phí dịch vụ                                         |
| tip                 | Decimal  | Mặc định: 0             | Số tiền tip                                           |
| total               | Decimal  | Bắt buộc               | Tổng số tiền cuối cùng                                   |
| estimated_prep_time | Int      | Có thể rỗng               | Thời gian chuẩn bị ước tính (phút)                 |
| actual_prep_time    | Int      | Có thể rỗng               | Thời gian thực tế (phút)                          |
| payment_method      | Enum     | Mặc định: BILL_TO_TABLE | PaymentMethod (xem danh sách enum)                        |
| payment_status      | Enum     | Mặc định: PENDING       | PaymentStatus (xem danh sách enum)                      |
| paid_at             | DateTime | Có thể rỗng               | Dấu thời gian hoàn thành thanh toán                         |
| bill_id             | UUID     | FK, Có thể rỗng           | Liên kết đến hóa đơn khi được nhóm                          |
| received_at         | DateTime | Có thể rỗng               | Dấu thời gian trạng thái RECEIVED (KDS)                      |
| preparing_at        | DateTime | Có thể rỗng               | Dấu thời gian trạng thái PREPARING (KDS)                     |
| ready_at            | DateTime | Có thể rỗng               | Dấu thời gian trạng thái READY (KDS)                         |
| served_at           | DateTime | Có thể rỗng               | Dấu thời gian trạng thái SERVED                             |
| completed_at        | DateTime | Có thể rỗng               | Dấu thời gian trạng thái COMPLETED                         |

**Chỉ mục**: `(tenant_id, status)`, `(tenant_id, created_at)`, `(table_id, status)`, `(order_number)`, `(session_id)`

**Quan hệ**: tenant, table, items, statusHistory, payment, bill

**Quy tắc kinh doanh**:
- `order_number` được tạo cho mỗi tenant (định dạng: ORD-YYYYMMDD-####)
- Vòng đời đơn hàng: PENDING → RECEIVED → PREPARING → READY → SERVED → COMPLETED → PAID (hoặc nhảy đến CANCELLED)
- Trạng thái có thể nhảy đến CANCELLED tại bất kỳ điểm nào trước SERVED
- Trạng thái PAID (trong enum OrderStatus) đánh dấu đơn hàng thanh toán được hoàn thành; trường `payment_status` riêng theo dõi trạng thái nhà cung cấp thanh toán
- Ưu tiên được tính tự động dựa trên thời gian trôi qua so với thời gian chuẩn bị ước tính
- RESTRICT trên FK bàn ngăn xoá bàn có các đơn hàng hoạt động
- ✅ **Triển khai**: Cửa sổ huỷ 5 phút (trong order.service.ts)

#### ORDER_ITEM

| Trường       | Kiểu     | Ràng buộc       | Mô tả                                    |
| ----------- | -------- | ----------------- | ---------------------------------------------- |
| id          | UUID     | PK                | Khóa chính                                    |
| order_id    | UUID     | FK                | Liên kết đến đơn hàng                                 |
| menu_item_id | UUID     | FK (RESTRICT)     | Liên kết đến mục menu                                 |
| name        | String   | Bắt buộc          | Ảnh chụp tên mục tại thời gian đặt hàng               |
| price       | Decimal  | Bắt buộc          | Ảnh chụp giá mục tại thời gian đặt hàng              |
| quantity    | Int      | Mặc định: 1        | Số lượng mục                                  |
| modifiers   | JSON     | Mặc định: []       | Các bộ sửa đổi được chọn                             |
| item_total  | Decimal  | Bắt buộc          | Tổng hàng (giá + bộ sửa đổi) × số lượng      |
| notes       | String   | Có thể rỗng        | Hướng dẫn chuẩn bị đặc biệt                       |
| prepared    | Boolean  | Mặc định: false    | Bếp đã đánh dấu là đã chuẩn bị                     |
| prepared_at | DateTime | Có thể rỗng        | Khi bếp hoàn thành mục này               |

**Chỉ mục**: `(order_id)`, `(menu_item_id)`, `(order_id, prepared)`

**Quan hệ**: order, menuItem, review

**Quy tắc kinh doanh**:
- Ảnh chụp tên & giá tại thời gian đặt hàng (lịch sử giá)
- Định dạng `modifiers` JSON: `[{ groupId, groupName, optionId, optionName, priceDelta }]`
- Bếp có thể đánh dấu các mục riêng lẻ là đã chuẩn bị
- Xoá dây chuyền khi đơn hàng bị xoá

#### ORDER_STATUS_HISTORY

| Trường      | Kiểu     | Ràng buộc | Mô tả                                |
| ---------- | -------- | ----------- | ------------------------------------------ |
| id         | UUID     | PK          | Khóa chính                                |
| order_id   | UUID     | FK          | Liên kết đến đơn hàng                             |
| status     | Enum     | Bắt buộc    | Trạng thái tại điểm này trong lịch sử            |
| notes      | String   | Có thể rỗng    | Lý do thay đổi trạng thái                   |
| changed_by | UUID     | Có thể rỗng    | ID người dùng nhân viên đã thực hiện thay đổi          |

**Chỉ mục**: `(order_id, created_at)`

**Quy tắc kinh doanh**:
- Dòng kiểm tra cho tất cả các thay đổi trạng thái
- Theo dõi người thay đổi trạng thái và thời gian
- Xoá dây chuyền khi đơn hàng bị xoá

---

### 8. Thanh toán

**Mục đích**: Giao dịch thanh toán trực tuyến (SePay VietQR).

**Bảng**: `payments`

#### PAYMENT

| Trường            | Kiểu     | Ràng buộc           | Mô tả                                      |
| ---------------- | -------- | --------------------- | ------------------------------------------------ |
| id               | UUID     | PK                    | Khóa chính                                      |
| order_id         | UUID     | FK, Duy nhất, Có thể rỗng  | Liên kết đến đơn hàng (tùy chọn cho đăng ký)      |
| tenant_id        | UUID     | FK                    | Liên kết đến tenant                              |
| method           | Enum     | Bắt buộc              | PaymentMethod (SEPAY_QR, BILL_TO_TABLE, v.v.)    |
| status           | Enum     | Mặc định: PENDING      | PaymentStatus (PENDING, COMPLETED, FAILED, v.v.) |
| amount           | Decimal  | Bắt buộc              | Số tiền thanh toán                                           |
| currency         | String   | Mặc định: "VND"        | Mã tiền tệ                                       |
| transaction_id   | String   | Có thể rỗng              | ID giao dịch SePay                             |
| bank_code        | String   | Có thể rỗng              | Mã ngân hàng (VCB, TCB, MB, v.v.)                   |
| account_number   | String   | Có thể rỗng              | Số tài khoản nhà cung cấp                          |
| qr_content       | String   | Có thể rỗng              | Dữ liệu mã VietQR                                 |
| deep_link        | String   | Có thể rỗng              | Liên kết sâu ứng dụng ngân hàng                            |
| transfer_content | String   | Có thể rỗng              | Mô tả/mã tham chiếu chuyển khoản              |
| provider_data    | JSON     | Có thể rỗng              | Dữ liệu webhook thô từ SePay                      |
| failure_reason   | String   | Có thể rỗng              | Thông báo lỗi nếu không thành công                          |
| paid_at          | DateTime | Có thể rỗng              | Dấu thời gian hoàn thành thanh toán                     |
| refunded_at      | DateTime | Có thể rỗng              | Dấu thời gian hoàn lại                                 |
| expires_at       | DateTime | Bắt buộc              | Hết hạn liên kết thanh toán (mặc định 15 phút)         |

**Chỉ mục**: `(tenant_id, status)`, `(transaction_id)`, `(expires_at)`

**Quan hệ**: order, tenant

**Quy tắc kinh doanh**:
- Một thanh toán cho mỗi đơn hàng (quan hệ 1:1 thông qua ràng buộc duy nhất trên order_id)
- `order_id` có thể rỗng để hỗ trợ thanh toán đăng ký
- Thanh toán hết hạn sau 15 phút nếu không hoàn thành
- Webhook cập nhật trạng thái dựa trên xác nhận ngân hàng
- ✅ **Triển khai**: Tích hợp SePay VietQR với webhook + fallback bằng cách poll

---

### 9. Hóa đơn

**Mục đích**: Nhóm nhiều đơn hàng để thanh toán bàn (hợp nhất hóa đơn).

**Bảng**: `bills`

#### BILL

| Trường          | Kiểu     | Ràng buộc       | Mô tả                                    |
| -------------- | -------- | ----------------- | ---------------------------------------------- |
| id             | UUID     | PK                | Khóa chính                                    |
| bill_number    | String   | Duy nhất toàn cầu   | ID hóa đơn dễ đọc (ví dụ: "BILL-20260120-0001") |
| tenant_id      | UUID     | FK                | Liên kết đến tenant                                |
| table_id       | UUID     | FK (RESTRICT)     | Liên kết đến bàn                                 |
| session_id     | UUID     | Bắt buộc          | Liên kết đến phiên bàn                         |
| subtotal       | Decimal  | Bắt buộc          | Tổng tất cả đơn hàng trước khi điều chỉnh           |
| discount       | Decimal  | Mặc định: 0        | Chiết khấu ở cấp hóa đơn                            |
| tip            | Decimal  | Mặc định: 0        | Tip ở cấp hóa đơn                                 |
| service_charge | Decimal  | Mặc định: 0        | Số tiền phí dịch vụ                                         |
| tax            | Decimal  | Mặc định: 0        | Số tiền thuế                                     |
| total          | Decimal  | Bắt buộc          | Số tiền cuối cùng sau khi điều chỉnh                 |
| payment_method | Enum     | Mặc định: BILL_TO_TABLE | PaymentMethod                             |
| payment_status | Enum     | Mặc định: PENDING  | PaymentStatus                                  |
| paid_at        | DateTime | Có thể rỗng        | Dấu thời gian hoàn thành thanh toán                   |
| notes          | String   | Có thể rỗng        | Ghi chú bổ sung                               |

**Chỉ mục**: `(tenant_id)`, `(table_id)`, `(session_id)`, `(bill_number)`

**Quan hệ**: tenant, table, orders

**Quy tắc kinh doanh**:
- Nhóm nhiều đơn hàng từ cùng một phiên bàn
- `bill_number` duy nhất toàn cầu
- Các đơn hàng tham chiếu `bill_id` khi được đưa vào hóa đơn
- Được sử dụng cho quy trình "đóng bàn" / "yêu cầu hóa đơn"

---

### 10. Đăng ký

**Mục đích**: Tầng đăng ký và giới hạn sử dụng cho mỗi tenant.

**Bảng**: `subscription_plans`, `tenant_subscriptions`

#### SUBSCRIPTION_PLAN

| Trường            | Kiểu     | Ràng buộc       | Mô tả                                         |
| ---------------- | -------- | ----------------- | --------------------------------------------------- |
| id               | UUID     | PK                | Khóa chính                                         |
| tier             | Enum     | Duy nhất            | SubscriptionTier: FREE, BASIC, PREMIUM              |
| price_usd        | Decimal  | Mặc định: 0        | Giá hàng tháng tính bằng USD                                |
| price_vnd        | Decimal  | Mặc định: 0        | Giá hàng tháng tính bằng VND                                |
| max_tables       | Int      | Mặc định: 1        | Bàn tối đa được phép (-1 = không giới hạn)                 |
| max_menu_items   | Int      | Mặc định: 10       | Mục menu tối đa được phép (-1 = không giới hạn)             |
| max_orders_month | Int      | Mặc định: 100      | Đơn hàng tối đa mỗi tháng (-1 = không giới hạn)               |
| max_staff        | Int      | Mặc định: 1        | Thành viên nhân viên tối đa (-1 = không giới hạn)                  |
| features         | JSON     | Mặc định: {}       | Cờ tính năng (phân tích, khuyến mãi, branding tùy chỉnh) |
| name             | String   | Bắt buộc          | Tên hiển thị (ví dụ: "Miễn phí", "Cơ bản", "Premium")     |
| description      | String   | Có thể rỗng        | Mô tả gói                                            |
| is_active        | Boolean  | Mặc định: true     | Cờ khả dụng gói                              |

**Quy tắc kinh doanh**:
- Giá do DB chạy (có thể cập nhật mà không triển khai)
- Ba tầng: FREE (1 bàn, 10 mục, 100 đơn hàng, 1 nhân viên), BASIC (10/50/500/5), PREMIUM (không giới hạn)
- Các cờ tính năng kiểm soát quyền truy cập vào phân tích, khuyến mãi, v.v.
- ✅ **Triển khai**: Các gói được hạt giống trong cơ sở dữ liệu (xem seed.service.ts)

#### TENANT_SUBSCRIPTION

| Trường                | Kiểu     | Ràng buộc        | Mô tả                                   |
| -------------------- | -------- | ------------------ | --------------------------------------------- |
| id                   | UUID     | PK                 | Khóa chính                                   |
| tenant_id            | UUID     | FK, Duy nhất (1:1)   | Liên kết đến tenant                               |
| plan_id              | UUID     | FK                 | Liên kết đến gói đăng ký                    |
| status               | Enum     | Mặc định: ACTIVE    | SubscriptionStatus: ACTIVE, EXPIRED, CANCELLED |
| current_period_start | DateTime | Bắt buộc           | Ngày bắt đầu kỳ thanh toán                     |
| current_period_end   | DateTime | Có thể rỗng        | Ngày kết thúc kỳ thanh toán (null cho FREE)       |
| orders_this_month    | Int      | Mặc định: 0         | Số lượng đơn hàng (đặt lại hàng tháng)                    |
| usage_reset_at       | DateTime | Tự động               | Dấu thời gian đặt lại sử dụng cuối cùng                    |
| last_payment_id      | UUID     | Có thể rỗng        | Tham chiếu đến thanh toán để nâng cấp              |

**Chỉ mục**: `(tenant_id)`, `(plan_id)`, `(status)`

**Quy tắc kinh doanh**:
- Một đăng ký cho mỗi tenant (quan hệ 1:1)
- Tầng FREE không bao giờ hết hạn (`current_period_end` = null)
- Các bộ đếm sử dụng được đặt lại hàng tháng tại `usage_reset_at`
- Trạng thái EXPIRED kích hoạt khi thanh toán không được gia hạn
- ✅ **Triển khai**: Tất cả các tenant mới bắt đầu trên gói FREE

---

### 11. Khuyến mãi

**Mục đích**: Mã chiết khấu và phiếu giảm giá.

**Bảng**: `promotions`

#### PROMOTION

| Trường           | Kiểu     | Ràng buộc         | Mô tả                                        |
| --------------- | -------- | ------------------- | -------------------------------------------------- |
| id              | UUID     | PK                  | Khóa chính                                  |
| tenant_id       | UUID     | FK                  | Liên kết đến tenant                                    |
| code            | String   | Duy nhất cho tenant   | Mã promo (ví dụ: "SUMMER20", "WELCOME10")         |
| description     | String   | Có thể rỗng            | Mô tả mã                                    |
| type            | Enum     | Bắt buộc            | PromotionType: PERCENTAGE, FIXED                   |
| value           | Decimal  | Bắt buộc            | Giá trị chiết khấu (20 cho 20%, hoặc số tiền cố định)       |
| min_order_value | Decimal  | Có thể rỗng            | Số tiền đơn hàng tối thiểu để áp dụng                      |
| max_discount    | Decimal  | Có thể rỗng            | Giới hạn chiết khấu tối đa (cho chiết khấu phần trăm)    |
| usage_limit     | Int      | Có thể rỗng            | Sử dụng tối đa (null = không giới hạn)                  |
| usage_count     | Int      | Mặc định: 0          | Số lượng sử dụng hiện tại                                |
| starts_at       | DateTime | Bắt buộc            | Ngày bắt đầu khuyến mãi                           |
| expires_at      | DateTime | Bắt buộc            | Ngày kết thúc khuyến mãi                             |
| active          | Boolean  | Mặc định: true       | Trạng thái hoạt động                                      |

**Chỉ mục**: `(tenant_id, active)`, `(code)`

**Ràng buộc duy nhất**: `(tenant_id, code)`

**Quy tắc kinh doanh**:
- Các mã promo duy nhất cho mỗi tenant
- Loại PERCENTAGE: giá trị là phần trăm (ví dụ: 20 = giảm 20%)
- Loại FIXED: giá trị là số tiền cố định (ví dụ: 50000 = giảm 50.000 VND)
- `usage_count` tăng lên khi mỗi lần sử dụng
- Vô hiệu hóa khi `usage_count >= usage_limit`

---

### 12. Đánh giá

**Mục đích**: Xếp hạng của khách hàng cho các mục đơn hàng riêng lẻ.

**Bảng**: `item_reviews`

#### ITEM_REVIEW

| Trường        | Kiểu     | Ràng buộc         | Mô tả                              |
| ------------ | -------- | ------------------- | ---------------------------------------- |
| id           | UUID     | PK                  | Khóa chính                              |
| order_item_id | UUID     | FK, Duy nhất (1:1)    | Liên kết đến mục đơn hàng                      |
| session_id   | UUID     | Bắt buộc            | Theo dõi phiên                         |
| tenant_id    | UUID     | Bắt buộc            | Liên kết đến tenant (cho các truy vấn)            |
| rating       | Int      | Bắt buộc, Phạm vi: 1-5 | Xếp hạng sao                             |
| comment      | String   | Có thể rỗng            | Bình luận đánh giá                           |

**Chỉ mục**: `(session_id)`, `(tenant_id, created_at)`

**Ràng buộc duy nhất**: `(order_item_id)` - một đánh giá cho mỗi mục đơn hàng

**Quy tắc kinh doanh**:
- Khách hàng có thể đánh giá các mục riêng lẻ từ đơn hàng của họ
- Thang đánh giá: 1-5 sao
- Một đánh giá cho mỗi mục đơn hàng (được thực thi bằng ràng buộc duy nhất)
- Các bài đánh giá được liên kết với phiên để phân tích

---

## Tham chiếu Enums

### TenantStatus
- `DRAFT` - Tenant được tạo nhưng onboarding chưa hoàn thành
- `ACTIVE` - Tenant hoạt động và vận hành
- `SUSPENDED` - Tenant bị tạm dừng (sự cố thanh toán, vi phạm chính sách)

### UserRole
- `OWNER` - Truy cập đầy đủ vào bảng điều khiển tenant
- `STAFF` - Truy cập hạn chế (console phục vụ)
- `KITCHEN` - Chỉ hệ thống hiển thị bếp

### UserStatus
- `ACTIVE` - Tài khoản người dùng hoạt động
- `INACTIVE` - Tài khoản người dùng bị vô hiệu hóa bởi quản trị viên
- `PENDING` - Xác minh email chưa hoàn thành
- `LOCKED` - Tài khoản bị khóa (bảo mật)

### MenuItemStatus
- `DRAFT` - Mục không hiển thị cho khách hàng
- `PUBLISHED` - Mục hiển thị trong menu
- `ARCHIVED` - Mục bị ẩn nhưng giữ lại cho lịch sử

### ModifierType
- `SINGLE_CHOICE` - Lựa chọn nút radio (ví dụ: Kích thước)
- `MULTI_CHOICE` - Lựa chọn checkbox (ví dụ: Topping)

### TableStatus
- `AVAILABLE` - Bàn sẵn sàng cho khách hàng
- `OCCUPIED` - Bàn có phiên hoạt động
- `RESERVED` - Bàn được đặt trước
- `INACTIVE` - Bàn không hoạt động

### OrderStatus
- `PENDING` - Đơn hàng được tạo, chờ xác nhận từ nhân viên/bếp
- `RECEIVED` - Bếp đã xác nhận đơn hàng
- `PREPARING` - Bếp đang chuẩn bị thức ăn
- `READY` - Thức ăn sẵn sàng để phục vụ
- `SERVED` - Thức ăn được giao tới bàn
- `COMPLETED` - Khách hàng hoàn tất ăn
- `PAID` - Thanh toán hoàn tất
- `CANCELLED` - Đơn hàng bị hủy

### PaymentMethod
- `BILL_TO_TABLE` - Trả tiền tại bàn sau khi ăn (mặc định cho Việt Nam)
- `SEPAY_QR` - Thanh toán SePay VietQR ngân hàng (✅ triển khai)
- `CARD_ONLINE` - Thanh toán trực tuyến bằng thẻ (❌ enum tồn tại trong lược đồ, KHÔNG được tích hợp trong MVP)
- `CASH` - Thanh toán tiền mặt được ghi lại bởi nhân viên

### PaymentStatus
- `PENDING` - Chờ thanh toán
- `PROCESSING` - Thanh toán đang diễn ra
- `COMPLETED` - Thanh toán thành công
- `FAILED` - Thanh toán thất bại
- `REFUNDED` - Thanh toán được hoàn lại

### OrderPriority
- `NORMAL` - Trong thời gian chuẩn bị ước tính (≤100%)
- `HIGH` - Vượt quá thời gian ước tính (100-150%)
- `URGENT` - Quá hạn đáng kể (>150%)

### PromotionType
- `PERCENTAGE` - Chiết khấu phần trăm (ví dụ: 20%)
- `FIXED` - Chiết khấu số tiền cố định (ví dụ: 50.000 VND)

### SubscriptionTier
- `FREE` - Tầng miễn phí có giới hạn
- `BASIC` - Tầng trả phí với giới hạn cao hơn
- `PREMIUM` - Tầng không giới hạn

### SubscriptionStatus
- `ACTIVE` - Đăng ký hoạt động
- `EXPIRED` - Thanh toán không được gia hạn
- `CANCELLED` - Người dùng hủy đăng ký

---

## Tài liệu Liên quan

- **Lược đồ Prisma**: [source/apps/api/prisma/schema.prisma](../../../source/apps/api/prisma/schema.prisma)
- **Migrations**: [source/apps/api/prisma/migrations/](../../../source/apps/api/prisma/migrations/)
- **Sơ đồ ER**: [er_diagram.md](./er_diagram.md)
- **Tài liệu API**: [Đặc tả OpenAPI](../../common/openapi.exported.json)
- **Kiến trúc**: [ARCHITECTURE.md](../../common/ARCHITECTURE.md)
- **Hướng dẫn Người dùng**: [USER_GUIDE.md](../../common/USER_GUIDE.md)

---

**Migration Lược đồ Cuối cùng**: `20260119060909_add_user_avatar`  
**Tổng Migration**: 20+ được áp dụng  
**Nhà cung cấp Cơ sở dữ liệu**: PostgreSQL  
**ORM**: Prisma 5.x

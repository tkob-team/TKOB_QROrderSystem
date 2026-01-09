# TÀI LIỆU MÔ TẢ DATABASE

- **Version**: 2.2
- **Last Updated**: 2026-01-02

---

## TENANT

| Field           | Type                | Description                                                        |
| --------------- | ------------------- | ------------------------------------------------------------------ |
| id              | string              | Primary Key (UUID)                                                 |
| name            | string              | Tên nhà hàng/quán                                                  |
| slug            | string              | Unique, URL-friendly identifier (e.g. pho-hung)                    |
| status          | enum                | TenantStatus: DRAFT, ACTIVE, SUSPENDED                             |
| settings        | json                | Cấu hình: description, phone, address, logoUrl, language, timezone |
| opening_hours   | json                | Giờ mở cửa                                                         |
| onboarding_step | int                 | Tiến trình onboarding (1..5)                                       |
| created_at      | datetime            | Thời điểm tạo                                                      |
| updated_at      | datetime            | Thời điểm cập nhật cuối                                            |
| users           | [User]              | Danh sách user thuộc tenant                                        |
| payment_config  | TenantPaymentConfig | Cấu hình thanh toán Stripe (1-1)                                   |
| menu_categories | [MenuCategory]      | Danh mục món ăn của tenant                                         |
| menu_items      | [MenuItem]          | Món ăn của tenant                                                  |
| modifier_groups | [ModifierGroup]     | Nhóm tuỳ chọn của tenant                                           |
| tables          | [Table]             | Danh sách bàn ăn của tenant                                        |
| orders          | [Order]             | Đơn hàng của tenant                                                |

---

## USER

| Field         | Type          | Description                                   |
| ------------- | ------------- | --------------------------------------------- |
| id            | string        | Primary Key (UUID)                            |
| email         | string        | Unique, Email đăng nhập                       |
| password_hash | string        | Mã hoá mật khẩu                               |
| full_name     | string        | Tên nhân viên                                 |
| role          | enum          | UserRole: OWNER, STAFF, KITCHEN               |
| status        | enum          | UserStatus: ACTIVE, INACTIVE, PENDING, LOCKED |
| tenant_id     | string        | Foreign Key đến TENANT                        |
| created_at    | datetime      | Thời điểm tạo                                 |
| updated_at    | datetime      | Thời điểm cập nhật cuối                       |
| sessions      | [UserSession] | Các phiên đăng nhập của user                  |

---

## USER_SESSION

| Field              | Type     | Description                       |
| ------------------ | -------- | --------------------------------- |
| id                 | string   | Primary Key (UUID)                |
| user_id            | string   | Foreign Key đến USER              |
| refresh_token_hash | string   | Hash refresh token cho bảo mật    |
| device_info        | string?  | Thông tin thiết bị đăng nhập      |
| last_used_at       | datetime | Thời gian đăng nhập lần cuối      |
| expires_at         | datetime | Thời gian hết hạn phiên đăng nhập |
| created_at         | datetime | Thời điểm tạo                     |

---

## TENANT_PAYMENT_CONFIG

| Field             | Type   | Description                  |
| ----------------- | ------ | ---------------------------- |
| id                | string | Primary Key (UUID)           |
| stripe_account_id | string | Tài khoản Stripe liên kết    |
| tenant_id         | string | Foreign Key đến TENANT (1-1) |

---

## MENU_CATEGORY

| Field         | Type       | Description               |
| ------------- | ---------- | ------------------------- |
| id            | string     | Primary Key (UUID)        |
| tenant_id     | string     | Foreign Key đến TENANT    |
| name          | string     | Tên danh mục              |
| description   | string?    | Mô tả danh mục            |
| display_order | int        | Thứ tự hiển thị           |
| active        | boolean    | Bật/tắt danh mục          |
| created_at    | datetime   | Thời điểm tạo             |
| updated_at    | datetime   | Thời điểm cập nhật cuối   |
| menu_items    | [MenuItem] | Các món ăn thuộc danh mục |

---

## MENU_ITEM

| Field             | Type               | Description                                  |
| ----------------- | ------------------ | -------------------------------------------- |
| id                | string             | Primary Key (UUID)                           |
| tenant_id         | string             | Foreign Key đến TENANT                       |
| category_id       | string             | Foreign Key đến MENU_CATEGORY                |
| name              | string             | Tên món ăn                                   |
| description       | string?            | Mô tả món ăn                                 |
| price             | decimal            | Giá cơ bản                                   |
| image_url         | string?            | (Deprecated) Link ảnh món ăn cũ              |
| status            | enum               | MenuItemStatus: DRAFT, PUBLISHED, ARCHIVED   |
| available         | boolean            | Còn hàng hay không                           |
| display_order     | int                | Thứ tự hiển thị                              |
| preparation_time  | int?               | Thời gian chuẩn bị (phút)                    |
| chef_recommended  | boolean            | Món đầu bếp khuyên dùng                      |
| popularity        | int                | Điểm phổ biến (để sắp xếp)                   |
| primary_photo_id  | string?            | ID của ảnh đại diện chính                    |
| tags              | json?              | Tag món ăn (popular, spicy, vegetarian, ...) |
| allergens         | json?              | Dị ứng (nuts, gluten, dairy, ...)            |
| created_at        | datetime           | Thời điểm tạo                                |
| updated_at        | datetime           | Thời điểm cập nhật cuối                      |
| published_at      | datetime?          | Thời điểm publish                            |
| modifier_groups   | [MenuItemModifier] | Các nhóm tuỳ chọn liên kết                   |
| photos            | [MenuItemPhoto]    | Danh sách ảnh món ăn                         |
| order_items       | [OrderItem]        | Các dòng món ăn trong đơn hàng               |

---

## MENU_ITEM_PHOTO

| Field         | Type     | Description                  |
| ------------- | -------- | ---------------------------- |
| id            | string   | Primary Key (UUID)           |
| menu_item_id  | string   | Foreign Key đến MENU_ITEM    |
| url           | string   | Full URL ảnh (S3/Cloudinary) |
| filename      | string   | Tên file gốc                 |
| mime_type     | string   | Loại file (image/jpeg, ...)  |
| size          | int      | Kích thước file (bytes)      |
| width         | int?     | Chiều rộng ảnh (px)          |
| height        | int?     | Chiều cao ảnh (px)           |
| display_order | int      | Thứ tự hiển thị              |
| is_primary    | boolean  | Là ảnh chính hay không       |
| created_at    | datetime | Thời điểm tạo                |
| updated_at    | datetime | Thời điểm cập nhật cuối      |

---

## MODIFIER_GROUP

| Field         | Type               | Description                               |
| ------------- | ------------------ | ----------------------------------------- |
| id            | string             | Primary Key (UUID)                        |
| tenant_id     | string             | Foreign Key đến TENANT                    |
| name          | string             | Tên nhóm tuỳ chọn                         |
| description   | string?            | Mô tả nhóm tuỳ chọn                       |
| type          | enum               | ModifierType: SINGLE_CHOICE, MULTI_CHOICE |
| required      | boolean            | Bắt buộc chọn không                       |
| min_choices   | int                | Số lựa chọn tối thiểu                     |
| max_choices   | int?               | Số lựa chọn tối đa                        |
| display_order | int                | Thứ tự hiển thị                           |
| active        | boolean            | Bật/tắt nhóm tuỳ chọn                     |
| created_at    | datetime           | Thời điểm tạo                             |
| updated_at    | datetime           | Thời điểm cập nhật cuối                   |
| options       | [ModifierOption]   | Các lựa chọn trong nhóm                   |
| menu_items    | [MenuItemModifier] | Các món ăn liên kết nhóm này              |

---

## MODIFIER_OPTION

| Field         | Type     | Description                    |
| ------------- | -------- | ------------------------------ |
| id            | string   | Primary Key (UUID)             |
| group_id      | string   | Foreign Key đến MODIFIER_GROUP |
| name          | string   | Tên lựa chọn                   |
| price_delta   | decimal  | Giá thêm/bớt                   |
| display_order | int      | Thứ tự hiển thị                |
| active        | boolean  | Bật/tắt lựa chọn               |
| created_at    | datetime | Thời điểm tạo                  |
| updated_at    | datetime | Thời điểm cập nhật cuối        |

---

## MENU_ITEM_MODIFIER (Junction Table)

| Field             | Type     | Description                                |
| ----------------- | -------- | ------------------------------------------ |
| menu_item_id      | string   | Foreign Key đến MENU_ITEM                  |
| modifier_group_id | string   | Foreign Key đến MODIFIER_GROUP             |
| display_order     | int      | Thứ tự hiển thị nhóm tuỳ chọn trong món ăn |
| created_at        | datetime | Thời điểm tạo                              |

---

## TABLE

| Field               | Type           | Description                                   |
| ------------------- | -------------- | --------------------------------------------- |
| id                  | string         | Primary Key (UUID)                            |
| tenant_id           | string         | Foreign Key đến TENANT                        |
| table_number        | string         | Số bàn/Tên bàn (Table 1, A1...)               |
| capacity            | int            | Sức chứa (số người)                           |
| location            | string?        | Vị trí (Tầng 1, Ngoài trời...)                |
| description         | string?        | Mô tả thêm                                    |
| status              | enum           | TableStatus: AVAILABLE, OCCUPIED, ...         |
| qr_token            | string?        | Token bảo mật cho QR Code (Unique)            |
| qr_token_hash       | string?        | Hash của token để verify                      |
| qr_token_created_at | datetime?      | Thời điểm tạo QR                              |
| qr_invalidated_at   | datetime?      | Thời điểm huỷ QR cũ                           |
| current_session_id  | string?        | ID phiên hoạt động hiện tại (nếu có)          |
| display_order       | int            | Thứ tự hiển thị                               |
| active              | boolean        | Soft delete flag                              |
| created_at          | datetime       | Thời điểm tạo                                 |
| updated_at          | datetime       | Thời điểm cập nhật cuối                       |
| sessions            | [TableSession] | Lịch sử các phiên sử dụng bàn                 |
| orders              | [Order]        | Đơn hàng trên bàn này                         |

---

## TABLE_SESSION

| Field      | Type      | Description                           |
| ---------- | --------- | ------------------------------------- |
| id         | string    | Primary Key (UUID)                    |
| table_id   | string    | Foreign Key đến TABLE                 |
| tenant_id  | string    | Foreign Key đến TENANT                |
| scanned_at | datetime  | Thời điểm khách quét QR bắt đầu phiên |
| active     | boolean   | Phiên còn đang hoạt động hay không    |
| cleared_at | datetime? | Thời điểm dọn bàn/kết thúc phiên      |
| cleared_by | string?   | ID nhân viên dọn bàn (User ID)        |
| created_at | datetime  | Thời điểm tạo                         |
| updated_at | datetime  | Thời điểm cập nhật cuối               |
| table      | Table     | Bàn liên kết                          |

---

## ORDER

| Field             | Type                    | Description                                    |
| ----------------- | ----------------------- | ---------------------------------------------- |
| id                | string                  | Primary Key (UUID)                             |
| order_number      | string                  | Mã đơn hàng (unique)                           |
| tenant_id         | string                  | Foreign Key đến TENANT                         |
| table_id          | string                  | Foreign Key đến TABLE                          |
| session_id        | string?                 | Foreign Key đến TABLE_SESSION                  |
| customer_name     | string?                 | Tên khách hàng                                 |
| customer_notes    | string?                 | Ghi chú của khách                              |
| status            | enum                    | OrderStatus                                    |
| subtotal          | decimal                 | Tổng tiền trước thuế                           |
| tax               | decimal                 | Thuế                                            |
| total             | decimal                 | Tổng tiền thanh toán                           |
| created_at        | datetime                | Thời điểm tạo                                  |
| updated_at        | datetime                | Thời điểm cập nhật cuối                        |
| served_at         | datetime?               | Thời điểm phục vụ                              |
| completed_at      | datetime?               | Thời điểm hoàn thành                           |
| tenant            | Tenant                  | Tenant liên kết                                |
| table             | Table                   | Bàn liên kết                                   |
| items             | [OrderItem]             | Danh sách món trong đơn                        |
| status_history    | [OrderStatusHistory]    | Lịch sử trạng thái đơn hàng                    |

---

## ORDER_ITEM

| Field         | Type     | Description                                                      |
| ------------- | -------- | ---------------------------------------------------------------- |
| id            | string   | Primary Key (UUID)                                               |
| order_id      | string   | Foreign Key đến ORDER                                            |
| menu_item_id  | string   | Foreign Key đến MENU_ITEM                                        |
| name          | string   | Tên món tại thời điểm đặt                                        |
| price         | decimal  | Giá món tại thời điểm đặt                                        |
| quantity      | int      | Số lượng                                                         |
| modifiers     | json?    | Các tuỳ chọn đã chọn (array: [{groupId, groupName, ...}])        |
| item_total    | decimal  | Tổng tiền dòng này (đã tính modifiers)                           |
| notes         | string?  | Ghi chú riêng cho món                                            |
| prepared      | boolean  | Đã chuẩn bị xong chưa                                            |
| prepared_at   | datetime?| Thời điểm bếp báo đã chuẩn bị xong                              |
| created_at    | datetime | Thời điểm tạo                                                    |
| updated_at    | datetime | Thời điểm cập nhật cuối                                          |
| order         | Order    | Đơn hàng liên kết                                                |
| menu_item     | MenuItem | Món ăn liên kết                                                  |

---

## ORDER_STATUS_HISTORY

| Field         | Type     | Description                                 |
| ------------- | -------- | ------------------------------------------- |
| id            | string   | Primary Key (UUID)                          |
| order_id      | string   | Foreign Key đến ORDER                       |
| status        | enum     | Trạng thái đơn hàng tại thời điểm thay đổi   |
| notes         | string?  | Ghi chú khi thay đổi trạng thái             |
| changed_by    | string?  | User ID nhân viên thay đổi trạng thái       |
| created_at    | datetime | Thời điểm thay đổi trạng thái               |
| order         | Order    | Đơn hàng liên kết                           |

---

## ENUMS

- **TenantStatus**: DRAFT, ACTIVE, SUSPENDED
- **UserRole**: OWNER, STAFF, KITCHEN
- **UserStatus**: ACTIVE, INACTIVE, PENDING, LOCKED
- **MenuItemStatus**: DRAFT, PUBLISHED, ARCHIVED
- **ModifierType**: SINGLE_CHOICE, MULTI_CHOICE
- **TableStatus**: AVAILABLE, OCCUPIED, RESERVED, INACTIVE
- **OrderStatus**: PENDING, RECEIVED, PREPARING, READY, SERVED, COMPLETED, PAID, CANCELLED

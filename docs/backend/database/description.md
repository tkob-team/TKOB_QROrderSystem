# TÀI LIỆU MÔ TẢ DATABASE

- **Version**: 2.0
- **Last Updated**: 2025-07-12

---


---

## TENANT

| Field            | Type    | Description                                                        |
|------------------|---------|--------------------------------------------------------------------|
| id               | string  | Primary Key (UUID)                                                 |
| name             | string  | Tên nhà hàng/quán                                                  |
| slug             | string  | Unique, URL-friendly identifier (e.g. pho-hung)                    |
| status           | enum    | TenantStatus: DRAFT, ACTIVE, SUSPENDED                             |
| settings         | json    | Cấu hình: description, phone, address, logoUrl, language, timezone |
| opening_hours    | json    | Giờ mở cửa                                                         |
| onboarding_step  | int     | Tiến trình onboarding (1..5)                                       |
| created_at       | datetime| Thời điểm tạo                                                      |
| updated_at       | datetime| Thời điểm cập nhật cuối                                            |
| users            | [User]  | Danh sách user thuộc tenant                                        |
| payment_config   | TenantPaymentConfig | Cấu hình thanh toán Stripe (1-1)                      |
| menu_categories  | [MenuCategory] | Danh mục món ăn của tenant                                 |
| menu_items       | [MenuItem] | Món ăn của tenant                                            |
| modifier_groups  | [ModifierGroup] | Nhóm tuỳ chọn của tenant                                 |

---

## USER

| Field         | Type    | Description                                   |
|---------------|---------|-----------------------------------------------|
| id            | string  | Primary Key (UUID)                            |
| email         | string  | Unique, Email đăng nhập                       |
| password_hash | string  | Mã hoá mật khẩu                               |
| full_name     | string  | Tên nhân viên                                 |
| role          | enum    | UserRole: OWNER, STAFF, KITCHEN               |
| status        | enum    | UserStatus: ACTIVE, INACTIVE, PENDING, LOCKED |
| tenant_id     | string  | Foreign Key đến TENANT                        |
| created_at    | datetime| Thời điểm tạo                                 |
| updated_at    | datetime| Thời điểm cập nhật cuối                       |
| sessions      | [UserSession] | Các phiên đăng nhập của user             |

---

## USER_SESSION

| Field              | Type      | Description                       |
|--------------------|-----------|-----------------------------------|
| id                 | string    | Primary Key (UUID)                |
| user_id            | string    | Foreign Key đến USER              |
| refresh_token_hash | string    | Hash refresh token cho bảo mật    |
| device_info        | string?   | Thông tin thiết bị đăng nhập      |
| last_used_at       | datetime  | Thời gian đăng nhập lần cuối      |
| expires_at         | datetime  | Thời gian hết hạn phiên đăng nhập |
| created_at         | datetime  | Thời điểm tạo                     |

---

## TENANT_PAYMENT_CONFIG

| Field             | Type    | Description                  |
|-------------------|---------|------------------------------|
| id                | string  | Primary Key (UUID)           |
| stripe_account_id | string  | Tài khoản Stripe liên kết    |
| tenant_id         | string  | Foreign Key đến TENANT (1-1) |

---

## MENU_CATEGORY

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | string    | Primary Key (UUID)                            |
| tenant_id     | string    | Foreign Key đến TENANT                        |
| name          | string    | Tên danh mục                                  |
| description   | string?   | Mô tả danh mục                                |
| display_order | int       | Thứ tự hiển thị                               |
| active        | boolean   | Bật/tắt danh mục                              |
| created_at    | datetime  | Thời điểm tạo                                 |
| updated_at    | datetime  | Thời điểm cập nhật cuối                       |
| menu_items    | [MenuItem]| Các món ăn thuộc danh mục                     |

---

## MENU_ITEM

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | string    | Primary Key (UUID)                            |
| tenant_id     | string    | Foreign Key đến TENANT                        |
| category_id   | string    | Foreign Key đến MENU_CATEGORY                 |
| name          | string    | Tên món ăn                                    |
| description   | string?   | Mô tả món ăn                                  |
| price         | decimal   | Giá cơ bản                                    |
| image_url     | string?   | Link ảnh món ăn                               |
| status        | enum      | MenuItemStatus: DRAFT, PUBLISHED, ARCHIVED    |
| available     | boolean   | Còn hàng hay không                            |
| display_order | int       | Thứ tự hiển thị                               |
| tags          | json?     | Tag món ăn (popular, spicy, vegetarian, ...)  |
| allergens     | json?     | Dị ứng (nuts, gluten, dairy, ...)             |
| created_at    | datetime  | Thời điểm tạo                                 |
| updated_at    | datetime  | Thời điểm cập nhật cuối                       |
| published_at  | datetime? | Thời điểm publish                             |
| modifier_groups | [MenuItemModifier] | Các nhóm tuỳ chọn liên kết           |

---

## MODIFIER_GROUP

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | string    | Primary Key (UUID)                            |
| tenant_id     | string    | Foreign Key đến TENANT                        |
| name          | string    | Tên nhóm tuỳ chọn                             |
| description   | string?   | Mô tả nhóm tuỳ chọn                           |
| type          | enum      | ModifierType: SINGLE_CHOICE, MULTI_CHOICE     |
| required      | boolean   | Bắt buộc chọn không                           |
| min_choices   | int       | Số lựa chọn tối thiểu                         |
| max_choices   | int?      | Số lựa chọn tối đa                            |
| display_order | int       | Thứ tự hiển thị                               |
| active        | boolean   | Bật/tắt nhóm tuỳ chọn                         |
| created_at    | datetime  | Thời điểm tạo                                 |
| updated_at    | datetime  | Thời điểm cập nhật cuối                       |
| options       | [ModifierOption] | Các lựa chọn trong nhóm                  |
| menu_items    | [MenuItemModifier] | Các món ăn liên kết nhóm này            |

---

## MODIFIER_OPTION

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | string    | Primary Key (UUID)                            |
| group_id      | string    | Foreign Key đến MODIFIER_GROUP                |
| name          | string    | Tên lựa chọn                                  |
| price_delta   | decimal   | Giá thêm/bớt                                  |
| display_order | int       | Thứ tự hiển thị                               |
| active        | boolean   | Bật/tắt lựa chọn                              |
| created_at    | datetime  | Thời điểm tạo                                 |
| updated_at    | datetime  | Thời điểm cập nhật cuối                       |

---

## MENU_ITEM_MODIFIER (Junction Table)

| Field             | Type      | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| menu_item_id      | string    | Foreign Key đến MENU_ITEM                     |
| modifier_group_id | string    | Foreign Key đến MODIFIER_GROUP                |
| display_order     | int       | Thứ tự hiển thị nhóm tuỳ chọn trong món ăn    |
| created_at        | datetime  | Thời điểm tạo                                 |

---

## ENUMS

- **TenantStatus**: DRAFT, ACTIVE, SUSPENDED
- **UserRole**: OWNER, STAFF, KITCHEN
- **UserStatus**: ACTIVE, INACTIVE, PENDING, LOCKED
- **MenuItemStatus**: DRAFT, PUBLISHED, ARCHIVED
- **ModifierType**: SINGLE_CHOICE, MULTI_CHOICE

---
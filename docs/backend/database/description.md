# TÀI LIỆU MÔ TẢ DATABASE

- **Version**: 1.1
- **Last Updated**: 2025-22-11

---

### TENANT

| Field           | Type   | Description                                     |
| --------------- | ------ | ----------------------------------------------- |
| id              | string | Primary Key                                     |
| name            | string | Tên nhà hàng/quán                               |
| description     | string | Mô tả cửa hafng                                 |
| phone           | string | Số điện thoại                                   |
| address         | string | Địa chỉ                                         |
| logo_url        | string | Đường dẫn Logo                                  |
| slug            | string | Unique, URL-friendly identifier (e.g. pho-hung) |
| status          | enum   | DeennRAFT, ACTIVE, SUSPENDED                    |
| settings        | json   | Cấu hình: màu sắc, tiền tệ, v.v.                |
| opening_hours   | json   | Giờ mở cửa (bước 2 onboarding)                  |
| onboarding_step | int    | Tiến trình onboarding (1..4)                    |

---

### USER

| Field         | Type   | Description                                   |
| ------------- | ------ | --------------------------------------------- |
| id            | string | Primary Key                                   |
| email         | string | Unique, Email đăng nhập                       |
| password_hash | string | Mã hoá mật khẩu                               |
| full_name     | string | Tên nhân viên                                 |
| role          | enum   | OWNER, STAFF, KITCHEN                         |
| tenant_id     | string | Foreign Key đến TENANT                        |
| status        | enum   | Trạng thái: ACTIVE, INACTIVE, PENDING, LOCKED |

---

### USER_SESSION

| Field              | Type      | Description                       |
| ------------------ | --------- | --------------------------------- |
| id                 | string    | Primary Key                       |
| user_id            | string    | Foreign Key đến USER              |
| refresh_token_hash | string    | Hash refresh token cho bảo mật    |
| device_info        | string    | Thông tin thiết bị đăng nhập      |
| last_used_at       | timestamp | Thời gian đăng nhập lần cuối      |
| expires_at         | timestamp | Thời gian hết hạn phiên đăng nhập |

---

### TENANT_PAYMENT_CONFIG

| Field             | Type   | Description                  |
| ----------------- | ------ | ---------------------------- |
| id                | string | Primary Key                  |
| stripe_account_id | string | Tài khoản Stripe liên kết    |
| tenant_id         | string | Foreign Key đến TENANT (1-1) |

---

### TABLE

| Field | Type | Description           |
| ----- | ---- | --------------------- |
| ...   | ...  | (Chưa mô tả chi tiết) |

---

### MENU_CATEGORY

| Field | Type | Description           |
| ----- | ---- | --------------------- |
| ...   | ...  | (Chưa mô tả chi tiết) |

---

### MENU_ITEM

| Field | Type | Description           |
| ----- | ---- | --------------------- |
| ...   | ...  | (Chưa mô tả chi tiết) |

---

### MODIFIER_GROUP

| Field | Type | Description           |
| ----- | ---- | --------------------- |
| ...   | ...  | (Chưa mô tả chi tiết) |

---

### MODIFIER_OPTION

| Field | Type | Description           |
| ----- | ---- | --------------------- |
| ...   | ...  | (Chưa mô tả chi tiết) |

---

### ORDER

| Field | Type | Description           |
| ----- | ---- | --------------------- |
| ...   | ...  | (Chưa mô tả chi tiết) |

---

### ORDER_ITEM

| Field | Type | Description           |
| ----- | ---- | --------------------- |
| ...   | ...  | (Chưa mô tả chi tiết) |

---

### ORDER_ACTIVITY_LOG

| Field | Type | Description           |
| ----- | ---- | --------------------- |
| ...   | ...  | (Chưa mô tả chi tiết) |

---

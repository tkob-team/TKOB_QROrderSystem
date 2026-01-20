# Sơ đồ ER Cơ sở dữ liệu - TKOB_QROrderSystem

> **Nguồn sự thật**: `source/apps/api/prisma/schema.prisma`  
> **Cập nhật lần cuối**: 2026-01-20  
> **Ghi chú**: Sơ đồ này hiển thị tất cả các thực thể chính với các trường chính. Các cột không phải khóa có thể được đơn giản hóa để dễ đọc.

---

```mermaid
erDiagram
    %% ==========================================
    %% TENANT & IDENTITY MANAGEMENT
    %% ==========================================
    
    TENANT {
        uuid id PK
        string name
        string slug UK
        enum status "DRAFT|ACTIVE|SUSPENDED"
        json settings
        json opening_hours
        int onboarding_step
        timestamp created_at
        timestamp updated_at
    }

    USER {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string avatar_url
        enum role "OWNER|STAFF|KITCHEN"
        enum status "ACTIVE|INACTIVE|PENDING|LOCKED"
        uuid tenant_id FK
        timestamp created_at
        timestamp updated_at
    }

    USER_SESSION {
        uuid id PK
        uuid user_id FK
        string refresh_token_hash
        string device_info
        timestamp last_used_at
        timestamp expires_at
        timestamp created_at
    }

    STAFF_INVITATION {
        uuid id PK
        uuid tenant_id FK
        string email
        enum role "OWNER|STAFF|KITCHEN"
        string token UK
        timestamp expires_at
        timestamp used_at
        string invited_by
        timestamp created_at
    }

    TENANT_PAYMENT_CONFIG {
        uuid id PK
        uuid tenant_id FK "UK"
        boolean sepay_enabled
        string sepay_api_key "encrypted"
        string sepay_account_no
        string sepay_account_name
        string sepay_bank_code
        string webhook_secret
        boolean webhook_enabled
        timestamp created_at
        timestamp updated_at
    }

    %% ==========================================
    %% MENU MANAGEMENT
    %% ==========================================
    
    MENU_CATEGORY {
        uuid id PK
        uuid tenant_id FK
        string name
        string description
        int display_order
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    MENU_ITEM {
        uuid id PK
        uuid tenant_id FK
        uuid category_id FK
        string name
        string description
        decimal price
        string image_url "deprecated"
        enum status "DRAFT|PUBLISHED|ARCHIVED"
        boolean available
        int display_order
        int preparation_time
        boolean chef_recommended
        int popularity
        uuid primary_photo_id
        json tags
        json allergens
        timestamp created_at
        timestamp updated_at
        timestamp published_at
    }

    MENU_ITEM_PHOTO {
        uuid id PK
        uuid menu_item_id FK
        string url
        string filename
        string mime_type
        int size
        int width
        int height
        int display_order
        boolean is_primary
        timestamp created_at
        timestamp updated_at
    }

    MODIFIER_GROUP {
        uuid id PK
        uuid tenant_id FK
        string name
        string description
        enum type "SINGLE_CHOICE|MULTI_CHOICE"
        boolean required
        int min_choices
        int max_choices
        int display_order
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    MODIFIER_OPTION {
        uuid id PK
        uuid group_id FK
        string name
        decimal price_delta
        int display_order
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    MENU_ITEM_MODIFIER {
        uuid menu_item_id FK "PK"
        uuid modifier_group_id FK "PK"
        int display_order
        timestamp created_at
    }

    %% ==========================================
    %% TABLE & SESSION MANAGEMENT
    %% ==========================================
    
    TABLE {
        uuid id PK
        uuid tenant_id FK
        string table_number
        int capacity
        string location
        string description
        enum status "AVAILABLE|OCCUPIED|RESERVED|INACTIVE"
        string qr_token UK
        string qr_token_hash
        timestamp qr_token_created_at
        timestamp qr_invalidated_at
        string current_session_id
        int display_order
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    TABLE_SESSION {
        uuid id PK
        uuid table_id FK
        uuid tenant_id FK
        timestamp scanned_at
        boolean active
        timestamp cleared_at
        string cleared_by
        timestamp created_at
        timestamp updated_at
    }

    %% ==========================================
    %% CART MANAGEMENT
    %% ==========================================
    
    CART {
        uuid id PK
        uuid tenant_id FK
        uuid table_id FK
        string session_id
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    CART_ITEM {
        uuid id PK
        uuid cart_id FK
        uuid menu_item_id FK
        int quantity
        decimal unit_price
        string notes
        json modifiers
        timestamp created_at
        timestamp updated_at
    }

    %% ==========================================
    %% ORDER MANAGEMENT
    %% ==========================================
    
    ORDER {
        uuid id PK
        string order_number
        uuid tenant_id FK
        uuid table_id FK
        string session_id
        string customer_name
        string customer_notes
        enum status "PENDING|RECEIVED|PREPARING|READY|SERVED|COMPLETED|PAID|CANCELLED"
        enum priority "NORMAL|HIGH|URGENT"
        decimal subtotal
        decimal tax
        decimal service_charge
        decimal tip
        decimal total
        int estimated_prep_time
        int actual_prep_time
        enum payment_method "BILL_TO_TABLE|SEPAY_QR|CARD_ONLINE|CASH"
        enum payment_status "PENDING|PROCESSING|COMPLETED|FAILED|REFUNDED"
        timestamp paid_at
        uuid bill_id FK
        timestamp created_at
        timestamp updated_at
        timestamp received_at
        timestamp preparing_at
        timestamp ready_at
        timestamp served_at
        timestamp completed_at
    }

    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid menu_item_id FK
        string name
        decimal price
        int quantity
        json modifiers
        decimal item_total
        string notes
        boolean prepared
        timestamp prepared_at
        timestamp created_at
        timestamp updated_at
    }

    ORDER_STATUS_HISTORY {
        uuid id PK
        uuid order_id FK
        enum status "PENDING|RECEIVED|PREPARING|READY|SERVED|COMPLETED|PAID|CANCELLED"
        string notes
        string changed_by
        timestamp created_at
    }

    %% ==========================================
    %% PAYMENT MANAGEMENT
    %% ==========================================
    
    PAYMENT {
        uuid id PK
        uuid order_id FK "UK optional"
        uuid tenant_id FK
        enum method "BILL_TO_TABLE|SEPAY_QR|CARD_ONLINE|CASH"
        enum status "PENDING|PROCESSING|COMPLETED|FAILED|REFUNDED"
        decimal amount
        string currency "VND"
        string transaction_id
        string bank_code
        string account_number
        string qr_content
        string deep_link
        string transfer_content
        json provider_data
        string failure_reason
        timestamp paid_at
        timestamp refunded_at
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    %% ==========================================
    %% BILLING
    %% ==========================================
    
    BILL {
        uuid id PK
        string bill_number UK
        uuid tenant_id FK
        uuid table_id FK
        string session_id
        decimal subtotal
        decimal discount
        decimal tip
        decimal service_charge
        decimal tax
        decimal total
        enum payment_method "BILL_TO_TABLE|SEPAY_QR|CARD_ONLINE|CASH"
        enum payment_status "PENDING|PROCESSING|COMPLETED|FAILED|REFUNDED"
        timestamp paid_at
        string notes
        timestamp created_at
        timestamp updated_at
    }

    %% ==========================================
    %% SUBSCRIPTION SYSTEM
    %% ==========================================
    
    SUBSCRIPTION_PLAN {
        uuid id PK
        enum tier UK "FREE|BASIC|PREMIUM"
        decimal price_usd
        decimal price_vnd
        int max_tables
        int max_menu_items
        int max_orders_month
        int max_staff
        json features
        string name
        string description
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    TENANT_SUBSCRIPTION {
        uuid id PK
        uuid tenant_id FK "UK"
        uuid plan_id FK
        enum status "ACTIVE|EXPIRED|CANCELLED"
        timestamp current_period_start
        timestamp current_period_end
        int orders_this_month
        timestamp usage_reset_at
        string last_payment_id
        timestamp created_at
        timestamp updated_at
    }

    %% ==========================================
    %% PROMOTION SYSTEM
    %% ==========================================
    
    PROMOTION {
        uuid id PK
        uuid tenant_id FK
        string code "UK with tenant_id"
        string description
        enum type "PERCENTAGE|FIXED"
        decimal value
        decimal min_order_value
        decimal max_discount
        int usage_limit
        int usage_count
        timestamp starts_at
        timestamp expires_at
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    %% ==========================================
    %% REVIEW SYSTEM
    %% ==========================================
    
    ITEM_REVIEW {
        uuid id PK
        uuid order_item_id FK "UK"
        string session_id
        uuid tenant_id FK
        int rating "1-5"
        string comment
        timestamp created_at
        timestamp updated_at
    }

    %% ==========================================
    %% RELATIONSHIPS
    %% ==========================================
    
    %% Tenant relationships
    TENANT ||--|{ USER : "owns"
    TENANT ||--|| TENANT_PAYMENT_CONFIG : "has_payment_config"
    TENANT ||--|{ STAFF_INVITATION : "has_invitations"
    TENANT ||--|{ MENU_CATEGORY : "owns_categories"
    TENANT ||--|{ MENU_ITEM : "owns_items"
    TENANT ||--|{ MODIFIER_GROUP : "owns_modifiers"
    TENANT ||--|{ TABLE : "owns_tables"
    TENANT ||--|{ CART : "owns_carts"
    TENANT ||--|{ ORDER : "processes_orders"
    TENANT ||--|{ PAYMENT : "receives_payments"
    TENANT ||--|{ BILL : "generates_bills"
    TENANT ||--|{ PROMOTION : "has_promotions"
    TENANT ||--|| TENANT_SUBSCRIPTION : "has_subscription"

    %% User & Auth relationships
    USER ||--o{ USER_SESSION : "has_sessions"

    %% Menu relationships
    MENU_CATEGORY ||--|{ MENU_ITEM : "contains_items"
    MENU_ITEM ||--|{ MENU_ITEM_PHOTO : "has_photos"
    MENU_ITEM }|--|{ MODIFIER_GROUP : "uses_modifiers_via_junction"
    MENU_ITEM_MODIFIER }|--|| MENU_ITEM : "belongs_to_item"
    MENU_ITEM_MODIFIER }|--|| MODIFIER_GROUP : "belongs_to_group"
    MODIFIER_GROUP ||--|{ MODIFIER_OPTION : "has_options"

    %% Table & Session relationships
    TABLE ||--|{ TABLE_SESSION : "has_sessions"
    TABLE ||--o{ ORDER : "places_orders"
    TABLE ||--o{ CART : "has_carts"
    TABLE ||--o{ BILL : "has_bills"

    %% Cart relationships
    CART ||--|{ CART_ITEM : "contains_items"
    MENU_ITEM ||--o{ CART_ITEM : "in_carts"

    %% Order relationships
    ORDER ||--|{ ORDER_ITEM : "contains_items"
    ORDER ||--|{ ORDER_STATUS_HISTORY : "has_status_history"
    ORDER ||--o| PAYMENT : "has_payment"
    ORDER }o--|| BILL : "grouped_in_bill"
    MENU_ITEM ||--o{ ORDER_ITEM : "ordered_as"

    %% Review relationships
    ORDER_ITEM ||--o| ITEM_REVIEW : "has_review"

    %% Subscription relationships
    SUBSCRIPTION_PLAN ||--|{ TENANT_SUBSCRIPTION : "subscribed_by_tenants"
```

---

## Chú giải Sơ đồ

**Tính chất quan hệ**:
- `||--||` : Một-một
- `||--|{` : Một-nhiều
- `}|--|{` : Nhiều-nhiều (thông qua bảng nối)
- `||--o|` : Một-không-hoặc-một (tùy chọn)
- `}o--||` : Nhiều-một (FK tùy chọn)

**Kiểu trường**:
- `uuid` : UUID v4 khóa chính/ngoài
- `string` : Trường VARCHAR/TEXT
- `enum` : Kiểu ENUM PostgreSQL
- `decimal` : DECIMAL(10,2) hoặc DECIMAL(12,0) cho tiền tệ
- `int` : Trường INTEGER
- `boolean` : Trường BOOLEAN
- `json` : Trường JSONB cho dữ liệu linh hoạt
- `timestamp` : Trường TIMESTAMPTZ

**Chú thích khóa**:
- `PK` : Khóa chính
- `FK` : Khóa ngoài
- `UK` : Ràng buộc duy nhất
- `"deprecated"` : Trường vẫn tồn tại nhưng được thay thế bằng giải pháp tốt hơn

---

## Nhóm Miền

### 1. Tenant & Danh tính (AUTH)
- `TENANT` - Thực thể nhà hàng/kinh doanh
- `USER` - Tài khoản nhân viên/chủ sở hữu
- `USER_SESSION` - Phiên đăng nhập với token làm mới
- `STAFF_INVITATION` - Onboarding nhân viên dựa trên email
- `TENANT_PAYMENT_CONFIG` - Cấu hình cổng thanh toán SePay/thanh toán

### 2. Quản lý Menu (MENU)
- `MENU_CATEGORY` - Phần menu (Khai vị, Món chính, v.v.)
- `MENU_ITEM` - Các món ăn/sản phẩm
- `MENU_ITEM_PHOTO` - Nhiều ảnh cho mỗi mục
- `MODIFIER_GROUP` - Nhóm tùy chỉnh (Kích thước, Topping)
- `MODIFIER_OPTION` - Các lựa chọn riêng lẻ trong nhóm
- `MENU_ITEM_MODIFIER` - Bảng nối liên kết các mục với nhóm sửa đổi

### 3. Quản lý Bàn & Phiên (TABLES)
- `TABLE` - Bàn vật lý với mã QR
- `TABLE_SESSION` - Phiên quét mã QR của khách hàng (kiểu Haidilao)

### 4. Giỏ hàng (CART)
- `CART` - Giỏ hàng dựa trên phiên
- `CART_ITEM` - Các mục trong giỏ hàng với bộ sửa đổi

### 5. Quản lý Đơn hàng (ORDERS)
- `ORDER` - Đơn hàng của khách hàng
- `ORDER_ITEM` - Các mục dòng có snapshot bộ sửa đổi
- `ORDER_STATUS_HISTORY` - Nhật ký kiểm tra cho các thay đổi trạng thái

### 6. Thanh toán & Hóa đơn (PAYMENTS)
- `PAYMENT` - Giao dịch thanh toán trực tuyến (SePay QR)
- `BILL` - Các đơn hàng được nhóm lại để đóng bàn (Bill-to-Table)

### 7. Hệ thống Đăng ký (SUBSCRIPTION)
- `SUBSCRIPTION_PLAN` - Tầng FREE/BASIC/PREMIUM
- `TENANT_SUBSCRIPTION` - Đăng ký hoạt động của Tenant với theo dõi sử dụng

### 8. Khuyến mãi (PROMOTION)
- `PROMOTION` - Mã chiết khấu có giới hạn sử dụng

### 9. Đánh giá (REVIEWS)
- `ITEM_REVIEW` - Xếp hạng của khách hàng (1-5 sao) cho mỗi mục đơn hàng

---

## Các Mẫu Thiết kế Chính

### Đa thuê bao (Multi-Tenancy)
Tất cả các bảng chính có FK `tenant_id` để cách ly dữ liệu. Phần mềm trung gian cấp ứng dụng thi hành phạm vi tenant trên tất cả các truy vấn.

### Xóa mềm (Soft Deletes)
Các bảng sử dụng boolean `active` hoặc enum `status` thay vì xóa cứng (ví dụ: `TABLE.active`, `MENU_ITEM.status`).

### Nhật ký kiểm tra (Audit Trails)
- `ORDER_STATUS_HISTORY` theo dõi tất cả các thay đổi trạng thái đơn hàng
- Hầu hết các bảng đều có timestamp `created_at` và `updated_at`
- Các hành động của người dùng tham chiếu `user_id` hoặc `changed_by`

### Tính linh hoạt JSON
- `TENANT.settings` - Cấu hình cụ thể của nhà hàng
- `MENU_ITEM.tags` / `allergens` - Siêu dữ liệu linh hoạt
- `ORDER_ITEM.modifiers` - Snapshot của các bộ sửa đổi được chọn
- `CART_ITEM.modifiers` - Lựa chọn bộ sửa đổi hiện tại

### Giỏ hàng dựa trên Phiên (Session-Based Cart)
Giỏ hàng được gắn với `table_id` và `session_id` tùy chọn cho các đơn hàng khách hàng nặc danh.

### Tính linh hoạt của Thanh toán (Payment Flexibility)
- Bảng `PAYMENT` hỗ trợ nhiều nhà cung cấp (SePay QR hiện được triển khai)
- `TENANT_PAYMENT_CONFIG` lưu trữ thông tin xác thực cổng được mã hóa
- Enum `ORDER.payment_method` cho phép các phương thức thanh toán trong tương lai (Stripe, v.v.)

---

## Các Trường Đơn giản hóa

Để dễ đọc sơ đồ, các cột sau bị bỏ qua nhưng tồn tại trong lược đồ:

**TENANT**: Không có trường bị bỏ qua (tất cả các trường chính được hiển thị)

**USER**: Không có trường quan trọng bị bỏ qua

**MENU_ITEM**: Tất cả các trường được hiển thị (đây là một thực thể phức tạp)

**TABLE**: Tất cả các trường chính được hiển thị

**ORDER**: Tất cả các trường chính được hiển thị (thực thể phức tạp với nhiều timestamp)

**Tất cả các bảng khác**: Chỉ các trường văn bản không quan trọng hoặc siêu dữ liệu bị bỏ qua

---

## Ghi chú

1. **SePay vs Stripe**: Triển khai hiện tại sử dụng SePay (Vietnam VietQR). `TENANT_PAYMENT_CONFIG` phản ánh lược đồ thực tế với các trường `sepay_*`. Enum `CARD_ONLINE` tồn tại nhưng không được tích hợp.

2. **Bảo mật Token QR**: `TABLE.qr_token` là duy nhất toàn cầu. `qr_token_hash` lưu trữ hash SHA256 để xác thực. Các token có thể được vô hiệu hóa thông qua timestamp `qr_invalidated_at`.

3. **Bill vs Order**:
   - `ORDER` = đơn hàng khách hàng duy nhất (các mục từ một thanh toán)
   - `BILL` = hóa đơn tổng hợp khi đóng phiên bàn (có thể bao gồm nhiều đơn hàng)

4. **Snapshot Bộ sửa đổi**: `ORDER_ITEM.modifiers` và `CART_ITEM.modifiers` lưu trữ JSON snapshot để bảo quản trạng thái bộ sửa đổi ngay cả khi menu thay đổi.

5. **Theo dõi sử dụng Đăng ký**: `TENANT_SUBSCRIPTION.orders_this_month` được đặt lại hàng tháng thông qua trường `usage_reset_at`.

6. **Tính duy nhất Đánh giá**: Một đánh giá trên `ORDER_ITEM` (thi hành thông qua ràng buộc duy nhất trên `order_item_id`).

---

**Lần đồng bộ sơ đồ cuối cùng**: 2026-01-20 từ `source/apps/api/prisma/schema.prisma` (796 dòng)
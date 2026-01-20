# DATABASE SCHEMA DOCUMENTATION

- **Version**: 3.0
- **Last Updated**: 2026-01-20
- **Database**: PostgreSQL with Prisma ORM
- **Migrations**: 21 migrations applied (as of 2026-01-20) (see [migrations folder](../../../source/apps/api/prisma/migrations/))

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Domain Models](#domain-models)
   - [Tenants Domain](#1-tenants-domain)
   - [Users & Authentication](#2-users--authentication)
   - [Staff Management](#3-staff-management)
   - [Tables & Sessions](#4-tables--sessions)
   - [Menu Management](#5-menu-management)
   - [Shopping Cart](#6-shopping-cart)
   - [Orders](#7-orders)
   - [Payments](#8-payments)
   - [Bills](#9-bills)
   - [Subscriptions](#10-subscriptions)
   - [Promotions](#11-promotions)
   - [Reviews](#12-reviews)
3. [Enums Reference](#enums-reference)
4. [Related Documentation](#related-documentation)

---

## Schema Overview

### Multi-Tenant Isolation

**Pattern**: Application-level `tenantId` field enforcement

- Every tenant-scoped table includes `tenant_id` foreign key
- Prisma middleware automatically filters queries by `tenantId`
- Composite indexes on `(tenant_id, ...)` for performance
- Cascade deletion when tenant is deleted

**Note**: Database-level Row-Level Security (RLS) is planned but not currently implemented.

### Naming Conventions

- **Tables**: Lowercase snake_case plural (e.g., `menu_items`, `order_status_history`)
- **Columns**: Lowercase snake_case (e.g., `created_at`, `tenant_id`)
- **Primary Keys**: UUID v4 (`@id @default(uuid())`)
- **Foreign Keys**: `{entity}_id` pattern (e.g., `tenant_id`, `order_id`)
- **Timestamps**: `created_at`, `updated_at` on all tables
- **Soft Deletes**: `active` boolean flag where applicable

### Key Constraints

- **Uniqueness**: `slug` unique globally, `email` unique globally, table `number` unique per tenant
- **Cascade Deletes**: Child records deleted when parent tenant is deleted
- **Restrict Deletes**: Foreign keys to MenuItem, MenuCategory use RESTRICT to prevent accidental deletion

---

## Domain Models

### 1. Tenants Domain

**Purpose**: Core multi-tenant isolation. Each tenant represents a restaurant/food business.

**Tables**: `tenants`, `tenant_payment_configs`, `tenant_subscriptions`

#### TENANT

| Field           | Type         | Constraints                | Description                                    |
| --------------- | ------------ | -------------------------- | ---------------------------------------------- |
| id              | UUID         | PK                         | Primary Key                                    |
| name            | String       | Required                   | Restaurant name                                |
| slug            | String       | Unique globally            | URL-friendly identifier (e.g., "pho-hung")     |
| status          | Enum         | Default: DRAFT             | TenantStatus: DRAFT, ACTIVE, SUSPENDED         |
| settings        | JSON         | Default: {}                | Flexible config: description, phone, address   |
| opening_hours   | JSON         | Nullable                   | Business hours configuration                   |
| onboarding_step | Int          | Default: 1                 | Onboarding progress tracker (1-5)              |
| created_at      | DateTime     | Auto                       | Creation timestamp                             |
| updated_at      | DateTime     | Auto                       | Last update timestamp                          |

**Relations**: users, paymentConfig, menuItems, tables, orders, carts, subscriptions, bills

**Business Rules**:
- Slug must be unique for subdomain routing
- Status DRAFT → ACTIVE after onboarding complete
- Cascade deletes all tenant data when deleted

#### TENANT_PAYMENT_CONFIG

| Field            | Type    | Constraints       | Description                                  |
| ---------------- | ------- | ----------------- | -------------------------------------------- |
| id               | UUID    | PK                | Primary Key                                  |
| tenant_id        | UUID    | FK, Unique (1:1)  | Links to tenant                              |
| sepay_enabled    | Boolean | Default: false    | SePay VietQR integration enabled             |
| sepay_api_key    | String  | Nullable          | SePay API key (encrypted)                    |
| sepay_account_no | String  | Nullable          | Bank account number for VietQR               |
| sepay_account_name | String  | Nullable          | Bank account holder name                     |
| sepay_bank_code  | String  | Nullable          | Bank code (MB, VCB, ACB, etc.)               |
| webhook_secret   | String  | Nullable          | Webhook signature verification               |
| webhook_enabled  | Boolean | Default: false    | Webhook integration status                   |

**Business Rules**:
- One config per tenant (1:1 relationship)
- API keys stored encrypted
- ✅ **Implemented**: SePay VietQR payment provider

---

### 2. Users & Authentication

**Purpose**: User accounts, roles, and session management for staff/owners.

**Tables**: `users`, `user_sessions`

#### USER

| Field         | Type     | Constraints             | Description                             |
| ------------- | -------- | ----------------------- | --------------------------------------- |
| id            | UUID     | PK                      | Primary Key                             |
| email         | String   | Unique globally         | Login email                             |
| password_hash | String   | Required                | Bcrypt hashed password                  |
| full_name     | String   | Required                | User full name                          |
| avatar_url    | String   | Nullable                | User profile avatar URL                 |
| role          | Enum     | Default: STAFF          | UserRole: OWNER, STAFF, KITCHEN         |
| status        | Enum     | Default: PENDING        | UserStatus: ACTIVE, INACTIVE, PENDING, LOCKED |
| tenant_id     | UUID     | FK                      | Links to tenant                         |
| created_at    | DateTime | Auto                    | Creation timestamp                      |
| updated_at    | DateTime | Auto                    | Last update timestamp                   |

**Indexes**: `(tenant_id, email)` for fast tenant-scoped lookups

**Relations**: sessions, tenant

**Business Rules**:
- Email unique globally (enforced by @unique constraint in schema)
- Status PENDING until email verified or admin approved
- OWNER role has full access, STAFF has limited access, KITCHEN sees only KDS
- Cascade delete sessions when user deleted

#### USER_SESSION

| Field              | Type     | Constraints | Description                            |
| ------------------ | -------- | ----------- | -------------------------------------- |
| id                 | UUID     | PK          | Primary Key                            |
| user_id            | UUID     | FK          | Links to user                          |
| refresh_token_hash | String   | Required    | Hashed refresh token (JWT)             |
| device_info        | String   | Nullable    | Browser/device info                    |
| last_used_at       | DateTime | Auto        | Last activity timestamp                |
| expires_at         | DateTime | Required    | Session expiration time                |
| created_at         | DateTime | Auto        | Creation timestamp                     |

**Business Rules**:
- Multiple active sessions per user allowed
- Refresh tokens stored as hash only (never plaintext)
- Auto-cleanup expired sessions via background job

---

### 3. Staff Management

**Purpose**: Invite and onboard new staff members.

**Tables**: `staff_invitations`

#### STAFF_INVITATION

| Field      | Type     | Constraints         | Description                               |
| ---------- | -------- | ------------------- | ----------------------------------------- |
| id         | UUID     | PK                  | Primary Key                               |
| tenant_id  | UUID     | FK                  | Links to tenant                           |
| email      | String   | Required            | Invited email address                     |
| role       | Enum     | Default: STAFF      | UserRole to assign                        |
| token      | String   | Unique globally     | Secure invite token                       |
| expires_at | DateTime | Required            | Invitation expiry (7 days default)        |
| used_at    | DateTime | Nullable            | Timestamp when invitation accepted        |
| invited_by | UUID     | Required            | User ID of inviter                        |
| created_at | DateTime | Auto                | Creation timestamp                        |

**Indexes**: `(tenant_id, email)`, `(token)`

**Business Rules**:
- Token expires after 7 days
- Mark as used (`used_at`) when accepted
- One invitation per email per tenant (can resend if expired)

---

### 4. Tables & Sessions

**Purpose**: Restaurant table management with QR code security and session tracking.

**Tables**: `tables`, `table_sessions`

#### TABLE

| Field               | Type     | Constraints                | Description                                    |
| ------------------- | -------- | -------------------------- | ---------------------------------------------- |
| id                  | UUID     | PK                         | Primary Key                                    |
| tenant_id           | UUID     | FK                         | Links to tenant                                |
| table_number        | String   | Unique per tenant          | Table identifier (e.g., "Table 1", "A1")       |
| capacity            | Int      | Default: 4, Range: 1-20    | Maximum number of guests                       |
| location            | String   | Nullable                   | Physical location (Floor 1, Terrace)           |
| description         | String   | Nullable                   | Additional notes                               |
| status              | Enum     | Default: AVAILABLE         | TableStatus: AVAILABLE, OCCUPIED, RESERVED, INACTIVE |
| qr_token            | String   | Unique globally, Nullable  | HMAC signed QR code token                      |
| qr_token_hash       | String   | Nullable                   | SHA256 hash for validation                     |
| qr_token_created_at | DateTime | Nullable                   | QR code generation timestamp                   |
| qr_invalidated_at   | DateTime | Nullable                   | When QR was regenerated/invalidated            |
| current_session_id  | UUID     | Nullable                   | Active session reference                       |
| display_order       | Int      | Default: 0                 | Display sorting order                          |
| active              | Boolean  | Default: true              | Soft delete flag                               |

**Indexes**: `(tenant_id, status)`, `(tenant_id, active)`, `(qr_token)`, `(current_session_id)`

**Relations**: sessions, orders, carts, bills, tenant

**Business Rules**:
- `table_number` unique per tenant (e.g., can't have two "Table 1")
- QR tokens globally unique for security
- Status OCCUPIED when active session exists
- Invalidate old QR when regenerating (security measure)

#### TABLE_SESSION

| Field      | Type     | Constraints | Description                                 |
| ---------- | -------- | ----------- | ------------------------------------------- |
| id         | UUID     | PK          | Primary Key                                 |
| table_id   | UUID     | FK          | Links to table                              |
| tenant_id  | UUID     | FK          | Links to tenant                             |
| scanned_at | DateTime | Auto        | When customer scanned QR                    |
| active     | Boolean  | Default: true | Session active status                     |
| cleared_at | DateTime | Nullable    | When staff cleared/closed session           |
| cleared_by | UUID     | Nullable    | Staff user ID who cleared session           |

**Indexes**: `(table_id, active)`, `(tenant_id, active)`, `(active, created_at)`

**Business Rules**:
- One active session per table (Haidilao style)
- Staff control when table is free (cleared_at)
- Track session history for analytics

---

### 5. Menu Management

**Purpose**: Menu structure with categories, items, modifiers, and photos.

**Tables**: `menu_categories`, `menu_items`, `menu_item_photos`, `modifier_groups`, `modifier_options`, `menu_item_modifiers`

#### MENU_CATEGORY

| Field         | Type     | Constraints            | Description                          |
| ------------- | -------- | ---------------------- | ------------------------------------ |
| id            | UUID     | PK                     | Primary Key                          |
| tenant_id     | UUID     | FK                     | Links to tenant                      |
| name          | String   | Unique per tenant      | Category name                        |
| description   | String   | Nullable               | Category description                 |
| display_order | Int      | Default: 0             | Display sorting order                |
| active        | Boolean  | Default: true          | Visibility flag                      |

**Indexes**: `(tenant_id, active)`, `(tenant_id, display_order)`

**Unique Constraint**: `(name, tenant_id)`

**Business Rules**:
- Category names unique within tenant
- Inactive categories hidden from customer menu

#### MENU_ITEM

| Field             | Type     | Constraints                | Description                                       |
| ----------------- | -------- | -------------------------- | ------------------------------------------------- |
| id                | UUID     | PK                         | Primary Key                                       |
| tenant_id         | UUID     | FK                         | Links to tenant                                   |
| category_id       | UUID     | FK (RESTRICT)              | Links to category                                 |
| name              | String   | Unique per tenant+category | Menu item name                                    |
| description       | String   | Nullable                   | Item description                                  |
| price             | Decimal  | Required                   | Base price (10,2 precision)                       |
| image_url         | String   | Nullable, Deprecated       | Legacy single image field                         |
| status            | Enum     | Default: DRAFT             | MenuItemStatus: DRAFT, PUBLISHED, ARCHIVED        |
| available         | Boolean  | Default: true              | Stock availability                                |
| display_order     | Int      | Default: 0                 | Display sorting order                             |
| preparation_time  | Int      | Nullable, Range: 0-240     | Estimated prep time in minutes                    |
| chef_recommended  | Boolean  | Default: false             | Featured/recommended flag                         |
| popularity        | Int      | Default: 0                 | Cached popularity score for sorting               |
| primary_photo_id  | UUID     | Nullable                   | Reference to primary MenuItemPhoto                |
| tags              | JSON     | Default: []                | Array of tags (e.g., ["spicy", "vegetarian"])     |
| allergens         | JSON     | Default: []                | Array of allergens (e.g., ["nuts", "gluten"])     |
| published_at      | DateTime | Nullable                   | When item was published                           |

**Indexes**: `(tenant_id, status, available)`, `(tenant_id, category_id)`, `(tenant_id, popularity)`, `(tenant_id, chef_recommended)`

**Unique Constraint**: `(name, tenant_id, category_id)`

**Relations**: category, modifierGroups, photos, orderItems, cartItems, tenant

**Business Rules**:
- Item names unique within tenant+category scope
- Status PUBLISHED required to show to customers
- RESTRICT on category FK prevents accidental category deletion
- Only one primary photo per item

#### MENU_ITEM_PHOTO

| Field         | Type     | Constraints | Description                                 |
| ------------- | -------- | ----------- | ------------------------------------------- |
| id            | UUID     | PK          | Primary Key                                 |
| menu_item_id  | UUID     | FK          | Links to menu item                          |
| url           | String   | Required    | Full image URL (S3/Cloudinary or local)     |
| filename      | String   | Required    | Original sanitized filename                 |
| mime_type     | String   | Required    | Image MIME type (image/jpeg, image/png)     |
| size          | Int      | Required    | File size in bytes                          |
| width         | Int      | Nullable    | Image width in pixels                       |
| height        | Int      | Nullable    | Image height in pixels                      |
| display_order | Int      | Default: 0  | Display sorting order                       |
| is_primary    | Boolean  | Default: false | Primary image flag (one per item)        |

**Indexes**: `(menu_item_id)`, `(menu_item_id, is_primary)`

**Business Rules**:
- Multiple photos per menu item
- Only one `is_primary = true` per item
- Cascade delete when menu item deleted
- ✅ **Implemented**: Local file storage in `uploads/menu-photos/`
- ❌ **Planned**: Cloud storage (S3/Cloudflare R2)

#### MODIFIER_GROUP

| Field         | Type     | Constraints | Description                                        |
| ------------- | -------- | ----------- | -------------------------------------------------- |
| id            | UUID     | PK          | Primary Key                                        |
| tenant_id     | UUID     | FK          | Links to tenant                                    |
| name          | String   | Required    | Group name (e.g., "Size", "Toppings")              |
| description   | String   | Nullable    | Group description                                  |
| type          | Enum     | Required    | ModifierType: SINGLE_CHOICE, MULTI_CHOICE          |
| required      | Boolean  | Default: false | Must customer select from this group?           |
| min_choices   | Int      | Default: 0  | Minimum selections (for MULTI_CHOICE)              |
| max_choices   | Int      | Nullable    | Maximum selections (null = unlimited)              |
| display_order | Int      | Default: 0  | Display sorting order                              |
| active        | Boolean  | Default: true | Visibility flag                                  |

**Indexes**: `(tenant_id, active)`

**Relations**: options, menuItems (junction), tenant

**Business Rules**:
- SINGLE_CHOICE: radio button (e.g., Size: S/M/L)
- MULTI_CHOICE: checkboxes (e.g., Toppings: multiple selection)
- `min_choices` and `max_choices` enforce selection rules

#### MODIFIER_OPTION

| Field         | Type    | Constraints | Description                          |
| ------------- | ------- | ----------- | ------------------------------------ |
| id            | UUID    | PK          | Primary Key                          |
| group_id      | UUID    | FK          | Links to modifier group              |
| name          | String  | Required    | Option name (e.g., "Large", "Extra Cheese") |
| price_delta   | Decimal | Default: 0  | Price adjustment (+/- from base)     |
| display_order | Int     | Default: 0  | Display sorting order                |
| active        | Boolean | Default: true | Availability flag                  |

**Indexes**: `(group_id, active)`

**Business Rules**:
- `price_delta` can be positive (add-on) or zero (no charge)
- Cascade delete when modifier group deleted

#### MENU_ITEM_MODIFIER (Junction Table)

| Field             | Type     | Constraints | Description                                     |
| ----------------- | -------- | ----------- | ----------------------------------------------- |
| menu_item_id      | UUID     | FK          | Links to menu item                              |
| modifier_group_id | UUID     | FK          | Links to modifier group                         |
| display_order     | Int      | Default: 0  | Display order for this modifier within item     |

**Composite PK**: `(menu_item_id, modifier_group_id)`

**Indexes**: `(menu_item_id)`, `(modifier_group_id)`

**Business Rules**:
- Many-to-many relationship between menu items and modifier groups
- Cascade delete when either side deleted

---

### 6. Shopping Cart

**Purpose**: Persistent cart for customers before checkout.

**Tables**: `carts`, `cart_items`

#### CART

| Field      | Type     | Constraints         | Description                                  |
| ---------- | -------- | ------------------- | -------------------------------------------- |
| id         | UUID     | PK                  | Primary Key                                  |
| tenant_id  | UUID     | FK                  | Links to tenant                              |
| table_id   | UUID     | FK                  | Links to table                               |
| session_id | UUID     | Nullable            | Optional session tracking                    |
| expires_at | DateTime | Required            | Auto-expire after 1 hour of inactivity       |

**Unique Constraint**: `(table_id, session_id)`

**Indexes**: `(expires_at)`, `(tenant_id, created_at)`

**Business Rules**:
- One cart per table+session combination
- Auto-cleanup via cron job when expired
- Convert cart to order on checkout

#### CART_ITEM

| Field       | Type    | Constraints | Description                                       |
| ----------- | ------- | ----------- | ------------------------------------------------- |
| id          | UUID    | PK          | Primary Key                                       |
| cart_id     | UUID    | FK          | Links to cart                                     |
| menu_item_id | UUID    | FK          | Links to menu item                                |
| quantity    | Int     | Default: 1  | Item quantity                                     |
| unit_price  | Decimal | Required    | Price snapshot at add time                        |
| notes       | String  | Nullable    | Customer notes for this item                      |
| modifiers   | JSON    | Default: [] | Selected modifiers array                          |

**Indexes**: `(cart_id)`, `(menu_item_id)`

**Business Rules**:
- Snapshot `unit_price` when added to cart
- `modifiers` JSON format: `[{ groupId, optionId, name, priceDelta }]`
- Cascade delete when cart deleted

---

### 7. Orders

**Purpose**: Order lifecycle from placement to completion.

**Tables**: `orders`, `order_items`, `order_status_history`

#### ORDER

| Field               | Type     | Constraints            | Description                                          |
| ------------------- | -------- | ---------------------- | ---------------------------------------------------- |
| id                  | UUID     | PK                     | Primary Key                                          |
| order_number        | String   | Indexed (not unique)   | Human-readable order ID (e.g., "ORD-20260120-0001") |
| tenant_id           | UUID     | FK                     | Links to tenant                                      |
| table_id            | UUID     | FK (RESTRICT)          | Links to table                                       |
| session_id          | UUID     | Nullable               | Links to table session                               |
| customer_name       | String   | Nullable               | Customer name (optional)                             |
| customer_notes      | String   | Nullable               | Special instructions                                 |
| status              | Enum     | Default: PENDING       | OrderStatus (see enum list)                          |
| priority            | Enum     | Default: NORMAL        | OrderPriority: NORMAL, HIGH, URGENT                  |
| subtotal            | Decimal  | Required               | Sum of items before adjustments                      |
| tax                 | Decimal  | Default: 0             | Tax amount                                           |
| service_charge      | Decimal  | Default: 0             | Service charge amount                                |
| tip                 | Decimal  | Default: 0             | Tip amount                                           |
| total               | Decimal  | Required               | Final total amount                                   |
| estimated_prep_time | Int      | Nullable               | Estimated preparation time (minutes)                 |
| actual_prep_time    | Int      | Nullable               | Actual time taken (minutes)                          |
| payment_method      | Enum     | Default: BILL_TO_TABLE | PaymentMethod (see enum list)                        |
| payment_status      | Enum     | Default: PENDING       | PaymentStatus (see enum list)                        |
| paid_at             | DateTime | Nullable               | Payment completion timestamp                         |
| bill_id             | UUID     | FK, Nullable           | Links to bill when grouped                           |
| received_at         | DateTime | Nullable               | Status RECEIVED timestamp (KDS)                      |
| preparing_at        | DateTime | Nullable               | Status PREPARING timestamp (KDS)                     |
| ready_at            | DateTime | Nullable               | Status READY timestamp (KDS)                         |
| served_at           | DateTime | Nullable               | Status SERVED timestamp                              |
| completed_at        | DateTime | Nullable               | Status COMPLETED timestamp                           |

**Indexes**: `(tenant_id, status)`, `(tenant_id, created_at)`, `(table_id, status)`, `(order_number)`, `(session_id)`

**Relations**: tenant, table, items, statusHistory, payment, bill

**Business Rules**:
- `order_number` generated per tenant (format: ORD-YYYYMMDD-####)
- Order lifecycle: PENDING → RECEIVED → PREPARING → READY → SERVED → COMPLETED → PAID (or jump to CANCELLED)
- Status can jump to CANCELLED at any point before SERVED
- PAID status (in OrderStatus enum) marks order as payment completed; separate `payment_status` field tracks payment provider state
- Priority auto-calculated based on elapsed time vs estimated prep time
- RESTRICT on table FK prevents table deletion with active orders
- ✅ **Implemented**: 5-minute cancellation window (in order.service.ts)

#### ORDER_ITEM

| Field       | Type     | Constraints       | Description                                    |
| ----------- | -------- | ----------------- | ---------------------------------------------- |
| id          | UUID     | PK                | Primary Key                                    |
| order_id    | UUID     | FK                | Links to order                                 |
| menu_item_id | UUID     | FK (RESTRICT)     | Links to menu item                             |
| name        | String   | Required          | Item name snapshot at order time               |
| price       | Decimal  | Required          | Item price snapshot at order time              |
| quantity    | Int      | Default: 1        | Item quantity                                  |
| modifiers   | JSON     | Default: []       | Selected modifiers                             |
| item_total  | Decimal  | Required          | Line total (price + modifiers) × quantity      |
| notes       | String   | Nullable          | Special preparation instructions               |
| prepared    | Boolean  | Default: false    | Kitchen marked as prepared                     |
| prepared_at | DateTime | Nullable          | When kitchen completed this item               |

**Indexes**: `(order_id)`, `(menu_item_id)`, `(order_id, prepared)`

**Relations**: order, menuItem, review

**Business Rules**:
- Snapshot name & price at order time (price history)
- `modifiers` JSON format: `[{ groupId, groupName, optionId, optionName, priceDelta }]`
- Kitchen can mark individual items as prepared
- Cascade delete when order deleted

#### ORDER_STATUS_HISTORY

| Field      | Type     | Constraints | Description                                |
| ---------- | -------- | ----------- | ------------------------------------------ |
| id         | UUID     | PK          | Primary Key                                |
| order_id   | UUID     | FK          | Links to order                             |
| status     | Enum     | Required    | Status at this point in history            |
| notes      | String   | Nullable    | Reason for status change                   |
| changed_by | UUID     | Nullable    | Staff user ID who made the change          |

**Indexes**: `(order_id, created_at)`

**Business Rules**:
- Audit trail for all status changes
- Track who changed status and when
- Cascade delete when order deleted

---

### 8. Payments

**Purpose**: Online payment transactions (SePay VietQR).

**Tables**: `payments`

#### PAYMENT

| Field            | Type     | Constraints           | Description                                      |
| ---------------- | -------- | --------------------- | ------------------------------------------------ |
| id               | UUID     | PK                    | Primary Key                                      |
| order_id         | UUID     | FK, Unique, Nullable  | Links to order (optional for subscriptions)      |
| tenant_id        | UUID     | FK                    | Links to tenant                                  |
| method           | Enum     | Required              | PaymentMethod (SEPAY_QR, BILL_TO_TABLE, etc.)    |
| status           | Enum     | Default: PENDING      | PaymentStatus (PENDING, COMPLETED, FAILED, etc.) |
| amount           | Decimal  | Required              | Payment amount                                   |
| currency         | String   | Default: "VND"        | Currency code                                    |
| transaction_id   | String   | Nullable              | SePay transaction ID                             |
| bank_code        | String   | Nullable              | Bank code (VCB, TCB, MB, etc.)                   |
| account_number   | String   | Nullable              | Merchant account number                          |
| qr_content       | String   | Nullable              | VietQR code data                                 |
| deep_link        | String   | Nullable              | Banking app deep link                            |
| transfer_content | String   | Nullable              | Transfer description/reference code              |
| provider_data    | JSON     | Nullable              | Raw webhook data from SePay                      |
| failure_reason   | String   | Nullable              | Error message if failed                          |
| paid_at          | DateTime | Nullable              | Payment completion timestamp                     |
| refunded_at      | DateTime | Nullable              | Refund timestamp                                 |
| expires_at       | DateTime | Required              | Payment link expiry (15 minutes default)         |

**Indexes**: `(tenant_id, status)`, `(transaction_id)`, `(expires_at)`

**Relations**: order, tenant

**Business Rules**:
- One payment per order (1:1 relationship via unique constraint on order_id)
- `order_id` nullable to support subscription payments
- Payment expires after 15 minutes if not completed
- Webhook updates status based on bank confirmation
- ✅ **Implemented**: SePay VietQR integration with webhook + polling fallback

---

### 9. Bills

**Purpose**: Group multiple orders for table checkout (bill consolidation).

**Tables**: `bills`

#### BILL

| Field          | Type     | Constraints       | Description                                    |
| -------------- | -------- | ----------------- | ---------------------------------------------- |
| id             | UUID     | PK                | Primary Key                                    |
| bill_number    | String   | Unique globally   | Human-readable bill ID (e.g., "BILL-20260120-0001") |
| tenant_id      | UUID     | FK                | Links to tenant                                |
| table_id       | UUID     | FK (RESTRICT)     | Links to table                                 |
| session_id     | UUID     | Required          | Links to table session                         |
| subtotal       | Decimal  | Required          | Sum of all orders before adjustments           |
| discount       | Decimal  | Default: 0        | Bill-level discount                            |
| tip            | Decimal  | Default: 0        | Bill-level tip                                 |
| service_charge | Decimal  | Default: 0        | Service charge amount                          |
| tax            | Decimal  | Default: 0        | Tax amount                                     |
| total          | Decimal  | Required          | Final amount after adjustments                 |
| payment_method | Enum     | Default: BILL_TO_TABLE | PaymentMethod                             |
| payment_status | Enum     | Default: PENDING  | PaymentStatus                                  |
| paid_at        | DateTime | Nullable          | Payment completion timestamp                   |
| notes          | String   | Nullable          | Additional notes                               |

**Indexes**: `(tenant_id)`, `(table_id)`, `(session_id)`, `(bill_number)`

**Relations**: tenant, table, orders

**Business Rules**:
- Groups multiple orders from same table session
- `bill_number` unique globally
- Orders reference `bill_id` when included in a bill
- Used for "close table" / "request bill" workflow

---

### 10. Subscriptions

**Purpose**: Subscription tiers and usage limits per tenant.

**Tables**: `subscription_plans`, `tenant_subscriptions`

#### SUBSCRIPTION_PLAN

| Field            | Type     | Constraints       | Description                                         |
| ---------------- | -------- | ----------------- | --------------------------------------------------- |
| id               | UUID     | PK                | Primary Key                                         |
| tier             | Enum     | Unique            | SubscriptionTier: FREE, BASIC, PREMIUM              |
| price_usd        | Decimal  | Default: 0        | Monthly price in USD                                |
| price_vnd        | Decimal  | Default: 0        | Monthly price in VND                                |
| max_tables       | Int      | Default: 1        | Max tables allowed (-1 = unlimited)                 |
| max_menu_items   | Int      | Default: 10       | Max menu items allowed (-1 = unlimited)             |
| max_orders_month | Int      | Default: 100      | Max orders per month (-1 = unlimited)               |
| max_staff        | Int      | Default: 1        | Max staff members (-1 = unlimited)                  |
| features         | JSON     | Default: {}       | Feature flags (analytics, promotions, customBranding) |
| name             | String   | Required          | Display name (e.g., "Free", "Basic", "Premium")     |
| description      | String   | Nullable          | Plan description                                    |
| is_active        | Boolean  | Default: true     | Plan availability flag                              |

**Business Rules**:
- DB-driven pricing (updateable without deploy)
- Three tiers: FREE (1 table, 10 items, 100 orders, 1 staff), BASIC (10/50/500/5), PREMIUM (unlimited)
- Feature flags control access to analytics, promotions, etc.
- ✅ **Implemented**: Seeded plans in database (see seed.service.ts)

#### TENANT_SUBSCRIPTION

| Field                | Type     | Constraints        | Description                                   |
| -------------------- | -------- | ------------------ | --------------------------------------------- |
| id                   | UUID     | PK                 | Primary Key                                   |
| tenant_id            | UUID     | FK, Unique (1:1)   | Links to tenant                               |
| plan_id              | UUID     | FK                 | Links to subscription plan                    |
| status               | Enum     | Default: ACTIVE    | SubscriptionStatus: ACTIVE, EXPIRED, CANCELLED |
| current_period_start | DateTime | Required           | Billing period start date                     |
| current_period_end   | DateTime | Nullable           | Billing period end date (null for FREE)       |
| orders_this_month    | Int      | Default: 0         | Order count (reset monthly)                   |
| usage_reset_at       | DateTime | Auto               | Last usage reset timestamp                    |
| last_payment_id      | UUID     | Nullable           | Reference to payment for upgrade              |

**Indexes**: `(tenant_id)`, `(plan_id)`, `(status)`

**Business Rules**:
- One subscription per tenant (1:1 relationship)
- FREE tier never expires (`current_period_end` = null)
- Usage counters reset monthly at `usage_reset_at`
- Status EXPIRED triggers when payment not renewed
- ✅ **Implemented**: All new tenants start on FREE plan

---

### 11. Promotions

**Purpose**: Discount codes and vouchers.

**Tables**: `promotions`

#### PROMOTION

| Field           | Type     | Constraints         | Description                                        |
| --------------- | -------- | ------------------- | -------------------------------------------------- |
| id              | UUID     | PK                  | Primary Key                                        |
| tenant_id       | UUID     | FK                  | Links to tenant                                    |
| code            | String   | Unique per tenant   | Promo code (e.g., "SUMMER20", "WELCOME10")         |
| description     | String   | Nullable            | Code description                                   |
| type            | Enum     | Required            | PromotionType: PERCENTAGE, FIXED                   |
| value           | Decimal  | Required            | Discount value (20 for 20%, or fixed amount)       |
| min_order_value | Decimal  | Nullable            | Minimum order amount to apply                      |
| max_discount    | Decimal  | Nullable            | Maximum discount cap (for percentage discounts)    |
| usage_limit     | Int      | Nullable            | Max total uses (null = unlimited)                  |
| usage_count     | Int      | Default: 0          | Current usage count                                |
| starts_at       | DateTime | Required            | Promotion start date                               |
| expires_at      | DateTime | Required            | Promotion end date                                 |
| active          | Boolean  | Default: true       | Active status                                      |

**Indexes**: `(tenant_id, active)`, `(code)`

**Unique Constraint**: `(tenant_id, code)`

**Business Rules**:
- Promo codes unique per tenant
- PERCENTAGE type: value is percentage (e.g., 20 = 20% off)
- FIXED type: value is fixed amount (e.g., 50000 = 50,000 VND off)
- `usage_count` incremented on each use
- Disabled when `usage_count >= usage_limit`

---

### 12. Reviews

**Purpose**: Customer ratings for individual order items.

**Tables**: `item_reviews`

#### ITEM_REVIEW

| Field        | Type     | Constraints         | Description                              |
| ------------ | -------- | ------------------- | ---------------------------------------- |
| id           | UUID     | PK                  | Primary Key                              |
| order_item_id | UUID     | FK, Unique (1:1)    | Links to order item                      |
| session_id   | UUID     | Required            | Session tracking                         |
| tenant_id    | UUID     | Required            | Links to tenant (for queries)            |
| rating       | Int      | Required, Range: 1-5 | Star rating                             |
| comment      | String   | Nullable            | Review comment                           |

**Indexes**: `(session_id)`, `(tenant_id, created_at)`

**Unique Constraint**: `(order_item_id)` - one review per order item

**Business Rules**:
- Customers can rate individual items from their order
- Rating scale: 1-5 stars
- One review per order item (enforced by unique constraint)
- Reviews linked to session for analytics

---

## Enums Reference

### TenantStatus
- `DRAFT` - Tenant created but onboarding incomplete
- `ACTIVE` - Tenant active and operational
- `SUSPENDED` - Tenant suspended (payment issue, policy violation)

### UserRole
- `OWNER` - Full access to tenant dashboard
- `STAFF` - Limited access (waiter console)
- `KITCHEN` - Kitchen display system only

### UserStatus
- `ACTIVE` - User account active
- `INACTIVE` - User deactivated by admin
- `PENDING` - Email verification pending
- `LOCKED` - Account locked (security)

### MenuItemStatus
- `DRAFT` - Item not visible to customers
- `PUBLISHED` - Item visible in menu
- `ARCHIVED` - Item hidden but kept for history

### ModifierType
- `SINGLE_CHOICE` - Radio button selection (e.g., Size)
- `MULTI_CHOICE` - Checkbox selection (e.g., Toppings)

### TableStatus
- `AVAILABLE` - Table ready for customers
- `OCCUPIED` - Table has active session
- `RESERVED` - Table reserved for booking
- `INACTIVE` - Table out of service

### OrderStatus
- `PENDING` - Order created, waiting for staff/kitchen acknowledgement
- `RECEIVED` - Kitchen acknowledged order
- `PREPARING` - Kitchen preparing food
- `READY` - Food ready to serve
- `SERVED` - Food delivered to table
- `COMPLETED` - Customer finished eating
- `PAID` - Payment completed
- `CANCELLED` - Order cancelled

### PaymentMethod
- `BILL_TO_TABLE` - Pay at table after eating (default for Vietnam)
- `SEPAY_QR` - SePay VietQR banking (✅ implemented)
- `CARD_ONLINE` - Online card payment (❌ enum exists in schema, NOT integrated in MVP)
- `CASH` - Cash payment recorded by staff

### PaymentStatus
- `PENDING` - Awaiting payment
- `PROCESSING` - Payment in progress
- `COMPLETED` - Payment successful
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

### OrderPriority
- `NORMAL` - Within estimated prep time (≤100%)
- `HIGH` - Exceeded estimated time (100-150%)
- `URGENT` - Significantly overdue (>150%)

### PromotionType
- `PERCENTAGE` - Percentage discount (e.g., 20%)
- `FIXED` - Fixed amount discount (e.g., 50,000 VND)

### SubscriptionTier
- `FREE` - Free tier with limits
- `BASIC` - Paid tier with higher limits
- `PREMIUM` - Unlimited tier

### SubscriptionStatus
- `ACTIVE` - Subscription active
- `EXPIRED` - Payment not renewed
- `CANCELLED` - User cancelled subscription

---

## Related Documentation

- **Prisma Schema**: [source/apps/api/prisma/schema.prisma](../../../source/apps/api/prisma/schema.prisma)
- **Migrations**: [source/apps/api/prisma/migrations/](../../../source/apps/api/prisma/migrations/)
- **ER Diagram**: [er_diagram.md](./er_diagram.md)
- **API Documentation**: [OpenAPI Specification](../../common/openapi.exported.json)
- **Architecture**: [ARCHITECTURE.md](../../common/ARCHITECTURE.md)
- **User Guide**: [USER_GUIDE.md](../../common/USER_GUIDE.md)

---

**Last Schema Migration**: `20260119060909_add_user_avatar`  
**Total Migrations**: 20+ applied  
**Database Provider**: PostgreSQL  
**ORM**: Prisma 5.x

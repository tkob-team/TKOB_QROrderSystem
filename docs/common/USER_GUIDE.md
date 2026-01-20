# USER GUIDE

**Last updated:** 2026-01-20  
**System:** TKOB_QROrderSystem (Product name: TKQR-in Ordering Platform)  
**Version:** 1.0

---

## Document Navigation

**Related Documentation:**
- [Setup Guide](./SETUP.md) - Installation and development environment setup
- [OpenAPI Specification](./OPENAPI.md) - Complete API reference (~140+ operations; see openapi.exported.json for exact count)
- [Architecture](./ARCHITECTURE.md) - System architecture and technical design
- [Backend Database](../backend/database/description.md) - Database schema details

---

## Table of Contents (Quick Navigation)

**Getting Started:** [1. How to Access](#1-how-to-access) - URLs and login  
**Customer:** [2. Customer Guide](#2-customer-guide) - QR scan, order, pay  
**Admin:** [3. Tenant Owner/Admin Guide](#3-tenant-owneradmin-guide) - Dashboard, menu, staff  
**Waiter:** [4. Staff/Waiter Guide](#4-staffwaiter-guide) - Table management, service  
**Kitchen:** [5. Kitchen/KDS Guide](#5-kitchenkds-guide) - Order preparation, priorities  
**Reference:** [6. Status Glossary](#6-status-glossary) - All order/table statuses  
**Help:** [7. FAQ & Known Limitations](#7-faq--known-limitations) - Common questions  

---

## 0) Overview

### What is TKOB_QROrderSystem?

TKOB_QROrderSystem (product brand: **TKQR-in Ordering Platform**) is a QR code-based restaurant ordering system that allows customers to scan a QR code at their table, browse the menu, place orders, and pay directly from their phone. Restaurant staff can manage menus, tables, orders, and view analytics through the tenant dashboard.

**Note:** TKOB_QROrderSystem is the technical repository name; TKQR-in is the customer-facing brand name.

### Who is this guide for?

This guide is organized by user roles:

- **Customers** - Diners who scan QR codes to order
- **Tenant Owner/Admin** - Restaurant owners and managers
- **Staff/Waiter** - Service staff managing tables and orders
- **Kitchen/KDS** - Kitchen staff viewing and preparing orders

---

## 1) How to Access

### Web Applications

**Customer App:**
- **Development:** http://localhost:3001 (verified from [SETUP.md](./SETUP.md))
- **Production:** TBD (not deployed in MVP submission)

**Tenant Dashboard:**
- **Development:** http://localhost:3002 (verified from [SETUP.md](./SETUP.md))
- **Production:** TBD (not deployed in MVP submission)

**API Server:**
- **Development:** http://localhost:3000 (API + Swagger UI at /api-docs)
- **Production:** TBD (not deployed in MVP submission)

### QR Code Usage Flow

1. **Scan QR code** at your table using your phone camera
2. Automatically redirected to restaurant menu
3. **Browse menu** and add items to cart
4. **Checkout** and select payment method
5. **Track order status** in real-time
6. **Rate and review** items after dining

### Demo Accounts

**No seeded demo accounts.** Create test accounts via the Auth API flow:
1. Register: `POST /api/v1/auth/register/submit` → `POST /api/v1/auth/register/confirm`
2. Login: `POST /api/v1/auth/login`

See [OPENAPI.md](./OPENAPI.md) for complete API documentation and [SETUP.md](./SETUP.md) for setup instructions.

---

## 2) Customer Guide

### 2.1) Scanning QR Code & Starting a Session

**Step 1:** Use your phone camera to scan the QR code on your table.

**Step 2:** You'll be automatically redirected to the restaurant's menu page. A session will be created and linked to your table.

**What you'll see:** Menu categories with available dishes, prices, and photos.

> **Note:** Each QR code is unique to a specific table. If the table is already occupied, you'll see an error message.

### 2.2) Browsing the Menu

**Available features:**
- View menu by category (Appetizers, Main Course, Desserts, etc.)
- See item details: name, description, price, preparation time, allergens
- View photos of dishes
- Filter by chef recommendations (if enabled by restaurant)
- Search for specific items (if enabled)

**To view item details:**
1. Tap on any menu item
2. See full description, modifiers (size, toppings, etc.), and photos
3. Read allergen information if available

[Screenshot Placeholder: Customer Menu Page]

### 2.3) Adding Items to Cart

**Step 1:** From the menu, tap on an item you want to order.

**Step 2:** Select modifiers (if available):
- **Single Choice:** Choose one option (e.g., Small/Medium/Large)
- **Multiple Choice:** Choose multiple options (e.g., toppings)

**Step 3:** Add special instructions in the "Notes" field (e.g., "No ice", "Extra spicy").

**Step 4:** Choose quantity and tap "Add to Cart".

**To modify cart:**
- View cart by tapping the cart icon
- Update quantities or remove items
- Total automatically updates with tax and service charge

[Screenshot Placeholder: Item Detail with Modifiers]  
[Screenshot Placeholder: Cart View]

### 2.4) Checkout & Payment

**Step 1:** Review your cart and tap "Checkout".

**Step 2:** Enter your name (optional) and any table-wide notes.

**Step 3:** Select payment method:
- **Bill to Table:** Pay cash when staff brings the bill
- **SePay QR:** Pay now by scanning VietQR code
- **Card Online:** ❌ Not implemented in current MVP (enum exists but no processor integration)

**Step 4:** For QR payment:
- Scan the payment QR code with your banking app
- Enter transfer content exactly as shown
- Payment confirms automatically within seconds

**Step 5:** Order is sent to kitchen after successful checkout.

> **Important:** If you choose "Bill to Table", multiple orders can be combined on one bill at the end of your meal.

[Screenshot Placeholder: Checkout Page]  
[Screenshot Placeholder: Payment QR Code]

### 2.5) Tracking Your Order

After checkout, you'll see order tracking with:

- **Order number** and **table number**
- **Current status:**
  - PENDING - Order created, waiting for staff/kitchen acknowledgement
  - RECEIVED - Kitchen acknowledged order
  - PREPARING - Food is being cooked
  - READY - Food is ready for serving
  - SERVED - Food delivered to your table
  - COMPLETED - Order finished

- **Estimated time remaining** (in minutes)
- **Order timeline** showing progress

**You can:**
- View all orders for your table
- Track multiple orders separately
- Cancel order (if allowed by restaurant policy and kitchen hasn't started preparation)

[Screenshot Placeholder: Order Tracking Page]

### 2.6) Requesting the Bill

When you're ready to pay (for Bill to Table orders):

1. Go to your order details
2. Tap "Request Bill" button
3. Staff will be notified and bring your bill

### 2.7) Rating & Reviewing

After your meal, you can rate individual items:

1. Go to your completed order
2. Tap on an item to rate it (1-5 stars)
3. Add an optional comment
4. Submit review

**Reviews help:**
- Restaurant improve menu items
- Other customers make better choices

---

## 3) Tenant Owner/Admin Guide

### 3.1) Account Setup & Login

**First-time registration:**
1. Visit tenant dashboard URL
2. Click "Sign Up"
3. Enter:
   - Email address
   - Password
   - Full name
   - Restaurant name
   - Restaurant slug (URL identifier)
4. Verify email via OTP code
5. Complete onboarding steps

**Login:**
1. Go to tenant dashboard
2. Enter email and password
3. Click "Login"

**Roles:**
- **OWNER:** Full access to all features
- **STAFF:** Table and order management
- **KITCHEN:** Kitchen display system only

### 3.2) Dashboard Overview

After login, you'll see:

- Total orders today
- Revenue summary
- Active tables
- Pending orders
- Recent reviews
- Analytics charts

[Screenshot Placeholder: Admin Dashboard]

### 3.3) Managing Menu

**Access:** Menu → Menu Management

#### Creating Categories

1. Click "Add Category"
2. Enter category name (e.g., "Appetizers")
3. Add description (optional)
4. Set display order (lower numbers appear first)
5. Click "Save"

#### Adding Menu Items

1. Select a category
2. Click "Add Item"
3. Fill in details:
   - Name
   - Description
   - Price (in tenant currency, typically VND)
   - Preparation time (minutes)
   - Tags (e.g., "vegetarian", "spicy")
   - Allergens (e.g., "gluten", "nuts")
4. Upload photos (ADD HERE: photo limit not confirmed, example: up to 10 per item)
5. Save as "Draft" or "Publish" immediately

**Item Status:**
- **DRAFT:** Not visible to customers
- **PUBLISHED:** Visible on customer menu
- **ARCHIVED:** Soft-deleted, can be restored

**Availability Toggle:**
- Mark items as unavailable temporarily (e.g., sold out)
- Item stays published but grayed out for customers

[Screenshot Placeholder: Menu Item Editor]

### 3.4) Managing Modifiers

Modifiers allow customers to customize items (size, toppings, extras).

**Access:** Menu → Modifiers

**Creating a modifier group:**

1. Click "Add Modifier Group"
2. Enter name (e.g., "Size")
3. Choose type:
   - **Single Choice:** Customer must pick one (radio buttons)
   - **Multiple Choice:** Customer can pick many (checkboxes)
4. Set if required or optional
5. Add options:
   - Option name (e.g., "Small", "Medium", "Large")
   - Price delta (+ or - from base price)
6. Save modifier group
7. Assign to menu items

**Example:**
- **Group:** Drink Size
- **Type:** Single Choice (required)
- **Options:**
  - Small: price adjustment (e.g., -10,000 VND or -$1)
  - Medium: no adjustment
  - Large: price adjustment (e.g., +15,000 VND or +$1.50)

**Note:** Currency and amounts vary by restaurant configuration. Examples shown for illustration only.

### 3.5) Managing Tables & QR Codes

**Access:** Tables → Table Management

#### Creating Tables

1. Click "Add Table"
2. Enter:
   - Table number (e.g., "Table 1", "VIP-A")
   - Capacity (number of seats)
   - Location (e.g., "Main Hall", "Terrace")
   - Description (optional)
3. QR code is automatically generated
4. Click "Save"

**Table Status:**
- **AVAILABLE:** Ready for customers
- **OCCUPIED:** Currently in use
- **RESERVED:** Pre-booked
- **INACTIVE:** Temporarily unavailable

#### Downloading QR Codes

**Single table:**
1. Click table row
2. Click "Download QR"
3. Choose format: PNG, SVG, or PDF

**All tables:**
1. Click "Download All QR Codes"
2. Choose ZIP (individual files) or PDF (multi-page)
3. Print and place on tables

**Regenerating QR codes:**
- Use if QR codes are compromised
- Old QR codes become invalid
- Can regenerate individual tables or all at once

[Screenshot Placeholder: Table Management]

### 3.6) Managing Staff

**Access:** Settings → Staff Management

**Subscription limits apply** (Free: 1 staff, Basic: 5, Premium: unlimited)

#### Inviting Staff Members

1. Click "Invite Staff"
2. Enter email address
3. Select role:
   - **STAFF:** Can manage tables, orders, service board
   - **KITCHEN:** Can only access KDS
4. Send invitation
5. Staff receives email with signup link
6. They create password and join your restaurant

**Managing existing staff:**
- View all staff members
- Change roles
- Remove staff (they lose access immediately)
- Resend invitations if expired

### 3.7) Viewing & Managing Orders

**Access:** Orders → All Orders

**Filter orders by:**
- Status (Pending, Preparing, Completed, etc.)
- Table
- Date range
- Search by order number or customer name

**Order actions:**
- View order details
- Update order status manually
- Mark as paid (for cash/bill to table)
- Cancel order (with reason)
- Print receipt

**Order statuses used:**
- PENDING - Order created, waiting for staff/kitchen acknowledgement
- RECEIVED - Kitchen acknowledged
- PREPARING - Being cooked
- READY - Food ready for pickup/serving
- SERVED - Delivered to table
- COMPLETED - Customer finished dining
- PAID - Payment completed
- CANCELLED - Order cancelled

**Note:** The order of COMPLETED and PAID statuses may vary depending on payment method (SePay immediate payment vs Bill to Table pay-after-dining).

[Screenshot Placeholder: Order Management Page]

### 3.8) Subscription Management

**Access:** Settings → Subscription

**View current plan:**
- Plan tier (Free, Basic, Premium)
- Limits: tables, menu items, orders per month, staff
- Features enabled
- Usage statistics

**Upgrading:**
1. Click "Upgrade Plan"
2. Choose target tier
3. Review pricing
4. Pay via SePay QR code
5. Subscription upgrades automatically after payment

**Subscription tiers:**

| Feature | Free | Basic | Premium |
|---------|------|-------|---------|
| Tables | 1 | 10 | Unlimited |
| Menu Items | 10 | 50 | Unlimited |
| Orders/Month | 100 | 500 | Unlimited |
| Staff | 1 | 5 | Unlimited |
| Analytics | No | Yes | Yes |
| Promotions | No | Yes | Yes |
| Priority Support | No | No | Yes |

### 3.9) Payment Configuration

**Access:** Settings → Payment Settings

**Setup SePay integration:**
1. Enter SePay API key
2. Enter bank account details:
   - Account number
   - Account holder name
   - Bank code (e.g., VCB, ACB, MB)
3. Set webhook secret (optional, for automatic payment confirmation)
4. Test configuration
5. Enable SePay for customers

**Payment methods available to customers:**
- Bill to Table: Always available
- SePay QR: Only if configured
- Card Online: Not in current MVP

### 3.10) Restaurant Settings

**Access:** Settings → Restaurant Profile

**Configurable settings:**

- **Basic Info:** Name, slug, description, address, phone
- **Opening Hours:** Set hours for each day of the week
- **Pricing:**
  - Currency (VND default, configurable per tenant)
  - Tax rate and label (e.g., 10% VAT)
  - Service charge (e.g., 5%)
  - Tip suggestions (e.g., 10%, 15%, 20%)
- **Language & Timezone**

### 3.11) Analytics & Reports

**Access:** Analytics → Dashboard

**Available reports:**

- **Revenue:** Daily, weekly, monthly totals
- **Order statistics:** Count, average order value, completion rate
- **Popular items:** Top-selling dishes
- **Hourly distribution:** Peak ordering times
- **Table performance:** Revenue and turnover by table
- **Reviews:** Rating trends and customer feedback

[Screenshot Placeholder: Analytics Dashboard]

---

## 4) Staff/Waiter Guide

### 4.1) Login & Dashboard

**Login:**
1. Visit tenant dashboard URL
2. Enter your staff email and password
3. You'll see staff dashboard with:
   - Active tables
   - Pending orders
   - Service requests

### 4.2) Managing Tables

**Access:** Staff → Tables or Waiter → Tables

**View table status:**
- See all tables with real-time status
- Filter by location or status
- View active sessions

**Opening a table:**
- Table becomes OCCUPIED when customer scans QR code
- Session is automatically created
- No manual action needed

**Closing a table:**
1. Click on occupied table
2. Click "Close Session & Generate Bill"
3. Select payment method:
   - **Cash:** Mark bill as paid immediately
   - **Bill to Table:** Generate bill for payment
4. Enter tip (optional)
5. Add notes (optional)
6. Confirm - table becomes AVAILABLE

**Clearing a table:** (Legacy method, use Close Session instead)
- Marks table as cleared without generating bill

[Screenshot Placeholder: Staff Table View]

### 4.3) Service Board

**Access:** Staff → Service Board or Waiter → Service Board

**Monitor customer requests:**
- Bill requests
- Special assistance
- Order issues

**Handling requests:**
1. View request details (table, time, type)
2. Take action
3. Mark as resolved

### 4.4) Assisting with Orders

**View all orders:**
- See orders by table or status
- Help customers who have questions

**Manual order actions:**
- Update order status if needed
- Mark orders as paid (for cash payments)
- Cancel orders (with customer approval)

**Communicating with kitchen:**
- Check order status before asking kitchen
- Notify customers of delays
- Handle special requests

---

## 5) Kitchen/KDS Guide

### 5.1) Accessing Kitchen Display System (KDS)

**Login:**
1. Visit tenant dashboard URL
2. Login with kitchen staff credentials
3. Automatically redirected to KDS view

**Alternative:** Direct KDS URL (if configured)

### 5.2) KDS Interface Overview

**Display shows:**
- **Normal priority orders:** Within estimated time (≤ 100% of estimated prep time)
- **High priority orders:** Exceeding estimated time (100-150% of estimated prep time)
- **Urgent orders:** Significantly delayed (> 150% of estimated prep time)

**For each order card:**
- Order number
- Table number
- Time elapsed since order placed
- All items with quantities and modifiers
- Special notes from customer
- Estimated prep time vs actual time

[Screenshot Placeholder: KDS Board with Orders]

### 5.3) Processing Orders

**When new order arrives:**

1. Order appears in "RECEIVED" status
2. Review items and check availability
3. Click "Start Preparing" - status changes to PREPARING
4. Timer starts counting

**While preparing:**
- Follow recipe and check modifiers
- Check special instructions
- Mark individual items as prepared (optional)

**When order is ready:**
1. Click "Mark Ready" - status changes to READY
2. Notify serving staff
3. Order moves off your main screen

### 5.4) Handling Order Statuses

**Status meanings in KDS:**

- **RECEIVED:** New order, needs acknowledgment
- **PREPARING:** Currently being cooked
- **READY:** Finished, awaiting server pickup
- **CANCELLED:** Customer or staff cancelled, stop preparation

**Priority indicators:**

- **Green (Normal):** ≤ 100% of estimated time, on track
- **Yellow (High):** 100-150% of estimated time, prioritize
- **Red (Urgent):** > 150% of estimated time, immediate attention

### 5.5) KDS Statistics

**Dashboard shows:**
- Total active orders
- Average prep time today
- Orders completed today
- Urgent/high priority count

**Use stats to:**
- Monitor kitchen performance
- Identify bottlenecks
- Plan staffing needs

### 5.6) Cancellations & Modifications

**If order is cancelled:**
- Order card turns gray or disappears
- Stop preparation immediately
- Dispose of or repurpose ingredients

**If customer modifies order:**
- Not supported in current MVP
- Customer must cancel and reorder
- Or coordinate through staff

---

## 6) Status Glossary

### Order Statuses (Actual System Values)

| Status | Description | Who Can Set | Next Status |
|--------|-------------|-------------|-------------|
| **PENDING** | Order created, waiting for kitchen | System (auto) | RECEIVED |
| **RECEIVED** | Kitchen acknowledged order | Kitchen Staff | PREPARING |
| **PREPARING** | Food is being cooked | Kitchen Staff | READY |
| **READY** | Food is ready for pickup | Kitchen Staff | SERVED |
| **SERVED** | Food delivered to table | Waiter/Staff | COMPLETED |
| **COMPLETED** | Customer finished dining | Waiter/Staff | PAID |
| **PAID** | Payment completed | System/Staff | - |
| **CANCELLED** | Order cancelled | Customer/Staff | - |

### Table Statuses (Actual System Values)

| Status | Description | Color | Actions Available |
|--------|-------------|-------|-------------------|
| **AVAILABLE** | Ready for customers | Green | QR scan, manual reserve |
| **OCCUPIED** | Currently in use | Red | View orders, close session |
| **RESERVED** | Pre-booked | Yellow | Cancel reservation |
| **INACTIVE** | Temporarily unavailable | Gray | Reactivate |

### Payment Statuses

| Status | Description |
|--------|-------------|
| **PENDING** | Awaiting payment |
| **PROCESSING** | Payment being verified |
| **COMPLETED** | Payment successful |
| **FAILED** | Payment failed or expired |
| **REFUNDED** | Payment refunded |

### Priority Levels (KDS)

| Priority | Condition | Color |
|----------|-----------|-------|
| **NORMAL** | Prep time ≤ 100% of estimate | Green |
| **HIGH** | Prep time 100-150% of estimate | Yellow |
| **URGENT** | Prep time > 150% of estimate | Red |

**Note:** Thresholds confirmed from system implementation (kds-response.dto.ts).

---

## 7) FAQ & Known Limitations

### Frequently Asked Questions

**Q: Can I order from multiple tables with one QR scan?**  
A: No, each QR code is linked to a specific table. Each table has its own session.

**Q: Can I modify my order after placing it?**  
A: You can cancel within 5 minutes if the kitchen hasn't started. Modifications are not supported in current MVP - you must cancel and reorder.

**Q: What happens if I scan a QR code for an occupied table?**  
A: You'll see an error message. Each table can only have one active session at a time.

**Q: Can I pay separately for items on the same table?**  
A: Not in current MVP. All orders at a table are combined into one bill when using "Bill to Table".

**Q: How long does my cart stay active?**  
A: Cart is session-based and expires when you close the browser or after session timeout (configured per tenant).

**Q: Can customers leave reviews without ordering?**  
A: No, reviews are linked to completed orders. Only customers who ordered an item can review it.

### Known Limitations (Current MVP)

**Customer App:**
- ❌ **Order modification:** Cannot edit order after checkout (must cancel and reorder)
- ❌ **Split bills:** Cannot split bill by individual items
- ❌ **Multiple payment methods:** Cannot use multiple payment methods for one order
- ❌ **Guest checkout:** Session required (scanned QR), no standalone browsing yet
- ❌ **Order history:** Limited to current session only

**Tenant Dashboard:**
- ❌ **Advanced inventory:** No stock tracking or ingredient management
- ❌ **Shift management:** No staff scheduling or shift reports
- ❌ **Multi-location:** Single restaurant only (no chain support)
- ❌ **Email notifications:** Limited email alerts (registration only)
- ❌ **Custom themes:** Fixed UI theme, no customization
- ❌ **Loyalty programs:** No points or rewards system

**KDS:**
- ❌ **Order routing:** All orders go to one KDS (no station-specific routing)
- ❌ **Printing:** No kitchen receipt printer integration
- ❌ **Bumping:** Cannot mark sub-items separately (all or nothing)
- ❌ **Recall:** Cannot un-ready an order

**Payments:**
- ❌ **Card payments:** Only cash and SePay QR supported
- ❌ **Installments:** No buy-now-pay-later options
- ❌ **International:** VND and USD only
- ❌ **Refunds:** No self-service refund process (contact support)

**General:**
- ❌ **Mobile apps:** Web only (no native iOS/Android apps)
- ❌ **Offline mode:** Internet required for all operations
- ❌ **Multi-language:** Limited language support
- ❌ **Accessibility:** Not fully WCAG compliant yet

### Planned Features (Future Releases)

**High Priority:**
- Order modification after checkout
- Split bill by item
- Kitchen printer integration
- Customer order history

**Medium Priority:**
- Multi-restaurant management
- Advanced inventory tracking
- Loyalty and rewards program
- Native mobile apps

**Low Priority:**
- Offline ordering mode
- Gift cards and vouchers

**For technical roadmap:** See [ARCHITECTURE.md Section 10](./ARCHITECTURE.md#10-future-enhancements-planned-but-not-implemented)

---

## 8) Screenshot Placeholders

Below are placeholder captions for screenshots that should be added to this guide:

### Customer App

1. **[Screenshot: Customer Menu Page]**
   - Shows category tabs, item cards with photos and prices, cart icon
   - Caption: "Browse menu by category and add items to cart"

2. **[Screenshot: Item Detail with Modifiers]**
   - Shows item photo, description, modifier groups (size, toppings), quantity selector
   - Caption: "Customize your order with modifiers and special instructions"

3. **[Screenshot: Cart View]**
   - Shows cart items, quantities, subtotal, tax, service charge, total
   - Caption: "Review your cart before checkout"

4. **[Screenshot: Checkout Page]**
   - Shows payment method selection, customer name field, notes field
   - Caption: "Choose payment method and complete checkout"

5. **[Screenshot: Payment QR Code]**
   - Shows VietQR code, transfer content, bank details, countdown timer
   - Caption: "Scan this QR code with your banking app to pay"

6. **[Screenshot: Order Tracking Page]**
   - Shows order status timeline, estimated time, order items, table number
   - Caption: "Track your order status in real-time"

### Tenant Dashboard

7. **[Screenshot: Admin Dashboard]**
   - Shows revenue charts, order stats, active tables, recent reviews
   - Caption: "Monitor your restaurant performance at a glance"

8. **[Screenshot: Menu Item Editor]**
   - Shows form for item name, price, description, photos, modifiers
   - Caption: "Create and edit menu items with photos and modifiers"

9. **[Screenshot: Table Management]**
   - Shows table list with status indicators, filters, QR download buttons
   - Caption: "Manage tables and download QR codes"

10. **[Screenshot: Order Management Page]**
    - Shows order list with filters, status badges, search bar
    - Caption: "View and manage all orders with filters"

11. **[Screenshot: Analytics Dashboard]**
    - Shows revenue charts, popular items, hourly distribution graphs
    - Caption: "Analyze sales trends and performance metrics"

### Staff/Waiter App

12. **[Screenshot: Staff Table View]**
    - Shows table grid with status colors, session info, actions
    - Caption: "View all tables and their current status"

### Kitchen Display System

13. **[Screenshot: KDS Board with Orders]**
    - Shows order cards grouped by priority, timers, item lists
    - Caption: "Kitchen display shows active orders with priority indicators"

---

## Need Help?

**Technical Support:**  
ADD HERE (example: support@tkqrin.com)

**Documentation:**  
For developer documentation and API details, see:
- [docs/common/OPENAPI.md](./OPENAPI.md)
- [docs/backend/README.md](../backend/README.md)
- [docs/frontend/README.md](../frontend/README.md)

**Report Issues:**  
ADD HERE (example: GitHub Issues link or support portal)

---

**Document Version:** 1.0  
**Last Reviewed:** 2026-01-20  
**Next Review:** 2026-04-20

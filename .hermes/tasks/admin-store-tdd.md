# Task: Admin Store Management — Products CRUD + Order Management

## Project Context
KitFix 2.0 at `/root/kitfix-2.0` — Next.js 16 App Router, Drizzle/Neon, Better Auth, Tailwind 4, shadcn/ui.
Admin dashboard already exists at `app/(admin)/` with customer/technician/payment/review management.
AGENTS.md has full structure. E-commerce schema already built (products, productVariants, personalizationOptions, orders, orderItems).

## Role
Build the admin store management UI: CRUD products, manage orders. Use admin layout established by existing admin pages.

## What to Build

### 1. Admin Products Page (`app/(admin)/admin/store/page.tsx`)
- Server component with admin auth guard (role check)
- Table listing all products with: name, price, stock (sum of variants), status (active/inactive)
- "Add Product" button
- Each row: edit button, toggle active/inactive, delete (soft)
- Empty state when no products

### 2. Admin Product Form (`app/(admin)/admin/store/[id]/page.tsx`)
- Form to create/edit a product
- Fields: name, description, slug (auto-generated from name), basePrice (in ZAR cents), category (select), imageUrl
- Variants section: add/remove sizes (S-2XL, Kids), set stock and priceModifier per variant
- Personalization options section: add/remove fields (name, number, sleeve, etc.), set type (text/select), required, maxLength, options for select fields
- Save button → calls server action
- Validate: basePrice > 0, at least one variant, unique slugs

### 3. Admin Orders Page (`app/(admin)/admin/orders/page.tsx`)
- Table listing all orders: order ID, customer name, total, status, date
- Filter by status (pending/paid/shipped/delivered/cancelled)
- Sort by date (newest first)
- Link to order detail

### 4. Admin Order Detail (`app/(admin)/admin/orders/[id]/page.tsx`)
- Order info: customer details, items list, totals, shipping address
- Status management: dropdown to update status (pending→paid→shipped→delivered or cancelled)
- Payment info: Polar checkout link, payment status

### 5. Server Actions (`actions/admin-store.ts`)
- `createProduct(input)` — create product with variants + personalization options
- `updateProduct(id, input)` — update product fields, sync variants
- `deleteProduct(id)` — soft delete (set isActive=false)
- `getProductForEdit(id)` — product with all variants and personalization options
- `getAdminOrders(filters)` — list all orders with customer name, paginated
- `getAdminOrderById(id)` — full order details
- `updateOrderStatus(id, status)` — update order status with validation

### 6. Admin Store Layout (`app/(admin)/admin/store/layout.tsx`)
- Sub-navigation for Store section (Products, Orders)
- Active tab highlighting
- Consistent with existing admin sidebar pattern

## Tech Stack
- **Framework:** Next.js 16 App Router (RSC default, 'use client' where needed)
- **UI:** shadcn/ui (Table, Button, Dialog, Form, Input, Select, Badge)
- **Styling:** Tailwind 4
- **Icons:** lucide-react

## Constraints
- Follow existing admin patterns exactly (see admin/technicians, admin/requests for reference)
- All server actions must validate admin role (use existing requireAdmin utility)
- Money in ZAR cents, display as Rands
- Match existing admin UI style (sidebar, stats cards, tables)
- Run `npm run typecheck` and `npx next build` at the end

# Task: Order & Checkout Flow — TDD

## Project Context
KitFix 2.0 at `/root/kitfix-2.0` — Next.js 16 App Router, Drizzle/Neon, Better Auth, Polar.sh, Tailwind 4.
AGENTS.md has full structure. Cart server actions at `actions/cart.ts`. Product queries at `lib/db/queries/products.ts`.
Polar webhook already exists at `app/api/webhooks/polar/route.ts` (handles repair payments).
DB schema already has `orders` and `orderItems` tables.
`@polar-sh/nextjs` and `@polar-sh/sdk` are installed.

## Role
Build the order and checkout flow: create orders from cart, integrate Polar.sh checkout for orders, handle order payment webhooks, and build the order confirmation UI. Use strict TDD for all server action logic.

## About TDD
RED → GREEN → REFACTOR. One test at a time. Test behavior through public interfaces.

## What to Build

### 1. Order Actions (`actions/orders.ts`)
```typescript
"use server";

// Create order from current user's cart
// - Validates auth (session required)
// - Gets all cart items with product + variant data
// - Validates stock for all items
// - Creates order record with status='pending'
// - Creates orderItems with snapshot pricing
// - Clears cart items
// - Returns order with items and total
export async function createOrderFromCart(): Promise<ActionResult<OrderResponse>>;

// Get orders for current user
export async function getOrders(): Promise<ActionResult<OrderResponse[]>>;

// Get order by ID (with ownership check)
export async function getOrderById(orderId: string): Promise<ActionResult<OrderResponse>>;

// Initiate Polar.sh checkout for an order
export async function initiateOrderCheckout(orderId: string): Promise<ActionResult<{ checkoutUrl: string }>>;
```

**Order creation logic:**
- Calculate totals server-side (don't trust client prices)
- `itemTotal = sum of all (unitPriceCents × quantity)`
- `shippingTotal = 0` (for now — will use Courier Guy later)
- `grandTotal = itemTotal + shippingTotal`
- Decrement stock for each variant via `decrementStock()`
- Wrap in transaction if possible, else sequential with rollback on failure

**Polar checkout:**
- Use `@polar-sh/sdk` to create a checkout session
- Set `successUrl` and `cancelUrl` with order ID in metadata
- Store `polarCheckoutId` on the order record
- Return checkout URL for redirect

### 2. Extend Polar Webhook (`app/api/webhooks/polar/route.ts`)
The existing webhook handles repair payments. Extend it to also handle **order payments**.

Currently it likely checks `repairRequestId` in metadata. Orders will have `orderId` in metadata instead.

Add logic:
- If webhook payload metadata contains `orderId`:
  - Update order status to 'paid'
  - Create payment record linked to order
- Keep existing repair payment logic intact
- Test both paths (repair payment and order payment webhook)

### 3. Checkout Page (`app/(store)/checkout/page.tsx`)
- Server component with auth guard
- Shows cart summary with items, quantities, prices
- Collects shipping address (simple form: name, phone, street, city, postal code)
- "Place Order" button → calls `createOrderFromCart()` then redirects to Polar checkout
- If cart is empty, redirect to shop

### 4. Order Confirmation (`app/(store)/orders/[id]/page.tsx`)
- Fetches order by ID
- Shows order status, items, totals, payment status
- If status is 'pending', show "Complete Payment" button linking to Polar checkout
- If status is 'paid', show success state with order details

### 5. Orders List (`app/(store)/orders/page.tsx`)
- Fetch orders via `getOrders()`
- Table/card list with: order ID, date, status, total
- Link to order detail

### 6. Tests (`actions/__tests__/orders.test.ts`)
Test in this order (vertical slices):
1. `createOrderFromCart()` creates order with correct items and totals
2. `createOrderFromCart()` decrements stock for each variant
3. `createOrderFromCart()` clears cart after order creation
4. `createOrderFromCart()` throws/returns error when cart is empty
5. `createOrderFromCart()` returns error when not signed in
6. `getOrderById()` returns order with correct ownership
7. `getOrderById()` returns error for another user's order
8. `initiateOrderCheckout()` creates Polar checkout session
9. Polar webhook updates order to 'paid' on payment confirmed
10. Polar webhook creates payment record linked to order

### Test for webhook (`app/api/webhooks/polar/__tests__/route.test.ts`)
Extend existing test file:
11. Webhook handler routes order payment correctly
12. Webhook handler still handles repair payments correctly (regression)

## Tech Stack
- **Runtime:** Node.js 22, Next.js 16 App Router
- **ORM:** Drizzle ORM with Neon PostgreSQL
- **Auth:** Better Auth (server-side session)
- **Payments:** `@polar-sh/sdk`, existing Polar.sh webhook
- **Test:** Vitest (v4.0.18)
- **Money:** All prices in ZAR cents (integers)

## Constraints
- `npm run test:run` after each implementation cycle
- `npx next build` at the end
- `npm run typecheck` must pass
- Don't break existing repair payment webhook logic
- Use `@polar-sh/sdk` for checkout creation (not raw HTTP)
- Format prices as Rands in UI but store as cents

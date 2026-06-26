# Task: E-Commerce Store (Products + Cart) — TDD

## Project Context
KitFix 2.0 at `/root/kitfix-2.0` — Next.js 16 App Router, Drizzle/Neon, Better Auth, Polar.sh, Tailwind 4.
AGENTS.md in project root has full structure and architecture docs.
Database schema is in `lib/db/schema.ts` — add e-commerce tables there.
The e-commerce domain is marked **UNDER CONSTRUCTION** in AGENTS.md.

## Role
You are building the e-commerce store: products catalog, variant picker, personalization options, and server-side cart. Use strict TDD (Matt Pocock TDD skill).

## About TDD
Follow RED → GREEN → REFACTOR. One test at a time. Write ONE test, make it pass, then write the next.
Tests must verify behavior through public interfaces, not implementation details.
DO NOT write all tests first, then all implementation (horizontal slicing). Write one test, implement, repeat.

## What to Build

### Phase 1: Database Types & Schema (extend `lib/db/schema.ts`)

Add these tables (already partially exists in schema — extend if needed):

**products:**
- id: text (cuid2, PK), name: text, description: text, slug: text (unique)
- basePrice: integer (ZAR cents), category: text, imageUrl: text (nullable)
- isActive: boolean, createdAt/updatedAt timestamps

**productVariants:**
- id: text (PK), productId: FK → products.id
- size: varchar (XS, S, M, L, XL, 2XL, 3XL, Kids-S, Kids-M, Kids-L)
- stock: integer, priceModifier: integer (cents, can be 0)

**personalizationOptions:**
- id: text (PK), productId: FK → products.id
- fieldName: text (e.g. "name", "number", "sleeve"), fieldType: text ("text", "select")
- isRequired: boolean, maxLength: integer (nullable)
- options: jsonb (nullable — array of {label, value} for select fields)

**cartItems:**
- id: text (PK), userId: FK → user.id
- productId: FK → products.id, variantId: FK → productVariants.id
- quantity: integer (≥1), personalization: jsonb (key-value pairs)
- createdAt/updatedAt timestamps
- UNIQUE constraint on (userId, productId, variantId, personalization) — same variant with same personalization = increment quantity

**orders + orderItems:**
- orders: id, userId, status (pending/paid/shipped/delivered/cancelled), totalCents, shippingCents, grandTotalCents, shippingAddress (jsonb), createdAt/updatedAt
- orderItems: id, orderId (FK), productId, variantId, quantity, unitPriceCents (snapshot price), personalization (jsonb)

### Phase 2: Queries (`lib/db/queries/products.ts`)

Write and TDD these query functions using Drizzle ORM:
- `getActiveProducts()` → all active products with their variants
- `getProductBySlug(slug)` → single product with variants + personalization options
- `getProductVariants(productId)` → all variants for a product
- `checkStock(variantId, quantity)` → boolean (enough stock?)
- `decrementStock(variantId, quantity)` → decrement stock (for checkout)

### Phase 3: Cart Actions (`actions/cart.ts`)

Server actions with auth guard (user must be signed in):
- `addToCart(productId, variantId, quantity, personalization)` → cart item
- `updateCartItem(itemId, quantity)` → updated item (quantity=0 removes)
- `removeFromCart(itemId)` → void
- `getCart()` → all items with product + variant data + totals
- `getCartTotal()` → { itemTotal, shippingTotal, grandTotal }

Validation rules:
- Quantity must be 1-99
- Stock check before add
- Personalization fields validated against product's personalizationOptions schema
- Cart items auto-delete if product is deactivated

### Phase 4: Tests (`actions/__tests__/cart.test.ts`)

Use vitest. Mock the DB via Drizzle queries (not the whole DB).
Test in this order (vertical slices):

1. `addToCart()` adds item with correct quantity
2. `addToCart()` increments quantity for same variant+personalization combo
3. `addToCart()` throws error when stock insufficient
4. `addToCart()` throws error when product is inactive
5. `updateCartItem()` updates quantity
6. `updateCartItem()` removes item when quantity=0
7. `removeFromCart()` deletes item
8. `getCart()` returns items with product names and unit prices
9. `getCartTotal()` calculates totals correctly
10. `addToCart()` throws `UNAUTHORIZED` when user not signed in

## Tech Stack
- **Runtime:** Node.js 22, Next.js 16 App Router
- **ORM:** Drizzle ORM with Neon PostgreSQL
- **Test framework:** Vitest (v4.0.18)
- **Auth:** Better Auth (server-side session check)
- **Money:** All prices in ZAR cents (integers, no floats)

## Constraints
- Run `npm run test:run` after each implementation cycle
- Run `npx next build` at the end to verify no build breaks
- All new code must pass `npm run typecheck`
- Follow the existing patterns in `actions/__tests__/repairs.test.ts` for test style
- Personalization data stored as jsonb — validate against the personalizationOptions schema

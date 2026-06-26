# Task: Storefront UI — Products + Cart Pages

## Project Context
KitFix 2.0 at `/root/kitfix-2.0` — Next.js 16 App Router, Drizzle/Neon, Better Auth, Tailwind 4, shadcn/ui.
AGENTS.md has full structure. E-commerce DB schema already built (products, productVariants, personalizationOptions, cartItems tables). Product queries at `lib/db/queries/products.ts`. Cart server actions at `actions/cart.ts`.

## Role
Build the storefront UI: product catalog listing, product detail with variant picker + personalization form, and cart page. Use TDD where possible (component tests, data flow validation).

## What to Build

### 1. Store Layout (`app/(store)/layout.tsx`)
- Wrap with customer auth guard (or make it public for browsing, auth only for cart)
- Top nav with "Shop" link, cart icon with item count badge
- Tailwind 4, use shadcn/ui primitives from `components/ui/`
- Route group layout — no sidebar, just top nav

### 2. Product Listing (`app/(store)/page.tsx`)
- Server component — fetch active products via `getActiveProducts()`
- Display as a responsive grid (2 cols mobile, 3 tablet, 4 desktop)
- Each card: product image placeholder, name, price (format ZAR from cents), "View" link
- Empty state when no products
- Loading skeleton

### 3. Product Detail (`app/(store)/[slug]/page.tsx`)
- Server component that fetches product by slug via `getProductBySlug()`
- Product info: name, description, price
- **Variant picker**: size selector (XS, S, M, L, XL, 2XL, 3XL, Kids sizes) — client component that checks stock
- **Personalization fields**: dynamically rendered from `personalizationOptions` — text inputs for name/number, selects for other field types, enforce maxLength and required
- **Add to cart button**: client component that calls `addToCart()` server action
- Show "Out of stock" for variants with 0 stock
- 404 if slug doesn't exist

### 4. Cart Page (`app/(store)/cart/page.tsx`)
- Client component (needs interactivity for quantity updates and removal)
- Shows all cart items with: product name, variant size, personalization preview, quantity, unit price, line total
- Update quantity inline (dropdown or +/- buttons)
- Remove button per item
- Cart total + "Proceed to checkout" button
- Empty cart state with link to shop
- Auth guard: redirect to sign-in if not logged in

### 5. Cart Badge (shared component)
- `components/store/CartBadge.tsx` — client component showing item count in nav
- Fetches cart on mount, shows count badge

### 6. Tests (`actions/__tests__/storefront.test.ts`)
Write integration-style tests for:
1. Product listing renders active products
2. Product detail loads correct product
3. Variant selector shows stock status
4. Add to cart flow (click size → add → cart updates)
5. Cart page shows items and totals
6. Empty cart state renders correctly
7. Out-of-stock variant shows proper message

Use `@testing-library/react` if available, or keep to server action / data flow tests if not.

## Tech Stack
- **Framework:** Next.js 16 App Router (RSC by default, 'use client' where needed)
- **Styling:** Tailwind 4 with tw-animate-css
- **UI primitives:** shadcn/ui (Card, Button, Badge, Select, Input, Skeleton)
- **Icons:** lucide-react
- **Animations:** framer-motion (optional, for cart transitions)
- **Money:** Format ZAR cents to Rands (e.g. `R 249.99`)

## Constraints
- Run `npm run typecheck` after implementation
- Run `npx next build` at the end — must compile clean
- Follow existing patterns: server components default, client only where interactivity required
- Personalization fields must be driven by DB config (not hardcoded)
- Cart count badge fetches fresh data (no global state yet)

# Feature: Admin Store - Product/Inventory Management

**From build-plan:** feature 12a (split from 12 - orders deferred to 12b pending checkout feature #13)
**Status:** shipped
**Completed:** 2026-08-25

## Goal

Add product and inventory management to the admin dashboard so Leroy can create, edit, and manage products (jerseys, accessories) with variants (sizes) and personalization options (name, number, etc.). This is the first half of the admin store; order management ships after the customer checkout flow (feature #13).

## Design reference

No visual mockup. Build against the existing admin dashboard patterns in `app/admin/(protected)/` - same header, stitch seam, dark pitch palette, sharp corners, monospace labels. Reference: `app/admin/(protected)/page.tsx`, `app/admin/(protected)/jobs/[id]/page.tsx`.

## In scope

- Convex schema: `products`, `productVariants`, `personalizationOptions` tables
- Convex queries and mutations for CRUD operations
- Admin products list page (`/admin/store`) with table, status toggle, delete
- Admin product create/edit form (`/admin/store/new`, `/admin/store/[id]`) with variant and personalization option management
- Admin store sub-navigation layout
- Slug auto-generation from product name
- Validation: base price > 0, at least one variant, unique slugs

## Out of scope

- Order management (feature 12b, depends on checkout #13)
- Customer-facing storefront (feature #15)
- Product image upload to Convex storage (use imageUrl text field for now; Convex storage integration deferred)
- Inventory reservation or stock decrement on order (deferred to #13)

## Build steps

- [x] **Step 1 - Convex schema: products, variants, personalization options** - Add three new tables to `convex/schema.ts`
- [x] **Step 2 - Convex queries: product listing and detail** - Create `convex/products.ts` with queries
- [x] **Step 3 - Convex mutations: product CRUD** - Add mutations to `convex/products.ts`
- [x] **Step 4 - Admin store layout and sub-navigation** - Create `app/admin/(protected)/store/layout.tsx`
- [x] **Step 5 - Admin products list page** - Create `app/admin/(protected)/store/page.tsx`
- [x] **Step 6 - Admin product form: create and edit** - Create create/edit form pages
- [x] **Step 7 - Product delete confirmation and status toggle** - Confirmation dialog + optimistic toggle
- [x] **Step 8 - Type check, lint, and build verification** - `npx tsc --noEmit`, `npm run lint`, `npm run build` pass

## Files / areas

### New files
- `convex/products.ts` - queries and mutations for products, variants, personalization options
- `app/admin/(protected)/store/layout.tsx` - store sub-navigation layout
- `app/admin/(protected)/store/page.tsx` - products list
- `app/admin/(protected)/store/new/page.tsx` - create product form
- `app/admin/(protected)/store/[id]/page.tsx` - edit product form

### Modified files
- `convex/schema.ts` - add products, productVariants, personalizationOptions tables
- `app/admin/(protected)/page.tsx` - add "Store" link to admin header nav

## Findings

### 12a/F-01 [P2] accepted - Personalization options hard-deleted on update while variants soft-deactivate

**File:** `convex/products.ts:369-374`
**Found:** 2026-08-25 by /audit (scope: current; lens: quality + security + correctness)
**Why it matters:** The `update` mutation hard-deletes removed personalization options (`db.delete`) while removed variants are soft-deactivated (`patch isActive: false`). This asymmetry means deleting a personalization option permanently destroys it from the database, breaking any future audit trail or historical reference. The spec notes this deviation but the inconsistency with the variant sync pattern is a maintainability risk: a future developer may assume all child entities follow the same soft-delete strategy.
**Suggested fix:** Either soft-deactivate personalization options (`isActive: false`) matching the variant pattern (requires adding `isActive` to the `personalizationOptions` table), or document the intentional asymmetry in the spec as a deliberate design choice with rationale (personalization options are form metadata, not inventory, so hard-delete is defensible). A brief comment in `products.ts` explaining _why_ would suffice.
**Resolution:** Accepted — documented as intentional asymmetry with a rationale comment in `convex/products.ts` (update handler). Personalization options are form metadata, not inventory; hard-delete is defensible. Revisit when orders (12b/13) land.

### 12a/F-02 [P2] closed - computeVariantStats includes inactive variant stock in totalStock

**File:** `convex/products.ts:6-24`
**Found:** 2026-08-25 by /audit (scope: current; lens: quality + correctness)
**Why it matters:** `computeVariantStats` iterates all variants and sums `v.stock` for `totalStock` without filtering on `isActive`. A deactivated variant's stock still counts toward the product's total. This means a product with 100 units in an active variant and 50 units in a deactivated variant shows `totalStock: 150`. The `list` query returns this to the admin product table, presenting misleading inventory numbers. The `displayPriceModifier` correctly filters to `isActive` variants only, so the inconsistency is within the same function.
**Suggested fix:** Filter to active variants for the totalStock sum: `if (v.isActive) totalStock += v.stock;`. The `variantCount` (total variants including inactive) can remain unfiltered if the admin needs visibility into all variants.
**Resolution:** Fixed and verified — `computeVariantStats` now sums stock only for `isActive` variants; `variantCount` still includes all variants for admin visibility.

## Notes

- **Convex, not server actions.** This project uses Convex for all data operations.
- **Admin auth.** The `(protected)` layout already calls `checkAdmin()`. No additional auth guard needed in store pages.
- **Design system.** CSS variables from `globals.css`. Sharp corners, no rounded elements. Monospace font for labels and data. Uppercase tracking for section headers.
- **TODO (confirm):** Category values - "jersey", "accessory", "other". Sizes - XS, S, M, L, XL, 2XL, 3XL, Kids. Product image approach - plain imageUrl text field.

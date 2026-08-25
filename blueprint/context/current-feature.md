# Feature: Admin Store - Product/Inventory Management

**From build-plan:** feature 12a (split from 12 - orders deferred to 12b pending checkout feature #13)
**Status:** not started

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

## Build loop

Build one step at a time, never the whole feature at once.

1. Plan mode lays out the step before any code.
2. The AI implements just that step.
3. It shows the diff (not full files); you read it and understand it.
4. You approve, then choose whether to commit a checkpoint or roll straight on.

Never accept a step you haven't read. If a diff is too big to review, the step was too big, so split it.

## Build steps

- [x] **Step 1 - Convex schema: products, variants, personalization options** - Add three new tables to `convex/schema.ts`: `products` (name, slug, description, basePrice in ZAR cents, category, imageUrl, isActive, createdAt, updatedAt), `productVariants` (productId FK, size, stock, priceModifier in ZAR cents, isActive), `personalizationOptions` (productId FK, label, type text/select, required, maxLength, options array). Add indexes: `products.by_slug`, `products.by_category`, `productVariants.by_productId`, `personalizationOptions.by_productId`. *Done when:* `npx convex dev` runs without schema errors, tables visible in Convex dashboard.

- [x] **Step 2 - Convex queries: product listing and detail** - Create `convex/products.ts` with queries: `list` (all products with variant count and total stock), `listActive` (active products only, for future storefront), `get` (single product with all variants and personalization options), `getBySlug` (for future storefront URLs). Each query returns computed fields: `totalStock` (sum of variant stocks), `variantCount`. *Done when:* queries type-check with `npx tsc --noEmit`, can be called from Convex dashboard.

- [x] **Step 3 - Convex mutations: product CRUD** - Add to `convex/products.ts`: `create` (product + variants + personalization options in one transaction), `update` (sync variants: add new, update existing, remove deleted; sync personalization options similarly), `softDelete` (set isActive=false), `toggleActive` (flip isActive). Validate: basePrice > 0, at least one variant with stock >= 0, unique slug (query before insert/update). Auto-generate slug from name (lowercase, hyphenated, append `-2`, `-3` on collision). *Done when:* create/update/delete work from Convex dashboard, validation errors thrown for invalid input.

- [ ] **Step 4 - Admin store layout and sub-navigation** - Create `app/admin/(protected)/store/layout.tsx` with sub-navigation tabs (Products active, Orders grayed out/coming soon). Follow the existing tab pattern from `admin-dashboard.tsx` (font-mono, uppercase, tracking, stitch-gold active state). Add a "Store" link to the admin header in `app/admin/(protected)/page.tsx`. *Done when:* `/admin/store` renders with the sub-nav, "Store" link visible in admin header, existing admin pages unaffected.

- [ ] **Step 5 - Admin products list page** - Create `app/admin/(protected)/store/page.tsx` as a `"use client"` component using Convex hooks. Table with columns: Name, Category, Price (Rands), Variants (count), Total Stock, Status (active/inactive badge), Actions (edit link, toggle, delete). "Add Product" button linking to `/admin/store/new`. Empty state when no products. Follow existing admin card/table style (border pitch-line, bg pitch/15, monospace labels). *Done when:* page loads at `/admin/store`, shows empty state, "Add Product" button visible.

- [ ] **Step 6 - Admin product form: create and edit** - Create `app/admin/(protected)/store/new/page.tsx` and `app/admin/(protected)/store/[id]/page.tsx`. Form fields: name (text), description (textarea), slug (auto-generated from name, editable), category (select: "jersey", "accessory", "other"), basePrice (number input, displayed in Rands), imageUrl (text input for URL). Variants section: dynamic list with size (select: XS, S, M, L, XL, 2XL, 3XL, Kids), stock (number), priceModifier (number, default 0). Add/remove variant buttons. Personalization options section: dynamic list with label (text), type (select: text, select), required (checkbox), maxLength (number, shown for text type), options (comma-separated text, shown for select type). Add/remove option buttons. Save button calls the appropriate Convex mutation. Validation: basePrice > 0, at least one variant, slug not empty. *Done when:* can create a product with 2 variants and 1 personalization option, appears in product list; can edit existing product, changes persist.

- [ ] **Step 7 - Product delete confirmation and status toggle** - Add a confirmation dialog (simple inline expand, not a modal library) before soft-deleting a product. Toggle active/inactive directly from the product list with optimistic update. *Done when:* delete shows confirmation text before executing, toggle flips status immediately in UI.

- [ ] **Step 8 - Type check, lint, and build verification** - Run `npx tsc --noEmit`, `npm run lint`, and `npm run build` (with `CSS_TRANSFORMER_WASM=true`). Fix any errors. *Done when:* all three commands pass cleanly.

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

## Data / contracts

### Convex schema additions

```typescript
products: defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.string(),
  basePrice: v.number(),           // ZAR cents (integer) — matches jobs.quote convention
  category: v.union(v.literal("jersey"), v.literal("accessory"), v.literal("other")),
  imageUrl: v.optional(v.string()),
  isActive: v.boolean(),
  createdAt: v.number(),           // epoch ms
  updatedAt: v.number(),           // epoch ms
})
  .index("by_slug", ["slug"])
  .index("by_category", ["category"])

productVariants: defineTable({
  productId: v.id("products"),
  size: v.string(),                // "XS" | "S" | "M" | "L" | "XL" | "2XL" | "3XL" | "Kids"
  stock: v.number(),               // >= 0
  priceModifier: v.number(),       // ZAR cents added to basePrice (can be negative for discounts)
  isActive: v.boolean(),
})
  .index("by_productId", ["productId"])

personalizationOptions: defineTable({
  productId: v.id("products"),
  label: v.string(),               // e.g. "Name", "Number", "Sleeve text"
  type: v.union(v.literal("text"), v.literal("select")),
  required: v.boolean(),
  maxLength: v.optional(v.number()), // for text type
  options: v.optional(v.array(v.string())), // for select type
})
  .index("by_productId", ["productId"])
```

### Computed fields returned by queries

- `totalStock`: sum of `stock` across all variants for a product
- `variantCount`: number of variants for a product
- `displayPrice`: `basePrice` (lowest variant price = basePrice + min priceModifier, computed in query)

### Price convention

Prices are stored as **ZAR cents** (integers, no floats), matching the existing `jobs.quote` + `quoteHistory` convention (`convex/schema.ts` comment: "quote (cents)"). The UI formats cents as Rands (`R{price/100}`) for display. The form accepts Rands input and converts ×100 on submit.

## Testing

No test runner is configured. Verification relies on:
- `npx tsc --noEmit` for type checking
- `npm run lint` for code quality
- `npm run build` for build verification
- Convex dashboard for querying/mutating data during development
- Manual browser verification at `/admin/store`, `/admin/store/new`, `/admin/store/[id]`

## Notes for the AI

- **Convex, not server actions.** This project uses Convex for all data operations. Do NOT create Next.js server actions. Mutations and queries go in `convex/products.ts`.
- **Admin auth.** The `(protected)` layout already calls `checkAdmin()`. No additional auth guard needed in store pages.
- **Design system.** Use CSS variables from `globals.css` (`--color-pitch-deep`, `--color-pitch`, `--color-pitch-line`, `--color-thread`, `--color-thread-dim`, `--color-stitch`, `--color-foul`, `--color-ink`). Sharp corners, no rounded elements. Monospace font (`font-mono`) for labels and data. Uppercase tracking for section headers.
- **Pattern reference.** Follow `app/admin/admin-dashboard.tsx` for Convex hook usage (`useQuery`, `useMutation`), and `app/admin/(protected)/jobs/[id]/page.tsx` for form patterns. Both are `"use client"` components.
- **Path alias.** `@/*` maps to project root (not `./src/*`).
- **Slug uniqueness.** Check slug collision in the Convex mutation before inserting. Append `-2`, `-3`, etc. if taken.
- **Variant sync on update.** When editing a product, the update mutation receives the full variant list. Match by `_id` for existing variants, create new ones for entries without `_id`, and deactivate (not delete) removed ones.
- **TODO (confirm):** Category values - using "jersey", "accessory", "other" as defaults. Adjust if Leroy has specific categories in mind.
- **TODO (confirm):** Sizes - using XS, S, M, L, XL, 2XL, 3XL, Kids as defaults. Adjust if needed.
- **TODO (confirm):** Product image approach - using a plain imageUrl text field for now. Convex file storage integration (like jobs photos) could be added later.

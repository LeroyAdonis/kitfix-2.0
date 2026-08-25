# Findings

> **Generated file.** The findings ledger: review findings raised by `/audit`
> against the work in progress, each with a durable ID, severity (P0-P3), and
> status. `/implement` marks repaired findings `fixed`, a later `/audit` pass
> moves them to `closed`, and `/complete` refuses to merge while any P0 or P1
> finding is `open` or `fixed`, then archives resolved findings with the work
> and resets this file.

_No findings recorded. `/audit` appends findings here when it finds them._

### F-01 [P2] open - Personalization options hard-deleted on update while variants soft-deactivate

**File:** `convex/products.ts:369-374`
**Found:** 2026-08-25 by /audit (scope: current; lens: quality + security + correctness)
**Why it matters:** The `update` mutation hard-deletes removed personalization options (`db.delete`) while removed variants are soft-deactivated (`patch isActive: false`). This asymmetry means deleting a personalization option permanently destroys it from the database, breaking any future audit trail or historical reference. The spec notes this deviation but the inconsistency with the variant sync pattern is a maintainability risk: a future developer may assume all child entities follow the same soft-delete strategy.
**Suggested fix:** Either soft-deactivate personalization options (`isActive: false`) matching the variant pattern (requires adding `isActive` to the `personalizationOptions` table), or document the intentional asymmetry in the spec as a deliberate design choice with rationale (personalization options are form metadata, not inventory, so hard-delete is defensible). A brief comment in `products.ts` explaining _why_ would suffice.
**Resolution:** Documented as intentional asymmetry with a rationale comment in `convex/products.ts` (update handler). Revisit when orders (12b/13) land.

### F-02 [P2] fixed - computeVariantStats includes inactive variant stock in totalStock

**File:** `convex/products.ts:6-24`
**Found:** 2026-08-25 by /audit (scope: current; lens: quality + correctness)
**Why it matters:** `computeVariantStats` iterates all variants and sums `v.stock` for `totalStock` without filtering on `isActive`. A deactivated variant's stock still counts toward the product's total. This means a product with 100 units in an active variant and 50 units in a deactivated variant shows `totalStock: 150`. The `list` query returns this to the admin product table, presenting misleading inventory numbers. The `displayPriceModifier` correctly filters to `isActive` variants only, so the inconsistency is within the same function.
**Suggested fix:** Filter to active variants for the totalStock sum: `if (v.isActive) totalStock += v.stock;`. The `variantCount` (total variants including inactive) can remain unfiltered if the admin needs visibility into all variants.
**Resolution:** Fixed 2026-08-25 — `computeVariantStats` now sums stock only for `isActive` variants; `variantCount` still includes all variants for admin visibility. Verified with tsc + convex typecheck.

### F-03 [P2] open - Soft-delete mutation name is misleading

**File:** `convex/products.ts:400-407`
**Found:** 2026-08-25 by /audit (scope: current; lens: quality)
**Why it matters:** `softDelete` sets `isActive: false` and `updatedAt: Date.now()` but the Convex schema has an `archivedAt` field on `jobs` for true soft-delete. More importantly, `softDelete` and `toggleActive` are functionally equivalent operations (both flip `isActive` and set `updatedAt`) with the only difference being that `softDelete` always sets to `false` while `toggleActive` flips. The product remains visible in the admin list (not filtered out). This naming creates confusion about what "soft delete" actually means in this context.
**Suggested fix:** Rename to `deactivate` to match what it actually does, or make `softDelete` actually soft-delete by setting an `archivedAt` timestamp and filtering archived products out of the `list` query. At minimum, the delete confirmation text ("This hides it from the storefront") is inaccurate since the product still appears in the admin list.
**Resolution:**

### F-04 [P2] open - N+1 query pattern in list and listActive queries

**File:** `convex/products.ts:34-51`, `convex/products.ts:66-86`
**Found:** 2026-08-25 by /audit (scope: current; lens: performance + quality)
**Why it matters:** Both `list` and `listActive` fire a separate `productVariants` query per product inside `Promise.all`. For N products, this issues N+1 queries. In Convex these are sub-queries within the same transaction (no network overhead), so this won't cause performance issues at current scale. However, it's a code-quality pattern issue: the identical N+1 logic is duplicated across both queries (and in `get`/`getBySlug`). If variant count or product count grows, this pattern becomes the bottleneck. Convex lacks a join or foreign-key query, so the pattern is somewhat idiomatic, but worth tracking.
**Suggested fix:** Acceptable at current admin scale (<100 products). For future-proofing, consider batch-fetching all variants for the product set in a single query and grouping them by `productId` in a Map. Also note the identical fetch-and-compute logic duplicated between `list` and `listActive` - a shared helper would reduce this.
**Resolution:**

### F-05 [P3] open - Duplicate nameToSlug between ProductForm and Convex mutation

**File:** `components/admin/ProductForm.tsx:45-50`, `convex/products.ts:158-163`
**Found:** 2026-08-25 by /audit (scope: current; lens: quality)
**Why it matters:** The `nameToSlug` helper is implemented identically in both the client component and the server mutation. The client version is used only to show a read-only slug preview; the server version is authoritative. If one diverges (different character handling, different collision logic), the preview becomes misleading. This is a minor duplication, but extracting to a shared `lib/slug.ts` would enforce consistency.
**Suggested fix:** Low priority. Extract to `lib/slug.ts` and import from both locations, or accept the duplication as intentional (server owns truth, client preview is best-effort). A comment on the client version noting "mirrors convex/products.ts:nameToSlug - server is authoritative" would suffice.
**Resolution:**

### F-06 [P3] open - Deleting personalization options while editing preserves stale options

**File:** `components/admin/ProductForm.tsx:109-111`
**Found:** 2026-08-25 by /audit (scope: current; lens: correctness)
**Why it matters:** When editing a product, removing a personalization option from the form and saving triggers `db.delete` on the server (via F-01). If the admin saves but the product already has customer-facing orders referencing that option (future feature 12b/13), the delete will orphan those references. This is not yet a live risk (orders aren't built), but the asymmetry with the variant soft-delete pattern means the future orders feature will need a different approach for personalization options vs variants.
**Suggested fix:** This is really a downstream consequence of F-01. Resolving F-01 (soft-deactivate instead of hard-delete) resolves this. For now, add a note in the spec that personalization options are hard-deleted intentionally and orders will need to snapshot option state.
**Resolution:**

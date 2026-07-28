# Implementation Plan: Design Token & Anti-Slop Cleanup

**Spec:** `.specify/specs/design-token-cleanup/spec.md`
**Constitution:** `.specify/memory/constitution.md`
**Date:** 2026-07-28

## Technical Context

| Dimension | Decision | Rationale |
|---|---|---|
| Project | Next.js 16 + Tailwind v4 | Existing stack |
| Styling | Tailwind v4 `@theme` tokens + globals.css | Existing setup |
| Tool | OpenCode CLI (`opencode run --auto`) | User requested OpenCode for delegation |

## Constitution Check

| Principle | Compliance |
|---|---|
| Token-First Design | ✅ Core purpose of this cleanup |
| Clean Token Names | ✅ Renaming `--color-text-*` → `--color-content-*` |
| Dark Premium Aesthetic | ✅ Color values unchanged, only naming |
| No AI Hallmarks | ✅ Removing icon-circle, inline hex |
| Interactive Accessibility | ✅ Bumping touch targets to h-11 |

## Implementation Phases

### Phase 1: CSS Token Rename
**Goal:** Update `app/globals.css` `@theme` block with new token names.

**Changes in `app/globals.css`:**
- `--color-text-primary` → `--color-content`
- `--color-text-secondary` → `--color-content-secondary`
- `--color-text-tertiary` → `--color-content-tertiary`
- `--color-text-disabled` → `--color-content-disabled`
- `--color-text-link` → `--color-content-link` (value stays `var(--brand-green-vibrant)`)
- `--color-bg-deep` → `--color-surface-deep`
- `--color-bg` → `--color-surface-base`
- `--color-bg-elevated` → `--color-surface-elevated`
- `--color-surface` stays (already clean)
- `--color-surface-hover` stays (already clean)
- `--color-surface-active` stays (already clean)
- `--color-surface-elevated` stays (already clean)

Also update: `--color-border` → `--color-border-default` for consistency.

**Also update the raw CSS variable references in `:root` and `[data-theme="light"]`** where `--color-border` is used: line 123 `--color-border: #2D2D30;` etc.

### Phase 2: TSX Token Class Rename (134 instances)
**Goal:** Update all `.tsx` files using the old token classes.

Files to update:
- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/layout.tsx`
- `app/(auth)/verify-email/page.tsx`
- `app/(auth)/sign-in/page.tsx`
- `app/(auth)/sign-up/page.tsx`
- `app/(customer)/payments/page.tsx`
- `app/(customer)/profile/page.tsx`
- `app/(customer)/notifications/page.tsx`
- `app/(customer)/repairs/new/page.tsx`
- `app/(customer)/repairs/page.tsx`
- `app/(customer)/repairs/[id]/page.tsx`
- `app/(store)/checkout/checkout-form.tsx`
- `app/(store)/checkout/page.tsx`
- `app/(store)/orders/page.tsx`
- `app/(store)/orders/[id]/page.tsx`
- `app/(store)/shop/cart/cart-content.tsx`
- `app/(store)/shop/page.tsx`
- `app/(store)/shop/[slug]/page.tsx`
- `app/(store)/layout.tsx`
- `app/(admin)/admin/orders/page.tsx`
- `app/(admin)/admin/page.tsx`
- `app/(admin)/admin/store/page.tsx`
- `app/(admin)/layout.tsx`
- `app/(admin)/loading.tsx`
- `app/contact/page.tsx`
- `app/globals.css`

### Phase 3: Payment Page Refactor
**Goal:** Replace raw grays with token classes in `app/(customer)/repairs/[id]/payment/page.tsx`.

Map: `text-gray-900` → `text-content`, `text-gray-800` → `text-content-secondary`, `text-gray-700` → `text-content`, `text-gray-600` → `text-content-secondary`, `text-gray-500` → `text-content-tertiary`, `bg-gray-50` → `bg-surface`, `bg-gray-200` → `bg-surface-hover`, `border-gray-200` → `border-border-default`, `border-gray-100` → `border-border-default`, `bg-white` → `bg-surface`.

### Phase 4: global-error.tsx Cleanup
**Goal:** Remove inline hex + icon-circle.

The `global-error.tsx` renders a standalone `<html><body>` (outside the app tree), so it can't use Tailwind classes. Options:
1. Use inline styles referencing CSS variables (preferred): `color: "var(--text-primary)"` etc.
2. Add a `<style>` block in the component
3. Use a dark/light color scheme media query

Replace the icon-circle with a simpler icon element (inline SVG or text, no circular wrapper).

### Phase 5: Landing Page Fix
**Goal:** `app/page.tsx` `bg-[#080808]` → `bg-surface-deep`.

### Phase 6: Touch Target Bump
**Goal:** Find and bump `h-10` buttons/links to `h-11`.

Check all interactive elements across auth pages, store pages, and admin pages.

## Risk Areas

- `global-error.tsx` cannot use Tailwind tokens because it's outside the React/Next.js CSS context. Must use CSS variables or inline `style` with `var()`.
- The `--color-text-link` token's value maps to `var(--brand-green-vibrant)` — verify this still works with new name.
- `.btn-primary` and button classes in globals.css use CSS variables that need updating.

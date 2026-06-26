# Task: KitFix Design Implementation — Phase 2 (Pages)

## Overview
Apply the new design system to all page-level components. Phase 1 (tokens + layout + UI primitives) must be completed first. Read `.hermes/tasks/design-system-tokens.md` for token reference. Read `docs/kitfix-design-direction.html` for visual reference.

## Prerequisites
The following should exist from Phase 1:
- New CSS tokens in `globals.css`
- Updated shadcn/ui components with gold accent
- Redesigned nav/sidebar/footer
- Component classes: `.btn-primary`, `.btn-secondary`, `.card-base`, `.badge`, `.pill`, `.skeleton`, `.empty-state`
- DM Sans font in layout
- `lib/design-tokens.ts` with token constants

## Theme System

### Light/Dark Toggle
Add a theme toggle component (`components/ThemeToggle.tsx`):
- Sun/moon icon button in the navbar
- Toggles `data-theme="dark"`/`data-theme="light"` on `<html>`
- Persist preference in `localStorage`
- Default to `prefers-color-scheme` if no saved preference
- Smooth transition (`250ms ease-out-expo`) on all themed properties

### Accent Color Picker
Add an accent color selector in the user settings / admin area:
- Toggles `data-accent` attribute on `<html>`
- Options: gold (default), green, orange, blue, purple
- Each accent sets `--accent`, `--accent-light`, `--accent-dark`, `--accent-glow`
- Persist preference in `localStorage`
- Show a small color indicator badge in the nav

### Implementation
In `app/layout.tsx`, add a script block (or client component wrapper) that:
1. Reads `localStorage` for theme and accent preferences
2. Sets `data-theme` and `data-accent` on `<html>` before any paint
3. Prevents flash of wrong theme

CSS in `globals.css`:
```css
/* Theme transition */
html {
  transition: background-color 250ms cubic-bezier(0.16, 1, 0.3, 1),
              color 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Base surface colors using CSS variables */
body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
}
/* All components reference var(--accent) instead of hardcoded gold */
button, .btn-primary {
  background: var(--accent);
  /* ... */
}
```

All component styles should reference `var(--accent)` instead of hardcoded gold values so they automatically switch when the accent changes.

## What to Build

### 1. Homepage (app/page.tsx or components)
Redesign the landing page:
- Full-bleed hero with gradient orbs and subtle grid overlay
- "We Fix What Matters" headline in DM Sans 800
- Gold "Start a Repair →" CTA pill + secondary "Browse Shop" outline
- Stats bar: 2,500+ Jerseys Repaired, 98% Satisfaction, 4.9★ Rating, 3 Days Turnaround
- "How It Works" 4-step process with numbered cards and arrow connectors
- Product showcase (if on homepage)

### 2. Auth Pages (app/(auth)/)
- **Sign In:** Centered card on dark bg, gold accent on "Sign in" button, forgot password link as secondary
- **Sign Up:** Same layout, add name field
- **Forgot Password:** Email input + submit CTA
- **Verify Email:** Confirmation state with success icon
- **All states:** Form validation errors (red border + message), loading spinner on submit, success confirmation, empty initial state

### 3. Storefront Pages (app/(store)/)
- **Shop Listing (shop/page.tsx):** Product grid with card hover effects, category badges, size chips
- **Shop Detail (shop/[slug]/):** Split layout — gallery left, info right, gold variant picker, personalization fields with gold focus, pill "Add to Cart" button
- **Cart (shop/cart/):** Split layout — items list left, sticky summary card right, gold checkout button
- **Checkout:** Clean form layout, shipping address fields, order summary card
- **Orders list + detail:** Status badges (gold=paid, green=shipped, etc.), timeline for tracking
- **Empty states:** Empty cart, empty orders, empty search results
- **Loading states:** Skeleton cards for product grid, skeleton lines for text
- **Error states:** Product not found (404), network error with retry

### 4. Customer Pages (app/(customer)/)
- **Dashboard:** Stats cards, recent activity timeline, quick actions
- **Repairs list:** Table/card list with status badges, filter by status
- **Repair detail:** 7-stage timeline (gold completed, current pulsing, pending muted) 
- **New Repair form:** Multi-step form with progress indicator
- **Profile:** Settings form with dark inputs
- **Payments:** Payment history table
- **Notifications:** Notification list with unread indicators
- **Empty states:** No repairs yet, no payments, no notifications

### 5. Admin Pages (app/(admin)/)
- **Dashboard:** Stats cards with gold accents, charts if any
- **Store management:** Product table, create/edit form
- **Order management:** Order table with status filters
- **All admin tables:** Consistent styling with dark header rows, hover highlight
- **Admin sidebar:** Gold active indicators

## Component States Required
For every page, ensure:
- [ ] Loading states (skeleton animations)
- [ ] Empty states (centered icon + message + CTA)
- [ ] Error states (retry button, error message)
- [ ] Success states (confirmation checkmarks)
- [ ] Form validation (inline errors on fields)
- [ ] Disabled states (dimmed buttons/inputs)
- [ ] Responsive layout (mobile-first)
- [ ] Focus indicators (keyboard navigation)

## UX Writing
- Use SA terminology: "jersey" not "jersey shirt", "Rands" for prices
- Short, active CTAs: "Start a Repair", "Browse Shop", "Track Order"
- Confident, warm tone — "We fix what matters"

## Constraints
- Use the CSS classes from Phase 1 (`.btn-primary`, `.card-base`, etc.)
- Update Tailwind classes in JSX to use new design tokens
- Don't change component logic or server actions — just styling
- Run `npm run typecheck` after implementation
- Run `npx next build` at the end — must compile clean

# Feature Spec: Design Token & Anti-Slop Cleanup

**Date:** 2026-07-28
**Constitution:** `.specify/memory/constitution.md`
**Status:** Ready for Planning

## Vision Statement
The KitFix codebase should use its design tokens consistently. Every page — whether auth, store, customer portal, or admin panel — renders the same visual language because they all reference the same tokens. No page stands out as "the one that still uses old gray classes." The error boundary handles failures without relying on AI-slop patterns like icon-circles or inline hex color leaks.

## Functional Requirements

### FR-1: Eliminate Double-Prefix Token Classes
The ~134 instances of `text-text-primary`, `text-text-secondary`, `text-text-tertiary`, `bg-bg-deep`, `bg-bg-elevated`, and `border-border` MUST be replaced with clean token names.

**Token mapping:**
| Old (in CSS `@theme`) | New CSS name | Old Tailwind class | New Tailwind class |
|---|---|---|---|
| `--color-text-primary` | `--color-content` | `text-text-primary` | `text-content` |
| `--color-text-secondary` | `--color-content-secondary` | `text-text-secondary` | `text-content-secondary` |
| `--color-text-tertiary` | `--color-content-tertiary` | `text-text-tertiary` | `text-content-tertiary` |
| `--color-text-disabled` | `--color-content-disabled` | `text-text-disabled` | `text-content-disabled` |
| `--color-text-link` | `--color-content-link` | `text-text-link` | `text-content-link` |
| `--color-bg-deep` | `--color-surface-deep` | `bg-bg-deep` | `bg-surface-deep` |
| `--color-bg` | `--color-surface-base` | `bg-bg` | `bg-surface-base` |
| `--color-bg-elevated` | `--color-surface-elevated` | `bg-bg-elevated` | `bg-surface-elevated` |

### FR-2: Remove Raw Gray Classes from Payment Page
`app/(customer)/repairs/[id]/payment/page.tsx` uses 17 instances of `text-gray-*`, `bg-gray-*`, `border-gray-*` classes. Replace with appropriate design tokens.

### FR-3: Replace Inline Hex in global-error.tsx
`app/global-error.tsx` uses 11 inline hex color values. Replace with token-aware classes or CSS custom properties (note: this file is outside the React tree, so must use inline `style` with token-aware fallback logic or align with the design system).

### FR-4: Replace Inline Hex in Landing Page
`app/page.tsx` uses `bg-[#080808]` — replace with `bg-surface-deep` (or equivalent token).

### FR-5: Remove Icon-Circle from Error Page
`app/global-error.tsx` has a 3.5rem circular div with an emoji icon — this is Hallmark Gate 1 violation. Replace with a simpler, non-icon-circle pattern.

### FR-6: Bump Touch Targets
Check for interactive elements using `h-10` (40px) — bump to `h-11` (44px minimum per WCAG touch target guidance).

## Acceptance Criteria

- [ ] No `text-text-` or `bg-bg-` or `border-border` classes remain in any `.tsx` file
- [ ] CSS `@theme` block uses `--color-content`, `--color-surface-*`, `--color-border-default` naming
- [ ] Payment page has zero `text-gray-*` or `bg-gray-*` classes
- [ ] `global-error.tsx` has no inline hex color values
- [ ] `global-error.tsx` has no icon-circle pattern
- [ ] `app/page.tsx` uses token class `bg-surface-deep` not `bg-[#080808]`
- [ ] All interactive elements use `h-11` or larger
- [ ] `npm run build` succeeds cleanly

## Out of Scope
- Adding new features or pages
- Changing the color values themselves (only renaming tokens)
- Updating test files for renamed tokens
- Adding dark/light mode toggle logic
- Changing the accent theme system

## Assumptions
- The `--color-border` token in globals.css is used in both `@theme` and raw CSS variables. It's fine as-is since `border-border` only appears once in globals.css and the actual Tailwind utility `border-border` resolves correctly via `@theme`.

# KitFix 2.0 Constitution

**Ratified:** 2026-07-28
**Version:** 1.0.0

## Principles

### 1. Token-First Design
Every visual element MUST use design system tokens. Raw Tailwind utility colors (`text-gray-*`, `bg-gray-*`, `border-gray-*`) and inline hex values are forbidden outside of `globals.css`. The design system is the single source of truth.

### 2. Clean Token Names
Token names in the `@theme inline {}` block MUST NOT start with a Tailwind utility prefix (`text-`, `bg-`, `border-`, `shadow-`, `ring-`, `outline-`). `--color-text-primary` generates `text-text-primary` which is confusing and fragile. Use `--color-content`, `--color-surface`, `--color-border-default` instead.

### 3. Dark Premium Aesthetic
Dark theme (#0A0A0B base) with vibrant green (#00E859) accent. Gold (#C8A951) for secondary emphasis only. Text hierarchy: content (#E8E8E3) → content-secondary (#999994) → content-tertiary (#666663).

### 4. No AI Hallmarks
No icon-circle feature cards (gate 1), no center-aligned body text (gate 2), no italic headers (gate 38a), no invented metrics (gate 46), no re-drawn chrome (gate 47), no inline hex improvisation (gate 48).

### 5. Interactive Accessibility
All touch targets MUST be ≥ 44px (h-11). Every interactive element MUST have hover, active, focus, and disabled states defined.

## Governance
- Amendments require Leroy approval
- Every spec references this constitution
- "Should" = recommendation. "MUST" = non-negotiable.

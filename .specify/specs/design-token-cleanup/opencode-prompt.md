# Design Token & Anti-Slop Cleanup for KitFix 2.0

Read the spec, plan, and tasks first:
- `.specify/specs/design-token-cleanup/spec.md`
- `.specify/specs/design-token-cleanup/plan.md`
- `.specify/specs/design-token-cleanup/tasks.md`
- `.specify/memory/constitution.md`

## Task Summary

Perform 6 phases of cleanup on the KitFix 2.0 codebase.

### Phase 1: CSS Token Rename (globals.css)

In `app/globals.css`, rename these tokens in the `@theme inline {}` block:

OLD token name → NEW token name:
- `--color-text-primary` → `--color-content`
- `--color-text-secondary` → `--color-content-secondary`
- `--color-text-tertiary` → `--color-content-tertiary`
- `--color-text-disabled` → `--color-content-disabled`
- `--color-text-link` → `--color-content-link`
- `--color-bg-deep` → `--color-surface-deep`
- `--color-bg` → `--color-surface-base`
- `--color-bg-elevated` → `--color-surface-elevated`
- `--color-border` → `--color-border-default`

Also update the raw CSS variable in `:root` where `--color-border` is defined, and in the light theme section. Update all references to `var(--color-border)` in globals.css.

### Phase 2: TSX Token Class Rename

In ALL `.tsx` files under `app/`, do bulk find-replace:

- `text-text-primary` → `text-content`
- `text-text-secondary` → `text-content-secondary`
- `text-text-tertiary` → `text-content-tertiary`
- `text-text-link` → `text-content-link`
- `bg-bg-deep` → `bg-surface-deep`
- `bg-bg-elevated` → `bg-surface-elevated`
- `bg-bg` → `bg-surface-base`

Files to update include all auth pages, customer pages, store pages, admin pages, contact page, and globals.css.

### Phase 3: Payment Page (raw grays → tokens)

In `app/(customer)/repairs/[id]/payment/page.tsx`:

| Old class | New class |
|---|---|
| `text-gray-900` | `text-content` |
| `text-gray-800` | `text-content` |
| `text-gray-700` | `text-content-secondary` |
| `text-gray-600` | `text-content-secondary` |
| `text-gray-500` | `text-content-tertiary` |
| `bg-gray-50` | `bg-surface` |
| `bg-gray-200` | `bg-surface-hover` |
| `border-gray-200` | `border-border-default` |
| `border-gray-100` | `border-border-default` |
| `bg-white` | `bg-surface` |

Leave green, amber, blue color classes as-is.

### Phase 4: global-error.tsx Cleanup

Replace inline hex in `app/global-error.tsx` with CSS variable references using `style={{}}`:

```
backgroundColor: "var(--bg)"     (was #fafafa)
color: "var(--text-primary)"     (was #0a0a0a)
color: "var(--text-secondary)"   (was #a3a3a3)
color: "var(--text-tertiary)"    (was #737373)
backgroundColor: "var(--surface)" (was #f0f0f0)
color: "var(--text-disabled)"    (was #a3a3a380)
backgroundColor: "var(--bg)"     (was #0a0a0a)
color: "var(--text-primary)"     (was #fafafa)
```

Also REMOVE the icon-circle pattern (the div with borderRadius "50%" wrapping the 🔧 emoji). The error has a clear title "Something Went Wrong" — the icon is redundant.

### Phase 5: Landing Page

In `app/page.tsx`, replace `bg-[#080808]` with `bg-surface-deep`.

### Phase 6: Touch Targets

Find interactive elements with `h-10` and bump to `h-11`.

### Verification

After all changes, run `npm run build` and fix any build errors.

## IMPORTANT RULES
1. Do NOT change actual color VALUES — only rename tokens
2. global-error.tsx is outside the React tree — cannot use Tailwind classes, use CSS variables in inline style
3. After ALL phases, run `npm run build` once
4. Report: files changed, build result, remaining issues

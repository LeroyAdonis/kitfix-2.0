# Task: KitFix Design Implementation — Phase 1 (Tokens + Layout + UI Primitives)

## Overview
Implement the KitFix design system into the codebase. Read `.hermes/tasks/design-system-tokens.md` for the complete token spec. Read `docs/kitfix-design-direction.html` for the visual concept. Read `app/globals.css` for current theme. Read `app/layout.tsx` for current layout. Read `components/layout/` for current nav/sidebar/footer.

## Design Identity
**"Precision Craft"** — Dark, sporty but refined. SA-inspired gold (#C8A951) + green (#007749) on near-black surfaces. DM Sans 800 headlines + Inter 400 body.

## What to Build

### 1. Update globals.css
Replace the `@theme inline` block with the new tokens from `design-system-tokens.md`. Add:
- All brand, surface, text, semantic, and border colors
- All radius tokens
- Shadow tokens (sm, md, lg, xl, glow-gold, glow-green)
- Motion/easing tokens
- Font family tokens (DM Sans + Inter)

**Do NOT remove** existing shadcn/ui CSS variables (`--background`, `--foreground`, `--card`, `--popover`, `--primary`, etc.) — update their values to match the new palette instead.

Add **component base styles** at the bottom of globals.css with all states:
- `.btn-primary` / `.btn-secondary` / `.btn-ghost` — default, hover, active, focus-visible, disabled, loading
- `.input-field` — default, hover, focus, filled, error, disabled, placeholder
- `.card-base` — default, hover, active, selected, disabled
- `.badge` — default, success, error, warning, info, gold, outline
- `.pill` — pill-shaped container utility
- `.skeleton` — shimmer animation for loading
- `.empty-state` — centered empty state layout
- `.toast` — success, error, warning, info variants
- `.status-dot` / `.status-line` — timeline/status indicators

### 2. Update app/layout.tsx
- Add DM Sans font (Google Fonts) alongside existing Geist
- Set `--font-display` CSS variable
- Update body classes
- Keep Geist as fallback for body text

### 3. Update shadcn/ui primitives (components/ui/)
Read each component file and update colors to use new tokens:
- `button.tsx` — gold primary, outline secondary, ghost variants
- `card.tsx` — dark surface bg, gold border on hover
- `input.tsx` — dark bg, gold focus ring
- `badge.tsx` — add gold variant
- `dialog.tsx` — dark surface, elevated shadow
- `select.tsx` — dark theme
- `skeleton.tsx` — shimmer animation

### 4. Redesign Navigation (components/layout/)
- **Navbar (`header.tsx` or similar):** Transparent with backdrop-blur, slim (16px padding), gold logo, nav links in text-secondary, Get Started as gold pill CTA
- **Admin Sidebar (`admin-sidebar.tsx`):** Dark surface bg, gold active state, text-secondary inactive, compact icons
- **Footer:** Dark bg, 4-column grid, gold accent links, "Proudly South African 🇿🇦" tagline

### 5. Add Design Tokens Export (lib/design-tokens.ts)
Create a TypeScript file exporting the design tokens as constants for use in inline styles and dynamic theming:
```typescript
export const tokens = {
  colors: { gold: '#C8A951', green: '#007749', ... },
  radius: { sm: '8px', md: '12px', pill: '9999px' },
  shadows: { sm: '0 1px 2px rgba(0,0,0,0.3)', ... },
} as const;
```

## States Checklist
Every interactive component must handle:
- [ ] **Default** — resting state
- [ ] **Hover** — cursor changes, visual feedback (lift, glow, border)
- [ ] **Focus** / **Focus-visible** — keyboard navigation ring
- [ ] **Active** / **Pressed** — momentary feedback
- [ ] **Selected** / **Checked** — toggle/radio/checkbox states
- [ ] **Disabled** — opacity 0.4, cursor not-allowed
- [ ] **Loading** — spinner animation, pointer-events none
- [ ] **Error** — red border, error message
- [ ] **Success** — green feedback
- [ ] **Empty** — centered empty state with icon + text + optional CTA
- [ ] **Out of stock** — crossed out, dimmed (variant picker)

## Constraints
- Run `npm run typecheck` after implementation
- Run `npx next build` at the end — must compile clean
- Keep existing shadcn/ui variable names, just update values
- Don't remove any existing components — add new styles alongside
- Respect `prefers-reduced-motion` for animations
- Mobile-responsive at all breakpoints

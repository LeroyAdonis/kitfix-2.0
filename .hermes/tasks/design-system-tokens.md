# KitFix Design System — Complete Token Spec

## Overview
Complete redesign of KitFix 2.0 (jersey repair + e-commerce). Dark theme with SA-inspired gold/green palette.

## Design Identity
- **Name:** Precision Craft
- **Vibe:** Sporty but refined, editorial, trustworthy
- **SA Inspiration:** Springbok gold + green, Bafana yellow
- **Inspirations:** Spotify (dark immersion), BMW (premium surfaces), Awwwards Sport/E-Commerce winners

## Color Tokens

### Brand
```css
--color-brand-gold: #C8A951;
--color-brand-gold-light: #E8D48B;
--color-brand-gold-dark: #A88B39;
--color-brand-green: #007749;
--color-brand-green-bright: #00A859;
--color-brand-green-dark: #005A37;
```

### Accent Color Themes
Each theme sets `--accent` and `--accent-light` as the primary brand accent.
Default (dark theme) uses Gold. Toggle via `data-accent` attribute on `<html>`.

```css
/* Gold (default — SA Springbok inspired) */
[data-accent="gold"] {
  --accent: #C8A951;
  --accent-light: #E8D48B;
  --accent-dark: #A88B39;
  --accent-glow: rgba(200, 169, 81, 0.15);
}

/* Green (SA Bafana Bafana inspired) */
[data-accent="green"] {
  --accent: #007749;
  --accent-light: #00A859;
  --accent-dark: #005A37;
  --accent-glow: rgba(0, 119, 73, 0.15);
}

/* Orange (energy, sporty) */
[data-accent="orange"] {
  --accent: #FF6B35;
  --accent-light: #FF8F5E;
  --accent-dark: #E55A2B;
  --accent-glow: rgba(255, 107, 53, 0.15);
}

/* Blue (trust, corporate) */
[data-accent="blue"] {
  --accent: #3B82F6;
  --accent-light: #60A5FA;
  --accent-dark: #2563EB;
  --accent-glow: rgba(59, 130, 246, 0.15);
}

/* Purple (creative, premium) */
[data-accent="purple"] {
  --accent: #8B5CF6;
  --accent-light: #A78BFA;
  --accent-dark: #7C3AED;
  --accent-glow: rgba(139, 92, 246, 0.15);
}
```

### Light Theme
Light mode via `data-theme="light"` on `<html>`. Toggle with a sun/moon icon.
```css
[data-theme="light"] {
  --color-bg-deep: #F8F8F6;
  --color-bg: #FFFFFF;
  --color-bg-elevated: #F3F3F0;
  --color-surface: #FFFFFF;
  --color-surface-hover: #F0F0ED;
  --color-surface-active: #E8E8E3;
  --color-surface-elevated: #FFFFFF;
  
  --color-text-primary: #1A1A18;
  --color-text-secondary: #6B6B66;
  --color-text-tertiary: #999994;
  --color-text-disabled: #C0C0BB;
  
  --color-border: #E0E0DB;
  --color-border-hover: #C0C0BB;
  --color-border-focus: var(--accent);
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.1);
  --shadow-xl: 0 16px 48px rgba(0,0,0,0.12);
  --shadow-glow: 0 0 20px var(--accent-glow);
}
```

### Dark Theme (Default)
```css
[data-theme="dark"] {
  --color-bg-deep: #0A0A0B;
  --color-bg: #111113;
  --color-bg-elevated: #18181B;
  --color-surface: #1C1C1F;
  --color-surface-hover: #252529;
  --color-surface-active: #2D2D32;
  
  --color-text-primary: #E8E8E3;
  --color-text-secondary: #999994;
  --color-text-tertiary: #666663;
  --color-text-disabled: #3D3D40;
  
  --color-border: #2D2D30;
  --color-border-hover: #3D3D40;
  --color-border-focus: var(--accent);
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
  --shadow-xl: 0 16px 48px rgba(0,0,0,0.6);
  --shadow-glow: 0 0 20px var(--accent-glow);
}
```

### Surfaces (Dark Theme)
```css
--color-bg-deep: #0A0A0B;
--color-bg: #111113;
--color-bg-elevated: #18181B;
--color-surface: #1C1C1F;
--color-surface-hover: #252529;
--color-surface-active: #2D2D32;
--color-surface-elevated: #2A2A2E;
```

### Text
```css
--color-text-primary: #E8E8E3;
--color-text-secondary: #999994;
--color-text-tertiary: #666663;
--color-text-disabled: #3D3D40;
--color-text-inverse: #0A0A0B;
--color-text-on-accent: #0A0A0B;
--color-text-link: var(--color-brand-gold);
--color-text-link-hover: var(--color-brand-gold-light);
```

### Borders
```css
--color-border: #2D2D30;
--color-border-hover: #3D3D40;
--color-border-focus: var(--color-brand-gold);
--color-border-active: var(--color-brand-gold);
--color-border-error: #DC2626;
--color-border-success: var(--color-brand-green-bright);
```

### Semantic
```css
--color-success: #00A859;
--color-success-bg: rgba(0, 168, 89, 0.1);
--color-error: #DC2626;
--color-error-bg: rgba(220, 38, 38, 0.1);
--color-warning: #F59E0B;
--color-warning-bg: rgba(245, 158, 11, 0.1);
--color-info: #3B82F6;
--color-info-bg: rgba(59, 130, 246, 0.1);
```

## Typography

### Font Families
```css
--font-display: 'DM Sans', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Sizes (ref)
- Display: 56-96px / 800 / -0.03em
- Heading 1: 36-48px / 800 / -0.02em
- Heading 2: 24-32px / 700 / -0.015em
- Heading 3: 18-20px / 700 / -0.01em
- Body: 14-16px / 400
- Small: 12-13px / 400
- Caption: 11px / 500 / 0.05em / uppercase
- Label: 13px / 600 / 0.02em / uppercase

## Spacing
Base unit: 4px. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 60, 80, 100, 120

## Border Radius
```css
--radius-none: 0;
--radius-xs: 6px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-pill: 9999px;
--radius-full: 50%;
```

## Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
--shadow-md: 0 4px 12px rgba(0,0,0,0.4);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
--shadow-xl: 0 16px 48px rgba(0,0,0,0.6);
--shadow-glow-gold: 0 0 20px rgba(200,169,81,0.15);
--shadow-glow-green: 0 0 20px rgba(0,119,73,0.15);
```

## Motion
```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
```

## Component States

### Buttons (3 variants + all states)

**Primary Button (Gold)**
```css
/* Default */
.btn-primary {
  background: #C8A951;
  color: #0A0A0B;
  padding: 12px 28px;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 15px;
  border: none;
  transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);
}
/* Hover: translateY(-1px), box-shadow glow gold */
/* Active: translateY(0), background darkens to #A88B39 */
/* Focus-visible: ring-2 ring-offset-2 ring-gold */
/* Disabled: opacity 0.4, cursor not-allowed, no hover effects */
/* Loading: show spinner before text, pointer-events none */
```

**Secondary Button (Outlined)**
```css
/* Default: transparent bg, 1px border, text primary */
/* Hover: border hover color, bg rgba(255,255,255,0.03) */
/* Active: bg darker */
/* Disabled: opacity 0.4 */
```

**Ghost Button**
```css
/* Default: no border/bg, text secondary */
/* Hover: bg surface, text primary */
/* Active: bg surface hover */
/* Disabled: opacity 0.3 */
```

### Input Fields
```css
/* Default: bg surface, 1px border, text primary, radius 8px */
/* Hover: border hover */
/* Focus: border gold, no outline, ring-1 ring-gold */
/* Filled: bg elevated */
/* Error: border error, error-bg */
/* Disabled: opacity 0.4, cursor not-allowed */
/* Placeholder: text tertiary */
/* Label: caption style above input */
/* Helper text: small below, secondary color */
```

### Cards
```css
/* Default: bg surface, 1px border, radius 12px */
/* Hover: translateY(-2px), shadow-lg, border hover */
/* Active: translateY(0) */
/* Selected: border gold, shadow-glow-gold */
/* Disabled: opacity 0.5 */
```

### Navigation
```css
/* Nav link default: text secondary, weight 500 */
/* Nav link hover: text primary */
/* Nav link active: text gold, weight 600 */
/* Nav current page: text gold, border-bottom gold */
/* Mobile nav: full-screen overlay, slide-in from right */
```

### Product Cards (Shop)
```css
/* Image container: aspect-ratio 3/4, gradient bg */
/* Badge position: top-left absolute, pill shape */
/* Size chips: 6px radius, surface bg, 11px, weight 600 */
/* Size active: gold bg, black text */
/* Size out-of-stock: opacity 0.3, line-through, not-allowed */
```

### Variant Picker
```css
/* Size btn: 48x48, surface bg, 1px border, radius 8px */
/* Hover: border gold, text gold */
/* Selected: gold bg, black text, no border */
/* Out of stock: opacity 0.3, line-through, not-allowed */
```

### Badges
```css
/* Default: pill, 11px, weight 600, uppercase, letter-spacing 0.05em */
/* Success: green bg */
/* Error: error bg */
/* Warning: warning bg */
/* Info: info bg */
/* Gold: gold bg, black text */
/* Outline: transparent, 1px border */
```

### Status Indicators
```css
/* Timeline step: numbered circle, connector line */
/* Completed: gold circle + line */
/* Current: gold circle (pulsing), dashed line */
/* Pending: muted circle, dotted line */
/* Error: red circle */
```

### Progress / Loading
```css
/* Spinner: animated rotate, gold accent */
/* Skeleton: shimmer animation, surface bg with gradient sweep */
/* Progress bar: gold fill on surface bg */
/* Page loader: full-screen overlay with centered spinner */
```

### Empty States
```css
/* Centered layout, icon/illustration (48px), heading (18px), 
   description (14px secondary), optional CTA */
/* Examples: empty cart, no orders, no products, no results */
```

### Error States
```css
/* Inline: error icon + text in error-bg, 8px radius */
/* Page: centered layout with illustration, heading, description, retry CTA */
/* Toast: bottom-right fixed, 12px radius, slide-in animation */
```

### Alerts / Toast
```css
/* Success: green left border, check icon */
/* Error: red left border, x icon */
/* Warning: amber left border, warning icon */
/* Info: blue left border, info icon */
/* Dismissible: close button top-right */
/* Auto-dismiss: progress bar at bottom, 5s duration */
```

## Tailwind 4 Theme Extension

Replace the current `@theme inline` block in `globals.css` with:
```css
@theme inline {
  /* Surfaces */
  --color-bg-deep: #0A0A0B;
  --color-bg: #111113;
  --color-bg-elevated: #18181B;
  --color-surface: #1C1C1F;
  --color-surface-hover: #252529;
  --color-surface-active: #2D2D32;
  
  /* Brand */
  --color-brand-gold: #C8A951;
  --color-brand-gold-light: #E8D48B;
  --color-brand-gold-dark: #A88B39;
  --color-brand-green: #007749;
  --color-brand-green-bright: #00A859;
  
  /* Text */
  --color-text-primary: #E8E8E3;
  --color-text-secondary: #999994;
  --color-text-tertiary: #666663;
  --color-text-disabled: #3D3D40;
  --color-text-link: var(--color-brand-gold);
  
  /* Semantic */
  --color-success: #00A859;
  --color-error: #DC2626;
  --color-warning: #F59E0B;
  --color-info: #3B82F6;
  
  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-pill: 9999px;
}
```

## Files to Update

1. `app/globals.css` — Theme tokens, component base styles, all states
2. `app/layout.tsx` — Add DM Sans font, update body classes
3. `components/ui/` — Update shadcn primitives with new tokens
4. `components/layout/` — Navigation, sidebar, footer redesign
5. `app/(store)/` — Storefront pages with new design
6. `app/(auth)/` — Auth pages with new design
7. `app/(customer)/` — Customer dashboard redesign
8. `app/(admin)/` — Admin dashboard redesign

## UX Writing Voice

- Tone: Confident, warm, South African
- Use "we" and "your" — "We fix what matters"
- Short, active sentences
- SA terminology: "jersey" not "jersey shirt", "Rands" not "ZAR", "postal code" not "zip code"
- Calls to action: "Start a Repair", "Browse Shop", "Track Your Repair"

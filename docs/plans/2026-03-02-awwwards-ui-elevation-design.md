# KitFix 2.0 — Awwwards-Level UI Elevation Design

**Date:** 2026-03-02
**Status:** Approved
**Aesthetic:** Bold & Energetic (Vercel/Linear inspired)
**Animation Engine:** Framer Motion
**Scope:** Homepage (full treatment) + Auth pages + Customer pages (elevated)

---

## Design System Foundation

### Color Palette (OKLCH)

| Token | Name | OKLCH | Hex |
|-------|------|-------|-----|
| `--primary` | Electric Blue | `oklch(0.65 0.22 260)` | `#3B82F6` |
| `--secondary` | Vivid Violet | `oklch(0.55 0.22 290)` | `#8B5CF6` |
| `--accent` | Hot Coral | `oklch(0.65 0.20 25)` | `#FF6B6B` |
| `--success` | Emerald | `oklch(0.72 0.19 155)` | `#10B981` |
| `--warning` | Amber | `oklch(0.80 0.16 85)` | `#F59E0B` |
| `--destructive` | Rose Red | `oklch(0.55 0.22 15)` | `#EF4444` |

**Gradients:**
- Hero: `primary → secondary` at 135deg
- CTA: `primary → accent` at 90deg
- Glow: primary at 20% opacity, 40px blur

### Typography
- **Display:** Geist Sans 700, tracking -0.03em, sizes 48-80px
- **Body:** Geist Sans 400/500, leading 1.6-1.8
- **Mono accents:** Geist Mono for repair IDs, status codes

### Spacing & Radius
- Section padding: 80-120px vertical
- Card radius: 16px
- Button radius: 12px

### Shadows & Effects
- Elevated cards: multi-layer colored shadows
- Glassmorphism nav: `backdrop-blur-xl bg-background/60 border-border/40`
- Glow hover: `box-shadow: 0 0 40px oklch(0.65 0.22 260 / 0.3)`

---

## Homepage Design

### Navigation Bar
- **Default:** Transparent, floating. Logo left, links center, CTA right
- **On scroll:** Glassmorphism — `backdrop-blur-xl`, 80px → 60px height, border glow
- **Mobile:** Hamburger → full-screen overlay with staggered link animations

### Hero Section (Full Viewport)
- Animated gradient mesh background with dot grid overlay
- Headline: staggered word-by-word reveal (Framer Motion, 100ms delays)
- Subheadline fades in after headline
- Magnetic CTA button (follows cursor on hover), gradient fill, glow
- Floating geometric shapes with parallax
- Animated scroll indicator chevron

### How It Works Section
- 3 horizontal cards, scroll-triggered slide-up entrance (200ms stagger)
- Number badges with gradient fills, connecting dashed lines
- Icons animate on scroll entry (scale bounce)

### Features / Why KitFix Section
- Bento grid layout (asymmetric card sizes)
- Cards have subtle parallax (different scroll speeds)
- Hover: lift, shadow deepen, border glow in primary
- Icons animate on hover (wiggle/pulse)

### Social Proof / Stats Section
- Full-width gradient banner (primary → secondary)
- Animated number counters (count up on scroll-into-view)
- Subtle background animated lines

### CTA / Footer
- Bold gradient "Ready to get started?" text
- Prominent CTA with animated arrow
- Clean footer grid, social links with hover transitions

---

## Auth Pages Design

### Layout
- Split-screen: left 45% brand showcase, right 55% form
- Left: gradient background, floating shapes, logo, tagline
- Right: clean with centered form

### Form Design
- Floating labels (animate up on focus, color → primary)
- Large inputs (48px, 12px radius, glow border on focus)
- Inline validation (slide-in errors, checkmark animations)
- Full-width gradient submit button with loading spinner
- Social login: outlined with brand color hover fill

### Transitions
- Sign-in ↔ Sign-up: AnimatePresence slide + fade
- Success: checkmark animation on sign-up completion

---

## Customer Pages Design

### Global Motion Layer
- Page transitions via AnimatePresence (direction-aware slide)
- Custom cursor: 8px dot + 32px trailing circle, scales on interactive elements
- Scroll progress bar at top (gradient fill)

### Dashboard
- Gradient welcome banner with animated greeting
- Stats cards: staggered slide-up entrance (100ms)
- Active repairs: hover-lift cards, pulse animation for "in progress"
- Quick actions: icon buttons with scale-bounce hover

### Repairs List & Detail
- Staggered card load animations
- Card hover: lift 8px, shadow deepen, status-color border glow
- Detail: animated status tracker, spring-animated progress bar, photo gallery lightbox

### Status Tracker Component
- Horizontal steps with animated connecting line
- Completed: checkmark SVG draw-in animation
- Current: pulsing ring in primary
- Future: muted waiting state

### Payments & Profile
- Consistent card hover effects
- Floating label form inputs
- Payment table with row hover highlights

---

## Technical Requirements

### Dependencies to Add
- `framer-motion` — animation engine
- No other new dependencies needed

### Key Reusable Components to Create
1. `AnimatedText` — staggered word/character reveal
2. `MagneticButton` — cursor-following CTA
3. `ScrollReveal` — generic scroll-triggered entrance wrapper
4. `CustomCursor` — dot + trailing circle cursor
5. `GlassmorphismNav` — scroll-aware transparent → blurred nav
6. `AnimatedCounter` — number count-up on scroll
7. `PageTransition` — route-level AnimatePresence wrapper
8. `FloatingShapes` — decorative animated shapes
9. `StatusTracker` — animated step indicator
10. `FloatingLabelInput` — animated form input

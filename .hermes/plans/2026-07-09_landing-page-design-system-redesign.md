# KitFix Landing Page + Design System Redesign

> **Goal:** Refresh the KitFix landing page to reflect the new AI-powered smart repair feature, and upgrade the overall UI/UX design system using the Stripe design system as inspiration (adapted to KitFix's existing dark theme with gold/green brand colors).

**Architecture:** The landing page (`app/page.tsx`) uses Framer Motion animations, custom CSS classes (`btn-primary`, `card-base`, `badge-gold`), and semantic CSS variables defined in `app/globals.css`. Layout is `app/layout.tsx`. No existing nav/header component exists — one needs to be created.

**Design Inspiration:** **Stripe** design system — premium, trust-focused typography (weight 300 elegance, negative letter-spacing), multi-layer blue-tinted shadow system, clean card components, conservative border-radius (4px-8px), but **adapted to KitFix's existing dark theme** (void-black backgrounds, gold `#C8A951` accent, green `#007749` secondary).

---

## Task 1: Design System Foundation Update

**Objective:** Upgrade the CSS design system (`globals.css`) to incorporate Stripe-inspired design principles while keeping KitFix's brand colors and dark theme.

**Files to modify:**
- `app/globals.css` — CSS variables, component classes, shadows, spacing

**Changes:**
1. **Shadow system**: Add multi-layer shadows inspired by Stripe's blue-tinted approach — but use gold-tinted shadows (`rgba(200,169,81,0.25)`) instead of blue
2. **Card component**: Refine `card-base` with Stripe's elevated card shadow formula: `rgba(200,169,81,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px`
3. **Typography enhancements**: Add tighter letter-spacing at display sizes, weight 300 option for elegant headings
4. **Button refinements**: Keep pill shape but add Stripe's hover glow treatment
5. **Spacing refinements**: Tighter spacing within components, more breathing between sections
6. **Container max-width**: 1080px like Stripe (current is 5xl/6xl)
7. **Border-radius scale**: More conservative for cards (8px-12px range)
8. **Add glass-morphism utility**: Frosted glass effect for nav and elevated elements

---

## Task 2: Landing Page Redesign

**Objective:** Rewrite `app/page.tsx` to feature the AI smart repair capability, redesign with Stripe-inspired components, and add missing sections (nav header, testimonials, AI demo section).

**Files to modify/create:**
- `app/page.tsx` — Full rewrite of landing page
- `components/layout/header.tsx` — New sticky nav header component
- `components/layout/footer.tsx` — Could move footer to component

**New landing page sections:**

### Hero Section
- Headline: "We Fix What Matters" with gold gradient
- Sub-headline mentioning new AI-powered instant assessment
- Two CTAs: "Start a Repair" (primary) + "AI Instant Quote" (new ghost CTA)
- Background: Deep dark with subtle gold radial gradients + grid pattern

### AI Smart Repair Feature Section (NEW)
- Show the AI-powered form as a highlight
- "Describe your damage in plain English — AI assesses it instantly"
- Visual: mockup/icon representation of the AI analysis flow
- Key benefit: "From description to quote in under 10 seconds"

### Stats Bar
- Same stats but with Stripe-inspired card treatment
- Gold numbers on dark

### How It Works
- Updated to include AI assessment as Step 1:
  1. **Describe Damage** — Tell us what's wrong in plain English
  2. **AI Assessment** — Our AI analyzes and prices instantly (NEW)
  3. **We Repair** — Expert technicians restore your jersey
  4. **Track & Receive** — Real-time tracking to your door

### Product Showcase
- Grid of premium jerseys with price in ZAR
- Gold badges for "New" and "Best Seller"
- Size chips

### Testimonials Section (NEW)
- Customer quotes with star ratings
- Social proof for trust

### CTA Section (NEW)
- Final call-to-action with "Ready to fix your kit?"
- Bold gold CTA button

### Footer
- Updated with proper links, company info
- "Proudly South African 🇿🇦"

---

## Task 3: Create Header Navigation Component (supporting Task 2)

**Objective:** Create a sticky nav header component.

**Files to create/modify:**
- Create: `components/layout/header.tsx`
- Modify: `app/layout.tsx` — include header

**Spec:**
- Sticky at top with frosted glass effect (`backdrop-filter: blur(12px)`)
- Logo: KitFix with gold accent
- Nav links: Repair, Shop, How It Works, About
- Mobile: Hamburger menu
- CTA: "Start a Repair" pill button
- Dark surface background with subtle bottom border

---

## Design Tokens (Stripe → KitFix Adaptation)

| Stripe Token | Stripe Value | KitFix Adaptation |
|---|---|---|
| Primary CTA | `#533afd` purple | `#C8A951` gold |
| Heading color | `#061b31` navy | `#E8E8E3` (existing text-primary) |
| Body color | `#64748d` slate | `#999994` (existing text-secondary) |
| Background | `#ffffff` white | `#0A0A0B` (existing bg-deep) |
| Card bg | `#ffffff` white with `#e5edf5` border | `#1C1C1F` (existing surface) with `#2D2D30` border |
| Shadow primary | `rgba(50,50,93,0.25)` | `rgba(200,169,81,0.2)` gold-tinted |
| Shadow secondary | `rgba(0,0,0,0.1)` | `rgba(0,0,0,0.3)` (darker on dark bg) |
| Font | sohne-var weight 300 | DM Sans weight 300-800 (existing font-display) |
| Body font | sohne-var | Inter (existing font-body) |
| Border radius | 4px-8px | 8px-12px (slightly larger for dark theme) |
| Button shape | 4px radius | 9999px pill (KitFix brand signature) |

## Verification
- `npm run build` — must pass with no errors
- `npm run lint` — no lint errors
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` returns 200
- Check that all Framer Motion imports are correct
- Verify new sections render without visual issues

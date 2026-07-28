# KitFix 2.0 Design Language

## Colors

### Dark Theme Palette
- **Background:** `#0A0A0B` (near-black)
- **Green Accent:** `#00E859` (primary CTAs, highlights)
- **Gold Accent:** `#C8A951` (badges, secondary actions)
- **Text Primary:** `#E8E8E3` (high-contrast content)
- **Surface:** `bg-surface` (card backgrounds)
- **Surface Deep:** `bg-surface-deep` (page backgrounds)

### CSS Custom Properties
- `--color-content` — primary text color
- `--color-surface` — card/panel backgrounds
- `--color-border-default` — subtle borders

### Semantic Colors
- Green 400 (`#00E859`) for primary actions, success states
- Gold for badges, warnings, secondary highlights
- White with opacity for borders (`border-white/[0.04]`)

## Typography

### Font Stack
- System font stack via Tailwind defaults
- Display font: `font-display` for headings (Montserrat or similar)

### Type Scale
| Token | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Labels, badges, metadata |
| `text-sm` | 14px | Body text, secondary content |
| `text-base` | 16px | Default body |
| `text-lg` | 18px | Emphasis |
| `text-xl` | 20px | Section headings |
| `text-2xl` | 24px | Page titles |
| `text-3xl` | 30px | Major headings |
| `text-4xl` | 36px | Hero text |

### Letter Spacing
- `tracking-tight` — display headings
- `tracking-tight` (`tracking-[-0.02em]`) — editorial headings
- `tracking-wider` — labels, badges
- `tracking-widest` — section markers, category labels

## Spacing

### Tailwind Default Scale
Standard Tailwind spacing utilities (p-1 through p-8, gap-1 through gap-8)

### Touch Targets
- Minimum height: `h-11` (44px) for buttons and interactive elements
- Card padding: `p-6` (24px)

### Section Spacing
- Page sections: `space-y-8` (32px)
- Card internal: `space-y-4` to `space-y-6`

## Shapes

### Border Radius
| Element | Class | Value |
|---------|-------|-------|
| Cards | `rounded-xl` | 12px |
| Buttons | `rounded-lg` | 8px |
| Inputs | `rounded-lg` | 8px |
| Pills/Badges | `rounded-full` | 9999px |
| Icons | `rounded-2xl` | 16px |

### Border Styling
- Subtle borders: `border-white/[0.04]`
- Active borders: `border-green-400/20`
- Strong borders: `border-green-400/30`

## Motion

### GSAP
- Scroll-driven hero animations
- Parallax effects on page load

### Framer Motion
- UI transitions (modals, drawers)
- Hover states on cards
- Page transitions

### Tailwind Transitions
- Standard: `transition-all duration-300`
- Hover lift: `hover:-translate-y-0.5`

## Component Rules

### Buttons (6 States)
1. **Default:** `bg-green-400/10 text-green-400 border-green-400/20`
2. **Hover:** `hover:bg-green-400/20`
3. **Active:** Press state
4. **Disabled:** `disabled:opacity-50 disabled:cursor-not-allowed`
5. **Loading:** Spinner + "Processing..." text
6. **Destructive:** `bg-destructive/10 text-destructive border-destructive/50`

### Inputs (5 States)
1. **Default:** Standard border
2. **Focus:** `ring-green-400/20 ring-2`
3. **Error:** `border-destructive ring-destructive/20`
4. **Disabled:** `opacity-50 cursor-not-allowed`
5. **With icon:** Left padding for icon space

### Card Pattern
```tsx
<div className="rounded-xl border border-white/[0.04] bg-surface p-6">
  {/* Card header with editorial divider */}
  <div className="flex items-center gap-3 mb-5">
    <div className="h-px w-6 bg-green-400/40" />
    <h2 className="text-xs font-semibold uppercase tracking-widest text-green-400/80">
      Section Title
    </h2>
  </div>
  {/* Card content */}
</div>
```

### Editorial Headers
```tsx
<div className="flex items-center gap-3 mb-2">
  <div className="h-px w-8 bg-green-400/40" />
  <p className="text-xs font-semibold tracking-widest text-green-400 uppercase">
    Category
  </p>
</div>
<h1 className="font-display text-3xl font-bold tracking-tight text-content">
  Page Title
</h1>
```

## Badge Variants
- `badge-success` — completed, delivered
- `badge-gold` — pending, processing
- `badge-outline` — neutral states
- `badge-error` — failed, cancelled

## Responsive Breakpoints
- Mobile first approach
- `sm:` — 640px (small tablets)
- `md:` — 768px (tablets, small desktop)
- `lg:` — 1024px (desktop)
- `xl:` — 1280px (large desktop)

## Accessibility
- Minimum contrast ratio: 4.5:1 for normal text
- Touch targets: minimum 44px height
- Focus visible states for keyboard navigation
- Semantic HTML structure with proper headings hierarchy

---

## Intentional Design Choices

### Double Accent (Green + Gold)
KitFix uses **two accent colors by design** — not a violation of the "one accent" rule. Green (`#00E859`) drives all **primary actions** (CTAs, interactive elements, status indicators). Gold (`#C8A951`) is used for **premium/status** elements (badges, secondary highlights, Recommended labels). This separates function from status — green says "click me," gold says "this is special."

### FloatingShapes on Auth Pages
The particle/shapes effect on sign-in, sign-up, and forgot-password pages is an **intentional atmospheric element**, not a decorative anti-pattern. It provides visual depth on minimal auth layouts where the content area is compact, creating a premium first-impression without relying on photography. This is an editorial-genre atmospheric choice, not a generic template blob.

### Dual Motion Stack (GSAP + Framer Motion)
- **GSAP** handles the landing page scroll-driven hero (ScrollTrigger + DrawSVGPlugin) — CPU-efficient scroll-linked animations that framer-motion can't match
- **Framer Motion** handles UI microinteractions (page transitions, modals, hover cards, form animations) — React-native, declarative, handles unmount animations
  
This is intentional separation of concerns, not redundancy. GSAP drives the hero's narrative scroll; framer-motion powers everyday UI feel.

### Custom SVG Artwork
The landing page hero SVG is **hand-built**, not generated or stock. Each path (jersey tear, stitches, magnifying glass, hexagonal scan lines) is hand-crafted for KitFix's brand. This is Tier B enrichment per Hallmark's hierarchy — beyond typography-only but before Lottie/stock imagery.

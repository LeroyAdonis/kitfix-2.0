# KitFix 2.0 Design Language — "Repair Sheet"

Design direction established via the **`frontend-design`** skill (Anthropic official, Apache 2.0).
Grounding: KitFix repairs **kits** for SA clubs and schools — the palette and structure come
from the pitch and the jersey, not a generic SaaS template.

## Design Principles

1. **Ground in the subject.** Everything references the kit: pitch green, thread bone,
   stitch gold, match-day panel, repair-sheet structure. No generic dark-SaaS defaults.
2. **Hero is a thesis.** The landing opens with the most characteristic object in the
   subject's world (the jersey) + the match-day readiness panel.
3. **One signature element.** The **stitch seam** — a dashed gold divider like real
   jersey stitching — is the single memorable detail, used as a through-line on every page.
4. **Structure is information.** Sections are labelled like a repair sheet / job card
   (KF-01, KF-A, "Job Ref:"), because KitFix genuinely processes jobs. Numbering encodes
   the process, it's not decoration.
5. **Motion is deliberate.** One orchestrated GSAP load moment on the hero (reduced-motion
   safe). No scattered effects.

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-pitch-deep` | `#17351A` | Page background (was `#0A0A0B`) |
| `--color-pitch` | `#24572A` | Panels, secondary surfaces |
| `--color-pitch-line` | `#2E6B35` | Borders, hover-green, "ready" status |
| `--color-thread` | `#EFE9D8` | Primary text (bone/thread white) |
| `--color-thread-dim` | `#C4BCA8` | Secondary text, muted labels |
| `--color-stitch` | `#F2B01E` | Accent — CTAs, signature seam, "new" status |
| `--color-foul` | `#C8402C` | Errors, destructive (used sparingly) |
| `--color-ink` | `#0F1C10` | Text on gold (dark green-black) |

> **Removed:** old acid green `#00E859` + gold `#C8A951` double-accent. The near-black
> + acid-green look was AI-default #2 (per frontend-design skill calibration). Gold
> `#F2B01E` is now the single accent.

## Typography

| Role | Font | Usage |
|------|------|-------|
| Display | `Archivo Black` | Headlines, hero, stat numbers, uppercase |
| Body | `Space Grotesk` | Paragraphs, body copy |
| Mono | `IBM Plex Mono` | Labels, refs, data, turnaround, footer |

Loaded via `next/font/google` in `app/layout.tsx` (self-hosted, no CLS).

## Signature Element — Stitch Seam

```html
<div style="background: repeating-linear-gradient(90deg, var(--color-stitch) 0 14px, transparent 14px 22px); height: 6px;" />
```

Used as section divider on the landing page, and a smaller 4px variant on admin/auth pages.

## Status Colors (Admin Board)

| Status | Color | Token |
|--------|-------|-------|
| New | gold | `--color-stitch` |
| In Repair | steel blue | `#7FB3D5` |
| Ready | pitch green | `--color-pitch-line` |
| Done | muted bone | `--color-thread-dim` |

## Shapes

- **No rounded corners** on primary CTAs or cards — sharp corners = kit repair workshop.
- Cards: `border border-[var(--color-pitch-line)]/50 bg-[var(--color-pitch)]/30 p-5/6`
- Inputs: `bg-[var(--color-pitch-deep)] border-[var(--color-pitch-line)]/50 focus:border-[var(--color-stitch)]`

## Section Patterns

### Editorial Header (used across admin pages)
```tsx
<div className="flex items-center gap-2 mb-3">
  <div className="h-px w-5 bg-[var(--color-stitch)]/60" />
  <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stitch)]">
    Section Title
  </h2>
</div>
```

### Repair Sheet Label
```tsx
<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-stitch)]">
  Job Ref — KF-2026
</p>
```

## Accessibility

- Minimum contrast 4.5:1 (thread `#EFE9D8` on pitch-deep `#17351A` passes)
- Touch targets min 44px height (buttons `py-4`+)
- Visible focus states, semantic headings
- `prefers-reduced-motion` respected (hero skips animation)

## Intentional Choices

1. **Sharp corners everywhere** — the workshop/repair-sheet identity. Rounded corners
   were the old generic-AI look.
2. **Mono labels everywhere** — IBM Plex Mono reads as job tickets / spec sheets.
3. **Foul red only for errors** — `#C8402C` never used decoratively.
4. **One accent** — gold does the work green+gold used to do split across two.
5. **GSAP only on the landing hero** — deliberate, single orchestrated moment.

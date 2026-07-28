# Macrophage Glow-Scan Hero

**Status:** Ready to build  
**Priority:** High  
**ADHD output:** Macrophage Glow-Scan `[N10 V7 F9 → 8.85]`  
**Source session:** @session:default/20260728_140904_c1c571

---

## Concept

The hero section IS a torn jersey rendered in SVG. As the user scrolls, 50–100 tiny green (#00E859) particles swarm across the screen and converge on the torn areas — glowing brighter, clustering, and visibly healing the fabric. Tear lines stitch closed under the particle swarm. Gold (#C8A951) glow highlights damage zones before they fade. The CTA appears only when healing resolves.

**Vibe:** "microscopic immune response for your jersey" — premium, organic, memorable.

---

## Technical Specs

### Stack
- **Framework:** Next.js 16 (app router)
- **Animation:** GSAP ScrollTrigger + MotionPathPlugin (NOT framer-motion)
- **Particles:** SVG `<circle>` elements animated with GSAP (NOT canvas — keeps DOM accessibility)
- **Styles:** Tailwind 4, CSS variables from `globals.css`: `--color-brand-green` (#00E859), `--color-brand-gold` (#C8A951), `--color-surface-deep` (#0A0A0B)
- **Font:** Inter via `next/font/google` (already set up)

### Existing GSAP Skills (USE THESE)
- `gsap-core`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-react`, `gsap-timeline` — all installed in OpenCode
- `kitfix-design-system` — full brand guide

### Component: `components/hero/MacrophageHero.tsx`

New file. Self-contained. Should not break existing layout.

### Props / Interface

```tsx
interface MacrophageHeroProps {
  /** Particle count — throttle to 30 on mobile */
  particleCount?: number; // default: 80
  /** Speed of particle swarm (1-10) */
  swarmSpeed?: number;    // default: 5
  /** Color overrides — default to brand tokens */
  colors?: {
    particle?: string;    // #00E859
    glow?: string;        // #C8A951  
    bg?: string;          // #0A0A0B
    text?: string;        // #E8E8E3
  };
}
```

### SVG Jersey
- ViewBox `0 0 800 600`
- Jersey silhouette with deliberate tear paths
- Tear = jagged `<path>` with `stroke-dasharray` for stitching animation
- Must include: jersey body, collar, sleeve lines

### Particle System
- 50–100 `<circle>` elements
- Initial position: random scatter across viewport
- On scroll: GSAP `MotionPathPlugin` animates each circle from scatter → converge on tear zone
- Particle opacity: 0 → 0.8 during swarm → 0 after healing
- Particle radius: 2–4px random
- Green (#00E859) with subtle opacity variation
- Performance: 30fps throttle on mobile (`matchMedia` check)

### Animation Phases

```
Phase 1: Page load → particles scattered, jersey torn, gold glow pulsing on damage zones
Phase 2: Scroll 0–200px → particles begin drifting toward tears (slow, organic)
Phase 3: Scroll 200–500px → particles converge, swarm intensifies, tears begin closing (DrawSVG)
Phase 4: Scroll 500–700px → tears fully closed, gold glow fades, headline + CTA fade in
Phase 5: Past hero → particles dissipate, section transitions to next content
```

### CTA
- "Send Your Jersey" — WhatsApp link to `wa.me/27721234567`
- Appears only after Phase 4 completes
- GSAP `from` animation: opacity 0, y: 20 → opacity 1, y: 0

### Headline (appears with CTA)
- "Your jersey's not broken. It's just getting started."
- White (#E8E8E3), Inter Bold, responsive text sizing

### Mobile
- `particleCount` = 30 on mobile (detected via `window.matchMedia`)
- Reduced particle radius (2–3px)
- GSAP ScrollTrigger `scrub: 0.5` for battery / performance
- CTA below hero on mobile (full bleed, not floating)

---

## Files to Create

```
components/hero/MacrophageHero.tsx        — Main component
components/hero/JerseySVG.tsx             — The SVG jersey with tear paths
components/hero/ParticleSystem.tsx        — Particle component + GSAP orchestrator
components/hero/hero-animations.ts        — GSAP timeline definitions (clean separation)
```

## Files to Modify

```
app/page.tsx                              — Import and place MacrophageHero
```

---

## Rules for Build

1. **No raw hex colors** — all colors from CSS variables via Tailwind classes or `var(--color-brand-green)` inline
2. **No console.log** — use `logger` from `lib/logger.ts`
3. **Mobile-first** — test at 375px breakpoint
4. **GSAP imported as** `import { gsap } from 'gsap'` with `import { ScrollTrigger } from 'gsap/ScrollTrigger'` and `gsap.registerPlugin(ScrollTrigger)`
5. **No external images** — everything is SVG/CSS
6. **Accessibility** — particles are decorative (aria-hidden), CTA is the only interactive element in hero
7. **Build check** — `npm run build` must pass before pushing

---

## Acceptance Criteria

- [ ] Particles swarm and converge on torn areas on scroll
- [ ] Tears visibly close under particle swarm (DrawSVG)
- [ ] Gold glow highlights damage zones before healing
- [ ] CTA + headline appear only after healing resolves
- [ ] Mobile: 30 particles, 30fps throttle, CTA below hero
- [ ] Desktop: 80 particles, smooth 60fps
- [ ] Build passes (`npm run build`)
- [ ] No lint errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Works in Chrome, Safari, Firefox

---

## OpenCode Build Command

```bash
cd /root/kitfix-2.0 && opencode run "Build the Macrophage Glow-Scan hero per the spec at .specify/specs/macrophage-hero/spec.md. Use GSAP ScrollTrigger + MotionPathPlugin for the particle swarm and tear-healing animation. All colors from CSS vars. Mobile throttle to 30 particles. Run npm run build after implementation and fix any errors." --agent Builder --auto
```

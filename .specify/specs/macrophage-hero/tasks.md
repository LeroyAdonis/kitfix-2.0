# Macrophage Hero — Build Tasks

## Phase 1: Create files
- [ ] `components/hero/JerseySVG.tsx` — SVG with tear paths
- [ ] `components/hero/ParticleSystem.tsx` — Swarm particles
- [ ] `components/hero/hero-animations.ts` — GSAP timelines
- [ ] `components/hero/MacrophageHero.tsx` — Main hero component

## Phase 2: Integrate
- [ ] Import MacrophageHero in `app/page.tsx` (replace existing hero)
- [ ] Run `npm run build` — fix errors if any

## Phase 3: Verify
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run lint` — 0 errors
- [ ] `npm run build` — passes
- [ ] Test at 375px and 1440px

## Phase 4: Ship
- [ ] `git add -A && git commit -m "feat(hero): Macrophage Glow-Scan — particle swarm scroll repair"`
- [ ] `git push origin main`

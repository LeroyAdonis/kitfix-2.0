# KitFix Macrophage Hero — Build Constitution

## Mandatory checks before every step
1. Run `code-review-graph query` before grep/search
2. Use `cn()` for conditional classes (already in `lib/utils.ts`)
3. All colors from CSS variables — never raw hex
4. GSAP over framer-motion for scroll-triggered animations
5. Mobile throttle: particleCount = 30, scrub = 0.5

## Autonomy
- Build the 4 component files, integrate into page.tsx
- Run build/lint/typecheck — fix any errors
- Push to main when green

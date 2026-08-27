# Relume primitives — reference copies

Raw `get_primitives` output saved to guard against the 1-hour Relume MCP token
expiry. The live, adapted copies live in:

- `lib/utils.ts` (cn util — note: project already has its own, check first)
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/input.tsx`
- `components/ui/badge.tsx`
- `components/ui/accordion.tsx`

## Install deps

```
npm i @radix-ui/react-accordion @radix-ui/react-slot class-variance-authority@0.7.1 clsx@^2.1.1 relume-icons@1.3.0 tailwind-merge@^2.2.2
```

## Tailwind v4 note

This project uses Tailwind v4 (`@theme` in `app/globals.css`, NO tailwind.config).
Map Relume's v4 tokens there: `text-h1…h6`, `text-medium/small`, `scheme-*`,
`rounded-button/card/form/…`, `animate-accordion-up/down`.
# Coding Standards

## TypeScript

- Strict mode enabled (tsconfig `strict: true`)
- No `any` types - use proper typing or `unknown`
- Define interfaces for all props, API responses, and data models
- Use type inference where obvious, explicit types where helpful
- Path alias: `@/*` maps to `./*` (project root, not `./src/*`)

## React

- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused - one job per component
- Extract reusable logic into custom hooks

## Next.js

- App Router (all routes under `app/`)
- Server components by default
- Only use `'use client'` when needed (interactivity, hooks, browser APIs, GSAP)
- Use API routes for webhooks, file uploads, third-party integrations, and external HTTP endpoints
- `ignoreBuildErrors` is NOT set - type errors are caught by `npx tsc --noEmit` (run manually before committing)

## File Organization

Flat structure - **no `src/` directory**. Everything at project root:

- Components: `components/ComponentName.tsx` or `components/feature/ComponentName.tsx`
- Pages/Routes: `app/[route]/page.tsx`
- API Routes: `app/api/[route]/route.ts`
- Server Actions: not used (Convex mutations handle mutations)
- Types: inline with components, or `lib/[utility].ts`
- Lib/Utils: `lib/[utility].ts`
- Backend: `convex/[module].ts` (schema, queries, mutations, actions)

## Naming

- Components: PascalCase (`ItemCard.tsx`)
- Files: Match component name or kebab-case
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase (no prefix)
- Convex functions: camelCase (`listByUser`, `updateStatus`, `generateUploadUrl`)

## Styling

- Tailwind CSS v4 for all styling
- Tailwind v4: CSS-first config (`@theme` in `globals.css`), no `tailwind.config.js`
- Use `@theme` tokens in `app/globals.css` for all design tokens (colors, fonts)
- No inline styles except for dynamic values (GSAP, stitch seam gradient)
- Dark mode is the default (class-based via `<html lang="en" className="dark">`)
- Sharp corners everywhere (no rounded cards/CTAs) per design system

## Backend (Convex)

- Schema defined in `convex/schema.ts` using `defineTable` and `v` validators
- Queries, mutations, and actions in `convex/[module].ts`
- Use `ctx.auth.getUserIdentity()` for auth checks in Convex functions
- File storage via Convex: client calls `generateUploadUrl` action, POSTs file, gets `storageId`
- Resolve storage IDs to URLs via `ctx.storage.getUrl(id)` in queries
- Index lookups via `.withIndex("index_name", (q) => q.eq("field", value))`
- No Drizzle ORM - this project uses Convex directly (no separate database layer)

## Auth

- **Customer auth:** Better Auth + Convex component (`@convex-dev/better-auth`). Files: `convex/auth.ts`, `convex/auth.config.ts`, `convex/http.ts`, `lib/auth-client.ts`, `lib/auth-server.ts`. Email/password, no email verification.
- **Admin auth:** Simple cookie (`kitfix_admin`, plaintext password comparison via `ADMIN_PASSWORD` env). Files: `lib/admin-auth.ts`, `/api/admin/login`, `/api/admin/logout`. This is MVP auth - no hashing, no rate limiting.
- Do not mix the two auth systems. Customer routes use Better Auth; admin routes use the cookie check.

## Data Fetching

- Client components use Convex hooks (`useQuery`, `useMutation`) from `convex/react`
- Server components use Convex server functions (queries/mutations) via `convex/_generated/server`
- API routes (Next.js route handlers) handle third-party integrations (Paystack, NVIDIA vision)
- Validate all inputs with Zod (v4) where applicable

## Error Handling

- Convex mutations throw errors on failure (Convex handles delivery to client)
- API routes return `{ error: string }` with appropriate HTTP status codes
- Client-side: display user-friendly error messages via UI (toasts or inline)

## Comments

Write code that explains itself; comment only what the code cannot say.
Over-commenting is a common AI tell, so resist it.

- Comment the **why**, not the **what**. Delete any comment that restates the code.
- No banner/header blocks, section dividers, or step-by-step narration of obvious code.
- A comment earns its place only when it captures something the code can't: a non-obvious decision, a gotcha or workaround, why a value is what it is, or a link to a spec or issue.
- Prefer self-documenting names and small functions over explanatory comments.
- Keep doc comments minimal: a one-line purpose on an exported type or function is plenty.
- When in doubt, leave the comment out.

## Writing

- No em dashes (U+2014) in generated content: docs, comments, commit messages, READMEs, specs. They read as AI-generated.
- Use a hyphen for `term - description` separators; rephrase prose with commas, parentheses, or a colon. Avoid en dashes and the ellipsis character too.

## Browser Verification

For UI and integration behavior, prefer real browser evidence over reading the code and assuming it works.

- No Playwright is installed. Use the dev server, browser screenshots, build output, or manual verification evidence instead.
- Add Playwright only when the user asks for it, or when the current spec is explicitly about setting up browser automation.
- Browser evidence is especially important for flows that click, type, submit, navigate, or depend on client-side state.

## Code Quality

- No commented-out code unless specified
- No unused imports or variables (ESLint enforces with warning)
- Keep functions under 50 lines when possible
- Underscore-prefixed variables (`_name`) are allowed for intentional unused values (ESLint rule)

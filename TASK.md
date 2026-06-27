# TDD Task Spec: Fix WAF & Auth Redirects (proxy.ts)

## Project Context
- Repo: `/root/kitfix-waf-proxy` (git worktree, branch `fix/waf-proxy-redirects`)
- Framework: Next.js 16 App Router
- Auth: Better Auth v1.6.20 with Drizzle adapter
- Current state: NO proxy.ts or middleware.ts — auth is done per-page via requireAuth() in each server component
- Problem: Vercel WAF blocks headless browser requests to protected routes. Unauthenticated users should be redirected to /sign-in BEFORE hitting the page component.

## TDD Mandate
- RED: Write failing test FIRST
- GREEN: Write minimal code to pass
- REFACTOR: Clean up after green
- NEVER write production code before the test fails
- Run `npm run test:run` after each cycle
- Run `npx next build` at end to verify no build errors

## Task: Create proxy.ts with Auth Guard

### What to build
Create `/root/kitfix-waf-proxy/proxy.ts` that:
1. Checks if request path matches protected routes: `/dashboard`, `/repairs`, `/payments`, `/profile`, `/notifications`, `/admin`
2. Reads the session cookie (`better-auth.session_token`)
3. If no valid session → redirects to `/sign-in?callbackUrl=<original_path>`
4. If valid session → continues (NextResponse.next())
5. Uses narrow matcher — NOT `/(.*)` which triggers Vercel WAF more aggressively

### Technical notes
- Next.js 16 renamed `middleware.ts` → `proxy.ts` with named export `proxy`
- Uses `NextRequest` and `NextResponse` from `next/server`
- Session check: parse cookie header, call DB directly (same pattern as lib/auth-utils.ts getSession())
- The proxy runs on Vercel Edge — cannot use `auth.api.getSession()` directly (edge compatibility)
- Must import from `@/lib/db` and `@/lib/db/schema` for DB access
- Cookie name: `better-auth.session_token`

### Test Order (Vertical Slices)
1. **Test: proxy redirects unauthenticated /dashboard to /sign-in** — Mock cookie header empty, expect 307 redirect to /sign-in?callbackUrl=%2Fdashboard
2. **Test: proxy allows authenticated /dashboard** — Mock valid session token cookie, expect 200 (NextResponse.next)
3. **Test: proxy redirects /admin to /sign-in** — Unauthenticated admin route
4. **Test: proxy does NOT redirect public routes** — /sign-in, /sign-up, / (home) pass through
5. **Test: proxy handles callbackUrl encoding** — /repairs/new → /sign-in?callbackUrl=%2Frepairs%2Fnew

### Test Framework
- Use Vitest with `vi.mock` for DB calls
- Mock `@/lib/db` and `@/lib/db/schema`
- Test the proxy function directly: `import { proxy } from '../../proxy'`
- Use Next.js test utilities: create a mock NextRequest with `.nextUrl.pathname` and `.headers.get('cookie')`

### Constraints
- No real DB calls in tests — mock everything
- Keep matcher narrow: `['/dashboard', '/repairs/(.*)', '/payments', '/profile', '/notifications', '/admin/(.*)']`
- Run `npm run test:run` after each RED→GREEN cycle
- Run `npx next build` at end

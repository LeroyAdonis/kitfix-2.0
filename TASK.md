# TDD Task Spec: Fix Sign-Up Redirect (Home → Dashboard)

## Project Context
- Repo: `/root/kitfix-signup-redirect` (git worktree, branch `fix/signup-redirect`)
- Framework: Next.js 16, Better Auth
- File to modify: `app/(auth)/sign-up/page.tsx` line 66
- Current: `window.location.href = "/"` — redirects to home after sign-up
- Goal: Redirect to `/dashboard` so new users land on their dashboard

## TDD Mandate
- RED: Write failing test FIRST
- GREEN: Write minimal code to pass
- REFACTOR: Clean up after green
- NEVER write production code before the test fails
- Run `npm run test:run` after each cycle

## Task: Fix Sign-Up Redirect

### What to change
In `app/(auth)/sign-up/page.tsx`, change line 66 from:
```typescript
window.location.href = "/";
```
To:
```typescript
window.location.href = "/dashboard";
```

### Also check sign-in page
`app/(auth)/sign-in/page.tsx` already redirects to `callbackUrl` (line 37) which defaults to `/dashboard` — this is correct. No change needed.

### Test Order
1. **Test: sign-up success redirects to /dashboard** — Mock signUp.email() to return success, verify window.location.href is set to "/dashboard"
2. **Test: existing tests still pass** — Run `npm run test:run`
3. **Test: Playwright E2E auth flow** — Run `npx playwright test e2e/auth-debug.spec.ts` against localhost:3000 (need dev server running)

### Constraints
- Only change one line
- Keep the `document.cookie` line (line 64) — it's the session cookie workaround
- Keep `window.location.href` pattern (not router.push) — it ensures cookie commit before navigation

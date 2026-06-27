# TDD Task Spec: Upgrade Better Auth v1.6.20 → v1.8.1+

## Project Context
- Repo: `/root/kitfix-upgrade-auth` (git worktree, branch `fix/upgrade-better-auth`)
- Framework: Next.js 16 App Router
- Current: better-auth@1.6.20 (core) + @polar-sh/better-auth@1.8.1 (polar wrapper)
- Problem: Version mismatch between core auth (1.6.20) and polar wrapper (1.8.1). Better Auth 1.6.20 has a known Drizzle adapter getSession() null bug.
- Goal: Upgrade better-auth core to match polar wrapper (1.8.1+), ideally to latest 1.9.x

## TDD Mandate
- RED: Write failing test FIRST
- GREEN: Write minimal code to pass
- REFACTOR: Clean up after green
- NEVER write production code before the test fails
- Run `npm run test:run` after each cycle

## Task: Upgrade better-auth

### What to do
1. `npm install better-auth@latest` in the worktree
2. Check for breaking changes in the changelog
3. Update auth.ts config if API changed
4. Update auth-client.ts if client API changed
5. Verify all existing tests still pass
6. Check if the Drizzle adapter `getSession()` bug is fixed in the new version
7. If fixed, consider removing the direct DB workaround (auth-utils.ts getSession) in favor of auth.api.getSession()

### Technical notes
- Better Auth 1.8+ changed some config structure
- Check if `advanced.useSecureCookies` still works or moved
- Check if `nextCookies()` plugin is still needed
- The `@polar-sh/better-auth` package wraps better-auth — verify they're compatible after upgrade
- Drizzle adapter may have changed — check `better-auth/adapters/drizzle` import

### Test Order
1. **Test: auth.api.getSession() returns session for valid cookie** — The key bug fix test. Mock headers with valid cookie, verify getSession returns user+session (not null)
2. **Test: signUp.email() works with upgraded version** — Verify sign-up flow still works
3. **Test: existing tests pass** — Run `npm run test:run` and ensure no regressions
4. **Test: build succeeds** — Run `npx next build`

### Constraints
- Do NOT remove the direct DB workaround until VERIFIED that getSession() bug is fixed
- Keep the custom auth-session route as fallback
- Run `npm run typecheck` to verify no type errors after upgrade

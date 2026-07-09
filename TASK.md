# KitFix 2.0 Auth Consolidation — Task

## Current State
- Phase 2 (JWT replacement) is already done ✅
- Phase 1 (auth consolidation) is partially done
- Phase 3 (cleanup) not started

## Remaining Issues

### Issue 1: proxy.ts doesn't propagate auth context
File: `/root/kitfix-2.0/proxy.ts`
Current behavior: After JWT validation, just returns `NextResponse.next()`.
Fix: After successful JWT verify, set response headers:
- `x-user-id` header 
- `x-user-role` header
- `x-session-id` header

Then return `NextResponse.next()` with those headers set on the response object.

### Issue 2: Add getSessionFromHeaders() to avoid DB re-query
File: `/root/kitfix-2.0/lib/auth-utils.ts`
Current: getSession() reads cookie, verifies JWT, queries DB for user every time.
Fix: Add a new function:
```ts
export async function getSessionFromHeaders() {
  const hdrs = await headers();
  const userId = hdrs.get('x-user-id');
  const userRole = hdrs.get('x-user-role');
  if (!userId) return null;
  // Return minimal session without DB query
  return { user: { id: userId, role: userRole } as any, session: { userId } as any };
}
```

### Issue 3: proxy.ts matcher missing store routes
Add to config.matcher: /shop, /shop/(.*), /checkout, /cart, /orders

### Issue 4: Store layout has zero auth
File: `/root/kitfix-2.0/app/(store)/layout.tsx`
Add auth check using getSessionFromHeaders()

### Issue 5: Dashboard page redundant getSession()
Dashboard already has auth from layout. Use getSessionFromHeaders() or remove the non-null assertion.

## Implementation Order
1. Fix proxy.ts to set response headers after JWT verify
2. Add getSessionFromHeaders() to auth-utils.ts
3. Fix proxy.ts matcher
4. Fix store layout
5. Fix dashboard page

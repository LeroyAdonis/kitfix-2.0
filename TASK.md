# TDD Task Spec: Add Drizzle Logger for SQL Visibility

## Project Context
- Repo: `/root/kitfix-drizzle-logger` (git worktree, branch `fix/drizzle-logger`)
- Framework: Next.js 16, Drizzle ORM with @neondatabase/serverless HTTP driver
- File to modify: `lib/db/index.ts`
- Current: `drizzle(sql, { schema })` — no logger
- Goal: Add `logger: true` so SQL queries are logged, making auth debugging 10x easier

## TDD Mandate
- RED: Write failing test FIRST
- GREEN: Write minimal code to pass
- REFACTOR: Clean up after green
- NEVER write production code before the test fails
- Run `npm run test:run` after each cycle

## Task: Add Drizzle Logger

### What to change in `/root/kitfix-drizzle-logger/lib/db/index.ts`

Change line 11 from:
```typescript
_db = drizzle(sql, { schema });
```
To:
```typescript
_db = drizzle(sql, { schema, logger: true });
```

### Test Order
1. **Test: drizzle is called with logger: true** — Mock the drizzle function, verify it receives `{ schema, logger: true }`
2. **Test: existing tests still pass** — Run `npm run test:run`
3. **Test: build succeeds** — Run `npx next build`

### Constraints
- Only change the one line in `lib/db/index.ts`
- Logger only activates in development — Drizzle's default behavior
- No impact on production performance

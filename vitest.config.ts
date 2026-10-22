import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Vitest config for KitFix 2.0.
 *
 * The repo is flat (no `src/`), and `@/*` maps to the project root — see tsconfig.json.
 * `process.cwd()` is the project root because every command in this repo (`npm test`)
 * is run from there.
 *
 * Tests must pass with no network and no credentials: anything that would reach out
 * (Convex, Paystack) is stubbed with `vi.stubGlobal("fetch", ...)` inside the tests.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd()),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Keep test output readable and deterministic; no watch mode in CI.
    restoreMocks: true,
    clearMocks: true,
  },
});

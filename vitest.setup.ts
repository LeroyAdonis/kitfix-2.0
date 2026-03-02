/**
 * Vitest global setup — mock Next.js server-only modules that cannot
 * be resolved in a pure-Node test environment.
 */
import { vi } from "vitest";

// ---------------------------------------------------------------------------
// next/cache — revalidatePath / revalidateTag are server-only
// ---------------------------------------------------------------------------
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn: unknown) => fn),
}));

// ---------------------------------------------------------------------------
// next/headers — cookies() / headers() are request-scoped
// ---------------------------------------------------------------------------
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(() => []),
    has: vi.fn(() => false),
  })),
  headers: vi.fn(() => new Map()),
}));

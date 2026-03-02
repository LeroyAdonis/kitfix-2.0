/**
 * Runtime environment variable validation for KitFix 2.0.
 *
 * Uses a Proxy for **lazy validation** — env vars are only checked on first
 * property access, never at import time. This prevents build-time failures
 * when the full env isn't present (e.g. `next build`, CI type-checks).
 *
 * Escape hatches:
 *  - `SKIP_ENV_VALIDATION=1` — skip validation entirely (useful for builds)
 *  - `NODE_ENV=test`         — skip validation in test runs
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine(
      (v) => v.startsWith("postgres://") || v.startsWith("postgresql://"),
      "DATABASE_URL must start with postgres:// or postgresql://",
    ),

  BETTER_AUTH_SECRET: z
    .string()
    .min(16, "BETTER_AUTH_SECRET must be at least 16 characters"),

  BETTER_AUTH_URL: z
    .string()
    .url("BETTER_AUTH_URL must be a valid URL"),

  POLAR_ACCESS_TOKEN: z
    .string()
    .min(1, "POLAR_ACCESS_TOKEN is required"),

  POLAR_WEBHOOK_SECRET: z
    .string()
    .min(1, "POLAR_WEBHOOK_SECRET is required"),

  POLAR_PRODUCT_ID: z
    .string()
    .min(1, "POLAR_PRODUCT_ID is required"),

  BLOB_READ_WRITE_TOKEN: z
    .string()
    .min(1, "BLOB_READ_WRITE_TOKEN is required"),

  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL"),
});

export type Env = z.infer<typeof envSchema>;

// ---------------------------------------------------------------------------
// Lazy validation
// ---------------------------------------------------------------------------

let _cached: Env | undefined;

function validate(): Env {
  if (_cached) return _cached;

  // Skip validation during builds and tests
  if (
    process.env.SKIP_ENV_VALIDATION === "1" ||
    process.env.NODE_ENV === "test"
  ) {
    // Return process.env as-is; callers accept the risk of missing vars.
    return process.env as unknown as Env;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const lines = result.error.issues.map(
      (issue) => `  ❌ ${issue.path.join(".")}: ${issue.message}`,
    );
    throw new Error(
      [
        "",
        "🔴 Invalid environment variables:",
        ...lines,
        "",
        "Set SKIP_ENV_VALIDATION=1 to bypass.",
        "",
      ].join("\n"),
    );
  }

  _cached = result.data;
  return _cached;
}

/**
 * Validated environment variables.
 *
 * Access any property (e.g. `env.DATABASE_URL`) to trigger validation
 * on first use. Subsequent accesses return the cached result.
 */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return validate()[prop as keyof Env];
  },
});

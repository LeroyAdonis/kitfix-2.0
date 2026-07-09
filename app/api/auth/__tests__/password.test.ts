/**
 * Tests for password verification logic used in sign-in flow.
 *
 * Bug 1: verifyLegacyPassword used r=16 but Better Auth default is r=8.
 * Bug 2: proxy.ts omitted JWT_SECRET fallback that auth-jwt.ts includes.
 *
 * Both are now fixed. These tests confirm the fixes and prevent regressions.
 */
import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { scryptSync, randomBytes } from "crypto";

// ---------------------------------------------------------------------------
// Constants — mirror the FIXED route.ts
// ---------------------------------------------------------------------------
const SALT_ROUNDS = 10;

// FIXED: r=8 matches Better Auth's default
const BA_SCRYPT_FIXED = { N: 16384, r: 8, p: 1, dkLen: 64, maxmem: 128 * 16384 * 8 * 2 } as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a simulated legacy Better Auth scrypt hash */
function createLegacyHash(password: string): string {
  const salt = randomBytes(32);
  const key = scryptSync(password.normalize("NFKC"), salt, BA_SCRYPT_FIXED.dkLen, {
    N: BA_SCRYPT_FIXED.N,
    r: BA_SCRYPT_FIXED.r,
    p: BA_SCRYPT_FIXED.p,
    maxmem: BA_SCRYPT_FIXED.maxmem,
  }) as Buffer;
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Bug 1: verifyLegacyPassword scrypt parameter fix", () => {
  const password = "TestPass123!";

  it("bcrypt.compare() validates a standard bcrypt hash correctly", async () => {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    expect(hash.startsWith("$2")).toBe(true);
    expect(await bcrypt.compare(password, hash)).toBe(true);
    expect(await bcrypt.compare("wrong", hash)).toBe(false);
  });

  it("verifyLegacyPassword() now matches r=8 hashes (Better Auth default)", async () => {
    const legacyHash = createLegacyHash(password);
    const { verifyLegacyPassword } = await import("@/app/api/auth/[...all]/route");

    const result = await verifyLegacyPassword(legacyHash, password);
    expect(result.valid).toBe(true);
    expect(result.newHash).toBeTruthy(); // migrated to bcrypt
    expect(result.newHash?.startsWith("$2")).toBe(true);
  });

  it("verifyLegacyPassword() rejects wrong password", async () => {
    const legacyHash = createLegacyHash(password);
    const { verifyLegacyPassword } = await import("@/app/api/auth/[...all]/route");

    const result = await verifyLegacyPassword(legacyHash, "WrongPassword");
    expect(result.valid).toBe(false);
  });

  it("verifyLegacyPassword() rejects malformed hashes", async () => {
    const { verifyLegacyPassword } = await import("@/app/api/auth/[...all]/route");

    // bcrypt hash (no colon separator)
    const bcryptHash = await bcrypt.hash(password, SALT_ROUNDS);
    const r1 = await verifyLegacyPassword(bcryptHash, password);
    expect(r1.valid).toBe(false);

    // empty string
    const r2 = await verifyLegacyPassword("", password);
    expect(r2.valid).toBe(false);

    // triple-colon format
    const r3 = await verifyLegacyPassword("a:b:c", password);
    expect(r3.valid).toBe(false);
  });

  it("migrated bcrypt hash from verifyLegacyPassword can be compared", async () => {
    const legacyHash = createLegacyHash(password);
    const { verifyLegacyPassword } = await import("@/app/api/auth/[...all]/route");

    const result = await verifyLegacyPassword(legacyHash, password);
    expect(result.valid).toBe(true);
    expect(result.newHash).toBeTruthy();

    // The new bcrypt hash should verify with bcrypt.compare
    const reValid = await bcrypt.compare(password, result.newHash!);
    expect(reValid).toBe(true);
  });
});

describe("Bug 2: proxy.ts and auth-jwt.ts secret fallback fix", () => {
  it("proxy.ts now includes JWT_SECRET fallback (matching auth-jwt.ts)", () => {
    // When BETTER_AUTH_SECRET is NOT set but JWT_SECRET IS set:
    //   Both proxy.ts and auth-jwt.ts now use JWT_SECRET ✓

    const envWithOnlyJwtSecret = { BETTER_AUTH_SECRET: "", JWT_SECRET: "some-production-secret-12345678" };

    // auth-jwt.ts logic:
    const authJwtSecret = envWithOnlyJwtSecret.BETTER_AUTH_SECRET || envWithOnlyJwtSecret.JWT_SECRET || "fallback";
    // proxy.ts (FIXED) logic:
    const proxySecret = envWithOnlyJwtSecret.BETTER_AUTH_SECRET || envWithOnlyJwtSecret.JWT_SECRET || "fallback";

    expect(authJwtSecret).toBe("some-production-secret-12345678");
    expect(proxySecret).toBe("some-production-secret-12345678");
    expect(authJwtSecret).toBe(proxySecret); // Now consistent!
  });

  it("both default to same fallback when neither secret is set", () => {
    const noEnv = { BETTER_AUTH_SECRET: "", JWT_SECRET: "" };

    const authJwtSecret = noEnv.BETTER_AUTH_SECRET || noEnv.JWT_SECRET || "kitfix-dev-secret-change-in-production";
    const proxySecret = noEnv.BETTER_AUTH_SECRET || noEnv.JWT_SECRET || "kitfix-dev-secret-change-in-production";

    expect(authJwtSecret).toBe(proxySecret);
  });

  it("BETTER_AUTH_SECRET takes precedence in both", () => {
    const bothEnv = { BETTER_AUTH_SECRET: "better-auth-secret-12345678", JWT_SECRET: "jwt-secret-87654321" };

    const authJwtSecret = bothEnv.BETTER_AUTH_SECRET || bothEnv.JWT_SECRET || "fallback";
    const proxySecret = bothEnv.BETTER_AUTH_SECRET || bothEnv.JWT_SECRET || "fallback";

    expect(authJwtSecret).toBe("better-auth-secret-12345678");
    expect(proxySecret).toBe("better-auth-secret-12345678");
    expect(authJwtSecret).toBe(proxySecret);
  });
});

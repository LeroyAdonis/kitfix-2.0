import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Customer-pages E2E tests
//
// Since we can't authenticate against a real DB in E2E, these tests validate:
//   1. Unauthenticated redirect behaviour (proxy.ts)
//   2. Sign-in page structure after redirect
// ---------------------------------------------------------------------------

const PROTECTED_ROUTES = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/repairs", label: "Repairs" },
  { path: "/repairs/new", label: "New Repair" },
  { path: "/payments", label: "Payments" },
  { path: "/profile", label: "Profile" },
  { path: "/notifications", label: "Notifications" },
] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Navigate to `path` and assert we land on /sign-in with the correct callbackUrl. */
async function expectRedirectToSignIn(page: Page, path: string) {
  await page.goto(path);
  await page.waitForURL(/\/sign-in/);

  const url = new URL(page.url());
  expect(url.pathname).toBe("/sign-in");
  expect(url.searchParams.get("callbackUrl")).toBe(path);
}

// ── 1. Unauthenticated redirects ────────────────────────────────────────────

test.describe("Unauthenticated redirect behaviour", () => {
  for (const { path, label } of PROTECTED_ROUTES) {
    test(`${label} (${path}) → /sign-in?callbackUrl=${path}`, async ({
      page,
    }) => {
      await expectRedirectToSignIn(page, path);
    });
  }

  test("nested repair detail route (/repairs/abc-123) → /sign-in", async ({
    page,
  }) => {
    const detailPath = "/repairs/abc-123";
    await page.goto(detailPath);
    await page.waitForURL(/\/sign-in/);

    const url = new URL(page.url());
    expect(url.pathname).toBe("/sign-in");
    // proxy.ts sets callbackUrl to the original pathname
    expect(url.searchParams.get("callbackUrl")).toBe(detailPath);
  });
});

// ── 2. Sign-in page structure after redirect ────────────────────────────────

test.describe("Sign-in page structure", () => {
  test("renders sign-in form with email and password fields", async ({
    page,
  }) => {
    await page.goto("/sign-in");

    // Heading
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    // Subtitle
    await expect(page.getByText(/sign in to your kitfix account/i)).toBeVisible();

    // Form fields
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Submit button
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

    // Links
    await expect(page.getByRole("link", { name: /forgot your password/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
  });

  test("preserves callbackUrl from redirect", async ({ page }) => {
    // Visit a protected route → get redirected
    await page.goto("/repairs");
    await page.waitForURL(/\/sign-in/);

    // The sign-in page reads callbackUrl from search params; verify it's in the URL
    const url = new URL(page.url());
    expect(url.searchParams.get("callbackUrl")).toBe("/repairs");
  });
});

// ── 3. Auth-page redirect guard (authenticated users on auth pages) ─────────

test.describe("Auth page access without session", () => {
  test("/sign-in is accessible without authentication", async ({ page }) => {
    const response = await page.goto("/sign-in");
    // Should load successfully (200), not redirect
    expect(response?.status()).toBeLessThan(400);
    expect(new URL(page.url()).pathname).toBe("/sign-in");
  });

  test("/sign-up is accessible without authentication", async ({ page }) => {
    const response = await page.goto("/sign-up");
    expect(response?.status()).toBeLessThan(400);
    expect(new URL(page.url()).pathname).toBe("/sign-up");
  });
});

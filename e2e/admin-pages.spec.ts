import { test, expect } from "@playwright/test";

/**
 * Admin pages – unauthenticated redirect tests.
 *
 * The proxy (proxy.ts) checks for the `better-auth.session_token` cookie.
 * Without it, every protected route redirects to `/sign-in?callbackUrl=<path>`.
 *
 * These tests verify the redirect behavior for all admin routes without
 * requiring a running database or real authentication.
 */

const ADMIN_ROUTES = [
  "/admin",
  "/admin/requests",
  "/admin/users",
  "/admin/technicians",
  "/admin/payments",
  "/admin/reviews",
] as const;

test.describe("Admin pages – unauthenticated redirect", () => {
  for (const route of ADMIN_ROUTES) {
    test(`${route} redirects to /sign-in with callbackUrl`, async ({
      page,
    }) => {
      await page.goto(route);

      // Proxy should redirect to /sign-in
      await expect(page).toHaveURL(/\/sign-in/);

      // Verify the callbackUrl search parameter preserves the original path
      const url = new URL(page.url());
      expect(url.pathname).toBe("/sign-in");
      expect(url.searchParams.get("callbackUrl")).toBe(route);
    });
  }
});

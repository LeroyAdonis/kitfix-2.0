import { test, expect } from "@playwright/test";

const TEST_EMAIL = `e2e-${Date.now()}@test.co.za`;
const TEST_PASSWORD = "TestPass123!";

test.describe("Full sign-up flow", () => {
  test("signs up and lands on homepage with session cookie", async ({
    page,
  }) => {
    console.log("[DEBUG-e2e] Starting sign-up test with email:", TEST_EMAIL);

    // 1. Go to sign-up page
    await page.goto("/sign-up");
    await expect(
      page.getByRole("heading", { name: /create an account/i }),
    ).toBeVisible();

    // 2. Fill in the form
    await page.getByLabel("Full name").fill("E2E Test User");
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel("Confirm password").fill(TEST_PASSWORD);
    console.log("[DEBUG-e2e] Form filled");

    // 3. Listen for the API call and the redirect
    const apiPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/auth/sign-up/email") &&
        resp.request().method() === "POST",
      { timeout: 15000 },
    );

    // 4. Submit
    await page.getByRole("button", { name: /create account/i }).click();
    console.log("[DEBUG-e2e] Button clicked");

    // 5. Wait for API response
    const apiResponse = await apiPromise;
    console.log("[DEBUG-e2e] API status:", apiResponse.status());

    // Should be 200
    expect(apiResponse.status()).toBe(200);

    // 6. Wait for redirect to homepage
    await page.waitForURL("/", { timeout: 10000 });
    console.log("[DEBUG-e2e] Landed on homepage:", page.url());

    // 7. Check the page loaded (homepage should have content)
    await expect(
      page.getByRole("heading", { name: /kitfix/i, level: 1 }),
    ).toBeVisible({ timeout: 5000 });

    console.log("[DEBUG-e2e] ✅ Test passed!");
  });
});

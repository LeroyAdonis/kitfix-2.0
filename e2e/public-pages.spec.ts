import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads successfully with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/KitFix/i);
    await expect(page.locator("main#main-content")).toBeVisible();
  });

  test("has hero section with heading and subheadline", async ({ page }) => {
    const hero = page.locator("section").first();

    // Main heading — rendered by AnimatedText with individual spans
    await expect(hero.getByRole("heading", { level: 1 })).toContainText(
      "We Fix What Matters"
    );

    // Badge text
    await expect(hero).toContainText("Professional Jersey Repair");

    // Subheadline mentioning AI
    await expect(hero).toContainText("AI damage assessment");
  });

  test("has navigation with Sign In and Get Started links", async ({
    page,
  }) => {
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav).toBeVisible();

    // Desktop nav shows "Get Started" CTA and in-page links
    await expect(nav.getByRole("link", { name: "Get Started" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "KitFix home" })).toBeVisible();

    // Hero section has Sign In link
    const signInLink = page.getByRole("link", { name: "Sign In" }).first();
    await expect(signInLink).toBeVisible();
  });

  test('has "How It Works" section with three steps', async ({ page }) => {
    const section = page.locator("#how-it-works");
    await expect(section).toBeAttached();

    await expect(section).toContainText("How It Works");
    await expect(section).toContainText("Three Simple Steps");

    // The three steps
    await expect(section).toContainText("Submit Your Jersey");
    await expect(section).toContainText("We Assess & Repair");
    await expect(section).toContainText("Track & Receive");
  });

  test("has CTA buttons visible in the hero", async ({ page }) => {
    // Hero "Get Started" button links to /sign-up
    const heroCta = page
      .locator("section")
      .first()
      .getByRole("link", { name: /Get Started/i });
    await expect(heroCta).toBeVisible();
    await expect(heroCta).toHaveAttribute("href", "/sign-up");

    // Hero "Sign In" link
    const heroSignIn = page
      .locator("section")
      .first()
      .getByRole("link", { name: "Sign In" });
    await expect(heroSignIn).toBeVisible();
    await expect(heroSignIn).toHaveAttribute("href", "/sign-in");
  });

  test("has features section", async ({ page }) => {
    const section = page.locator("#features");
    await expect(section).toBeAttached();

    await expect(section).toContainText("Everything You Need");
    await expect(section).toContainText("AI Damage Assessment");
    await expect(section).toContainText("Quality Guarantee");
  });

  test("has bottom CTA section", async ({ page }) => {
    await expect(page.locator("main")).toContainText(
      "Ready to Restore Your Jersey?"
    );
    await expect(page.locator("main")).toContainText(
      "Submit your repair request in minutes"
    );
  });

  test("has footer with copyright and links", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Copyright
    const year = new Date().getFullYear().toString();
    await expect(footer).toContainText(`© ${year} KitFix`);

    // Footer nav
    const footerNav = footer.getByRole("navigation", {
      name: "Footer navigation",
    });
    await expect(footerNav.getByRole("link", { name: "Sign In" })).toBeVisible();
    await expect(
      footerNav.getByRole("link", { name: "Get Started" })
    ).toBeVisible();
  });
});

test.describe("Not Found page", () => {
  test("shows 404 content for non-existent route", async ({ page }) => {
    const response = await page.goto("/some-nonexistent-page");

    // Next.js returns 404 status for not-found pages
    expect(response?.status()).toBe(404);

    // Page shows the 404 UI
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
    await expect(page.locator("main")).toContainText("404");
    await expect(page.locator("main")).toContainText(
      "doesn\u2019t exist or has been moved"
    );

    // "Back to Home" link points to /
    const backLink = page.getByRole("link", { name: /Back to Home/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/");
  });
});

test.describe("Offline page", () => {
  test("loads and shows offline message", async ({ page }) => {
    await page.goto("/~offline");

    await expect(
      page.getByRole("heading", { name: "You are offline" })
    ).toBeVisible();
    await expect(page.locator("body")).toContainText(
      "Please check your internet connection and try again"
    );
  });
});

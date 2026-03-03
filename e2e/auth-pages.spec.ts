import { test, expect } from '@playwright/test';

// ─── Sign In ────────────────────────────────────────────────────────
test.describe('Sign In page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-in');
  });

  test('renders sign-in heading and subtitle', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /welcome back/i }),
    ).toBeVisible();
    await expect(page.getByText('Sign in to your KitFix account')).toBeVisible();
  });

  test('has email input field', async ({ page }) => {
    const email = page.getByLabel('Email');
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute('type', 'email');
    await expect(email).toHaveAttribute('placeholder', 'you@example.com');
  });

  test('has password input field', async ({ page }) => {
    const password = page.getByLabel('Password');
    await expect(password).toBeVisible();
    await expect(password).toHaveAttribute('type', 'password');
  });

  test('has submit button', async ({ page }) => {
    const button = page.getByRole('button', { name: /sign in/i });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  test('has link to sign-up', async ({ page }) => {
    const link = page.getByRole('link', { name: /sign up/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/sign-up');
  });

  test('has link to forgot-password', async ({ page }) => {
    const link = page.getByRole('link', { name: /forgot your password/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/forgot-password');
  });
});

// ─── Sign Up ────────────────────────────────────────────────────────
test.describe('Sign Up page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-up');
  });

  test('renders sign-up heading and subtitle', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /create an account/i }),
    ).toBeVisible();
    await expect(
      page.getByText('Get started with KitFix jersey repairs'),
    ).toBeVisible();
  });

  test('has name input field', async ({ page }) => {
    const name = page.getByLabel('Full name');
    await expect(name).toBeVisible();
    await expect(name).toHaveAttribute('type', 'text');
    await expect(name).toHaveAttribute('placeholder', 'John Doe');
  });

  test('has email input field', async ({ page }) => {
    const email = page.getByLabel('Email');
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute('type', 'email');
  });

  test('has password input field', async ({ page }) => {
    const password = page.getByLabel('Password', { exact: true });
    await expect(password).toBeVisible();
    await expect(password).toHaveAttribute('type', 'password');
  });

  test('has confirm password input field', async ({ page }) => {
    const confirm = page.getByLabel('Confirm password');
    await expect(confirm).toBeVisible();
    await expect(confirm).toHaveAttribute('type', 'password');
  });

  test('has submit button', async ({ page }) => {
    const button = page.getByRole('button', { name: /create account/i });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  test('has link to sign-in', async ({ page }) => {
    const link = page.getByRole('link', { name: /sign in/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/sign-in');
  });
});

// ─── Forgot Password ────────────────────────────────────────────────
test.describe('Forgot Password page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
  });

  test('renders forgot-password heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /forgot your password/i }),
    ).toBeVisible();
    await expect(
      page.getByText("Enter your email and we'll send a reset link"),
    ).toBeVisible();
  });

  test('has email input field', async ({ page }) => {
    const email = page.getByLabel('Email');
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute('type', 'email');
  });

  test('has submit button', async ({ page }) => {
    const button = page.getByRole('button', { name: /send reset link/i });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  test('has link back to sign-in', async ({ page }) => {
    const link = page.getByRole('link', { name: /sign in/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/sign-in');
  });
});

// ─── Auth Redirects ─────────────────────────────────────────────────
test.describe('Auth redirects for unauthenticated users', () => {
  test('visiting /dashboard redirects to /sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in\?callbackUrl=%2Fdashboard/);
  });

  test('visiting /repairs redirects to /sign-in', async ({ page }) => {
    await page.goto('/repairs');
    await expect(page).toHaveURL(/\/sign-in\?callbackUrl=%2Frepairs/);
  });

  test('visiting /admin redirects to /sign-in', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/sign-in\?callbackUrl=%2Fadmin/);
  });
});

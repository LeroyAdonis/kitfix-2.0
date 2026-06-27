/**
 * Auth System Debug Test — traces the full sign-up → cookie → session → protected page flow.
 * Run with: npx playwright test e2e/auth-debug.spec.ts --headed
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const TEST_USER = {
  name: `DebugUser${Date.now()}`,
  email: `debug${Date.now()}@kitfix-test.com`,
  password: 'Debug1234!',
};

test.describe('Auth Full Flow Debug', () => {
  test('sign-up → cookie set → session → dashboard accessible', async ({ page }) => {
    // ── Phase 1: Visit sign-up page ──
    console.log(`[DEBUG] Navigating to ${BASE}/sign-up`);
    const signUpRes = await page.goto(`${BASE}/sign-up`);
    console.log(`[DEBUG] Sign-up page status: ${signUpRes?.status()}`);

    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();

    // ── Phase 2: Fill sign-up form ──
    console.log('[DEBUG] Filling sign-up form with:', TEST_USER.email);
    await page.getByLabel('Full name').fill(TEST_USER.name);
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password', { exact: true }).fill(TEST_USER.password);
    await page.getByLabel('Confirm password').fill(TEST_USER.password);

    // ── Phase 3: Intercept the sign-up API call ──
    const apiResponse = page.waitForResponse(
      (res) => res.url().includes('/api/auth/sign-up/email') && res.status() === 200,
      { timeout: 15000 }
    );

    // ── Phase 4: Submit ──
    console.log('[DEBUG] Clicking Create account...');
    await page.getByRole('button', { name: /create account/i }).click();

    // ── Phase 5: Check API response ──
    try {
      const response = await apiResponse;
      const body = await response.json();
      console.log('[DEBUG] Sign-up API response:', JSON.stringify(body, null, 2));

      // Check if token is in response
      if (body?.token) {
        console.log('[DEBUG] ✅ Token received in API response');
      } else {
        console.log('[DEBUG] ❌ No token in API response — full body:', JSON.stringify(body));
      }
    } catch (err) {
      console.log('[DEBUG] ❌ Failed to capture sign-up API response:', err);
    }

    // ── Phase 6: Wait for redirect + check cookie ──
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(async () => {
      console.log('[DEBUG] ⚠️ No redirect to dashboard. Current URL:', page.url());
      // Dump page content to see what happened
      const text = await page.textContent('body');
      console.log('[DEBUG] Page body preview:', text?.slice(0, 500));
    });

    // Check cookies
    const cookies = await page.context().cookies();
    console.log('[DEBUG] All cookies:', JSON.stringify(cookies.map(c => ({
      name: c.name,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      sameSite: c.sameSite,
      valuePreview: c.value.slice(0, 20) + '...',
    })), null, 2));

    const sessionCookie = cookies.find(c => c.name === 'better-auth.session_token');
    if (sessionCookie) {
      console.log('[DEBUG] ✅ Session cookie found:', sessionCookie.name, 'secure:', sessionCookie.secure);
    } else {
      console.log('[DEBUG] ❌ No session cookie found!');
      // Also check for __Secure- prefixed cookie
      const secureCookie = cookies.find(c => c.name.startsWith('__Secure-better-auth'));
      if (secureCookie) {
        console.log('[DEBUG] ⚠️ Found __Secure- prefixed cookie instead:', secureCookie.name);
      }
    }

    // ── Phase 7: Try accessing a protected page directly ──
    console.log(`[DEBUG] Navigating to ${BASE}/dashboard`);
    const dashRes = await page.goto(`${BASE}/dashboard`);
    console.log(`[DEBUG] Dashboard status: ${dashRes?.status()}`);
    const currentUrl = page.url();
    console.log('[DEBUG] Current URL after dashboard nav:', currentUrl);

    if (currentUrl.includes('/sign-in')) {
      console.log('[DEBUG] ❌ Redirected to sign-in — session not recognized!');
      // Check what the auth-session endpoint returns
      const sessionCheck = await page.request.get(`${BASE}/api/auth-session`);
      console.log('[DEBUG] /api/auth-session status:', sessionCheck.status());
      console.log('[DEBUG] /api/auth-session body:', await sessionCheck.text());
    } else if (currentUrl.includes('/dashboard')) {
      console.log('[DEBUG] ✅ Dashboard accessible — auth is working!');
    }

    // ── Phase 8: Check console for errors ──
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
  });

  test('sign-in → existing user → cookie → dashboard', async ({ page }) => {
    // Use a known test account (must exist in DB)
    console.log('[DEBUG] Sign-in flow test');

    await page.goto(`${BASE}/sign-in`);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

    // Fill sign-in form with a test user that should exist
    // Note: adjust email/password if you have a seeded test user
    await page.getByLabel('Email').fill('test@kitfix.com');
    await page.getByLabel('Password').fill('Test1234!');

    const apiResponse = page.waitForResponse(
      (res) => res.url().includes('/api/auth/sign-in/email'),
      { timeout: 15000 }
    );

    await page.getByRole('button', { name: /sign in/i }).click();

    try {
      const response = await apiResponse;
      const body = await response.json();
      console.log('[DEBUG] Sign-in API response status:', response.status());
      console.log('[DEBUG] Sign-in response keys:', Object.keys(body || {}));
      if (body?.error) {
        console.log('[DEBUG] ❌ Sign-in error:', body.error);
      } else {
        console.log('[DEBUG] ✅ Sign-in succeeded');
      }
    } catch (err) {
      console.log('[DEBUG] ❌ Sign-in API response failed:', err);
    }

    // Check outcome
    await page.waitForTimeout(2000);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'better-auth.session_token');
    console.log('[DEBUG] Session cookie after sign-in:', sessionCookie ? '✅ Present' : '❌ Missing');
    console.log('[DEBUG] Final URL:', page.url());
  });
});

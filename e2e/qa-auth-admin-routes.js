/* eslint-disable @typescript-eslint/no-require-imports */
// KitFix 2.0 QA — Customer & Admin Routes
// Tests against production: https://kitfix-2-0.vercel.app

const { chromium } = require('@playwright/test');
const BASE = 'https://kitfix-2-0.vercel.app';
const OUT = '/root/kitfix-2.0/e2e-results/auth';

async function run() {
  require('fs').mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const results = { passed: 0, failed: 0, issues: [] };

  async function check(label, url, fn) {
    const page = await context.newPage();
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      const status = resp ? resp.status() : 0;
      await page.screenshot({ path: `${OUT}/${label.replace(/[^a-z0-9]/gi, '_')}.png`, fullPage: true });

      const bodyText = await page.textContent('body');
      const errors = bodyText.match(/error|something went wrong|internal server/i);

      const result = fn ? await fn(page) : {};
      const pageTitle = await page.title();

      console.log(`  ${status === 200 && !errors ? '✅' : '⚠️'} ${label} — ${status} — "${pageTitle}"`);
      if (status >= 400) results.issues.push(`${label} returned HTTP ${status}`);
      if (errors) results.issues.push(`${label} has error indicators in body text`);
      results.passed++;
    } catch (e) {
      console.log(`  ❌ ${label} — ${e.message.slice(0, 100)}`);
      results.failed++;
      results.issues.push(`${label} crashed: ${e.message.slice(0, 100)}`);
    } finally {
      await page.close();
    }
  }

  console.log('\n========== CUSTOMER ROUTES (unauthenticated — expect redirects) ==========\n');

  await check('Dashboard (no auth)', `${BASE}/dashboard`, async page => {
    const isSignIn = page.url().includes('/sign-in');
    const text = await page.textContent('body');
    return { redirectedToSignIn: isSignIn, preview: text.slice(0, 100) };
  });

  await check('Profile (no auth)', `${BASE}/profile`, async page => {
    const isSignIn = page.url().includes('/sign-in');
    return { redirected: isSignIn };
  });

  await check('Repairs List (no auth)', `${BASE}/repairs`, async page => {
    const isSignIn = page.url().includes('/sign-in');
    return { redirected: isSignIn };
  });

  await check('New Repair (no auth)', `${BASE}/repairs/new`, async page => {
    const isSignIn = page.url().includes('/sign-in');
    return { redirected: isSignIn };
  });

  await check('Payments (no auth)', `${BASE}/payments`, async page => {
    const isSignIn = page.url().includes('/sign-in');
    return { redirected: isSignIn };
  });

  await check('Notifications (no auth)', `${BASE}/notifications`, async page => {
    const isSignIn = page.url().includes('/sign-in');
    return { redirected: isSignIn };
  });

  console.log('\n========== ADMIN ROUTES (unauthenticated — expect redirects or 403) ==========\n');

  await check('Admin Dashboard (no auth)', `${BASE}/admin`, async page => {
    const url = page.url();
    const text = await page.textContent('body');
    return { finalUrl: url, preview: text.slice(0, 100) };
  });

  await check('Admin Store (no auth)', `${BASE}/admin/store`, async page => {
    const text = await page.textContent('body');
    return { preview: text.slice(0, 100) };
  });

  await check('Admin Orders (no auth)', `${BASE}/admin/orders`, async page => {
    const text = await page.textContent('body');
    return { preview: text.slice(0, 100) };
  });

  await check('Admin Requests (no auth)', `${BASE}/admin/requests`, async page => {
    const text = await page.textContent('body');
    return { preview: text.slice(0, 100) };
  });

  await check('Admin Technicians (no auth)', `${BASE}/admin/technicians`, async page => {
    const text = await page.textContent('body');
    return { preview: text.slice(0, 100) };
  });

  await check('Admin Users (no auth)', `${BASE}/admin/users`, async page => {
    const text = await page.textContent('body');
    return { preview: text.slice(0, 100) };
  });

  await check('Admin Reviews (no auth)', `${BASE}/admin/reviews`, async page => {
    const text = await page.textContent('body');
    return { preview: text.slice(0, 100) };
  });

  // Try interacting — click sign-in nav link if it exists
  await check('Interaction: Navigate from Home to Sign In', BASE, async page => {
    // Try clicking sign-in link
    const signInLink = page.locator('a[href*="sign-in"], a:has-text("Sign In")').first();
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await page.waitForURL('**/sign-in**', { timeout: 5000 }).catch(() => {});
    }
    const finalUrl = page.url();
    return { clickedSignIn: finalUrl.includes('/sign-in'), finalUrl };
  });

  console.log('\n========== RESULTS ==========');
  console.log(`  Passed: ${results.passed} | Failed: ${results.failed}`);
  if (results.issues.length) {
    console.log('\n  Issues Found:');
    results.issues.forEach(i => console.log(`    ⚠️  ${i}`));
  }

  await browser.close();
  require('fs').writeFileSync(`${OUT}/_results.json`, JSON.stringify(results, null, 2));
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });

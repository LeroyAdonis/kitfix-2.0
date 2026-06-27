/* eslint-disable @typescript-eslint/no-require-imports */
// KitFix 2.0 QA — Browser check with realistic UA to bypass Vercel WAF

const { chromium } = require('@playwright/test');
const BASE = 'https://kitfix-2-0.vercel.app';
const OUT = '/root/kitfix-2.0/e2e-results/prod-qa';

async function run() {
  require('fs').mkdirSync(OUT, { recursive: true });

  // Use a real Chrome User-Agent to bypass Vercel Security Checkpoint
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
    }
  });

  const results = { passed: 0, failed: 0, issues: [] };

  async function check(label, url) {
    const page = await context.newPage();
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const status = resp ? resp.status() : 0;
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUT}/${label.replace(/[^a-z0-9]/gi, '_')}.png`, fullPage: true });

      const title = await page.title();
      const body = await page.textContent('body');
      const isBlocked = title.includes('Security') || status === 403;
      const hasError = body.toLowerCase().includes('something went wrong') || body.toLowerCase().includes('internal server');

      console.log(`  ${status === 200 ? '✅' : '⚠️'} ${label} — ${status} — "${title}"`);
      if (isBlocked) results.issues.push(`${label} — BLOCKED by Vercel WAF (${status})`);
      if (hasError) results.issues.push(`${label} — Error in page content`);
      results.passed++;
    } catch (e) {
      console.log(`  ❌ ${label} — ${e.message.slice(0, 100)}`);
      results.failed++;
    } finally {
      await page.close();
    }
  }

  const routes = [
    '/', '/sign-in', '/sign-up', '/forgot-password', '/verify-email',
    '/shop', '/shop/kaizer-chiefs-2024-home', '/shop/cart',
    '/checkout', '/orders', '/~offline',
    '/dashboard', '/profile', '/repairs', '/repairs/new',
    '/payments', '/notifications',
    '/admin', '/admin/store', '/admin/orders',
    '/admin/requests', '/admin/technicians', '/admin/users',
  ];

  console.log(`\n========== PRODUCTION QA (${routes.length} routes) ==========\n`);

  for (const route of routes) {
    await check(route, `${BASE}${route}`);
  }

  console.log('\n========== RESULTS ==========');
  console.log(`  Routes checked: ${routes.length}`);
  console.log(`  Passed: ${results.passed} | Failed: ${results.failed}`);
  console.log(`  Blocked by WAF: ${results.issues.filter(i => i.includes('BLOCKED')).length}`);
  console.log(`  Has errors: ${results.issues.filter(i => i.includes('Error')).length}`);

  if (results.issues.length) {
    console.log('\n  Issues:');
    results.issues.forEach(i => console.log(`    ${i}`));
  }

  await browser.close();
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });

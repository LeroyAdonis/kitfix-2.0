// KitFix 2.0 QA — Public & Store Routes
// Tests against production: https://kitfix-2-0.vercel.app

const { chromium } = require('@playwright/test');
const BASE = 'https://kitfix-2-0.vercel.app';
const OUT = '/root/kitfix-2.0/e2e-results/public';

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

      const errors = await page.evaluate(() =>
        Array.from(document.querySelectorAll('[class*="error" i], [class*="error"]')).map(e => e.textContent)
      );

      const result = fn ? await fn(page) : {};
      const pageTitle = await page.title();

      console.log(`  ${status === 200 ? '✅' : '⚠️'} ${label} — ${status} — "${pageTitle}"`);
      if (status >= 400) results.issues.push(`${label} returned HTTP ${status}`);
      if (errors.length) results.issues.push(`${label} has visible error text: ${errors.slice(0, 3).join('; ')}`);
      results.passed++;
    } catch (e) {
      console.log(`  ❌ ${label} — ${e.message.slice(0, 100)}`);
      results.failed++;
      results.issues.push(`${label} crashed: ${e.message.slice(0, 100)}`);
    } finally {
      await page.close();
    }
  }

  console.log('\n========== PUBLIC ROUTES ==========\n');

  await check('Homepage', BASE, async page => {
    const text = await page.textContent('body');
    const hasLinks = await page.locator('a').count();
    return { textPreview: text.slice(0, 100), linkCount: hasLinks };
  });

  await check('Sign In', `${BASE}/sign-in`, async page => {
    const hasForm = await page.locator('input, button, form').count();
    return { formElements: hasForm };
  });

  await check('Sign Up', `${BASE}/sign-up`, async page => {
    const hasForm = await page.locator('input, button').count();
    return { formFields: hasForm };
  });

  await check('Forgot Password', `${BASE}/forgot-password`, async page => {
    const hasInput = await page.locator('input[type="email"], input').count();
    return { inputCount: hasInput };
  });

  await check('Verify Email', `${BASE}/verify-email`, async page => {
    const text = await page.textContent('body');
    return { preview: text.slice(0, 150) };
  });

  console.log('\n========== STORE ROUTES ==========\n');

  await check('Shop Listing', `${BASE}/shop`, async page => {
    const productCards = await page.locator('a[href*="/shop/"], article, [class*="product"]').count();
    const bodyText = await page.textContent('body');
    return { productElements: productCards, preview: bodyText.slice(0, 100) };
  });

  await check('Shop Detail (generic)', `${BASE}/shop/kaizer-chiefs-2024-home`, async page => {
    const hasContent = await page.locator('body').textContent();
    const buttons = await page.locator('button, a[href*="add"]').count();
    return { charCount: hasContent.length, interactiveElements: buttons };
  });

  await check('Shop Cart', `${BASE}/shop/cart`, async page => {
    const bodyText = await page.textContent('body');
    return { preview: bodyText.slice(0, 200) };
  });

  await check('Checkout', `${BASE}/checkout`, async page => {
    const bodyText = await page.textContent('body');
    return { preview: bodyText.slice(0, 200) };
  });

  await check('Orders List', `${BASE}/orders`, async page => {
    const bodyText = await page.textContent('body');
    return { preview: bodyText.slice(0, 200) };
  });

  await check('Offline Fallback', `${BASE}/~offline`, async page => {
    const text = await page.textContent('body');
    return { preview: text.slice(0, 150) };
  });

  await check('404 Page', `${BASE}/this-page-does-not-exist-12345`, async page => {
    const status = page.url().includes('_not-found') || (await page.textContent('body')).includes('not found');
    return { is404: status };
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

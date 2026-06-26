// KitFix 2.0 QA — Local Playwright smoke test
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'fs';

const BASE = 'http://localhost:3000';
const OUT = './e2e-results/local';

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

const results = [];

async function check(label, path, fn) {
  const page = await context.newPage();
  try {
    const resp = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
    const status = resp ? resp.status() : 0;
    const title = await page.title();
    await page.screenshot({ path: `${OUT}/${label.replace(/[^a-z0-9]/gi, '_')}.png`, fullPage: true });
    
    const bodyText = await page.textContent('body');
    const hasError = /something went wrong|internal server error|application error/i.test(bodyText);
    const issues = [];
    if (status >= 400) issues.push(`HTTP ${status}`);
    if (hasError) issues.push('Error text in body');
    
    if (fn) await fn(page);
    
    results.push({ route: path, status, title, hasError, issues });
    const icon = status === 200 && !hasError ? '✅' : '⚠️';
    console.log(`${icon} ${label} — ${status} — "${title}"`);
  } catch (e) {
    results.push({ route: path, status: 0, title: 'CRASH', hasError: true, issues: [e.message.slice(0, 100)] });
    console.log(`❌ ${label} — ${e.message.slice(0, 100)}`);
  } finally {
    await page.close();
  }
}

console.log('\n========== PUBLIC & STATIC ROUTES ==========\n');

await check('Homepage', '/', async (page) => {
  const links = await page.locator('a').count();
  console.log(`    Links on page: ${links}`);
});

await check('Sign In', '/sign-in', async (page) => {
  const inputs = await page.locator('input').count();
  console.log(`    Form inputs: ${inputs}`);
});

await check('Sign Up', '/sign-up');
await check('Forgot Password', '/forgot-password');
await check('Verify Email', '/verify-email');
await check('Offline', '/~offline');
await check('404', '/this-does-not-exist');

console.log('\n========== STORE ROUTES ==========\n');

await check('Shop Listing', '/shop', async (page) => {
  const cards = await page.locator('a[href*="/shop/"]').count();
  const body = await page.textContent('body');
  console.log(`    Product cards: ${cards}`);
  console.log(`    Page has: ${body.includes('Kaizer') ? '✅ Products visible' : '⚠️ No products'}`);
});

await check('Shop Detail', '/shop/kaizer-chiefs-2024-home', async (page) => {
  const buttons = await page.locator('button').count();
  const sizes = await page.locator('button:has-text("S"), button:has-text("M"), button:has-text("L")').count();
  console.log(`    Buttons: ${buttons}, Size options: ${sizes}`);
});

await check('Shop Cart', '/shop/cart');
await check('Checkout', '/checkout', async (page) => {
  console.log(`    Final URL: ${page.url()}`);
});
await check('Orders List', '/orders', async (page) => {
  console.log(`    Final URL: ${page.url()}`);
});

console.log('\n========== CUSTOMER ROUTES ==========\n');

await check('Dashboard', '/dashboard', async (page) => {
  console.log(`    Final URL: ${page.url()}`);
});
await check('Repairs', '/repairs', async (page) => {
  console.log(`    Final URL: ${page.url()}`);
});
await check('Repairs New', '/repairs/new');
await check('Payments', '/payments');
await check('Notifications', '/notifications');
await check('Profile', '/profile');

console.log('\n========== ADMIN ROUTES ==========\n');

await check('Admin Dashboard', '/admin');
await check('Admin Store', '/admin/store');
await check('Admin Orders', '/admin/orders');
await check('Admin Requests', '/admin/requests');
await check('Admin Technicians', '/admin/technicians');
await check('Admin Users', '/admin/users');
await check('Admin Payments', '/admin/payments');
await check('Admin Reviews', '/admin/reviews');

console.log('\n========== SUMMARY ==========\n');

const passed = results.filter(r => r.status === 200 && !r.hasError).length;
const warnings = results.filter(r => r.status === 200 && r.hasError).length;
const failed = results.filter(r => r.status >= 400).length;
const crashed = results.filter(r => r.status === 0).length;

console.log(`Total routes: ${results.length}`);
console.log(`✅ OK (200, no errors): ${passed}`);
console.log(`⚠️  OK but has errors: ${warnings}`);
console.log(`❌ HTTP errors: ${failed}`);
console.log(`💥 Crashed: ${crashed}`);

const issues = results.filter(r => r.issues.length > 0);
if (issues.length > 0) {
  console.log('\nIssues:');
  for (const r of issues) {
    console.log(`  ${r.route}: ${r.issues.join(', ')}`);
  }
}

writeFileSync(`${OUT}/_results.json`, JSON.stringify(results, null, 2));
await browser.close();

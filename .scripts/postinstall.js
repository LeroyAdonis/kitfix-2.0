/**
 * Postinstall script — patches lightningcss to use lightningcss-wasm via module resolution
 * instead of a relative ../pkg/ path that doesn't exist on Vercel's clean install.
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'node_modules', 'lightningcss', 'node', 'index.js');

if (!fs.existsSync(indexPath)) {
  console.warn('[postinstall] lightningcss node/index.js not found — skipping patch');
  process.exit(0);
}

const content = fs.readFileSync(indexPath, 'utf8');

// Handle both original relative path and any previous broken resolve attempts
const patterns = [
  'module.exports = require(`../pkg/wasm-node.cjs`);',
  "module.exports = require(require.resolve('lightningcss-wasm/wasm-node.cjs'));",
  "module.exports = require(require.resolve('lightningcss-wasm'));",
];
const replacement = "module.exports = require('lightningcss-wasm');";

let updated = content;
let patched = false;

for (const pattern of patterns) {
  if (updated.includes(pattern)) {
    updated = updated.replace(pattern, replacement);
    patched = true;
  }
}

if (patched) {
  fs.writeFileSync(indexPath, updated, 'utf8');
  console.log('[postinstall] ✅ Patched lightningcss WASM require path');
} else {
  console.log('[postinstall] ⏭  lightningcss already correctly patched');
}

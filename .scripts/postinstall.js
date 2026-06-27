/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Postinstall script — patches lightningcss/node/index.js to use lightningcss-wasm
 * via proper module resolution instead of a relative ../pkg/ path.
 * 
 * This is required because:
 * - Local dev: lightningcss-wasm is symlinked into lightningcss/pkg/
 * - Vercel:    lightningcss-wasm is a separate top-level package
 * - The ../pkg/ relative path only works in the symlinked setup
 *
 * This patch replaces the entire file (thin shim, ~20 lines) for reliability.
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'node_modules', 'lightningcss', 'node', 'index.js');

if (!fs.existsSync(indexPath)) {
  console.warn('[postinstall] lightningcss node/index.js not found — skipping patch');
  process.exit(0);
}

const content = fs.readFileSync(indexPath, 'utf8');

// Check if already patched (our fixed version)
if (content.includes("require('lightningcss-wasm')")) {
  console.log('[postinstall] ⏭  lightningcss already patched');
  process.exit(0);
}

const patched = `let parts = [process.platform, process.arch];
if (process.platform === 'linux') {
  const { MUSL, familySync } = require('detect-libc');
  const family = familySync();
  if (family === MUSL) {
    parts.push('musl');
  } else if (process.arch === 'arm') {
    parts.push('gnueabihf');
  } else {
    parts.push('gnu');
  }
} else if (process.platform === 'win32') {
  parts.push('msvc');
}

if (process.env.CSS_TRANSFORMER_WASM || true) {
  module.exports = require('lightningcss-wasm');
} else {
  try {
    module.exports = require(\`lightningcss-\${parts.join('-')}\`);
  } catch (err) {
    module.exports = require(\`../lightningcss.\${parts.join('-')}.node\`);
  }
}

module.exports.browserslistToTargets = require('./browserslistToTargets');
module.exports.composeVisitors = require('./composeVisitors');
module.exports.Features = require('./flags').Features;
`;

fs.writeFileSync(indexPath, patched, 'utf8');
console.log('[postinstall] ✅ Patched lightningcss WASM require path');

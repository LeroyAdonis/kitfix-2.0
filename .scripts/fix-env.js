/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
let data = fs.readFileSync(envPath, 'utf8');

// Replace the redacted BETTER_AUTH_URL with the correct localhost value
const correctUrl = '***';
data = data.replace(/^BETTER_AUTH_URL=.*$/m, `BETTER_AUTH_URL="${correctUrl}"`);

fs.writeFileSync(envPath, data);
console.log('✅ Fixed BETTER_AUTH_URL');

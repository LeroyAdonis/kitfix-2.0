// Debug script to test sign-up API directly
const { neon } = require('@neondatabase/serverless');

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set!');
    process.exit(1);
  }
  
  console.log('DATABASE_URL prefix:', dbUrl.substring(0, 20) + '...');
  
  try {
    const sql = neon(dbUrl);
    const result = await sql`SELECT 1 AS ok`;
    console.log('DB Connection OK:', JSON.stringify(result));
  } catch (e) {
    console.error('DB Connection FAILED:', e.message);
    console.error('Full error:', e);
  }
  
  // Test table access
  try {
    const sql = neon(dbUrl);
    const users = await sql`SELECT COUNT(*) FROM "user"`;
    console.log('User count:', JSON.stringify(users));
  } catch (e) {
    console.error('User table query FAILED:', e.message);
  }

  // Test inserting a user directly
  try {
    const sql = neon(dbUrl);
    const testEmail = `debug-${Date.now()}@test.co.za`;
    await sql`
      INSERT INTO "user" (id, name, email, "emailVerified", role)
      VALUES (gen_random_uuid()::text, 'Debug User', ${testEmail}, false, 'customer')
    `;
    console.log('INSERT user: OK');
    
    // Clean up
    await sql`DELETE FROM "user" WHERE email = ${testEmail}`;
    console.log('CLEANUP: OK');
  } catch (e) {
    console.error('User INSERT FAILED:', e.message);
    console.error('Full:', e);
  }
}

main().catch(console.error);

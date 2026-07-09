import { neon } from "@neondatabase/serverless";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log("DATABASE_URL not set in env");
    process.exit(1);
  }
  console.log("DB URL:", dbUrl.slice(0, 25) + "...");

  const sql = neon(dbUrl);
  
  // Test basic connection
  const r1 = await sql`SELECT 1 AS ok`;
  console.log("Basic query:", JSON.stringify(r1));
  
  // Test user table exists
  const r2 = await sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user')`;
  console.log("User table exists:", JSON.stringify(r2));
  
  // Test account table
  const r3 = await sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'account')`;
  console.log("Account table exists:", JSON.stringify(r3));
  
  // Count existing users
  const r4 = await sql`SELECT COUNT(*)::int FROM "user"`;
  console.log("User count:", JSON.stringify(r4));
  
  // Try inserting
  const testEmail = `dbg-${Date.now()}@test.za`;
  await sql`INSERT INTO "user" (id, name, email, "emailVerified", role) VALUES (${crypto.randomUUID()}, 'DBG', ${testEmail}, false, 'customer')`;
  console.log("INSERT user: OK");
  
  await sql`DELETE FROM "user" WHERE email = ${testEmail}`;
  console.log("CLEANUP: OK ✅ DB is fully operational");
}

main();

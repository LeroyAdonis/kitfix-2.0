import { neon } from "@neondatabase/serverless";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set!");
    process.exit(1);
  }

  console.log("DATABASE_URL prefix:", dbUrl.substring(0, 20) + "...");

  try {
    const sql = neon(dbUrl);
    const result = await sql`SELECT 1 AS ok`;
    console.log("DB Connection OK:", JSON.stringify(result));
  } catch (e: any) {
    console.error("DB Connection FAILED:", e.message);
    process.exit(1);
  }

  // Test user table
  try {
    const sql = neon(dbUrl);
    const users = await sql`SELECT COUNT(*) FROM "user"`;
    console.log("User count:", JSON.stringify(users));
  } catch (e: any) {
    console.error("User table query FAILED:", e.message);
    process.exit(1);
  }

  // Test sign-up insert
  try {
    const sql = neon(dbUrl);
    const testEmail = `debug-${Date.now()}@test.co.za`;
    
    // Check existing
    const existing = await sql`SELECT id FROM "user" WHERE email = ${testEmail} LIMIT 1`;
    console.log("Existing check:", JSON.stringify(existing));
    
    // Insert
    const userId = crypto.randomUUID();
    await sql`
      INSERT INTO "user" (id, name, email, "emailVerified", role)
      VALUES (${userId}, 'Debug User', ${testEmail}, false, 'customer')
    `;
    console.log("INSERT user: OK, id:", userId);
    
    // Insert account
    await sql`
      INSERT INTO "account" (id, "userId", "accountId", "providerId", password)
      VALUES (${crypto.randomUUID()}, ${userId}, ${userId}, 'credential', '$2a$10$test')
    `;
    console.log("INSERT account: OK");
    
    // Clean up
    await sql`DELETE FROM "user" WHERE id = ${userId}`;
    console.log("CLEANUP: OK");
    console.log("ALL DB OPERATIONS PASSED ✅");
  } catch (e: any) {
    console.error("INSERT FAILED:", e.message);
    console.error("Full error:", e);
  }
}

main();

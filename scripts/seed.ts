/**
 * Seed script — creates test users and repair requests covering all pipeline stages.
 *
 * Usage:  npx tsx scripts/seed.ts
 * Requires: DATABASE_URL env var (Neon Postgres connection string)
 *
 * Idempotent: checks for existing users by email before inserting.
 */

import "dotenv/config";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "../lib/db";
import {
  user,
  account,
  repairRequests,
  statusHistory,
} from "../lib/db/schema";

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const ADMIN_EMAIL = "admin@kitfix.co.za";
const CUSTOMER_EMAIL = "customer@test.co.za";

const ADMIN_ID = "seed-admin-001";
const CUSTOMER_ID = "seed-customer-001";

interface SeedRepairRequest {
  id: string;
  customerId: string;
  jerseyDescription: string;
  jerseyBrand: string;
  jerseySize: string;
  damageType: "tear" | "hole" | "stain" | "fading" | "logo_damage" | "seam_split" | "other";
  damageDescription: string;
  urgencyLevel: "standard" | "rush" | "emergency";
  currentStatus: "submitted" | "reviewed" | "quote_sent" | "quote_accepted" | "in_repair" | "quality_check" | "shipped";
  estimatedCost: number | null;
  adminNotes: string | null;
  quoteDeclineReason: string | null;
}

const REPAIR_REQUESTS: SeedRepairRequest[] = [
  {
    id: "seed-rr-001",
    customerId: CUSTOMER_ID,
    jerseyDescription: "Kaizer Chiefs 2024/25 Home Jersey",
    jerseyBrand: "Nike",
    jerseySize: "L",
    damageType: "tear",
    damageDescription: "15cm tear along the left shoulder seam from a tackle",
    urgencyLevel: "standard",
    currentStatus: "submitted",
    estimatedCost: null,
    adminNotes: null,
    quoteDeclineReason: null,
  },
  {
    id: "seed-rr-002",
    customerId: CUSTOMER_ID,
    jerseyDescription: "Springbok 2023 Rugby World Cup Jersey",
    jerseyBrand: "Asics",
    jerseySize: "XL",
    damageType: "logo_damage",
    damageDescription: "Springbok emblem peeling off at the edges",
    urgencyLevel: "rush",
    currentStatus: "reviewed",
    estimatedCost: 35000, // R350.00 in cents
    adminNotes: "Logo re-attachment required — need matching thread colour",
    quoteDeclineReason: null,
  },
  {
    id: "seed-rr-003",
    customerId: CUSTOMER_ID,
    jerseyDescription: "Orlando Pirates 2024 Away Jersey",
    jerseyBrand: "Adidas",
    jerseySize: "M",
    damageType: "hole",
    damageDescription: "Small burn hole near the front crest, 2cm diameter",
    urgencyLevel: "standard",
    currentStatus: "quote_sent",
    estimatedCost: 22500, // R225.00
    adminNotes: "Patch repair with matching fabric — quote sent to customer",
    quoteDeclineReason: null,
  },
  {
    id: "seed-rr-004",
    customerId: CUSTOMER_ID,
    jerseyDescription: "Mamelodi Sundowns 2024 Home Jersey",
    jerseyBrand: "Puma",
    jerseySize: "L",
    damageType: "seam_split",
    damageDescription: "Side seam split from armpit to hip, approximately 20cm",
    urgencyLevel: "emergency",
    currentStatus: "quote_accepted",
    estimatedCost: 18000, // R180.00
    adminNotes: "Customer accepted quote — fast-track for emergency",
    quoteDeclineReason: null,
  },
  {
    id: "seed-rr-005",
    customerId: CUSTOMER_ID,
    jerseyDescription: "Stormers 2024 Super Rugby Jersey",
    jerseyBrand: "Adidas",
    jerseySize: "S",
    damageType: "stain",
    damageDescription: "Grass and mud stains on front and back from a match",
    urgencyLevel: "standard",
    currentStatus: "in_repair",
    estimatedCost: 15000, // R150.00
    adminNotes: "Deep-clean treatment in progress",
    quoteDeclineReason: null,
  },
  {
    id: "seed-rr-006",
    customerId: CUSTOMER_ID,
    jerseyDescription: "Bafana Bafana 2023 Away Jersey",
    jerseyBrand: "Le Coq Sportif",
    jerseySize: "M",
    damageType: "fading",
    damageDescription: "Colour fading on the back around number print area",
    urgencyLevel: "standard",
    currentStatus: "quality_check",
    estimatedCost: 28000, // R280.00
    adminNotes: "Dye restoration complete — QC pending before dispatch",
    quoteDeclineReason: null,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function upsertUser(
  id: string,
  name: string,
  email: string,
  role: "admin" | "customer",
  plainPassword: string,
): Promise<boolean> {
  // Check if user already exists
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`  ⏭  User "${email}" already exists (id: ${existing[0].id})`);
    return false;
  }

  // Hash the password using Better Auth's own hashing (scrypt)
  const hashedPassword = await hashPassword(plainPassword);

  // Insert the user row
  await db.insert(user).values({
    id,
    name,
    email,
    emailVerified: true,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insert the credential account row (how Better Auth stores email/password)
  await db.insert(account).values({
    id: `${id}-credential`,
    userId: id,
    accountId: id,
    providerId: "credential",
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`  ✅ Created user "${email}" (role: ${role})`);
  return true;
}

async function seedRepairRequests(): Promise<void> {
  for (const rr of REPAIR_REQUESTS) {
    const existing = await db
      .select({ id: repairRequests.id })
      .from(repairRequests)
      .where(eq(repairRequests.id, rr.id))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ⏭  Repair request "${rr.id}" already exists`);
      continue;
    }

    await db.insert(repairRequests).values({
      id: rr.id,
      customerId: rr.customerId,
      jerseyDescription: rr.jerseyDescription,
      jerseyBrand: rr.jerseyBrand,
      jerseySize: rr.jerseySize,
      damageType: rr.damageType,
      damageDescription: rr.damageDescription,
      urgencyLevel: rr.urgencyLevel,
      currentStatus: rr.currentStatus,
      estimatedCost: rr.estimatedCost,
      adminNotes: rr.adminNotes,
      quoteDeclineReason: rr.quoteDeclineReason,
    });

    // Add an initial status history entry
    await db.insert(statusHistory).values({
      repairRequestId: rr.id,
      fromStatus: null,
      toStatus: rr.currentStatus,
      changedBy: rr.currentStatus === "submitted" ? rr.customerId : ADMIN_ID,
      notes: `Seeded with status: ${rr.currentStatus}`,
    });

    console.log(`  ✅ Created repair request "${rr.id}" (status: ${rr.currentStatus})`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("\n🌱 KitFix Seed Script\n");
  console.log("--- Users ---");

  await upsertUser(ADMIN_ID, "KitFix Admin", ADMIN_EMAIL, "admin", "KitFix2024!");
  await upsertUser(CUSTOMER_ID, "Test Customer", CUSTOMER_EMAIL, "customer", "Test1234!");

  console.log("\n--- Repair Requests ---");
  await seedRepairRequests();

  console.log("\n✅ Seed complete.\n");
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});

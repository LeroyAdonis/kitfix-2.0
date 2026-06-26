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
  products,
  productVariants,
  personalizationOptions,
  cartItems,
  orders,
  orderItems,
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
  currentStatus: "submitted" | "reviewed" | "quote_sent" | "quote_accepted" | "item_received" | "in_repair" | "quality_check" | "ready_for_shipment" | "shipped" | "delivered";
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
// E-commerce seed data
// ---------------------------------------------------------------------------

interface SeedProduct {
  id: string;
  name: string;
  description: string;
  slug: string;
  basePrice: number; // ZAR cents
  category: string;
  imageUrl: string | null;
}

interface SeedVariant {
  id: string;
  productId: string;
  size: string;
  stock: number;
  priceModifier: number;
}

interface SeedPersonalization {
  id: string;
  productId: string;
  fieldName: string;
  fieldType: "text" | "select";
  isRequired: boolean;
  maxLength: number | null;
  options: Record<string, string>[] | null;
}

const PRODUCTS: SeedProduct[] = [
  {
    id: "seed-prod-001",
    name: "Kaizer Chiefs 2024 Home Jersey",
    description: "Official Nike Kaizer Chiefs home jersey for the 2024/25 season. Gold and black with the iconic Amakhosi crest. Perfect for match day or customisation with your favourite player's name and number.",
    slug: "kaizer-chiefs-2024-home",
    basePrice: 89900, // R899.00
    category: "soccer",
    imageUrl: null,
  },
  {
    id: "seed-prod-002",
    name: "Orlando Pirates 2024 Away Jersey",
    description: "Official Adidas Orlando Pirates away jersey. Crisp white with gold trim and the Buccaneers badge. Lightweight breathable fabric for comfort on and off the pitch.",
    slug: "orlando-pirates-2024-away",
    basePrice: 84900,
    category: "soccer",
    imageUrl: null,
  },
  {
    id: "seed-prod-003",
    name: "Springbok 2023 Rugby World Cup Jersey",
    description: "The iconic Springbok jersey worn during the 2023 Rugby World Cup campaign. Green and gold with the World Cup champions badge. Genuine Asics replica.",
    slug: "springbok-2023-rwc",
    basePrice: 129900, // R1,299.00
    category: "rugby",
    imageUrl: null,
  },
  {
    id: "seed-prod-004",
    name: "Bafana Bafana 2024 Home Jersey",
    description: "Represent South Africa in this official Bafana Bafana home jersey. Yellow with green trim and the national team crest. Lightweight performance fabric by Le Coq Sportif.",
    slug: "bafana-bafana-2024-home",
    basePrice: 79900,
    category: "soccer",
    imageUrl: null,
  },
  {
    id: "seed-prod-005",
    name: "Blank Premium Jersey",
    description: "A high-quality blank jersey for full customisation. Choose your own colours, add a name and number, and create your unique look. Perfect for amateur teams and events.",
    slug: "blank-premium-jersey",
    basePrice: 54900,
    category: "custom",
    imageUrl: null,
  },
];

const VARIANTS: SeedVariant[] = [
  // Kaizer Chiefs
  { id: "seed-var-001", productId: "seed-prod-001", size: "S", stock: 15, priceModifier: 0 },
  { id: "seed-var-002", productId: "seed-prod-001", size: "M", stock: 25, priceModifier: 0 },
  { id: "seed-var-003", productId: "seed-prod-001", size: "L", stock: 30, priceModifier: 0 },
  { id: "seed-var-004", productId: "seed-prod-001", size: "XL", stock: 20, priceModifier: 0 },
  { id: "seed-var-005", productId: "seed-prod-001", size: "2XL", stock: 10, priceModifier: 5000 },
  // Orlando Pirates
  { id: "seed-var-006", productId: "seed-prod-002", size: "S", stock: 12, priceModifier: 0 },
  { id: "seed-var-007", productId: "seed-prod-002", size: "M", stock: 22, priceModifier: 0 },
  { id: "seed-var-008", productId: "seed-prod-002", size: "L", stock: 28, priceModifier: 0 },
  { id: "seed-var-009", productId: "seed-prod-002", size: "XL", stock: 18, priceModifier: 0 },
  { id: "seed-var-010", productId: "seed-prod-002", size: "2XL", stock: 8, priceModifier: 5000 },
  // Springbok
  { id: "seed-var-011", productId: "seed-prod-003", size: "S", stock: 10, priceModifier: 0 },
  { id: "seed-var-012", productId: "seed-prod-003", size: "M", stock: 20, priceModifier: 0 },
  { id: "seed-var-013", productId: "seed-prod-003", size: "L", stock: 25, priceModifier: 0 },
  { id: "seed-var-014", productId: "seed-prod-003", size: "XL", stock: 15, priceModifier: 0 },
  { id: "seed-var-015", productId: "seed-prod-003", size: "2XL", stock: 5, priceModifier: 10000 },
  // Bafana Bafana
  { id: "seed-var-016", productId: "seed-prod-004", size: "S", stock: 18, priceModifier: 0 },
  { id: "seed-var-017", productId: "seed-prod-004", size: "M", stock: 28, priceModifier: 0 },
  { id: "seed-var-018", productId: "seed-prod-004", size: "L", stock: 32, priceModifier: 0 },
  { id: "seed-var-019", productId: "seed-prod-004", size: "XL", stock: 22, priceModifier: 0 },
  { id: "seed-var-020", productId: "seed-prod-004", size: "2XL", stock: 12, priceModifier: 5000 },
  // Blank Premium
  { id: "seed-var-021", productId: "seed-prod-005", size: "S", stock: 50, priceModifier: 0 },
  { id: "seed-var-022", productId: "seed-prod-005", size: "M", stock: 50, priceModifier: 0 },
  { id: "seed-var-023", productId: "seed-prod-005", size: "L", stock: 50, priceModifier: 0 },
  { id: "seed-var-024", productId: "seed-prod-005", size: "XL", stock: 50, priceModifier: 0 },
  { id: "seed-var-025", productId: "seed-prod-005", size: "2XL", stock: 30, priceModifier: 5000 },
];

const PERSONALIZATION_OPTIONS: SeedPersonalization[] = [
  // All products get name + number + sleeve options
  { id: "seed-po-001", productId: "seed-prod-001", fieldName: "name", fieldType: "text", isRequired: false, maxLength: 15, options: null },
  { id: "seed-po-002", productId: "seed-prod-001", fieldName: "number", fieldType: "text", isRequired: false, maxLength: 2, options: null },
  { id: "seed-po-003", productId: "seed-prod-001", fieldName: "sleeve", fieldType: "select", isRequired: false, maxLength: null, options: [{ label: "Short Sleeve", value: "short" }, { label: "Long Sleeve", value: "long" }] },
  { id: "seed-po-004", productId: "seed-prod-002", fieldName: "name", fieldType: "text", isRequired: false, maxLength: 15, options: null },
  { id: "seed-po-005", productId: "seed-prod-002", fieldName: "number", fieldType: "text", isRequired: false, maxLength: 2, options: null },
  { id: "seed-po-006", productId: "seed-prod-002", fieldName: "sleeve", fieldType: "select", isRequired: false, maxLength: null, options: [{ label: "Short Sleeve", value: "short" }, { label: "Long Sleeve", value: "long" }] },
  { id: "seed-po-007", productId: "seed-prod-003", fieldName: "name", fieldType: "text", isRequired: false, maxLength: 15, options: null },
  { id: "seed-po-008", productId: "seed-prod-003", fieldName: "number", fieldType: "text", isRequired: false, maxLength: 2, options: null },
  { id: "seed-po-009", productId: "seed-prod-003", fieldName: "sleeve", fieldType: "select", isRequired: false, maxLength: null, options: [{ label: "Short Sleeve", value: "short" }, { label: "Long Sleeve", value: "long" }] },
  { id: "seed-po-010", productId: "seed-prod-004", fieldName: "name", fieldType: "text", isRequired: false, maxLength: 15, options: null },
  { id: "seed-po-011", productId: "seed-prod-004", fieldName: "number", fieldType: "text", isRequired: false, maxLength: 2, options: null },
  { id: "seed-po-012", productId: "seed-prod-004", fieldName: "sleeve", fieldType: "select", isRequired: false, maxLength: null, options: [{ label: "Short Sleeve", value: "short" }, { label: "Long Sleeve", value: "long" }] },
  { id: "seed-po-013", productId: "seed-prod-005", fieldName: "name", fieldType: "text", isRequired: true, maxLength: 20, options: null },
  { id: "seed-po-014", productId: "seed-prod-005", fieldName: "number", fieldType: "text", isRequired: true, maxLength: 2, options: null },
  { id: "seed-po-015", productId: "seed-prod-005", fieldName: "primary_colour", fieldType: "select", isRequired: true, maxLength: null, options: [{ label: "Red", value: "red" }, { label: "Blue", value: "blue" }, { label: "Green", value: "green" }, { label: "Black", value: "black" }, { label: "White", value: "white" }, { label: "Yellow", value: "yellow" }] },
  { id: "seed-po-016", productId: "seed-prod-005", fieldName: "sleeve", fieldType: "select", isRequired: false, maxLength: null, options: [{ label: "Short Sleeve", value: "short" }, { label: "Long Sleeve", value: "long" }] },
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

async function seedProducts(): Promise<void> {
  for (const p of PRODUCTS) {
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, p.id))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ⏭  Product "${p.name}" already exists`);
      continue;
    }

    await db.insert(products).values({
      id: p.id,
      name: p.name,
      description: p.description,
      slug: p.slug,
      basePrice: p.basePrice,
      category: p.category,
      imageUrl: p.imageUrl,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`  ✅ Created product "${p.name}" (R${(p.basePrice / 100).toFixed(2)})`);
  }

  for (const v of VARIANTS) {
    const existing = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(eq(productVariants.id, v.id))
      .limit(1);

    if (existing.length > 0) continue;

    await db.insert(productVariants).values({
      id: v.id,
      productId: v.productId,
      size: v.size,
      stock: v.stock,
      priceModifier: v.priceModifier,
    });
  }
  console.log(`  ✅ Created ${VARIANTS.length} product variants`);

  for (const po of PERSONALIZATION_OPTIONS) {
    const existing = await db
      .select({ id: personalizationOptions.id })
      .from(personalizationOptions)
      .where(eq(personalizationOptions.id, po.id))
      .limit(1);

    if (existing.length > 0) continue;

    await db.insert(personalizationOptions).values({
      id: po.id,
      productId: po.productId,
      fieldName: po.fieldName,
      fieldType: po.fieldType,
      isRequired: po.isRequired,
      maxLength: po.maxLength,
      options: po.options,
    });
  }
  console.log(`  ✅ Created ${PERSONALIZATION_OPTIONS.length} personalization options`);
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

  console.log("\n--- E-Commerce Products ---");
  await seedProducts();

  console.log("\n✅ Seed complete.\n");
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});

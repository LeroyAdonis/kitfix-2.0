import {
  createRepairSchema,
  shippingAddressSchema,
  sendQuoteSchema,
  acceptQuoteSchema,
  pickupAddressSchema,
} from "../repair";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid shipping address */
const validAddress = {
  street: "123 Long Street",
  city: "Cape Town",
  province: "Western Cape",
  postalCode: "8001",
};

/** Minimal valid repair input (urgencyLevel intentionally omitted to test default) */
const validRepairInput = {
  jerseyDescription: "Kaizer Chiefs 2024 home jersey", // 10+ chars
  jerseySize: "L" as const,
  damageType: "tear" as const,
  damageDescription: "Large tear along the left sleeve seam, approximately 10cm", // 20+ chars
  shippingAddress: validAddress,
};

// ---------------------------------------------------------------------------
// shippingAddressSchema
// ---------------------------------------------------------------------------

describe("shippingAddressSchema", () => {
  it("accepts a valid address and defaults country to South Africa", () => {
    const result = shippingAddressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe("South Africa");
    }
  });

  it("allows overriding the country default", () => {
    const result = shippingAddressSchema.safeParse({
      ...validAddress,
      country: "Namibia",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe("Namibia");
    }
  });

  it("rejects street shorter than 5 characters", () => {
    const result = shippingAddressSchema.safeParse({
      ...validAddress,
      street: "Hi",
    });
    expect(result.success).toBe(false);
  });

  it("rejects postalCode shorter than 4 characters", () => {
    const result = shippingAddressSchema.safeParse({
      ...validAddress,
      postalCode: "80",
    });
    expect(result.success).toBe(false);
  });

  it("rejects postalCode longer than 10 characters", () => {
    const result = shippingAddressSchema.safeParse({
      ...validAddress,
      postalCode: "12345678901",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createRepairSchema
// ---------------------------------------------------------------------------

describe("createRepairSchema", () => {
  // --- Happy path ---

  it("accepts valid input and defaults urgencyLevel to standard", () => {
    const result = createRepairSchema.safeParse(validRepairInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.urgencyLevel).toBe("standard");
    }
  });

  it("accepts valid input with explicit urgencyLevel", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      urgencyLevel: "rush",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.urgencyLevel).toBe("rush");
    }
  });

  it("accepts optional jerseyBrand", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      jerseyBrand: "Nike",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jerseyBrand).toBe("Nike");
    }
  });

  it("omits jerseyBrand when not provided", () => {
    const result = createRepairSchema.safeParse(validRepairInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jerseyBrand).toBeUndefined();
    }
  });

  // --- Missing required fields ---

  it("fails when jerseyDescription is missing", () => {
    const { jerseyDescription: _jerseyDescription, ...rest } = validRepairInput;
    const result = createRepairSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("fails when jerseySize is missing", () => {
    const { jerseySize: _jerseySize, ...rest } = validRepairInput;
    const result = createRepairSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("fails when damageType is missing", () => {
    const { damageType: _damageType, ...rest } = validRepairInput;
    const result = createRepairSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("fails when damageDescription is missing", () => {
    const { damageDescription: _damageDescription, ...rest } = validRepairInput;
    const result = createRepairSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("fails when shippingAddress is missing", () => {
    const { shippingAddress: _shippingAddress, ...rest } = validRepairInput;
    const result = createRepairSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  // --- jerseyDescription boundaries ---

  it("rejects jerseyDescription shorter than 10 characters", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      jerseyDescription: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("accepts jerseyDescription at exactly 10 characters", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      jerseyDescription: "A".repeat(10),
    });
    expect(result.success).toBe(true);
  });

  it("accepts jerseyDescription at exactly 500 characters", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      jerseyDescription: "A".repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it("rejects jerseyDescription longer than 500 characters", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      jerseyDescription: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  // --- damageDescription boundaries ---

  it("rejects damageDescription shorter than 20 characters", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      damageDescription: "Too short damage",
    });
    expect(result.success).toBe(false);
  });

  it("accepts damageDescription at exactly 20 characters", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      damageDescription: "A".repeat(20),
    });
    expect(result.success).toBe(true);
  });

  it("accepts damageDescription at exactly 1000 characters", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      damageDescription: "A".repeat(1000),
    });
    expect(result.success).toBe(true);
  });

  it("rejects damageDescription longer than 1000 characters", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      damageDescription: "A".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  // --- Invalid enums ---

  it("rejects invalid jerseySize", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      jerseySize: "XXXL",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid damageType", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      damageType: "burn",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid urgencyLevel", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      urgencyLevel: "super_rush",
    });
    expect(result.success).toBe(false);
  });

  // --- Enum coverage ---

  it.each(["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const)(
    "accepts jerseySize %s",
    (size) => {
      const result = createRepairSchema.safeParse({
        ...validRepairInput,
        jerseySize: size,
      });
      expect(result.success).toBe(true);
    },
  );

  it.each([
    "tear", "hole", "stain", "fading", "logo_damage", "seam_split", "other",
  ] as const)("accepts damageType %s", (type) => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      damageType: type,
    });
    expect(result.success).toBe(true);
  });

  it.each(["standard", "rush", "emergency"] as const)(
    "accepts urgencyLevel %s",
    (level) => {
      const result = createRepairSchema.safeParse({
        ...validRepairInput,
        urgencyLevel: level,
      });
      expect(result.success).toBe(true);
    },
  );

  // --- jerseyBrand max length ---

  it("accepts jerseyBrand at exactly 100 characters", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      jerseyBrand: "A".repeat(100),
    });
    expect(result.success).toBe(true);
  });

  it("rejects jerseyBrand longer than 100 characters", () => {
    const result = createRepairSchema.safeParse({
      ...validRepairInput,
      jerseyBrand: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// sendQuoteSchema
// ---------------------------------------------------------------------------

describe("sendQuoteSchema", () => {
  it("accepts valid input with pickupRequired override", () => {
    const result = sendQuoteSchema.safeParse({
      repairId: "abc-123",
      estimatedCost: 30000,
      pickupRequired: true,
    });
    expect(result.success).toBe(true);
  });

  it("defaults pickupRequired to undefined (auto-detect)", () => {
    const result = sendQuoteSchema.safeParse({
      repairId: "abc-123",
      estimatedCost: 30000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pickupRequired).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// acceptQuoteSchema
// ---------------------------------------------------------------------------

describe("acceptQuoteSchema", () => {
  it("accepts repairId only (no pickup address needed)", () => {
    const result = acceptQuoteSchema.safeParse({ repairId: "abc-123" });
    expect(result.success).toBe(true);
  });

  it("accepts repairId with valid pickup address", () => {
    const result = acceptQuoteSchema.safeParse({
      repairId: "abc-123",
      pickupAddress: {
        street: "42 Main Street",
        city: "Johannesburg",
        province: "Gauteng",
        postalCode: "2001",
        contactName: "Thabo Mokoena",
        contactPhone: "0821234567",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects pickup address with invalid phone number", () => {
    const result = acceptQuoteSchema.safeParse({
      repairId: "abc-123",
      pickupAddress: {
        street: "42 Main Street",
        city: "Johannesburg",
        province: "Gauteng",
        postalCode: "2001",
        contactName: "Thabo",
        contactPhone: "123",
      },
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// pickupAddressSchema
// ---------------------------------------------------------------------------

describe("pickupAddressSchema", () => {
  it("requires contactName and contactPhone", () => {
    const result = pickupAddressSchema.safeParse({
      street: "42 Main Street",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2001",
    });
    expect(result.success).toBe(false);
  });

  it("accepts +27 phone format", () => {
    const result = pickupAddressSchema.safeParse({
      street: "42 Main Street",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2001",
      contactName: "Thabo Mokoena",
      contactPhone: "+27821234567",
    });
    expect(result.success).toBe(true);
  });

  it("accepts 0XX phone format", () => {
    const result = pickupAddressSchema.safeParse({
      street: "42 Main Street",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2001",
      contactName: "Thabo Mokoena",
      contactPhone: "0821234567",
    });
    expect(result.success).toBe(true);
  });

  it("allows optional specialInstructions", () => {
    const result = pickupAddressSchema.safeParse({
      street: "42 Main Street",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2001",
      contactName: "Thabo Mokoena",
      contactPhone: "0821234567",
      specialInstructions: "Ring doorbell twice",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.specialInstructions).toBe("Ring doorbell twice");
    }
  });
});

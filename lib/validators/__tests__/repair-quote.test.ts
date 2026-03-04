import { describe, it, expect } from "vitest";
import { sendQuoteSchema, declineQuoteSchema } from "../repair";

describe("sendQuoteSchema", () => {
  it("accepts valid quote data", () => {
    const result = sendQuoteSchema.safeParse({
      repairId: "repair-123",
      estimatedCost: 450,
      adminNotes: "Standard tear repair",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing repairId", () => {
    const result = sendQuoteSchema.safeParse({ estimatedCost: 450 });
    expect(result.success).toBe(false);
  });

  it("rejects zero or negative cost", () => {
    const result = sendQuoteSchema.safeParse({
      repairId: "repair-123",
      estimatedCost: 0,
    });
    expect(result.success).toBe(false);
  });

  it("allows optional adminNotes", () => {
    const result = sendQuoteSchema.safeParse({
      repairId: "repair-123",
      estimatedCost: 200,
    });
    expect(result.success).toBe(true);
  });
});

describe("declineQuoteSchema", () => {
  it("accepts valid decline data", () => {
    const result = declineQuoteSchema.safeParse({
      repairId: "repair-123",
      reason: "Price is too high for a simple tear",
    });
    expect(result.success).toBe(true);
  });

  it("rejects reason shorter than 10 chars", () => {
    const result = declineQuoteSchema.safeParse({
      repairId: "repair-123",
      reason: "too much",
    });
    expect(result.success).toBe(false);
  });
});

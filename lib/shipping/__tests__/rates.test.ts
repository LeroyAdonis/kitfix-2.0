import { describe, it, expect } from "vitest";
import { NON_METRO_SURCHARGE_CENTS, formatShippingCost } from "../rates";

describe("formatShippingCost", () => {
  it("formats cents to Rands", () => {
    expect(formatShippingCost(89900)).toBe("R899.00");
  });

  it("formats small amounts", () => {
    expect(formatShippingCost(5000)).toBe("R50.00");
  });

  it("formats zero", () => {
    expect(formatShippingCost(0)).toBe("R0.00");
  });
});

describe("NON_METRO_SURCHARGE_CENTS", () => {
  it("is R50", () => {
    expect(NON_METRO_SURCHARGE_CENTS).toBe(5000);
  });
});

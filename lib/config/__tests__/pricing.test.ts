import { describe, it, expect } from "vitest";
import {
  PRICING,
  getPickupFee,
  getDeliveryFee,
  isMetroArea,
} from "../pricing";

describe("PRICING constants", () => {
  it("has correct metro pickup fee (R99 = 9900 cents)", () => {
    expect(PRICING.pickupFee.metro).toBe(9900);
  });

  it("has correct non-metro pickup fee (R149 = 14900 cents)", () => {
    expect(PRICING.pickupFee.nonMetro).toBe(14900);
  });
});

describe("isMetroArea", () => {
  it("returns true for Gauteng province", () => {
    expect(isMetroArea("Gauteng")).toBe(true);
  });

  it("returns true for metro city regardless of province", () => {
    expect(isMetroArea("Western Cape", "Cape Town")).toBe(true);
  });

  it("returns false for non-metro province and city", () => {
    expect(isMetroArea("Limpopo", "Polokwane")).toBe(false);
  });

  it("returns false for undefined province and city", () => {
    expect(isMetroArea(undefined, undefined)).toBe(false);
  });

  it("is case-insensitive for city matching", () => {
    expect(isMetroArea("KwaZulu-Natal", "durban")).toBe(true);
  });
});

describe("getPickupFee", () => {
  it("returns metro rate for Gauteng", () => {
    expect(getPickupFee("Gauteng")).toBe(9900);
  });

  it("returns metro rate for metro city", () => {
    expect(getPickupFee("Western Cape", "Cape Town")).toBe(9900);
  });

  it("returns non-metro rate for rural province", () => {
    expect(getPickupFee("Limpopo")).toBe(14900);
  });

  it("defaults to non-metro when province is undefined", () => {
    expect(getPickupFee(undefined)).toBe(14900);
  });
});

describe("getDeliveryFee", () => {
  it("returns metro rate for metro area", () => {
    expect(getDeliveryFee("Gauteng")).toBe(9900);
  });

  it("returns non-metro rate for rural area", () => {
    expect(getDeliveryFee("Limpopo")).toBe(14900);
  });
});

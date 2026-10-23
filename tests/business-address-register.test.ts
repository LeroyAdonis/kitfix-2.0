import { describe, expect, it } from "vitest";

import { BUSINESS, businessAddressLines } from "@/lib/business";

/**
 * Registered-address guard — added 2026-10-23.
 *
 * The address on the site must match the CIPC register, because Paystack cross-checks the two when
 * reviewing a merchant. The site briefly published "Randburg" as the city — geographically correct
 * (Fontainebleau sits inside Randburg) but absent from the register, which repeats FONTAINEBLEAU as
 * the town line and GAUTENG as the province.
 *
 * Source of truth, transcribed from BizPortal for enterprise K2025325036 on 2026-10-23:
 *
 *   Physical Address: 66 CATHERINE ROAD / FONTAINEBLEAU / FONTAINEBLEAU / GAUTENG / 2032
 *
 * If the register changes (CIPC office move), change REGISTER below in the same commit as
 * lib/business.ts — the pair moving together is the only way this stays honest.
 */

const REGISTER = {
  street: "66 CATHERINE ROAD",
  town: "FONTAINEBLEAU", // listed twice by CIPC: as suburb and as town
  province: "GAUTENG",
  postalCode: "2032",
} as const;

const norm = (s: string): string => s.trim().replace(/\s+/g, " ").toUpperCase();

describe("registered address matches the CIPC record", () => {
  it("street matches the register", () => {
    expect(norm(BUSINESS.address.street)).toBe(REGISTER.street);
  });

  it("suburb matches the register", () => {
    expect(norm(BUSINESS.address.suburb)).toBe(REGISTER.town);
  });

  it("city matches the register's town line — not an inferred metro name", () => {
    // Guards the exact regression: "Randburg" was published here and is not on the register.
    expect(norm(BUSINESS.address.city)).toBe(REGISTER.town);
  });

  it("province matches the register", () => {
    expect(norm(BUSINESS.address.province)).toBe(REGISTER.province);
  });

  it("postal code is the register's 2032", () => {
    expect(norm(BUSINESS.address.postalCode)).toBe(REGISTER.postalCode);
    expect(BUSINESS.address.postalCode).toMatch(/^\d{4}$/);
  });

  it("the rendered address lines carry every register element", () => {
    const joined = norm(businessAddressLines().join(" | "));
    expect(joined).toContain(REGISTER.street);
    expect(joined).toContain(REGISTER.town);
    expect(joined).toContain(REGISTER.province);
    expect(joined).toContain(REGISTER.postalCode);
  });

  it("the rendered address never repeats the town line twice in a row", () => {
    // CIPC stores FONTAINEBLEAU twice; a customer-facing address must not read that way.
    const lines = businessAddressLines().map(norm);
    for (let i = 1; i < lines.length; i++) {
      expect(lines[i], `address lines ${i - 1} and ${i} are identical`).not.toBe(lines[i - 1]);
    }
  });

  it("legal identity on the site matches the CIPC record", () => {
    expect(norm(BUSINESS.legalName)).toBe("KITFIX (PTY) LTD");
    expect(BUSINESS.registration).toBe("2025/325036/07");
  });
});

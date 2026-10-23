import { describe, expect, it } from "vitest";

import { BUSINESS } from "@/lib/business";

/**
 * Phone-number STRUCTURE guard — added 2026-10-23 after a real production defect.
 *
 * `BUSINESS.whatsapp` shipped as "2763322026" (10 digits). The leading 0 had been stripped from
 * 0763322026 and "27" prefixed, but the 7 of the mobile prefix was lost, so every wa.me link opened a
 * chat request for a number that does not exist and WhatsApp replied "+2763322026 is not a valid
 * phone number". The placeholder guard did not catch it because a malformed number is not a
 * placeholder — it is a wrong value, and that test only looked for `TODO-` and known-fake strings.
 *
 * The lesson: a test that checks a link MATCHES a stored value proves consistency, not correctness.
 * This file derives the expected international form FROM the local number and asserts the stored
 * fields equal that derivation, so a mistyped digit anywhere fails loudly.
 *
 * South African mobile numbers are 10 digits locally (0XX XXX XXXX) and drop the leading 0 when
 * prefixed with the +27 country code.
 */

const digits = (s: string): string => s.replace(/\D/g, "");

/** The only correct derivation: local 0XXXXXXXXX -> +27XXXXXXXXX */
const expectedE164 = `+27${digits(BUSINESS.phone).slice(1)}`;
const expectedWhatsApp = expectedE164.slice(1); // wa.me takes no "+"

describe("phone number structure", () => {
  it("the local number is a valid SA mobile: 10 digits starting with 0", () => {
    const d = digits(BUSINESS.phone);
    expect(d).toHaveLength(10);
    expect(d.startsWith("0")).toBe(true);
    // SA mobile prefixes are 06x, 07x or 08x — anything else is a landline or a typo.
    expect(["06", "07", "08"]).toContain(d.slice(0, 2));
  });

  it("phoneE164 is derived from the local number, not stored independently", () => {
    expect(BUSINESS.phoneE164).toBe(expectedE164);
    expect(digits(BUSINESS.phoneE164)).toHaveLength(11);
    expect(digits(BUSINESS.phoneE164).startsWith("27")).toBe(true);
  });

  it("the WhatsApp number is the E.164 form without the plus — 11 digits", () => {
    expect(BUSINESS.whatsapp).toBe(expectedWhatsApp);
    expect(digits(BUSINESS.whatsapp)).toHaveLength(11);
    expect(digits(BUSINESS.whatsapp).startsWith("27")).toBe(true);
  });

  it("all three representations describe the SAME number", () => {
    // This is the assertion whose absence let a 10-digit wa.me link reach production.
    expect(digits(BUSINESS.whatsapp)).toBe(digits(BUSINESS.phoneE164));
    expect(BUSINESS.phoneE164).toBe(`+${BUSINESS.whatsapp}`);
    expect(digits(BUSINESS.phone).slice(1)).toBe(digits(BUSINESS.whatsapp).slice(2));
  });

  it("a wa.me link built the way the components build it resolves to a usable URL", () => {
    const url = `https://wa.me/${BUSINESS.whatsapp}`;
    const m = url.match(/^https:\/\/wa\.me\/(\d{11})$/);
    expect(m, `wa.me URL is malformed: ${url}`).not.toBeNull();
  });
});

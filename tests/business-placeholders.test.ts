import { describe, expect, it } from "vitest";

import { BUSINESS, businessAddressLines } from "@/lib/business";

/**
 * ⛔ THIS TEST IS EXPECTED TO FAIL TODAY. That is the point.
 *
 * lib/business.ts is the single source of truth for the business details that appear in
 * the footer, the refund policy and the terms of service, and that Paystack's activation
 * review requires (address, email, phone). The structure is in place but the owner has not
 * supplied the real values yet, so they are `TODO-…` placeholders.
 *
 * Publishing invented contact details to a payment provider is how a merchant gets rejected
 * for risk and compliance (NoZar was, 2026-06-05). So this guard fails loudly and names
 * every missing field instead of letting placeholder text reach production.
 *
 * When the owner supplies the real details, this test turns green with no other change.
 */

const PLACEHOLDER_PREFIX = "TODO-";

/** Values from the previous footer that were placeholders, not real contact routes. */
const KNOWN_FAKE_LEGACY = ["060 000 0000", "wa.me/27721234567", "27721234567"];

type Finding = {
  /** Dotted path of the offending value, e.g. `BUSINESS.address.street`. */
  field: string;
  /** What is wrong with it. */
  problem: string;
  /** The current value, for the person who has to fix it. */
  value: string;
};

/** Walk the (nested) BUSINESS object and collect every value that is not publishable. */
function findPlaceholders(node: unknown, path: string[] = []): Finding[] {
  if (typeof node === "string") {
    const field = path.join(".");
    const findings: Finding[] = [];

    if (node.startsWith(PLACEHOLDER_PREFIX)) {
      findings.push({
        field,
        problem: "is a TODO- placeholder",
        value: node,
      });
    } else if (node.trim() === "") {
      findings.push({ field, problem: "is empty", value: node });
    } else if (
      KNOWN_FAKE_LEGACY.includes(node) ||
      /0{3}\s?-?\s?0{3}/.test(node)
    ) {
      findings.push({
        field,
        problem: "looks like an invented/legacy placeholder value",
        value: node,
      });
    }
    return findings;
  }

  if (node !== null && typeof node === "object") {
    return Object.entries(node).flatMap(([key, value]) =>
      findPlaceholders(value, [...path, key]),
    );
  }

  return [];
}

/** Format rules that only make sense once a real value is in place. */
function findMalformed(): Finding[] {
  const findings: Finding[] = [];

  if (
    !BUSINESS.phoneE164.startsWith(PLACEHOLDER_PREFIX) &&
    !/^\+\d{10,15}$/.test(BUSINESS.phoneE164)
  ) {
    findings.push({
      field: "BUSINESS.phoneE164",
      problem: "must be E.164, e.g. +27821234567",
      value: BUSINESS.phoneE164,
    });
  }

  if (
    !BUSINESS.whatsapp.startsWith(PLACEHOLDER_PREFIX) &&
    !/^\d{10,15}$/.test(BUSINESS.whatsapp)
  ) {
    findings.push({
      field: "BUSINESS.whatsapp",
      problem: "must be digits only with country code, e.g. 27821234567",
      value: BUSINESS.whatsapp,
    });
  }

  if (
    !BUSINESS.phone.startsWith(PLACEHOLDER_PREFIX) &&
    !/\d{3}/.test(BUSINESS.phone)
  ) {
    findings.push({
      field: "BUSINESS.phone",
      problem: "must be a dialable public number",
      value: BUSINESS.phone,
    });
  }

  for (const [index, line] of businessAddressLines().entries()) {
    // `address.*` above already reports TODO- placeholders, so only flag a line here when
    // it is independently suspicious (an invented number that leaked into the footer).
    if (KNOWN_FAKE_LEGACY.includes(line) || /0{3}\s?-?\s?0{3}/.test(line)) {
      findings.push({
        field: `businessAddressLines()[${index}]`,
        problem: "address line is still a placeholder",
        value: line,
      });
    }
  }

  return findings;
}

const formatFindings = (findings: Finding[]): string =>
  [
    "",
    "  ⛔ BUSINESS DETAILS ARE STILL PLACEHOLDERS — the site cannot be deployed like this.",
    "",
    "  lib/business.ts is imported by the footer, the refund policy and the terms of service,",
    "  and Paystack's activation review requires a real address, email and phone.",
    "",
    `  ${findings.length} value(s) must be replaced with the real registered details:`,
    ...findings.map(
      (f) => `    • ${f.field} — ${f.problem} (currently: ${JSON.stringify(f.value)})`,
    ),
    "",
    "  Owner action: supply the public phone number, the WhatsApp number, and the street",
    "  address (street, suburb, city, postal code). Then update BUSINESS in lib/business.ts.",
    "",
  ].join("\n");

describe("lib/business.ts — publishable business details", () => {
  it("publishes the real trading name, entity and mailbox", () => {
    // These are known-good today; keeping them asserted stops a future edit from
    // quietly regressing them into placeholders alongside the rest.
    expect(BUSINESS.name).toBe("KitFix");
    expect(BUSINESS.legalName).toBe("KitFix (Pty) Ltd");
    expect(BUSINESS.registration).toMatch(/^\d{4}\/\d{6}\/\d{2}$/);
    expect(BUSINESS.email).toBe("info@mykitfix.co.za");
    expect(BUSINESS.policiesEffective).not.toMatch(/TODO-/);
  });

  it("contains no placeholder or invented contact details", () => {
    const findings = [...findPlaceholders(BUSINESS), ...findMalformed()];

    // One aggregated failure, so the owner sees every missing field in a single run
    // rather than fixing them one red test at a time.
    expect(findings, formatFindings(findings)).toEqual([]);
  });
});

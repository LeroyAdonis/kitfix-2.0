import { cn, formatCurrency, formatDateSAST } from "../utils";

// ---------------------------------------------------------------------------
// cn() — Tailwind class merging
// ---------------------------------------------------------------------------

describe("cn()", () => {
  it("merges multiple class strings", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes (falsy values)", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles undefined and null inputs", () => {
    expect(cn("base", undefined, null, "extra")).toBe("base extra");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    // p-4 should be overridden by p-2
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("resolves partial Tailwind conflicts", () => {
    // px-4 should be overridden by px-2, py-1 kept
    expect(cn("px-4 py-1", "px-2")).toBe("py-1 px-2");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles array inputs via clsx", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("handles object inputs via clsx", () => {
    expect(cn({ hidden: true, visible: false })).toBe("hidden");
  });
});

// ---------------------------------------------------------------------------
// formatCurrency() — ZAR formatting from cents
// ---------------------------------------------------------------------------

describe("formatCurrency()", () => {
  // Intl.NumberFormat uses non-breaking space (U+00A0) between currency symbol
  // and value. We use \u00a0 in expected strings to match exactly.

  it("formats 0 cents as R\u00a00,00", () => {
    expect(formatCurrency(0)).toBe("R\u00a00,00");
  });

  it("formats 100 cents as R\u00a01,00", () => {
    expect(formatCurrency(100)).toBe("R\u00a01,00");
  });

  it("formats 15050 cents as R\u00a0150,50", () => {
    expect(formatCurrency(15050)).toBe("R\u00a0150,50");
  });

  it("formats negative values with minus sign", () => {
    expect(formatCurrency(-500)).toBe("-R\u00a05,00");
  });

  it("formats 1 cent as R\u00a00,01", () => {
    expect(formatCurrency(1)).toBe("R\u00a00,01");
  });

  it("formats 99 cents as R\u00a00,99", () => {
    expect(formatCurrency(99)).toBe("R\u00a00,99");
  });

  it("formats large amounts with thousands separator", () => {
    const result = formatCurrency(1_000_000);
    // en-ZA uses non-breaking space for thousands separator
    expect(result).toMatch(/R\u00a010[\s\u00a0]000,00/);
  });

  it("always starts with R currency symbol", () => {
    expect(formatCurrency(42)).toMatch(/^-?R/);
  });
});

// ---------------------------------------------------------------------------
// formatDateSAST() — Africa/Johannesburg timezone
// ---------------------------------------------------------------------------

describe("formatDateSAST()", () => {
  it("formats a UTC date to SAST (UTC+2)", () => {
    // 10:30 UTC → 12:30 SAST
    const date = new Date("2024-01-15T10:30:00Z");
    const result = formatDateSAST(date);
    expect(result).toBe("15 Jan 2024, 12:30");
  });

  it("handles day boundary crossing (UTC evening → SAST next day)", () => {
    // 22:30 UTC → 00:30 SAST next day
    const date = new Date("2024-06-30T22:30:00Z");
    const result = formatDateSAST(date);
    expect(result).toBe("01 Jul 2024, 00:30");
  });

  it("does not change for DST (South Africa has no DST)", () => {
    // Winter date: offset should still be +2
    const winter = new Date("2024-07-15T08:00:00Z");
    const winterResult = formatDateSAST(winter);
    expect(winterResult).toContain("10:00"); // 08:00 UTC + 2 = 10:00

    // Summer date: offset should still be +2
    const summer = new Date("2024-01-15T08:00:00Z");
    const summerResult = formatDateSAST(summer);
    expect(summerResult).toContain("10:00"); // 08:00 UTC + 2 = 10:00
  });

  it("produces a non-empty string for any valid Date", () => {
    const date = new Date();
    const result = formatDateSAST(date);
    expect(result.length).toBeGreaterThan(0);
  });
});

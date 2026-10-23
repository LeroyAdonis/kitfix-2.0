/**
 * Single source of truth for KitFix's public business details.
 *
 * Every value here appears on the website footer, the refund policy and the terms of service, and
 * Paystack's activation review (email of 2026-10-06, ticket 1416876) requires business contact
 * details — address, email and phone — to be published and reachable. The previous footer shipped
 * `060 000 0000` and `wa.me/27721234567`, which are PLACEHOLDERS, and no street address at all.
 *
 * ⛔ RULE: never publish an invented value here. Publishing invented contact details to a payment
 * provider is exactly what gets a merchant rejected for "risk and compliance" (NoZar was,
 * 2026-06-05). If a value is unknown, leave it as a `TODO-` placeholder — `tests/business-placeholders.test.ts`
 * fails loudly and names every missing field rather than letting placeholder text reach production.
 *
 * Values below were supplied by the owner on 2026-10-22 (DIG-21): public phone 0763322026, WhatsApp
 * the same number, and the registered address 66 Catherine Road, Fontainebleau, Gauteng, 2032 —
 * transcribed verbatim from what the owner typed, with no inferred street, suburb or city.
 */

export const BUSINESS = {
  /** Trading name used everywhere on the site. */
  name: "KitFix",
  /** Registered entity — must match the CIPC certificate. */
  legalName: "KitFix (Pty) Ltd",
  /** CIPC registration number. KitFix is NOT VAT-registered, so no VAT number is published. */
  registration: "2025/325036/07",

  /** Real, monitored mailbox. */
  email: "info@mykitfix.co.za",

  /** Public business phone number, as supplied by the owner (DIG-21). */
  phone: "076 332 2026",
  /** Same number in E.164 for the tel: link. */
  phoneE164: "+27763322026",
  /**
   * WhatsApp number in international format without + or spaces — owner confirmed same as phone.
   *
   * Was "2763322026" (10 digits) until 2026-10-23: the leading 0 was stripped from 0763322026 and a
   * 27 prefixed, but the 7 of the mobile prefix was lost, so every wa.me link opened a chat request
   * for a number that does not exist and WhatsApp answered "not a valid phone number".
   * Derivation that is actually correct: 0**76**3322026 -> drop 0 -> 763322026 -> prefix 27 -> 27763322026.
   * `tests/business-phone-validity.test.ts` now asserts the structure so this cannot recur.
   */
  whatsapp: "27763322026",

  /**
   * The business address Paystack will see. Street, suburb, city, postal code.
   *
   * City confirmed as **Randburg** by the owner on 2026-10-23 after this file first carried
   * "Gauteng" (the province repeated in the city field, which Paystack's activation form would
   * reject). Street and suburb are unchanged and literal.
   */
  address: {
    street: "66 Catherine Road",
    suburb: "Fontainebleau",
    city: "Randburg",
    postalCode: "2032",
    country: "South Africa",
  },

  /** Shown as the "last updated" date on the policy pages. */
  policiesEffective: "22 October 2026",
} as const;

export const businessAddressLines = (): string[] => [
  BUSINESS.address.street,
  BUSINESS.address.suburb,
  `${BUSINESS.address.city}, ${BUSINESS.address.postalCode}`,
  BUSINESS.address.country,
];

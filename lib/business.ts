/**
 * Single source of truth for KitFix's public business details.
 *
 * Every value here appears on the website footer, the refund policy and the terms of service, and
 * Paystack's activation review (email of 2026-10-06, ticket 1416876) requires business contact
 * details — address, email and phone — to be published and reachable. The previous footer shipped
 * `060 000 0000` and `wa.me/27721234567`, which are PLACEHOLDERS, and no street address at all.
 *
 * ⛔ DEPLOY BLOCKER: the values marked TODO must be replaced with the real registered details before
 * this site is pushed. Publishing invented contact details to a payment provider is exactly what
 * gets a merchant rejected for "risk and compliance" (NoZar was, 2026-06-05). Do not guess.
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

  /** TODO-BLOCKING: the public business phone number. */
  phone: "TODO-PHONE",
  /** TODO-BLOCKING: same number in E.164 for the tel: link, e.g. +27821234567 */
  phoneE164: "TODO-PHONE-E164",
  /** TODO-BLOCKING: WhatsApp number in international format without + or spaces, e.g. 27821234567 */
  whatsapp: "TODO-WHATSAPP",

  /** TODO-BLOCKING: the business address Paystack will see. Street, suburb, city, postal code. */
  address: {
    street: "TODO-STREET",
    suburb: "TODO-SUBURB",
    city: "TODO-CITY",
    postalCode: "TODO-POSTAL",
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

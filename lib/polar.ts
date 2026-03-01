import { Polar } from "@polar-sh/sdk";

/**
 * Polar.sh SDK client for payment processing.
 *
 * Required env vars:
 *  - POLAR_ACCESS_TOKEN  — API access token from Polar dashboard
 *  - POLAR_WEBHOOK_SECRET — Webhook signing secret for signature verification
 *  - POLAR_PRODUCT_ID    — Product ID for the "Jersey Repair" product
 */
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
});

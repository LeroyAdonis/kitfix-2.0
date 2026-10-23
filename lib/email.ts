/**
 * Transactional email — the one place KitFix talks to a customer.
 *
 * Provider: Zoho Mail SMTP for info@mykitfix.co.za (the domain's real MX records already live on
 * Zoho, verified 2026-10-23). Credentials are host credentials and live in env only — never in code:
 *
 *   SMTP_HOST  (default smtp.zoho.com)
 *   SMTP_PORT  (default 465, implicit TLS)
 *   SMTP_USER  info@mykitfix.co.za
 *   SMTP_PASS  app/host password
 *   MAIL_FROM  optional display override, e.g. "KitFix <info@mykitfix.co.za>"
 *
 * RULES
 * 1. **Email must never break a booking.** If SMTP is unconfigured or fails, the caller's job still
 *    succeeds — we log and return `{sent:false, reason}` instead of throwing. A customer losing their
 *    repair because a mail server hiccuped is worse than a missing acknowledgement.
 * 2. **No invented content.** Every value comes from BUSINESS (lib/business.ts), which is the single
 *    source of truth for the phone, address and legal name. Templates carry no testimonials, no
 *    metrics, no promises we cannot keep.
 * 3. **Plain text is a first-class part**, not an afterthought — it is what survives spam filters and
 *    what a customer on a thin data connection actually reads.
 */
import nodemailer, { type Transporter } from "nodemailer";
import { BUSINESS, businessAddressLines } from "@/lib/business";

let cached: Transporter | null = null;

export const mailConfigured = (): boolean =>
  Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

function transport(): Transporter {
  if (cached) return cached;
  if (!mailConfigured()) {
    throw new Error("SMTP not configured: set SMTP_USER and SMTP_PASS");
  }
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.zoho.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER as string, pass: process.env.SMTP_PASS as string },
  });
  return cached;
}

const FROM = () => process.env.MAIL_FROM || `${BUSINESS.name} <${process.env.SMTP_USER}>`;

export type MailResult = { sent: boolean; id?: string; reason?: string };

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<MailResult> {
  if (!mailConfigured()) return { sent: false, reason: "SMTP not configured" };
  if (!opts.to || !opts.to.includes("@")) return { sent: false, reason: "invalid recipient" };
  try {
    const info = await transport().sendMail({
      from: FROM(),
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      replyTo: opts.replyTo || process.env.SMTP_USER,
    });
    return { sent: true, id: info.messageId };
  } catch (err) {
    // Log, never throw: the booking must survive a mail failure.
    console.error("[email] send failed", {
      to: opts.to,
      subject: opts.subject,
      error: err instanceof Error ? err.message : String(err),
    });
    return { sent: false, reason: err instanceof Error ? err.message : "send failed" };
  }
}

/** Shared footer — the legal identity Paystack and the CPA both expect on business mail. */
const signature = (): string =>
  [
    "",
    "—",
    `${BUSINESS.name} (${BUSINESS.legalName})`,
    `Reg ${BUSINESS.registration}`,
    ...businessAddressLines(),
    `Phone / WhatsApp: ${BUSINESS.phone}`,
    `Email: ${BUSINESS.email}`,
  ].join("\n");

/** Acknowledgement for a repair request that just came in. */
export function bookingReceived(opts: { name: string; reference: string; description: string }) {
  const subject = `We have your repair request (${opts.reference})`;
  const text = [
    `Hi ${opts.name},`,
    "",
    "Thanks — your repair request is in. Here is what we have from you:",
    "",
    `  Reference: ${opts.reference}`,
    `  Damage:    ${opts.description}`,
    "",
    "What happens next: we look at the photos and send you a firm quote. Nothing is charged until you",
    "approve that quote. Quotes are usually out within one working day.",
    "",
    `Any questions, reply to this email or WhatsApp us on ${BUSINESS.phone}.`,
    signature(),
  ].join("\n");
  return { subject, text };
}

/** A confirmed quote — the point at which the customer can pay. */
export function quoteConfirmed(opts: {
  name: string;
  reference: string;
  amountRands: number;
  payUrl?: string;
}) {
  const amount = `R${opts.amountRands.toFixed(2)}`;
  const subject = `Your KitFix quote: ${amount} (${opts.reference})`;
  const text = [
    `Hi ${opts.name},`,
    "",
    `Your quote for repair ${opts.reference} is ${amount}.`,
    "",
    opts.payUrl
      ? `Pay securely here: ${opts.payUrl}`
      : "Open your job in the portal to pay.",
    "",
    "The quote covers the repair as described. If the damage turns out to be worse than the photos",
    "show, we contact you before doing anything extra — you are never billed for work you did not",
    "approve.",
    "",
    "Our cancellation and refund terms are here: https://mykitfix.co.za/refund-policy",
    "",
    `Questions? Reply to this email or WhatsApp ${BUSINESS.phone}.`,
    signature(),
  ].join("\n");
  return { subject, text };
}

/** Ready for collection. */
export function repairReady(opts: { name: string; reference: string }) {
  const subject = `Your repair is ready (${opts.reference})`;
  const text = [
    `Hi ${opts.name},`,
    "",
    `Good news — repair ${opts.reference} is finished and ready.`,
    "",
    `Get in touch on ${BUSINESS.phone} (WhatsApp works) to arrange collection or delivery.`,
    signature(),
  ].join("\n");
  return { subject, text };
}

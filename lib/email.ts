/**
 * Email notification service for KitFix 2.0.
 *
 * Uses Resend (https://resend.com) as the transactional email provider.
 * All send functions are fire-and-forget: they log errors but never throw,
 * so email failures don't block the main application flow.
 *
 * Required env vars (optional — emails are silently skipped if missing):
 *  - RESEND_API_KEY       — API key from Resend dashboard
 *  - RESEND_FROM_EMAIL    — Sender address (default: KitFix <noreply@kitfix.co.za>)
 */

import { Resend } from "resend";

import {
  estimateReadyTemplate,
  formatZAR,
  paymentConfirmationTemplate,
  reviewRequestTemplate,
  statusUpdateTemplate,
} from "@/lib/email-templates";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const apiKey = process.env.RESEND_API_KEY;

const resend = apiKey ? new Resend(apiKey) : null;

const DEFAULT_FROM = "KitFix <noreply@kitfix.co.za>";

function getFrom(): string {
  return process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM;
}

// ---------------------------------------------------------------------------
// Internal send helper
// ---------------------------------------------------------------------------

interface SendOptions {
  to: string;
  subject: string;
  html: string;
}

async function send({ to, subject, html }: SendOptions): Promise<boolean> {
  if (!resend) {
    logger.warn("Email skipped — RESEND_API_KEY not configured", {
      to,
      subject,
    });
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getFrom(),
      to: [to],
      subject,
      html,
    });

    if (error) {
      logger.error("Resend API returned an error", {
        to,
        subject,
        error: error.message,
      });
      return false;
    }

    logger.info("Email sent", { to, subject, id: data?.id });
    return true;
  } catch (err) {
    logger.error("Failed to send email", {
      to,
      subject,
      error: err instanceof Error ? err : new Error(String(err)),
    });
    return false;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Notify a customer that their repair status has changed.
 */
export async function sendStatusUpdateEmail(
  to: string,
  customerName: string,
  repairId: string,
  newStatus: string,
): Promise<boolean> {
  return send({
    to,
    subject: `Repair #${repairId} — Status Update: ${newStatus}`,
    html: statusUpdateTemplate(customerName, repairId, newStatus),
  });
}

/**
 * Confirm payment receipt.
 */
export async function sendPaymentConfirmationEmail(
  to: string,
  customerName: string,
  repairId: string,
  amount: number,
): Promise<boolean> {
  return send({
    to,
    subject: `Repair #${repairId} — Payment Confirmed`,
    html: paymentConfirmationTemplate(customerName, repairId, amount),
  });
}

/**
 * Let the customer know their repair estimate is ready.
 */
export async function sendEstimateReadyEmail(
  to: string,
  customerName: string,
  repairId: string,
  repairCost: number,
  pickupFee: number,
  deliveryFee: number,
  totalCost: number,
  depositAmount: number,
  pickupRequired: boolean,
  adminNotes?: string,
): Promise<boolean> {
  return send({
    to,
    subject: `Your KitFix Repair Quote is Ready — ${formatZAR(totalCost)}`,
    html: estimateReadyTemplate(
      customerName,
      repairId,
      repairCost,
      pickupFee,
      deliveryFee,
      totalCost,
      depositAmount,
      pickupRequired,
      adminNotes,
    ),
  });
}

/**
 * Ask the customer to review their completed repair.
 */
export async function sendReviewRequestEmail(
  to: string,
  customerName: string,
  repairId: string,
): Promise<boolean> {
  return send({
    to,
    subject: `Repair #${repairId} — How Was Your Experience?`,
    html: reviewRequestTemplate(customerName, repairId),
  });
}

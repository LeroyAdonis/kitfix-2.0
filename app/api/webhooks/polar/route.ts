import { NextRequest, NextResponse } from "next/server";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import {
  getPaymentByCheckoutId,
  updatePaymentStatus,
} from "@/lib/db/queries/payments";
import { updateRepairStatus } from "@/lib/db/queries/repairs";
import { createNotification } from "@/lib/db/queries/notifications";
import { logger } from "@/lib/logger";

/**
 * Polar.sh webhook handler.
 *
 * Verifies the webhook signature using the Standard Webhooks spec,
 * then processes checkout events to update payment and repair status.
 *
 * Required env var: POLAR_WEBHOOK_SECRET
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("POLAR_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  let event: WebhookEvent;

  try {
    const body = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    event = validateEvent(body, headers, webhookSecret) as WebhookEvent;
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      logger.error("Signature verification failed", { message: error.message });
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 403 },
      );
    }
    logger.error("Failed to parse webhook", { error });
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 },
    );
  }

  try {
    await handleWebhookEvent(event);
  } catch (error) {
    logger.error("Error processing event", { error });
    // Return 200 to prevent Polar from retrying — we log the error for investigation
    return NextResponse.json({ received: true, error: "Processing failed" });
  }

  return NextResponse.json({ received: true });
}

// ---------------------------------------------------------------------------
// Event handler
// ---------------------------------------------------------------------------

interface CheckoutEventData {
  id: string;
  status: string;
  order_id?: string;
  metadata?: Record<string, string>;
}

interface WebhookEvent {
  type: string;
  data: CheckoutEventData;
}

async function handleWebhookEvent(event: WebhookEvent): Promise<void> {
  switch (event.type) {
    case "checkout.updated":
      await handleCheckoutUpdated(event.data);
      break;

    case "checkout.created":
      // No action needed — checkout is tracked via our initiateCheckout action
      break;

    default:
      // Gracefully ignore unhandled event types
      break;
  }
}

/**
 * Handle checkout.updated events from Polar.
 *
 * When a checkout reaches 'succeeded' status:
 *  1. Mark the payment as completed
 *  2. Transition the repair to 'in_repair' status
 *  3. Notify the customer
 */
async function handleCheckoutUpdated(data: CheckoutEventData): Promise<void> {
  if (data.status !== "succeeded") {
    // Only process successful checkouts — other statuses are informational
    return;
  }

  const polarCheckoutId = data.id;

  // 1. Find the payment record we created during checkout initiation
  const payment = await getPaymentByCheckoutId(polarCheckoutId);
  if (!payment) {
    logger.error("No payment found for checkout", { polarCheckoutId });
    return;
  }

  // Idempotency: skip if already completed
  if (payment.status === "completed") {
    return;
  }

  // 2. Update payment status to completed
  const existingMeta =
    typeof payment.metadata === "object" && payment.metadata !== null
      ? (payment.metadata as Record<string, unknown>)
      : {};

  await updatePaymentStatus(payment.id, "completed", {
    polarOrderId: data.order_id ?? undefined,
    paidAt: new Date(),
    metadata: {
      ...existingMeta,
      polarEvent: "checkout.updated",
      completedAt: new Date().toISOString(),
    },
  });

  // 3. Transition repair request to 'in_repair'
  await updateRepairStatus(
    payment.repairRequestId,
    "in_repair",
    payment.customerId, // changedBy — system action on behalf of customer
    "Payment confirmed via Polar.sh — repair work can begin.",
  );

  // 4. Notify the customer
  await createNotification({
    userId: payment.customerId,
    type: "payment",
    title: "Payment Confirmed",
    message:
      "Your payment has been received. Your jersey repair is now in progress!",
    repairRequestId: payment.repairRequestId,
  });
}

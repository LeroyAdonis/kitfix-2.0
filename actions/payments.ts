"use server";

import { eq } from "drizzle-orm";

import { polar } from "@/lib/polar";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { getRepairById } from "@/lib/db/queries/repairs";
import { getPaymentsByRepair, createPayment } from "@/lib/db/queries/payments";
import { createNotification } from "@/lib/db/queries/notifications";
import type { ActionResult } from "@/types";

/**
 * Initiate a Polar.sh checkout session for a reviewed repair request.
 *
 * Pre-conditions:
 *  - User is authenticated (customer who owns the repair, or admin)
 *  - Repair status is 'reviewed' (admin has set the estimate)
 *  - Repair has an estimatedCost (set by admin during review)
 *  - No completed payment already exists for this repair
 */
export async function initiateCheckout(
  repairRequestId: string,
): Promise<ActionResult<{ checkoutUrl: string }>> {
  try {
    // 1. Authenticate
    const session = await requireAuth();
    const userId = session.user.id;
    const userRole = session.user.role;

    // 2. Fetch the repair request
    const repair = await getRepairById(repairRequestId);
    if (!repair) {
      return { success: false, error: "Repair request not found." };
    }

    // 3. Validate ownership (customer who owns it, or admin)
    if (userRole !== "admin" && repair.customerId !== userId) {
      return { success: false, error: "You do not have access to this repair request." };
    }

    // 4. Validate repair status — must be 'reviewed' to accept payment
    if (repair.currentStatus !== "reviewed") {
      return {
        success: false,
        error: "This repair must be reviewed by an admin before payment can be made.",
      };
    }

    // 5. Validate estimated cost is set
    if (!repair.estimatedCost || repair.estimatedCost <= 0) {
      return {
        success: false,
        error: "No cost estimate has been set for this repair yet.",
      };
    }

    // 6. Check for existing completed payment (prevent double payment)
    const existingPayments = await getPaymentsByRepair(repairRequestId);
    const completedPayment = existingPayments.find((p) => p.status === "completed");
    if (completedPayment) {
      return { success: false, error: "This repair has already been paid for." };
    }

    // 7. Create Polar checkout session
    const productId = process.env.POLAR_PRODUCT_ID;
    if (!productId) {
      // eslint-disable-next-line no-console -- no logger module yet
      console.error("[payments] POLAR_PRODUCT_ID env var is not configured");
      return { success: false, error: "Payment system is not configured. Please contact support." };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${appUrl}/repairs/${repairRequestId}?payment=success`,
      metadata: {
        repairRequestId,
        customerId: userId,
      },
    });

    // 8. Create pending payment record in our database
    await createPayment({
      repairRequestId,
      customerId: userId,
      polarCheckoutId: checkout.id,
      amount: repair.estimatedCost,
      currency: "usd",
      status: "pending",
      metadata: {
        repairRequestId,
        customerId: userId,
        polarCheckoutUrl: checkout.url,
      },
    });

    // 9. Notify admin(s) about the initiated payment (non-blocking)
    try {
      const admins = await db.select({ id: user.id }).from(user).where(eq(user.role, "admin"));
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: "payment",
          title: "Payment Initiated",
          message: `A customer has initiated payment for repair #${repairRequestId.slice(0, 8)}.`,
          repairRequestId,
        });
      }
    } catch {
      // Notification failure should not block payment initiation
    }

    return {
      success: true,
      data: { checkoutUrl: checkout.url },
    };
  } catch (error) {
    // eslint-disable-next-line no-console -- no logger module yet
    console.error("[payments] Failed to initiate checkout:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating the checkout session.",
    };
  }
}

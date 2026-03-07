"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { repairRequests } from "@/lib/db/schema";
import { getSession } from "@/lib/auth-utils";
import { getRepairById, updateRepairStatus } from "@/lib/db/queries/repairs";
import { createNotification } from "@/lib/db/queries/notifications";
import { sendEstimateReadyEmail } from "@/lib/email";
import { getPickupFee, getDeliveryFee } from "@/lib/config/pricing";
import { sendQuoteSchema, acceptQuoteSchema, declineQuoteSchema, pickupAddressSchema } from "@/lib/validators/repair";
import type { z } from "zod";
import { eq } from "drizzle-orm";
import type { ActionResult } from "@/types";

export async function sendQuoteAction(
  repairId: string,
  estimatedCost: number,
  adminNotes?: string,
  pickupRequired?: boolean,
): Promise<ActionResult<{ repairRequestId: string }>> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Only admin users can send quotes." };
  }

  const parsed = sendQuoteSchema.safeParse({
    repairId,
    estimatedCost,
    adminNotes,
    pickupRequired,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const repair = await getRepairById(repairId);
  if (!repair) {
    return { success: false, error: "Repair request not found." };
  }
  if (repair.currentStatus !== "reviewed") {
    return { success: false, error: "Repair must be in reviewed status to send a quote." };
  }

  // Determine pickup requirement: admin override or auto-detect from AI
  const aiAssessed = repair.aiDamageAssessment !== null;
  const needsPickup = pickupRequired ?? !aiAssessed;

  // Calculate fees based on customer's shipping address
  const address = repair.shippingAddress as { province?: string; city?: string } | null;
  const pickupFeeAmount = needsPickup
    ? getPickupFee(address?.province, address?.city)
    : 0;
  const deliveryFeeAmount = getDeliveryFee(address?.province, address?.city);

  // Build quote breakdown
  const totalCost = estimatedCost + pickupFeeAmount + deliveryFeeAmount;
  const depositAmount = Math.ceil(totalCost / 2);

  // Update repair with estimate + fees
  await db.update(repairRequests).set({
    estimatedCost,
    pickupRequired: needsPickup,
    pickupFee: pickupFeeAmount,
    deliveryFee: deliveryFeeAmount,
    adminNotes: adminNotes ?? repair.adminNotes,
    quoteDeclineReason: null,
  }).where(eq(repairRequests.id, repairId));

  // Transition status
  await updateRepairStatus(
    repairId,
    "quote_sent",
    session.user.id,
    needsPickup
      ? `Quote sent: R${(estimatedCost / 100).toFixed(2)} + R${(pickupFeeAmount / 100).toFixed(2)} pickup + R${(deliveryFeeAmount / 100).toFixed(2)} delivery = R${(totalCost / 100).toFixed(2)}`
      : `Quote sent: R${(estimatedCost / 100).toFixed(2)} + R${(deliveryFeeAmount / 100).toFixed(2)} delivery = R${(totalCost / 100).toFixed(2)}`,
  );

  // Notify customer (in-app)
  if (repair.customer) {
    const message = needsPickup
      ? `Your repair quote is R${(totalCost / 100).toFixed(2)} (includes R${(pickupFeeAmount / 100).toFixed(2)} pickup fee for physical inspection). A 50% deposit of R${(depositAmount / 100).toFixed(2)} is required to proceed.`
      : `Your repair quote is R${(totalCost / 100).toFixed(2)}. A 50% deposit of R${(depositAmount / 100).toFixed(2)} is required to proceed.`;

    await createNotification({
      userId: repair.customer.id,
      type: "status_update",
      title: "Your repair quote is ready",
      message,
      repairRequestId: repairId,
      isRead: false,
    });

    // Email
    if (repair.customer.email) {
      await sendEstimateReadyEmail(
        repair.customer.email,
        repair.customer.name ?? "Customer",
        repairId,
        estimatedCost,
        pickupFeeAmount,
        deliveryFeeAmount,
        totalCost,
        depositAmount,
        needsPickup,
        adminNotes,
      );
    }
  }

  revalidatePath(`/admin/requests/${repairId}`);
  revalidatePath("/admin/requests");

  return { success: true, data: { repairRequestId: repairId } };
}

export async function acceptQuoteAction(
  repairId: string,
  pickupAddress?: z.infer<typeof pickupAddressSchema>,
): Promise<ActionResult<{ repairRequestId: string; totalCost: number; depositAmount: number }>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  const parsed = acceptQuoteSchema.safeParse({ repairId, pickupAddress });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const repair = await getRepairById(repairId);
  if (!repair) {
    return { success: false, error: "Repair request not found." };
  }
  if (repair.customerId !== session.user.id && session.user.role !== "admin") {
    return { success: false, error: "You don't have permission to accept this quote." };
  }
  if (repair.currentStatus !== "quote_sent") {
    return { success: false, error: "This repair does not have a pending quote." };
  }

  // Validate pickup address is provided when required
  if (repair.pickupRequired && !pickupAddress) {
    return {
      success: false,
      error: "A pickup address is required for this repair. Please provide your address so we can arrange courier collection.",
    };
  }

  // Store pickup address if provided (overrides shipping address)
  if (pickupAddress) {
    await db.update(repairRequests).set({
      shippingAddress: pickupAddress,
    }).where(eq(repairRequests.id, repairId));
  }

  // Calculate totals
  const totalCost =
    (repair.estimatedCost ?? 0) +
    (repair.pickupFee ?? 0) +
    (repair.deliveryFee ?? 0);
  const depositAmount = Math.ceil(totalCost / 2);

  await updateRepairStatus(repairId, "quote_accepted", session.user.id, "Customer accepted the quote");

  // Notify customer with deposit info
  await createNotification({
    userId: repair.customerId,
    type: "status_update",
    title: "Quote accepted",
    message: `You accepted the quote of R${(totalCost / 100).toFixed(2)} for repair #${repairId.slice(0, 8)}. Please pay the 50% deposit of R${(depositAmount / 100).toFixed(2)} to begin your repair.`,
    repairRequestId: repairId,
    isRead: false,
  });

  revalidatePath(`/repairs/${repairId}`);
  revalidatePath("/repairs");

  return { success: true, data: { repairRequestId: repairId, totalCost, depositAmount } };
}

export async function declineQuoteAction(
  repairId: string,
  reason: string,
): Promise<ActionResult<{ repairRequestId: string }>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  const parsed = declineQuoteSchema.safeParse({ repairId, reason });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const repair = await getRepairById(repairId);
  if (!repair) {
    return { success: false, error: "Repair request not found." };
  }
  if (repair.customerId !== session.user.id && session.user.role !== "admin") {
    return { success: false, error: "You don't have permission to decline this quote." };
  }
  if (repair.currentStatus !== "quote_sent") {
    return { success: false, error: "This repair does not have a pending quote." };
  }

  // Store decline reason
  await db.update(repairRequests).set({
    quoteDeclineReason: reason,
  }).where(eq(repairRequests.id, repairId));

  // Move back to reviewed
  await updateRepairStatus(repairId, "reviewed", session.user.id, `Customer requested re-quote: ${reason}`);

  // Notify admin
  await createNotification({
    userId: repair.customerId,
    type: "status_update",
    title: "Re-quote requested",
    message: `You requested a re-quote for repair #${repairId.slice(0, 8)}: "${reason}"`,
    repairRequestId: repairId,
    isRead: false,
  });

  revalidatePath(`/repairs/${repairId}`);
  revalidatePath("/repairs");

  return { success: true, data: { repairRequestId: repairId } };
}

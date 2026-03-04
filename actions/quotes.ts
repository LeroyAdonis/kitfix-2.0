"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { repairRequests } from "@/lib/db/schema";
import { getSession } from "@/lib/auth-utils";
import { getRepairById, updateRepairStatus } from "@/lib/db/queries/repairs";
import { createNotification } from "@/lib/db/queries/notifications";
import { sendEstimateReadyEmail } from "@/lib/email";
import { sendQuoteSchema, acceptQuoteSchema, declineQuoteSchema } from "@/lib/validators/repair";
import { eq } from "drizzle-orm";
import type { ActionResult } from "@/types";

export async function sendQuoteAction(
  repairId: string,
  estimatedCost: number,
  adminNotes?: string,
): Promise<ActionResult<{ repairRequestId: string }>> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Only admin users can send quotes." };
  }

  const parsed = sendQuoteSchema.safeParse({ repairId, estimatedCost, adminNotes });
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

  // Update estimate + notes on repair
  await db.update(repairRequests).set({
    estimatedCost,
    adminNotes: adminNotes ?? repair.adminNotes,
    quoteDeclineReason: null, // Clear any previous decline reason
  }).where(eq(repairRequests.id, repairId));

  // Transition status
  await updateRepairStatus(repairId, "quote_sent", session.user.id, `Quote sent: R${estimatedCost}`);

  // Notify customer (in-app)
  if (repair.customer) {
    await createNotification({
      userId: repair.customer.id,
      type: "status_update",
      title: "Your repair quote is ready",
      message: `We've quoted R${estimatedCost} for your jersey repair. Please review and accept or request a re-quote.`,
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
      );
    }
  }

  revalidatePath(`/admin/requests/${repairId}`);
  revalidatePath("/admin/requests");

  return { success: true, data: { repairRequestId: repairId } };
}

export async function acceptQuoteAction(
  repairId: string,
): Promise<ActionResult<{ repairRequestId: string }>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  const parsed = acceptQuoteSchema.safeParse({ repairId });
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

  await updateRepairStatus(repairId, "quote_accepted", session.user.id, "Customer accepted the quote");

  // Notify admin(s)
  await createNotification({
    userId: repair.customerId,
    type: "status_update",
    title: "Quote accepted",
    message: `You accepted the quote of R${repair.estimatedCost} for repair #${repairId.slice(0, 8)}.`,
    repairRequestId: repairId,
    isRead: false,
  });

  revalidatePath(`/repairs/${repairId}`);
  revalidatePath("/repairs");

  return { success: true, data: { repairRequestId: repairId } };
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

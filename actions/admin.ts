"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { getSession } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { repairRequests } from "@/lib/db/schema";
import { updateRepairStatus } from "@/lib/db/queries/repairs";
import { createNotification } from "@/lib/db/queries/notifications";
import type { ActionResult } from "@/types";
import type { RepairStatus } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function requireAdminSession() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin") return null;
  return session;
}

async function requireAdminOrTechSession() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "technician")
    return null;
  return session;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function assignTechnicianAction(
  repairRequestId: string,
  technicianId: string,
): Promise<ActionResult<{ repairRequestId: string }>> {
  const session = await requireAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db
      .update(repairRequests)
      .set({ technicianId })
      .where(eq(repairRequests.id, repairRequestId));

    await createNotification({
      userId: technicianId,
      type: "assignment",
      title: "New Repair Assigned",
      message: "A new repair request has been assigned to you.",
      repairRequestId,
    });

    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${repairRequestId}`);

    return { success: true, data: { repairRequestId } };
  } catch {
    return { success: false, error: "Failed to assign technician" };
  }
}

export async function updateRepairStatusAction(
  repairRequestId: string,
  newStatus: RepairStatus,
  notes?: string,
): Promise<ActionResult<{ repairRequestId: string }>> {
  const session = await requireAdminOrTechSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const updated = await updateRepairStatus(
      repairRequestId,
      newStatus,
      session.user.id,
      notes,
    );

    // Notify the customer about the status change
    await createNotification({
      userId: updated.customerId,
      type: "status_update",
      title: "Repair Status Updated",
      message: `Your repair status has been updated to: ${newStatus.replace(/_/g, " ")}`,
      repairRequestId,
    });

    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${repairRequestId}`);

    return { success: true, data: { repairRequestId } };
  } catch {
    return { success: false, error: "Failed to update repair status" };
  }
}

export async function updateEstimateAction(
  repairRequestId: string,
  estimatedCost: number,
): Promise<ActionResult<{ repairRequestId: string }>> {
  const session = await requireAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const [updated] = await db
      .update(repairRequests)
      .set({ estimatedCost })
      .where(eq(repairRequests.id, repairRequestId))
      .returning({ customerId: repairRequests.customerId });

    if (updated) {
      await createNotification({
        userId: updated.customerId,
        type: "payment",
        title: "Repair Estimate Ready",
        message: "Your repair estimate is ready. Please review and proceed with payment.",
        repairRequestId,
      });
    }

    revalidatePath(`/admin/requests/${repairRequestId}`);

    return { success: true, data: { repairRequestId } };
  } catch {
    return { success: false, error: "Failed to update estimate" };
  }
}

export async function addAdminNotesAction(
  repairRequestId: string,
  notes: string,
): Promise<ActionResult<{ repairRequestId: string }>> {
  const session = await requireAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db
      .update(repairRequests)
      .set({ adminNotes: notes })
      .where(eq(repairRequests.id, repairRequestId));

    revalidatePath(`/admin/requests/${repairRequestId}`);

    return { success: true, data: { repairRequestId } };
  } catch {
    return { success: false, error: "Failed to update admin notes" };
  }
}

export async function addTrackingNumberAction(
  repairRequestId: string,
  trackingNumber: string,
): Promise<ActionResult<{ repairRequestId: string }>> {
  const session = await requireAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const [updated] = await db
      .update(repairRequests)
      .set({ trackingNumber })
      .where(eq(repairRequests.id, repairRequestId))
      .returning({ customerId: repairRequests.customerId });

    if (updated) {
      await createNotification({
        userId: updated.customerId,
        type: "status_update",
        title: "Repair Shipped!",
        message: `Your repair has been shipped! Tracking number: ${trackingNumber}`,
        repairRequestId,
      });
    }

    revalidatePath(`/admin/requests/${repairRequestId}`);

    return { success: true, data: { repairRequestId } };
  } catch {
    return { success: false, error: "Failed to add tracking number" };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { authenticatedAdminAction, authenticatedRoleAction } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { repairRequests } from "@/lib/db/schema";
import { getRepairById, updateRepairStatus } from "@/lib/db/queries/repairs";
import { createNotification } from "@/lib/db/queries/notifications";
import { createClient } from "@/lib/courier/client";
import type { ActionResult } from "@/types";
import type { RepairStatus } from "@/types";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export const assignTechnicianAction = authenticatedAdminAction(async (
  session,
  repairRequestId: string,
  technicianId: string,
): Promise<ActionResult<{ repairRequestId: string }>> => {
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
});

export const updateRepairStatusAction = authenticatedRoleAction(
  ["admin", "technician"],
  async (
    session,
    repairRequestId: string,
    newStatus: RepairStatus,
    notes?: string,
  ): Promise<ActionResult<{ repairRequestId: string }>> => {
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
  },
);

export const updateEstimateAction = authenticatedAdminAction(async (
  session,
  repairRequestId: string,
  estimatedCost: number,
): Promise<ActionResult<{ repairRequestId: string }>> => {
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
});

export const addAdminNotesAction = authenticatedAdminAction(async (
  session,
  repairRequestId: string,
  notes: string,
): Promise<ActionResult<{ repairRequestId: string }>> => {
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
});

export const addTrackingNumberAction = authenticatedAdminAction(async (
  session,
  repairRequestId: string,
  trackingNumber: string,
): Promise<ActionResult<{ repairRequestId: string }>> => {
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
});

export const generateReturnLabelAction = authenticatedRoleAction(
  ["admin", "technician"],
  async (
    session,
    repairRequestId: string,
  ): Promise<ActionResult<{ labelUrl: string; tracking: string }>> => {
    try {
      const repair = await getRepairById(repairRequestId);
      if (!repair) return { success: false, error: "Repair not found" };
      if (repair.currentStatus !== "ready_for_shipment") {
        return { success: false, error: "Repair must be in 'Ready for Shipment' status." };
      }

      const shippingAddr = repair.shippingAddress as {
        street?: string; city?: string; province?: string; postalCode?: string;
      } | null;

      const client = createClient();
      const shipment = await client.createShipment({
        fromName: "KitFix Workshop",
        fromPhone: process.env.WORKSHOP_PHONE ?? "+27123456789",
        fromLockerId: repair.returnLockerId ?? undefined,
        fromPostalCode: process.env.WORKSHOP_POSTAL_CODE ?? "2000",
        toName: repair.customer?.name ?? "Customer",
        toPhone: "",
        toLockerId: repair.returnLockerId ?? undefined,
        toAddress: shippingAddr
          ? `${shippingAddr.street}, ${shippingAddr.city}, ${shippingAddr.province}`
          : undefined,
        toPostalCode: shippingAddr?.postalCode ?? "2000",
        mode: (repair.shippingMode as "L2L" | "D2D" | "D2L" | "L2D") ?? "L2L",
        weightKg: 0.5,
        dimensions: { height: 30, width: 20, length: 5 },
        description: `Repaired jersey — ${repair.jerseyDescription}`,
        reference: repair.id,
      });

      await db
        .update(repairRequests)
        .set({
          returnTracking: shipment.barcode,
          returnLabelUrl: shipment.labelUrl ?? null,
          trackingNumber: shipment.barcode,
        })
        .where(eq(repairRequests.id, repairRequestId));

      await updateRepairStatus(
        repairRequestId,
        "shipped",
        session.user.id,
        `Return label generated. Tracking: ${shipment.barcode}`,
      );

      await createNotification({
        userId: repair.customerId,
        type: "status_update",
        title: "Repair Shipped!",
        message: `Your repaired jersey is on its way back! Tracking: ${shipment.barcode}`,
        repairRequestId,
      });

      revalidatePath(`/admin/requests/${repairRequestId}`);

      return {
        success: true,
        data: { labelUrl: shipment.labelUrl ?? "", tracking: shipment.barcode },
      };
    } catch (error) {
      return { success: false, error: "Failed to generate return label" };
    }
  },
);

"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { getSession } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { repairRequests, user } from "@/lib/db/schema";
import { createRepair, getRepairById } from "@/lib/db/queries/repairs";
import { createNotification } from "@/lib/db/queries/notifications";
import { createRepairSchema } from "@/lib/validators/repair";
import type { ActionResult } from "@/types";
import type { RepairRequest } from "@/lib/db/schema";

export async function createRepairAction(
  formData: FormData,
): Promise<ActionResult<RepairRequest>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "You must be signed in to submit a repair request." };
  }

  const raw = {
    jerseyDescription: formData.get("jerseyDescription") as string,
    jerseyBrand: (formData.get("jerseyBrand") as string) || undefined,
    jerseySize: formData.get("jerseySize") as string,
    damageType: formData.get("damageType") as string,
    damageDescription: formData.get("damageDescription") as string,
    urgencyLevel: (formData.get("urgencyLevel") as string) || "standard",
    shippingAddress: {
      street: formData.get("street") as string,
      city: formData.get("city") as string,
      province: formData.get("province") as string,
      postalCode: formData.get("postalCode") as string,
      country: (formData.get("country") as string) || "South Africa",
    },
  };

  const result = createRepairSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return { success: false, error: "Validation failed.", fieldErrors };
  }

  const data = result.data;
  const repair = await createRepair({
    customerId: session.user.id,
    jerseyDescription: data.jerseyDescription,
    jerseyBrand: data.jerseyBrand ?? null,
    jerseySize: data.jerseySize,
    damageType: data.damageType,
    damageDescription: data.damageDescription,
    urgencyLevel: data.urgencyLevel,
    shippingAddress: data.shippingAddress,
  });

  // Notify all admin users about the new repair submission (non-blocking)
  try {
    const admins = await db.select({ id: user.id }).from(user).where(eq(user.role, "admin"));
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: "system",
        title: "New Repair Request",
        message: `New repair request from ${session.user.name}.`,
        repairRequestId: repair.id,
      });
    }
  } catch {
    // Notification failure should not block repair creation
  }

  revalidatePath("/repairs");
  revalidatePath("/dashboard");
  return { success: true, data: repair };
}

export async function cancelRepairAction(
  repairRequestId: string,
): Promise<ActionResult<null>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  const repair = await getRepairById(repairRequestId);
  if (!repair) {
    return { success: false, error: "Repair request not found." };
  }
  if (repair.customerId !== session.user.id && session.user.role !== "admin") {
    return { success: false, error: "You do not have permission to cancel this repair." };
  }
  if (repair.currentStatus !== "submitted") {
    return { success: false, error: "Only submitted repairs can be cancelled." };
  }

  await db
    .update(repairRequests)
    .set({ deletedAt: new Date() })
    .where(eq(repairRequests.id, repairRequestId));

  revalidatePath("/repairs");
  revalidatePath("/dashboard");
  return { success: true, data: null };
}

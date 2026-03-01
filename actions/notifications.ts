"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth-utils";
import { getUnreadNotifications, markAsRead, markAllAsRead } from "@/lib/db/queries/notifications";
import type { ActionResult } from "@/types";

export async function markNotificationReadAction(
  notificationId: string,
): Promise<ActionResult<null>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  await markAsRead(notificationId);

  revalidatePath("/notifications");
  return { success: true, data: null };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult<null>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  await markAllAsRead(session.user.id);

  revalidatePath("/notifications");
  return { success: true, data: null };
}

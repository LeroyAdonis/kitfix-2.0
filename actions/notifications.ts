"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth-utils";
import {
  markAsRead,
  markAllAsRead,
  getUnreadNotifications,
} from "@/lib/db/queries/notifications";
import type { ActionResult } from "@/types";
import type { Notification } from "@/lib/db/schema";

export async function markNotificationReadAction(
  notificationId: string,
): Promise<ActionResult<{ notificationId: string }>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await markAsRead(notificationId);
    revalidatePath("/admin");
    revalidatePath("/notifications");
    return { success: true, data: { notificationId } };
  } catch {
    return { success: false, error: "Failed to mark notification as read" };
  }
}

export async function markAllNotificationsReadAction(): Promise<
  ActionResult<{ success: boolean }>
> {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await markAllAsRead(session.user.id);
    revalidatePath("/admin");
    revalidatePath("/notifications");
    return { success: true, data: { success: true } };
  } catch {
    return {
      success: false,
      error: "Failed to mark all notifications as read",
    };
  }
}

export async function getUnreadNotificationsAction(): Promise<
  ActionResult<Notification[]>
> {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const items = await getUnreadNotifications(session.user.id);
    return { success: true, data: items };
  } catch {
    return { success: false, error: "Failed to fetch notifications" };
  }
}

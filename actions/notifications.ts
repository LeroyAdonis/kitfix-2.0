"use server";

import { revalidatePath } from "next/cache";

import { authenticatedAction } from "@/lib/auth-utils";
import {
  markAsRead,
  markAllAsRead,
  getUnreadNotifications,
} from "@/lib/db/queries/notifications";
import type { ActionResult } from "@/types";
import type { Notification } from "@/lib/db/schema";

export const markNotificationReadAction = authenticatedAction(async (
  session,
  notificationId: string,
): Promise<ActionResult<{ notificationId: string }>> => {
  try {
    await markAsRead(notificationId);
    revalidatePath("/admin");
    revalidatePath("/notifications");
    return { success: true, data: { notificationId } };
  } catch {
    return { success: false, error: "Failed to mark notification as read" };
  }
});

export const markAllNotificationsReadAction = authenticatedAction(async (
  session,
): Promise<ActionResult<{ success: boolean }>> => {
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
});

export const getUnreadNotificationsAction = authenticatedAction(async (
  session,
): Promise<ActionResult<Notification[]>> => {
  try {
    const items = await getUnreadNotifications(session.user.id);
    return { success: true, data: items };
  } catch {
    return { success: false, error: "Failed to fetch notifications" };
  }
});

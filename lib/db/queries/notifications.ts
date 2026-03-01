import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "../index";
import { notifications, type NewNotification } from "../schema";

/** Get unread notifications for a user (most recent first). */
export async function getUnreadNotifications(userId: string) {
  return db.query.notifications.findMany({
    where: and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false),
    ),
    orderBy: [desc(notifications.createdAt)],
  });
}

/** Get all notifications for a user (paginated). */
export async function getAllNotifications(
  userId: string,
  page = 1,
  pageSize = 20,
) {
  const [items, countResult] = await Promise.all([
    db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: [desc(notifications.createdAt)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(eq(notifications.userId, userId)),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

/** Create a new notification. */
export async function createNotification(data: NewNotification) {
  const [notification] = await db
    .insert(notifications)
    .values(data)
    .returning();
  return notification;
}

/** Mark a single notification as read. */
export async function markAsRead(notificationId: string) {
  const [updated] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId))
    .returning();
  return updated;
}

/** Mark all notifications as read for a given user. */
export async function markAllAsRead(userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
    );
}

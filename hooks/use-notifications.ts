"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Notification } from "@/lib/db/schema";
import {
  getUnreadNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions/notifications";

const POLL_INTERVAL_MS = 30_000;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    const result = await getUnreadNotificationsAction();
    if (result.success) {
      setNotifications(result.data);
    }
    setIsLoading(false);
  }, []);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      const result = await markNotificationReadAction(notificationId);
      if (result.success) {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId),
        );
      }
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    const result = await markAllNotificationsReadAction();
    if (result.success) {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  return {
    notifications,
    unreadCount: notifications.length,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}

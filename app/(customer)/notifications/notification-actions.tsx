"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions/notifications";
import { Loader2, Check, CheckCheck } from "lucide-react";

interface NotificationActionsProps {
  notificationId?: string;
}

export function NotificationActions({
  notificationId,
}: NotificationActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      if (notificationId) {
        await markNotificationReadAction(notificationId);
      } else {
        await markAllNotificationsReadAction();
      }
    });
  }

  if (notificationId) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={isPending}
        className="shrink-0"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        <span className="sr-only">Mark as read</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CheckCheck className="mr-2 h-4 w-4" />
      )}
      Mark All Read
    </Button>
  );
}

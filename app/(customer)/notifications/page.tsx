import { requireAuth } from "@/lib/auth-utils";
import {
  getAllNotifications,
  getUnreadNotifications,
} from "@/lib/db/queries/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateSAST } from "@/lib/utils";
import { Bell } from "lucide-react";
import { NotificationActions } from "./notification-actions";

export default async function NotificationsPage() {
  const session = await requireAuth();
  const [allNotifs, unreadNotifs] = await Promise.all([
    getAllNotifications(session.user.id, 1, 50),
    getUnreadNotifications(session.user.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadNotifs.length > 0
              ? `You have ${unreadNotifs.length} unread notification${unreadNotifs.length === 1 ? "" : "s"}.`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadNotifs.length > 0 && <NotificationActions />}
      </div>

      {allNotifs.items.length > 0 ? (
        <div className="space-y-2">
          {allNotifs.items.map((notif) => (
            <Card
              key={notif.id}
              className={notif.isRead ? "opacity-60" : ""}
            >
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{notif.title}</p>
                    {!notif.isRead && (
                      <Badge variant="default" className="text-[10px]">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateSAST(notif.createdAt)}
                  </p>
                </div>
                {!notif.isRead && (
                  <NotificationActions notificationId={notif.id} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="h-10 w-10" />}
          title="No notifications"
          description="Notifications about your repairs will appear here."
        />
      )}
    </div>
  );
}

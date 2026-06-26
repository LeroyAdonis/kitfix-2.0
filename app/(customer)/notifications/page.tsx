import { requireAuth } from "@/lib/auth-utils";
import {
  getAllNotifications,
  getUnreadNotifications,
} from "@/lib/db/queries/notifications";
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
          <h1 className="font-display text-2xl font-bold text-text-primary">Notifications</h1>
          <p className="text-text-secondary">
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
            <div
              key={notif.id}
              className={`card-base flex items-start justify-between gap-4 p-4 ${notif.isRead ? "opacity-60" : ""}`}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">{notif.title}</p>
                  {!notif.isRead && (
                    <span className="badge badge-gold text-[10px]">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary">
                  {notif.message}
                </p>
                <p className="text-xs text-text-tertiary">
                  {formatDateSAST(notif.createdAt)}
                </p>
              </div>
              {!notif.isRead && (
                <NotificationActions notificationId={notif.id} />
              )}
            </div>
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
